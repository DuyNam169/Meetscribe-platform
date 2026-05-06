from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from db import get_db
from models.database import Meeting, Transcript, ChatHistory
from schemas.schemas import MeetingCreate, MeetingResponse, TranscriptResponse, ChatMessageResponse

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


@router.post("/", response_model=MeetingResponse)
def create_meeting(payload: MeetingCreate, db: Session = Depends(get_db)):
    meeting = Meeting(title=payload.title, platform=payload.platform)
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


@router.get("/", response_model=list[MeetingResponse])
def list_meetings(db: Session = Depends(get_db)):
    return db.query(Meeting).order_by(Meeting.started_at.desc()).all()


@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.patch("/{meeting_id}/end", response_model=MeetingResponse)
def end_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting.ended_at = datetime.now(timezone.utc)
    meeting.status = "completed"
    db.commit()
    db.refresh(meeting)
    return meeting


@router.get("/{meeting_id}/transcript", response_model=list[TranscriptResponse])
def get_transcript(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return db.query(Transcript).filter(Transcript.meeting_id == meeting_id).order_by(Transcript.timestamp).all()


@router.get("/{meeting_id}/chat", response_model=list[ChatMessageResponse])
def get_chat_history(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return db.query(ChatHistory).filter(ChatHistory.meeting_id == meeting_id).order_by(ChatHistory.created_at).all()
