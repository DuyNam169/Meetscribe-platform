from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import engine
from models.database import Base
from routers import meetings, transcribe, chat

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MeetScribe API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings.router)
app.include_router(transcribe.router)
app.include_router(chat.router)


@app.get("/health")
def health():
    return {"status": "ok"}
