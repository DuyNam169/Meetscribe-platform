import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session

from db import SessionLocal
from models.database import Transcript
from services.audio_capture import AudioCapture
from services.groq_whisper import transcribe_audio

router = APIRouter(tags=["transcribe"])

active_captures: dict[int, AudioCapture] = {}


@router.websocket("/ws/transcribe/{meeting_id}")
async def transcribe_ws(websocket: WebSocket, meeting_id: int):
    await websocket.accept()

    db: Session = SessionLocal()
    loop = asyncio.get_event_loop()  # lấy event loop của main thread

    async def send_transcript(text: str):
        row = Transcript(meeting_id=meeting_id, content=text)
        db.add(row)
        db.commit()
        db.refresh(row)
        try:
            await websocket.send_text(json.dumps({
                "type": "transcript",
                "content": text,
                "timestamp": row.timestamp.isoformat(),
            }))
        except Exception:
            pass

    def on_audio_chunk(wav_bytes: bytes):
        text = transcribe_audio(wav_bytes)
        if text:
            # Gửi coroutine vào event loop của main thread từ thread phụ
            asyncio.run_coroutine_threadsafe(send_transcript(text), loop)

    capture = AudioCapture(on_chunk_callback=on_audio_chunk)
    active_captures[meeting_id] = capture

    try:
        await websocket.send_text(json.dumps({"type": "status", "message": "connected"}))

        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)

            if msg.get("action") == "start":
                try:
                    capture.start()
                    await websocket.send_text(json.dumps({"type": "status", "message": "recording"}))
                except RuntimeError as e:
                    await websocket.send_text(json.dumps({"type": "error", "message": str(e)}))

            elif msg.get("action") == "stop":
                capture.stop()
                await websocket.send_text(json.dumps({"type": "status", "message": "stopped"}))

    except WebSocketDisconnect:
        capture.stop()
        active_captures.pop(meeting_id, None)
        db.close()