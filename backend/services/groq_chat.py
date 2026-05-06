import os
from groq import Groq
from dotenv import load_dotenv
from prompts.vi_system_prompt import SYSTEM_PROMPT_VI

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
CHAT_MODEL = os.getenv("GROQ_CHAT_MODEL", "llama-3.3-70b-versatile")


def build_system_message(transcript: str) -> str:
    return (
        SYSTEM_PROMPT_VI.strip()
        + "\n\n"
        + "=== TRANSCRIPT CUỘC HỌP ===\n"
        + transcript
        + "\n=== KẾT THÚC TRANSCRIPT ==="
    )


def ask_question(
    question: str,
    transcript: str,
    chat_history: list[dict],
) -> str:
    messages = [
        {"role": "system", "content": build_system_message(transcript)}
    ]

    for msg in chat_history:
        messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": question})

    try:
        response = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=messages,
            max_tokens=1024,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[groq_chat] Chat error: {e}")
        return "Đã xảy ra lỗi khi gọi AI. Vui lòng thử lại."
