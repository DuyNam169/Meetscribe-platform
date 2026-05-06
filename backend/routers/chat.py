from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from models.database import Meeting, Transcript, ChatHistory
from schemas.schemas import ChatMessageCreate, ChatMessageResponse, ChatResponse
from services.groq_chat import ask_question

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/{meeting_id}", response_model=ChatResponse)
def chat(meeting_id: int, payload: ChatMessageCreate, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    transcript_rows = (
        db.query(Transcript)
        .filter(Transcript.meeting_id == meeting_id)
        .order_by(Transcript.timestamp)
        .all()
    )
    full_transcript = "\n".join(row.content for row in transcript_rows)

    if not full_transcript.strip():
        raise HTTPException(status_code=400, detail="Chưa có transcript cho cuộc họp này.")

    history_rows = (
        db.query(ChatHistory)
        .filter(ChatHistory.meeting_id == meeting_id)
        .order_by(ChatHistory.created_at)
        .all()
    )
    history = [{"role": row.role, "content": row.content} for row in history_rows]

    user_msg = ChatHistory(meeting_id=meeting_id, role="user", content=payload.content)
    db.add(user_msg)
    db.commit()

    answer = ask_question(
        question=payload.content,
        transcript=full_transcript,
        chat_history=history,
    )

    assistant_msg = ChatHistory(meeting_id=meeting_id, role="assistant", content=answer)
    db.add(assistant_msg)
    db.commit()

    all_history = (
        db.query(ChatHistory)
        .filter(ChatHistory.meeting_id == meeting_id)
        .order_by(ChatHistory.created_at)
        .all()
    )

    return ChatResponse(answer=answer, history=all_history)
