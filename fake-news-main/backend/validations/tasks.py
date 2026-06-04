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
                    _ffmpeg_binary(), "-y", "-i", in_path,
                    "-vn", "-ac", "1", "-ar", "16000", "-f", "wav", wav_path,
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

        # ─────────────────────────────────────────────────────────────
        # HEURISTIC VALIDATOR — improved with broader pattern detection
        # Used as fallback when Mistral AI key is not configured
        # ─────────────────────────────────────────────────────────────
        def heuristic_validate(text_raw: str, url_value: str):
            text = (text_raw or "").lower()
            url  = (url_value or "").lower()

            # High-weight misinformation signals (score +3 each)
            high_signals = [
                "breaking news",
                "you won't believe",
                "they don't want you to know",
                "the truth about",
                "what the media won't tell you",
                "mainstream media hiding",
                "fake news exposed",
                "scientists are baffled",
                "doctors hate this",
                "one weird trick",
                "big pharma",
                "new world order",
                "deep state",
                "george soros",
                "illuminati",
                "false flag",
                "crisis actor",
                "plandemic",
                "microchip vaccine",
                "5g causes",
                "chemtrails",
                "flat earth",
                "moon landing fake",
                "election stolen",
                "voter fraud confirmed",
                "martial law",
                "mandatory quarantine camps",
                "government coverup",
                "suppressed cure",
                "cancer cure hidden",
                "miracle cure",
                "instant weight loss",
                "make money fast",
                "click here now",
                "limited time offer",
                "act now before",
                "this will shock you",
                "share before deleted",
                "banned from the internet",
                "deleted by facebook",
                "censored by google",
            ]

            # Medium-weight clickbait signals (score +2 each)
            medium_signals = [
                "shocking",
                "unbelievable",
                "incredible",
                "bombshell",
                "explosive",
                "devastating",
                "outrageous",
                "scandalous",
                "horrifying",
                "terrifying",
                "alarming",
                "urgent",
                "must see",
                "share this",
                "exposed",
                "banned",
                "hoax",
                "conspiracy",
                "100%",
                "guaranteed",
                "natural remedy",
                "home remedy",
                "they lied",
                "wake up",
                "sheeple",
                "brainwashed",
                "mind control",
                "propaganda",
                "satanic",
                "pedophile ring",
                "child trafficking",
                "arrested for treason",
                "executed secretly",
                "clone",
                "hologram",
                "simulation",
                "reptilian",
                "alien invasion",
                "end times",
                "apocalypse",
                "rapture",
                "biblical prophecy",
            ]

            # Low-weight signals (score +1 each)
            low_signals = [
                "breaking",
                "secret",
                "miracle",
                "cure",
                "forbidden",
                "they don't want",
                "watch before",
                "before it's too late",
                "only a few know",
                "hidden truth",
                "alternative facts",
                "do your research",
                "do your own research",
                "question everything",
                "mainstream narrative",
            ]

            suspicious_domains = [
                "blogspot.", "wordpress.", "bit.ly", "tinyurl.", "t.co",
                "infowars.", "naturalnews.", "beforeitsnews.", "worldtruth.",
                "yournewswire.", "newspunch.", "themindunleashed.",
                "activistpost.", "zerohedge.", "globalresearch.",
            ]

            hits  = []
            score = 0

            for phrase in high_signals:
                if phrase in text:
                    hits.append(phrase)
                    score += 3

            for phrase in medium_signals:
                if phrase in text:
                    hits.append(phrase)
                    score += 2

            for phrase in low_signals:
                if phrase in text:
                    hits.append(phrase)
                    score += 1

            # Punctuation abuse
            if "!!!" in (text_raw or ""):
                hits.append("triple_exclamation")
                score += 2
            if (text_raw or "").count("!") >= 4:
                hits.append("many_exclamation_marks")
                score += 2
            elif (text_raw or "").count("!") >= 2:
                hits.append("multiple_exclamation_marks")
                score += 1
            if (text_raw or "").count("?") >= 4:
                hits.append("many_question_marks")
                score += 1

            # Excessive ALL CAPS
            letters = re.findall(r"[A-Za-z]", text_raw or "")
            if letters:
                upper       = sum(1 for c in letters if c.isupper())
                upper_ratio = upper / len(letters)
                if upper_ratio >= 0.45 and len(letters) >= 20:
                    hits.append("excessive_caps")
                    score += 3
                elif upper_ratio >= 0.30 and len(letters) >= 30:
                    hits.append("high_caps_ratio")
                    score += 1

            # Unsubstantiated superlatives
            superlatives = re.findall(
                r"\b(worst|best|greatest|most|least|never before|first ever|only one|"
                r"unprecedented|historic|revolutionary|game.changing)\b",
                text,
            )
            if len(superlatives) >= 3:
                hits.append("excessive_superlatives")
                score += 2

            # Vague attribution — red flag for fabricated quotes
            vague_sources = re.findall(
                r"\b(sources say|insiders reveal|anonymous source|"
                r"experts say|scientists confirm|doctors confirm|"
                r"studies show|research proves|reports suggest)\b",
                text,
            )
            if len(vague_sources) >= 2:
                hits.append("vague_attribution")
                score += 2

            # Very short unsubstantiated claim
            word_count = len(re.findall(r"\b\w+\b", text_raw or ""))
            if 0 < word_count <= 8:
                hits.append("very_short_claim")
                score += 2

            # Suspicious domains
            for dom in suspicious_domains:
                if dom in url:
                    hits.append(dom)
                    score += 3

            # ── Classification ─────────────────────────────────────
            threshold = 4
            classification = "fake" if score >= threshold else "real"

            if classification == "fake":
                raw_conf = 55 + min(40, (score - threshold) * 4)
            else:
                raw_conf = 55 + min(35, (threshold - score) * 5)
            confidence = int(max(40, min(95, raw_conf)))

            if classification == "fake":
                found = ", ".join(f'"{h}"' for h in hits[:5])
                explanation = (
                    f"This content shows {score} misinformation signals "
                    f"(threshold: {threshold}). Key patterns detected: {found}. "
                    f"Consider verifying with reputable sources before sharing."
                )
            else:
                explanation = (
                    "This content does not strongly match known misinformation patterns. "
                    "The heuristic analysis found no significant red flags. "
                    "For higher certainty, cross-check against reputable sources."
                )

            return classification, confidence, explanation, hits

        # ─────────────────────────────────────────────────────────────
        # MISTRAL AI VALIDATOR
        # Checks both CHECKDEM_MISTRAL_API_KEY and MISTRAL_API_KEY
        # so either Railway variable name works
        # ─────────────────────────────────────────────────────────────
        def mistral_validate(text_raw: str, url_value: str):
            # Support both naming conventions
            api_key = (
                os.getenv("CHECKDEM_MISTRAL_API_KEY", "").strip()
                or os.getenv("MISTRAL_API_KEY", "").strip()
            )
            if not api_key:
                return None

            base_url = os.getenv(
                "CHECKDEM_MISTRAL_API_BASE_URL", "https://api.mistral.ai/v1"
            ).rstrip("/")
            model   = os.getenv("CHECKDEM_MISTRAL_MODEL", "mistral-small-latest")
            timeout = int(os.getenv("CHECKDEM_MISTRAL_TIMEOUT_SECONDS", "30"))

            user_payload = {
                "text":     (text_raw or "")[:4000],
                "url":      (url_value or "")[:2000],
                "language": submission.language or "",
            }

            system = (
                "You are CheckDem, a rigorous AI fact-checker. Your default stance is SKEPTICAL. "
                "You must classify content as 'fake' or 'real' with high precision.\n\n"
                "CLASSIFY AS FAKE if ANY of these are present:\n"
                "- Sensationalist, emotionally manipulative, or rage-bait language\n"
                "- Unverifiable or fabricated statistics (e.g. '97% of doctors agree...')\n"
                "- Claims that contradict well-established scientific consensus\n"
                "- Conspiracy narratives (deep state, NWO, plandemic, election fraud, etc.)\n"
                "- AI-generated padding, circular reasoning, or non-specific vagueness\n"
                "- Headlines or claims with no named credible sources\n"
                "- Content designed to provoke fear, outrage, or urgency without evidence\n"
                "- Logical inconsistencies or internally contradictory statements\n\n"
                "CLASSIFY AS REAL only if the content:\n"
                "- Contains verifiable facts attributable to named, credible sources\n"
                "- Uses measured, non-sensationalist language\n"
                "- Is consistent with established journalism or academic standards\n"
                "- Makes no claims that contradict known facts\n\n"
                "IMPORTANT: When uncertain, lean toward 'fake'. A false positive (labelling "
                "real content as fake) is far less harmful than a false negative (letting "
                "fake content pass as real).\n\n"
                "Return ONLY a valid JSON object with exactly these keys:\n"
                "  classification (string: 'fake' or 'real'),\n"
                "  confidence_score (integer 0-100; never use round multiples of 25 like 50/75/100),\n"
                "  explanation (string: 2-4 sentences citing specific signals that drove your verdict),\n"
                "  sources (array of strings: fact-check URLs if known, else empty array).\n"
                "Do NOT output anything outside the JSON object. No markdown, no preamble, no comments."
            )

            resp = requests.post(
                f"{base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type":  "application/json",
                },
                json={
                    "model":       model,
                    "temperature": 0.0,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user",   "content": json.dumps(user_payload)},
                    ],
                },
                timeout=timeout,
            )
            try:
                resp.raise_for_status()
            except requests.HTTPError as exc:
                detail = (resp.text or "").strip()[:800]
                raise ValueError(f"Mistral HTTP {resp.status_code}: {detail}") from exc

            data    = resp.json()
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
            sources     = parsed.get("sources")
            if not isinstance(sources, list):
                sources = []

            return {
                "classification":  classification,
                "confidence_score": confidence,
                "explanation":     explanation,
                "sources": [
                    {"type": "source", "value": s}
                    for s in sources
                    if isinstance(s, str) and s.strip()
                ],
                "_validator": "mistral",
            }

        # ── Run validators ────────────────────────────────────────────
        ai_error          = ""
        mistral_key_present = bool(
            os.getenv("CHECKDEM_MISTRAL_API_KEY", "").strip()
            or os.getenv("MISTRAL_API_KEY", "").strip()
        )

        model_result = None
        try:
            model_result = mistral_validate(original_text, url_raw)
        except Exception as exc:
            ai_error = str(exc).strip() or exc.__class__.__name__
            ai_error = ai_error[:800]

        if model_result is not None:
            classification = model_result["classification"]
            confidence     = model_result["confidence_score"]
            explanation    = model_result["explanation"]
            hits           = []
            validator_used = model_result.get("_validator") or "mistral"
        else:
            classification, confidence, explanation, hits = heuristic_validate(
                original_text, url_raw
            )
            validator_used = "heuristic"

        sources = []
        if model_result is not None:
            sources = model_result.get("sources") or []
        if url_raw:
            sources.append({"type": "url", "value": submission.input_url})

        submission.result = {
            "classification":    classification,
            "confidence_score":  confidence,
            "explanation":       explanation,
            "sources":           sources,
            "validator":         validator_used,
            "mistral_key_present": mistral_key_present,
            "ai_error":          ai_error,
            "transcript":        (transcript_text[:4000] if transcript_text else ""),
            "transcript_error":  transcript_error,
            "validator_input":   ("transcript" if transcript_text else "text"),
            "transcript_source": transcript_used,
        }
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
            submission.completed_at  = timezone.now()
            submission.error_message = str(exc)
            submission.save(
                update_fields=[
                    "processing_status",
                    "completed_at",
                    "error_message",
                    "updated_at",
                ]
            )
        except Exception:
            pass
        raise
