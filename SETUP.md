# MeetScribe — Setup Guide

## Yêu cầu hệ thống

- Windows 10/11
- Python 3.10+
- Node.js 18+
- Docker Desktop (thay thế cho PostgreSQL cài trực tiếp)
- VB-Cable Virtual Audio Driver

---

## Bước 1 — Cài VB-Cable + VoiceMeeter Banana

Cần cài cả hai để vừa nghe được loa, vừa cho app capture audio.

### 1a. Cài VB-Cable
Download: https://vb-audio.com/Cable/

### 1b. Cài VoiceMeeter Banana
Download: https://vb-audio.com/Voicemeeter/banana.htm

VoiceMeeter đóng vai trò bộ chia âm thanh:

```
[Zoom / Meet / Teams audio]
           |
           v
   [VoiceMeeter Banana]
           |
           +-----> A1: Loa thật     <- bạn nghe bình thường
           |
           +-----> B1: VB-Cable     <- MeetScribe capture từ đây
```

### 1c. Cấu hình sau khi cài

**Windows Sound Settings:**
- Output → chọn `Voicemeeter Input (VB-Audio Voicemeeter VAIO)`

**Trong VoiceMeeter Banana:**
- Hardware Out **A1** → chọn `Speakers (Realtek Audio)` với driver WDM (WASAPI)
- Bật nút **B1** trên kênh VIRTUAL INPUTS
- Menu → **Restart Audio Engine** sau khi thay đổi

**Kiểm tra:** Mở YouTube, âm thanh phải vừa ra loa vừa hiển thị level trong VoiceMeeter.

App MeetScribe vẫn đọc từ `CABLE Output` như bình thường — không cần thay đổi gì trong app.

---

## Bước 2 — Khởi động Database (Docker)

### 2a. Cài Docker Desktop
Download: https://www.docker.com/products/docker-desktop/

### 2b. Tạo file `docker-compose.yml` ở thư mục gốc project

```yaml
services:
  postgres:
    image: postgres:16
    container_name: meetscribe_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: meetscribe
    ports:
      - "5432:5432"
    volumes:
      - ./backend/init_db.sql:/docker-entrypoint-initdb.d/init_db.sql
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### 2c. Chạy database

```bash
docker compose up -d
```

Các lệnh hữu ích:

```bash
docker compose up -d      # bật database
docker compose down       # tắt database
docker compose down -v    # tắt + xóa toàn bộ data
```

---

## Bước 3 — Lấy Groq API Key

1. Truy cập https://console.groq.com
2. Đăng ký tài khoản miễn phí (có thể dùng Google)
3. Vào **API Keys** → **Create API Key**
4. Copy key — chỉ hiển thị một lần, lưu lại ngay

---

## Bước 4 — Cấu hình Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Copy và chỉnh file môi trường:

```bash
copy .env.example .env
```

Mở `.env` và điền:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/meetscribe
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx   # key lấy từ console.groq.com

GROQ_WHISPER_MODEL=whisper-large-v3-turbo
TRANSCRIBE_LANGUAGE=vi
AUDIO_CHUNK_SECONDS=5

GROQ_CHAT_MODEL=llama-3.3-70b-versatile
RESPONSE_LANGUAGE=vi
```

---

## Bước 5 — Cài Frontend

```bash
cd frontend
npm install
```

---

## Chạy ứng dụng

### Terminal 1 — Database
```bash
docker compose up -d
```

### Terminal 2 — Backend
```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

### Terminal 3 — Frontend
```bash
cd frontend
npm run dev
```

Mở trình duyệt: **http://localhost:5173**

---

## Luồng sử dụng

1. Bật VoiceMeeter Banana và đảm bảo audio đang chạy qua đó
2. Vào Zoom/Meet/Teams, bắt đầu cuộc họp
3. Mở MeetScribe tại http://localhost:5173
4. Tab **Cuộc họp hiện tại** → nhập tên → nhấn **Start Recording**
5. Transcript xuất hiện realtime ở panel trái
6. Hỏi AI ở panel phải bất kỳ lúc nào
7. Nhấn **Stop** khi xong
8. Tab **Lịch sử** để xem lại các buổi họp cũ