-- Run this script to initialize the MeetScribe database
-- psql -U postgres -d meetscribe -f init_db.sql

CREATE TABLE IF NOT EXISTS meetings (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    platform    VARCHAR(50),
    started_at  TIMESTAMP DEFAULT NOW(),
    ended_at    TIMESTAMP,
    status      VARCHAR(20) DEFAULT 'recording'
);

CREATE TABLE IF NOT EXISTS transcripts (
    id          SERIAL PRIMARY KEY,
    meeting_id  INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    timestamp   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_history (
    id          SERIAL PRIMARY KEY,
    meeting_id  INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
    role        VARCHAR(10) NOT NULL,
    content     TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);
