import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
WHISPER_MODEL = os.getenv("GROQ_WHISPER_MODEL", "whisper-large-v3-turbo")
LANGUAGE = os.getenv("TRANSCRIBE_LANGUAGE", "vi")


def transcribe_audio(wav_bytes: bytes) -> str | None:
    try:
        params = {
            "file": ("audio.wav", wav_bytes, "audio/wav"),
            "model": WHISPER_MODEL,
            "response_format": "text",
        }
        if LANGUAGE:
            params["language"] = LANGUAGE

        transcription = client.audio.transcriptions.create(**params)

        if isinstance(transcription, str):
            text = transcription.strip()
        else:
            text = getattr(transcription, "text", "").strip()

        return text if text else None

    except Exception as e:
        print(f"[groq_whisper] Transcription error: {e}")
        return None
