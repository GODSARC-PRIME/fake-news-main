from rest_framework import serializers


class ValidationCreateSerializer(serializers.Serializer):
    text = serializers.CharField(required=False, allow_blank=False, trim_whitespace=True)
    url = serializers.URLField(required=False, allow_blank=False)
    audio = serializers.FileField(required=False)
    video = serializers.FileField(required=False)
    language = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if not attrs.get("text") and not attrs.get("url") and not attrs.get("audio") and not attrs.get("video"):
            raise serializers.ValidationError(
                {"message": "Please provide at least one input: text, URL, audio, or video."}
            )
        return attrs
