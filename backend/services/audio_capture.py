import os
import io
import time
import wave
import threading
import numpy as np
import sounddevice as sd
from dotenv import load_dotenv

load_dotenv()

CHUNK_SECONDS = int(os.getenv("AUDIO_CHUNK_SECONDS", "5"))
SAMPLE_RATE = 16000
CHANNELS = 1


def find_vbcable_device() -> int | None:
    devices = sd.query_devices()
    for i, device in enumerate(devices):
        name = device.get("name", "").lower()
        if device.get("max_input_channels", 0) > 0:
            if "voicemeeter out b1" in name or "voicemeeter out b" in name:
                print(f"[AudioCapture] Found device: index={i}, name={device['name']}")
                return i
    # fallback: CABLE Output
    for i, device in enumerate(devices):
        name = device.get("name", "").lower()
        if "cable output" in name:
            if device.get("max_input_channels", 0) > 0:
                print(f"[AudioCapture] Found CABLE device: index={i}, name={device['name']}")
                return i
    print("[AudioCapture] Không tìm thấy device phù hợp!")
    for i, d in enumerate(devices):
        print(f"  [{i}] {d['name']} in={d['max_input_channels']}")
    return None


def audio_chunk_to_wav_bytes(audio_data: np.ndarray, sample_rate: int) -> bytes:
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        pcm = (audio_data * 32767).astype(np.int16)
        wf.writeframes(pcm.tobytes())
    buffer.seek(0)
    return buffer.read()


class AudioCapture:
    def __init__(self, on_chunk_callback):
        self.on_chunk_callback = on_chunk_callback
        self.is_recording = False
        self._buffer = []
        self._stream = None
        self._thread = None
        self.device_index = find_vbcable_device()

    def _audio_callback(self, indata, frames, time_info, status):
        self._buffer.append(indata.copy())

    def _chunk_sender(self):
        while self.is_recording:
            time.sleep(CHUNK_SECONDS)
            if not self._buffer:
                continue

            chunk = np.concatenate(self._buffer, axis=0)
            self._buffer = []

            mono = chunk[:, 0] if chunk.ndim > 1 else chunk
            wav_bytes = audio_chunk_to_wav_bytes(mono, SAMPLE_RATE)
            self.on_chunk_callback(wav_bytes)

    def start(self):
        if self.is_recording:
            return

        if self.device_index is None:
            raise RuntimeError(
                "Không tìm thấy thiết bị VB-Cable. "
                "Vui lòng cài đặt VB-Audio Virtual Cable và thử lại."
            )

        self.is_recording = True
        self._buffer = []

        self._stream = sd.InputStream(
            samplerate=SAMPLE_RATE,
            channels=CHANNELS,
            dtype="float32",
            device=self.device_index,
            callback=self._audio_callback,
        )
        self._stream.start()

        self._thread = threading.Thread(target=self._chunk_sender, daemon=True)
        self._thread.start()

    def stop(self):
        self.is_recording = False
        if self._stream:
            self._stream.stop()
            self._stream.close()
            self._stream = None
