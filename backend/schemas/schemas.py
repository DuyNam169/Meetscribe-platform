from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class MeetingCreate(BaseModel):
    title: str
    platform: Optional[str] = None


class MeetingResponse(BaseModel):
    id: int
    title: str
    platform: Optional[str]
    started_at: datetime
    ended_at: Optional[datetime]
    status: str

    class Config:
        from_attributes = True


class TranscriptResponse(BaseModel):
    id: int
    meeting_id: int
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True


class ChatMessageCreate(BaseModel):
    content: str


class ChatMessageResponse(BaseModel):
    id: int
    meeting_id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    answer: str
    history: List[ChatMessageResponse]
