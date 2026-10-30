import asyncio
import base64
import ctypes
import json
import sys
import time
from datetime import datetime, timezone
from io import BytesIO
from ctypes import wintypes
from urllib.parse import quote

import websockets
from PIL import ImageGrab

if sys.platform != "win32":
    raise SystemExit("SENTINEL desktop agent currently requires Windows.")

user32 = ctypes.windll.user32
BUFFER_SIZE = 512
FRAME_INTERVAL_SECONDS = 3
MAX_SCREEN_WIDTH = 960

APPROVED_WINDOW_KEYWORDS = [
    "sentinel",
    "secure student",
    "examination portal",
    "cs401",
    "vite",
    "localhost:3001",
]

RESTRICTED_APP_POLICIES = {
    "notepad": "Notepad / Text Editor",
    "calculator": "System Calculator",
    "calc": "System Calculator",
    "explorer": "Windows File Explorer",
    "chatgpt": "Unauthorized AI Tool (ChatGPT)",
    "discord": "External Communication (Discord)",
    "whatsapp": "Instant Messaging (WhatsApp)",
    "telegram": "Instant Messaging (Telegram)",
    "stackoverflow": "External Programming Reference (Stack Overflow)",
    "code": "Visual Studio Code / External Editor",
}


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def get_active_window_info():
    hwnd = user32.GetForegroundWindow()
    if not hwnd:
        return None, "", 0

    title_buffer = ctypes.create_unicode_buffer(BUFFER_SIZE)
    user32.GetWindowTextW(hwnd, title_buffer, BUFFER_SIZE)

    pid = wintypes.DWORD()
    user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))

    return hwnd, title_buffer.value, pid.value


def is_window_approved(title):
    lowered = (title or "").lower()
    return any(word in lowered for word in APPROVED_WINDOW_KEYWORDS)


def identify_application(title):
    lowered = (title or "").lower()
    for keyword, label in RESTRICTED_APP_POLICIES.items():
        if keyword in lowered:
            return label
    return "External Desktop Application"


def capture_screen_base64():
    """Capture the desktop visibly shared with the examination proctor."""
    image = ImageGrab.grab()

    if image.width > MAX_SCREEN_WIDTH:
        new_height = int(image.height * MAX_SCREEN_WIDTH / image.width)
        image = image.resize((MAX_SCREEN_WIDTH, new_height))

    buffer = BytesIO()
    image.convert("RGB").save(
        buffer,
        format="JPEG",
        quality=45,
        optimize=True
    )
    return base64.b64encode(buffer.getvalue()).decode("ascii")


async def receive_teacher_commands(websocket):
    async for raw_message in websocket:
        try:
            data = json.loads(raw_message)
        except json.JSONDecodeError:
            continue

        if data.get("type") == "CONNECTION_ESTABLISHED":
            print("[CONNECTED] Backend registered this desktop agent.")

        elif data.get("type") == "COMMAND":
            action = str(data.get("action", "")).upper()
            message = data.get("message", "")

            print(f"\n[PROCTOR COMMAND] {action}: {message}")

            if action == "LOCK":
                print("[INFO] The connected student browser receives the exam-lock command.")
                print("[INFO] This agent does not disable Windows keyboard or mouse input.")
            elif action == "UNLOCK":
                print("[INFO] The browser exam interface receives the unlock command.")
            elif action == "WARNING":
                print("[WARNING] Please follow the proctor's instruction.")


async def run_connected_agent(student_id, exam_id, backend_url):
    ws_base = backend_url.rstrip("/")
    ws_base = ws_base.replace("https://", "wss://", 1)
    ws_base = ws_base.replace("http://", "ws://", 1)

    websocket_url = f"{ws_base}/ws/student/os/{quote(student_id)}"

    print("=" * 65)
    print("SENTINEL — VISIBLE DESKTOP MONITORING AGENT")
    print("=" * 65)
    print(f"Student ID : {student_id}")
    print(f"Exam ID    : {exam_id}")
    print(f"Gateway    : {websocket_url}")
    print("Application monitoring: ACTIVE")
    print("Screen sharing: ACTIVE every 3 seconds")
    print("Press Ctrl+C to stop monitoring.")
    print("=" * 65)

    async with websockets.connect(
        websocket_url,
        ping_interval=20,
        max_size=8 * 1024 * 1024
    ) as websocket:

        receiver = asyncio.create_task(receive_teacher_commands(websocket))

        # Do not report the agent's own launch window as an exam violation.
        _, last_title, _ = get_active_window_info()
        last_reported_title = None
        last_frame_time = 0.0
        capture_error_reported = False

        while not receiver.done():
            hwnd, title, pid = get_active_window_info()

            if hwnd and title and title != last_title:
                last_title = title

                if not is_window_approved(title) and title != last_reported_title:
                    last_reported_title = title
                    app_name = identify_application(title)

                    event = {
                        "student_id": student_id,
                        "exam_id": exam_id,
                        "event_type": "APPLICATION_SWITCH",
                        "subtype": "FOREGROUND_CHANGE",
                        "application_name": app_name,
                        "description": (
                            f"Candidate switched to unauthorized foreground "
                            f"application: '{title}' (PID: {pid})"
                        ),
                        "timestamp": now_iso(),
                        "severity": "high",
                    }

                    await websocket.send(json.dumps(event))
                    print(f"[ALERT] {app_name}: {title}")

                elif is_window_approved(title):
                    if last_reported_title:
                        print("[INFO] Returned to an approved examination window.")
                    last_reported_title = None

            current_time = time.monotonic()

            if current_time - last_frame_time >= FRAME_INTERVAL_SECONDS:
                try:
                    image_data = await asyncio.to_thread(capture_screen_base64)

                    frame = {
                        "type": "SCREEN_STREAM",
                        "student_id": student_id,
                        "image_base64": image_data,
                        "timestamp": now_iso(),
                    }

                    await websocket.send(json.dumps(frame))
                    last_frame_time = current_time
                    capture_error_reported = False

                except Exception as exc:
                    if not capture_error_reported:
                        print(f"[SCREEN CAPTURE ERROR] {exc}")
                        capture_error_reported = True
                    last_frame_time = current_time

            await asyncio.sleep(1)

        await receiver


async def run_agent(student_id, exam_id, backend_url):
    while True:
        try:
            await run_connected_agent(student_id, exam_id, backend_url)

        except asyncio.CancelledError:
            raise

        except Exception as exc:
            print(f"[CONNECTION LOST] {exc}")
            print("[RECONNECTING] Retrying in 3 seconds...")
            await asyncio.sleep(3)


if __name__ == "__main__":
    student_id = sys.argv[1] if len(sys.argv) > 1 else "STU002"
    exam_id = sys.argv[2] if len(sys.argv) > 2 else "EXAM_101"
    backend_url = sys.argv[3] if len(sys.argv) > 3 else "http://127.0.0.1:8000"

    try:
        asyncio.run(run_agent(student_id, exam_id, backend_url))
    except KeyboardInterrupt:
        print("\n[SENTINEL] Monitoring stopped by the operator.")
