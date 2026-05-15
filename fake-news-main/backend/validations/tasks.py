import time
import re
import os
import json
import subprocess
import tempfile

from celery import shared_task
from django.core.files.storage import default_storage
from django.utils import timezone

import requests
from langdetect import detect

from .models import ValidationSubmission


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def process_validation_submission(self, submission_id: str):
    try:
        submission = ValidationSubmission.objects.get(id=submission_id)
        if submission.processing_status not in [
            ValidationSubmission.ProcessingStatus.PENDING,
            ValidationSubmission.ProcessingStatus.PROCESSING,
        ]:
            return

        submission.processing_status = ValidationSubmission.ProcessingStatus.PROCESSING
        submission.started_at = timezone.now()
        submission.save(update_fields=["processing_status", "started_at", "updated_at"])

        def _ffmpeg_binary() -> str:
            configured = os.getenv("CHECKDEM_FFMPEG_PATH", "").strip()
            return configured or "ffmpeg"

        def _transcribe_media() -> dict:
            audio_field = submission.input_audio
            video_field = submission.input_video

            if not audio_field and not video_field:
                return {"text": "", "error": "", "used": ""}

            in_path = ""
            used = ""
            temp_in_file = None
            if audio_field:
                used = "audio"
                try:
                    in_path = audio_field.path
                except Exception:
                    in_path = ""
                if not in_path and audio_field.name:
                    try:
                        temp_in_file = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_field.name)[1] or ".bin")
                        with default_storage.open(audio_field.name, "rb") as src:
                            temp_in_file.write(src.read())
                        temp_in_file.flush()
                        in_path = temp_in_file.name
                    except Exception:
                        in_path = ""

            if not in_path and video_field:
                used = "video"
                try:
                    in_path = video_field.path
                except Exception:
                    in_path = ""
                if not in_path and video_field.name:
                    try:
                        temp_in_file = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(video_field.name)[1] or ".bin")
                        with default_storage.open(video_field.name, "rb") as src:
                            temp_in_file.write(src.read())
                        temp_in_file.flush()
                        in_path = temp_in_file.name
                    except Exception:
                        in_path = ""

            if not in_path:
                if temp_in_file is not None:
                    try:
                        temp_in_file.close()
                    except Exception:
                        pass
                return {"text": "", "error": "media_file_not_available", "used": used}

            try:
                from faster_whisper import WhisperModel
            except Exception as exc:
                return {"text": "", "error": f"missing_faster_whisper: {exc.__class__.__name__}", "used": used}

            whisper_model_name = os.getenv("CHECKDEM_WHISPER_MODEL", "small").strip() or "small"
            whisper_device = os.getenv("CHECKDEM_WHISPER_DEVICE", "cpu").strip() or "cpu"
            whisper_compute_type = os.getenv("CHECKDEM_WHISPER_COMPUTE_TYPE", "int8").strip() or "int8"

            with tempfile.TemporaryDirectory() as tmpdir:
                wav_path = os.path.join(tmpdir, "input.wav")

                ffmpeg_cmd = [
                    _ffmpeg_binary(),
                    "-y",
                    "-i",
                    in_path,
                    "-vn",
                    "-ac",
                    "1",
                    "-ar",
                    "16000",
                    "-f",
                    "wav",
                    wav_path,
                ]

                try:
                    subprocess.run(ffmpeg_cmd, capture_output=True, text=True, check=True)
                except Exception as exc:
                    if temp_in_file is not None and in_path:
                        try:
                            os.unlink(in_path)
                        except Exception:
                            pass
                    return {"text": "", "error": f"ffmpeg_failed: {str(exc)[:200]}", "used": used}

                try:
                    model = WhisperModel(
                        whisper_model_name,
                        device=whisper_device,
                        compute_type=whisper_compute_type,
                    )

                    transcribe_language = (submission.language or "").strip() or None
                    segments, _info = model.transcribe(wav_path, language=transcribe_language)
                    transcript = "".join((seg.text or "") for seg in segments).strip()
                    if temp_in_file is not None and in_path:
                        try:
                            os.unlink(in_path)
                        except Exception:
                            pass
                    return {"text": transcript, "error": "", "used": used}
                except Exception as exc:
                    if temp_in_file is not None and in_path:
                        try:
                            os.unlink(in_path)
                        except Exception:
                            pass
                    return {"text": "", "error": f"whisper_failed: {exc.__class__.__name__}", "used": used}

        time.sleep(2)

        original_text = submission.input_text or ""
        url_raw = submission.input_url or ""

        media = _transcribe_media()
        transcript_text = (media.get("text") or "").strip()
        transcript_error = (media.get("error") or "").strip()
        transcript_used = (media.get("used") or "").strip()

        if transcript_text:
            original_text = transcript_text
            if not (submission.language or "").strip():
                try:
                    submission.language = detect(transcript_text[:2000])
                    submission.save(update_fields=["language", "updated_at"])
                except Exception:
                    pass

        def heuristic_validate(text_raw: str, url_value: str):
            text = (text_raw or "").lower()
            url = (url_value or "").lower()

            # Clickbait phrases with descriptions
            clickbait_phrases = {
                "breaking": "Often used to create false urgency in misleading stories",
                "shocking": "Sensationalist language to provoke emotional reactions",
                "you won't believe": "Creates artificial intrigue typical in clickbait",
                "miracle": "Overblown claims of effectiveness or discovery",
                "secret": "Implies hidden information, common in conspiracy narratives",
                "urgent": "Creates false time pressure to bypass critical thinking",
                "must see": "Manipulative call-to-action used in clickbait",
                "share this": "Amplification request typical of misinformation campaigns",
                "they don't want you to know": "Classic conspiracy theory framing",
                "what happens next": "Incomplete narratives designed to drive clicks",
                "exposed": "Overstated revelatory language",
                "banned": "Often false claims about content suppression",
                "cure": "Potentially harmful medical misinformation",
                "hoax": "Dismissive language often paired with conspiracy claims",
                "conspiracy": "Suggests coordinated deception without evidence",
                "100%": "Absolute claims that lack nuance",
                "guaranteed": "Unrealistic certainty often seen in scams",
            }
            suspicious_domains = {
                "blogspot.": "Unverified blog platform often used for misinformation",
                "wordpress.": "Self-hosted blogs with no editorial oversight",
                "bit.ly": "URL shortener commonly used to hide true sources",
                "tinyurl.": "URL shortener that obscures destination",
                "t.co": "Twitter shortened URLs sometimes used deceptively",
            }

            hits = []
            score = 0

            for phrase, description in clickbait_phrases.items():
                if phrase in text:
                    hits.append({"indicator": phrase, "reason": description})
                    score += 2

            if "!!!" in (text_raw or ""):
                hits.append({"indicator": "!!!", "reason": "Triple exclamation marks indicate excessive emphasis"})
                score += 2
            if (text_raw or "").count("!") >= 3:
                hits.append({"indicator": "many_exclamation_marks", "reason": "3+ exclamation marks show unusual emphasis patterns"})
                score += 1
            if (text_raw or "").count("?") >= 3:
                hits.append({"indicator": "many_question_marks", "reason": "3+ question marks create artificial doubt"})
                score += 1

            letters = re.findall(r"[A-Za-z]", text_raw or "")
            if letters:
                upper = sum(1 for c in letters if c.isupper())
                upper_ratio = upper / len(letters)
                if upper_ratio >= 0.45 and len(letters) >= 20:
                    hits.append({"indicator": "excessive_caps", "reason": "45%+ uppercase letters indicate aggressive tone"})
                    score += 2

            word_count = len(re.findall(r"\b\w+\b", text_raw or ""))
            if 0 < word_count <= 6:
                hits.append({"indicator": "very_short_claim", "reason": "Incomplete claims under 6 words lack context"})
                score += 1

            for dom, description in suspicious_domains.items():
                if dom in url:
                    hits.append({"indicator": dom, "reason": description})
                    score += 2

            threshold = 4
            classification = "fake" if score >= threshold else "real"

            # Confidence should increase as we move away from the decision boundary.
            # Keep it in a conservative band (55-95) to avoid overclaiming certainty.
            if classification == "fake":
                confidence = 70 + (score - threshold) * 7
            else:
                confidence = 70 + (threshold - 1 - score) * 7
            confidence = int(max(55, min(95, confidence)))

            explanation = (
                "This content contains multiple clickbait/emphasis patterns often seen in misinformation. Consider verifying with reputable sources."
                if classification == "fake"
                else "This content does not strongly match common clickbait or misinformation patterns. For higher certainty, cross-check against reputable sources."
            )

            return classification, confidence, explanation, hits

        def mistral_validate(text_raw: str, url_value: str):
            api_key = os.getenv("CHECKDEM_MISTRAL_API_KEY", "").strip()
            if not api_key:
                return None

            base_url = os.getenv("CHECKDEM_MISTRAL_API_BASE_URL", "https://api.mistral.ai/v1").rstrip("/")
            model = os.getenv("CHECKDEM_MISTRAL_MODEL", "mistral-small-latest")
            timeout = int(os.getenv("CHECKDEM_MISTRAL_TIMEOUT_SECONDS", "30"))

            user_payload = {
                "text": (text_raw or "")[:4000],
                "url": (url_value or "")[:2000],
                "language": submission.language or "",
            }

            system = (
                "You are CheckDem, a fact-checking classifier. "
                "Classify the content as 'fake' or 'real' and return strict JSON with keys: "
                "classification ('fake'|'real'), confidence_score (0-100 integer), explanation (string), sources (array of strings). "
                "Return ONLY valid JSON."
            )

            resp = requests.post(
                f"{base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "temperature": 0.2,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": json.dumps(user_payload)},
                    ],
                },
                timeout=timeout,
            )
            try:
                resp.raise_for_status()
            except requests.HTTPError as exc:
                detail = (resp.text or "").strip()[:800]
                raise ValueError(f"Mistral HTTP {resp.status_code}: {detail}") from exc

            data = resp.json()
            content = data["choices"][0]["message"]["content"]

            try:
                parsed = json.loads(content)
            except json.JSONDecodeError:
                m = re.search(r"\{.*\}", content, flags=re.DOTALL)
                if not m:
                    raise
                parsed = json.loads(m.group(0))

            classification = str(parsed.get("classification", "")).lower().strip()
            if classification not in ["fake", "real"]:
                raise ValueError("Mistral response missing valid classification")

            confidence = int(parsed.get("confidence_score", 0))
            confidence = int(max(0, min(100, confidence)))
            explanation = str(parsed.get("explanation", "")).strip() or "No explanation provided."
            sources = parsed.get("sources")
            if not isinstance(sources, list):
                sources = []

            return {
                "classification": classification,
                "confidence_score": confidence,
                "explanation": explanation,
                "sources": [{"type": "source", "value": s} for s in sources if isinstance(s, str) and s.strip()],
                "_validator": "mistral",
            }

        ai_error = ""
        mistral_key_present = bool(os.getenv("CHECKDEM_MISTRAL_API_KEY", "").strip())

        model_result = None
        try:
            model_result = mistral_validate(original_text, url_raw)
        except Exception as exc:
            ai_error = str(exc).strip() or exc.__class__.__name__
            ai_error = ai_error[:800]

        if model_result is not None:
            classification = model_result["classification"]
            confidence = model_result["confidence_score"]
            explanation = model_result["explanation"]
            hits = []
            validator_used = model_result.get("_validator") or "model"
        else:
            classification, confidence, explanation, hits = heuristic_validate(original_text, url_raw)
            validator_used = "heuristic"

        sources = []
        if model_result is not None:
            sources = model_result.get("sources") or []
        if url_raw:
            sources.append({"type": "url", "value": submission.input_url})

        submission.result = {
            "classification": classification,
            "confidence_score": confidence,
            "explanation": explanation,
            "sources": sources,
            "validator": validator_used,
            "mistral_key_present": mistral_key_present,
            "ai_error": ai_error,
            "transcript": (transcript_text[:4000] if transcript_text else ""),
            "transcript_error": transcript_error,
            "validator_input": ("transcript" if transcript_text else "text"),
            "transcript_source": transcript_used,
        }
        # Frontend expects suspicious_words as a list of strings
        submission.suspicious_words = hits
        submission.processing_status = ValidationSubmission.ProcessingStatus.COMPLETED
        submission.completed_at = timezone.now()
        submission.error_message = ""
        submission.save(
            update_fields=[
                "result",
                "suspicious_words",
                "processing_status",
                "completed_at",
                "error_message",
                "updated_at",
            ]
        )
    except Exception as exc:
        try:
            submission = ValidationSubmission.objects.get(id=submission_id)
            submission.processing_status = ValidationSubmission.ProcessingStatus.FAILED
            submission.completed_at = timezone.now()
            submission.error_message = str(exc)
            submission.save(update_fields=["processing_status", "completed_at", "error_message", "updated_at"])
        except Exception:
            pass
        raise
