"""
SENTINEL Backend - Main Application
FastAPI server orchestrating REST API endpoints and real-time WebSocket communication
for Teacher Dashboard, Student Web Exam Interface, and Student Python Desktop Agent.
"""

import io
import csv
import logging
from datetime import datetime, timezone
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import (
    FastAPI,
    WebSocket,
    WebSocketDisconnect,
    HTTPException,
    status,
    Query,
    Response,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from backend.database import (
    init_db,
    insert_alert,
    fetch_all_alerts,
    get_student,
    fetch_all_students,
    register_or_get_student,
    get_active_exam,
    update_student_status,
    save_student_answer,
    save_student_submission,
    get_student_answers,
    get_student_submission,
)
from backend.models import (
    LoginRequest,
    LoginResponse,
    AlertEvent,
    TeacherCommand,
    ExamInfo,
    AlertRecord,
    SaveAnswerRequest,
    SaveAnswerResponse,
    ExamSubmissionRequest,
    ExamSubmissionResponse,
    MonitoringEventResponse,
)
from backend.connection_manager import manager

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("sentinel.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler: initializes SQLite database and seed records on startup.
    """
    logger.info("Initializing SENTINEL SQLite Database...")
    init_db()
    logger.info("SENTINEL Database initialized successfully.")
    yield
    logger.info("Shutting down SENTINEL Server.")


# Initialize FastAPI application
app = FastAPI(
    title="SENTINEL - Smart Classroom Monitoring Backend",
    description="Real-time Proctoring & Integrity Engine for Online Classrooms and Examinations",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS Middleware to allow requests from any origin (Teacher Dashboard, Student React App)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# REST Endpoints
# ============================================================================

@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint and system overview."""
    overview = manager.get_status_overview()
    return {
        "system": "SENTINEL Monitoring Engine",
        "status": "ONLINE",
        "active_connections": overview,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/api/login", response_model=LoginResponse, tags=["Authentication"])
async def login_student(payload: LoginRequest, auto_register: bool = Query(False, description="Auto-register unregistered student for testing")):
    """
    Validates student credentials before granting access to the exam interface.
    Checks the local database for student enrollment.
    """
    try:
        student_id = payload.student_id.strip()
        if not student_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student ID cannot be empty."
            )

        student = get_student(student_id)

        # In testing/hackathon mode, auto-register if requested
        if not student and auto_register:
            student = register_or_get_student(student_id)

        if not student:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Student ID '{student_id}' is not enrolled in the examination roster. Sample IDs: STU001, STU002, STU003."
            )

        if student.get("status") == "LOCKED":
            return LoginResponse(
                success=False,
                student_id=student["student_id"],
                name=student["name"],
                status="LOCKED",
                message="Your examination session has been LOCKED by the proctor. Please reach out to your instructor."
            )

        return LoginResponse(
            success=True,
            student_id=student["student_id"],
            name=student["name"],
            status=student["status"],
            message="Student authentication successful. Proceed to exam portal."
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error during student login: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected internal error occurred: {str(exc)}"
        )


@app.get("/api/exam", response_model=ExamInfo, tags=["Exam"])
async def get_exam():
    """
    Returns mock examination details, duration, security instructions, and questions.
    """
    try:
        exam_record = get_active_exam()
        if not exam_record:
            # Fallback mock exam
            exam_record = {
                "exam_id": "EXAM_101",
                "title": "CS401: Advanced Operating Systems Final Examination",
                "duration": 60,
                "status": "ACTIVE"
            }

        return ExamInfo(
            exam_id=exam_record["exam_id"],
            title=exam_record["title"],
            duration=exam_record["duration"],
            status=exam_record["status"],
            instructions=[
                "1. Full-screen mode is strictly enforced throughout the entire exam session.",
                "2. Navigating away from the exam tab or opening external tabs will trigger a BROWSER_SWITCH violation.",
                "3. The SENTINEL Python Desktop Agent must run continuously in the background.",
                "4. Unauthorized applications (e.g. IDEs, Chat apps, browsers) will trigger an APPLICATION_SWITCH alert.",
                "5. Live desktop screen frames and active violation logs are streamed continuously to the proctor."
            ],
            questions=[
                {
                    "id": 1,
                    "topic": "Process Architecture",
                    "marks": 10,
                    "question": "What is the primary architectural difference between a process and a thread?",
                    "options": [
                        {"key": "A", "text": "Threads share the virtual address space and heap of their parent process."},
                        {"key": "B", "text": "Processes share memory by default without IPC mechanisms."},
                        {"key": "C", "text": "Threads cannot be individually scheduled across multiple CPU cores."},
                        {"key": "D", "text": "Context switching between processes has lower overhead than threads."}
                    ],
                    "correct_option": "A"
                },
                {
                    "id": 2,
                    "topic": "Process Concurrency",
                    "marks": 10,
                    "question": "Which synchronization primitive prevents race conditions by permitting only one execution thread inside a critical section?",
                    "options": [
                        {"key": "A", "text": "Counting Semaphore"},
                        {"key": "B", "text": "Mutex (Mutual Exclusion Lock)"},
                        {"key": "C", "text": "Barrier"},
                        {"key": "D", "text": "Read-Write Spinlock"}
                    ],
                    "correct_option": "B"
                },
                {
                    "id": 3,
                    "topic": "Virtual Memory & Paging",
                    "marks": 10,
                    "question": "In virtual memory management, which condition triggers a Page Fault interrupt?",
                    "options": [
                        {"key": "A", "text": "CPU instruction cache miss during execution."},
                        {"key": "B", "text": "An attempt to access a virtual page whose Present/Valid bit in the page table is 0."},
                        {"key": "C", "text": "High disk I/O throughput preventing kernel DMA writes."},
                        {"key": "D", "text": "Direct access of hardware BIOS interrupt table."}
                    ],
                    "correct_option": "B"
                },
                {
                    "id": 4,
                    "topic": "CPU Scheduling",
                    "marks": 10,
                    "question": "Which CPU scheduling algorithm is guaranteed to minimize average waiting time for a given set of stationary processes?",
                    "options": [
                        {"key": "A", "text": "First-Come, First-Served (FCFS)"},
                        {"key": "B", "text": "Round Robin (RR) with 10ms quantum"},
                        {"key": "C", "text": "Shortest Job First (SJF) / Shortest Remaining Time First"},
                        {"key": "D", "text": "Multilevel Feedback Queue (MLFQ)"}
                    ],
                    "correct_option": "C"
                }
            ]
        )
    except Exception as exc:
        logger.error(f"Error fetching exam data: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve exam details: {str(exc)}"
        )


@app.post("/api/exam/save-answer", response_model=SaveAnswerResponse, tags=["Exam"])
async def save_exam_answer(payload: SaveAnswerRequest):
    """
    Saves or updates a candidate's answer to an examination question with SQLite persistence.
    """
    try:
        student_id = payload.student_id.strip()
        exam_id = payload.exam_id.strip()

        if not student_id or not exam_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student ID and Exam ID are required."
            )

        saved = save_student_answer(
            student_id=student_id,
            exam_id=exam_id,
            question_id=payload.question_id,
            selected_option=payload.selected_option,
            timestamp=payload.timestamp,
        )

        return SaveAnswerResponse(
            success=True,
            student_id=saved["student_id"],
            question_id=saved["question_id"],
            selected_option=saved["selected_option"],
            message="Answer recorded successfully."
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error saving answer: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist answer: {str(exc)}"
        )


@app.post("/api/exam/submit", response_model=ExamSubmissionResponse, tags=["Exam"])
async def submit_exam(payload: ExamSubmissionRequest):
    """
    Records final exam submission and stores all answers and completion summary in SQLite.
    """
    try:
        student_id = payload.student_id.strip()
        exam_id = payload.exam_id.strip()

        if not student_id or not exam_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student ID and Exam ID are required."
            )

        import uuid
        reference_id = f"SENTINEL-SUB-{datetime.now().strftime('%y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        submitted_at = payload.submission_time or datetime.now(timezone.utc).isoformat()

        record = save_student_submission(
            student_id=student_id,
            exam_id=exam_id,
            reference_id=reference_id,
            answers=payload.answers,
            summary=payload.summary,
            submitted_at=submitted_at,
        )

        # Notify teachers that student submitted the exam
        await manager.broadcast_to_teachers({
            "type": "STUDENT_SUBMISSION",
            "student_id": student_id,
            "exam_id": exam_id,
            "reference_id": reference_id,
            "timestamp": submitted_at,
            "summary": payload.summary,
        })

        return ExamSubmissionResponse(
            success=True,
            reference_id=reference_id,
            status="SUBMITTED",
            student_id=student_id,
            exam_id=exam_id,
            timestamp=submitted_at,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error submitting exam: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit examination: {str(exc)}"
        )


@app.post("/api/monitoring/event", response_model=MonitoringEventResponse, tags=["Monitoring"])
async def receive_monitoring_event(payload: AlertEvent):
    """
    Receives proctoring violation alerts from the OS Python monitoring agent
    or student web client over HTTP REST.
    Persists event into SQLite and broadcasts immediately to connected teachers.
    """
    try:
        student_id = payload.student_id.strip()
        event_type = payload.event_type.strip()
        description = payload.description or "Monitoring event reported."
        application_name = payload.application_name or "External Application"
        timestamp = payload.timestamp or datetime.now(timezone.utc).isoformat()

        # 1. Insert into SQLite alerts table
        alert_record = insert_alert(
            student_id=student_id,
            event_type=event_type,
            description=description,
            application_name=application_name,
            timestamp=timestamp,
        )

        # 2. Broadcast alert immediately to Teacher Dashboard
        source = "OS" if event_type == "APPLICATION_SWITCH" else "WEB"
        await manager.broadcast_to_teachers({
            "type": "ALERT",
            "source": source,
            "student_id": student_id,
            "alert": alert_record,
        })

        return MonitoringEventResponse(
            success=True,
            alert_id=alert_record["alert_id"],
            status="RECORDED",
        )
    except Exception as exc:
        logger.error(f"Error recording monitoring event: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record monitoring event: {str(exc)}"
        )


@app.get("/api/alerts", tags=["Audit & Reports"])
async def get_alerts(
    student_id: Optional[str] = Query(None, description="Optional filter by student ID"),
    format: Optional[str] = Query(None, description="Set to 'csv' to download as a ready-to-use CSV export")
):
    """
    Returns the full violation history for Teacher CSV export.
    Supports both JSON response and direct downloadable CSV stream.
    """
    try:
        alerts = fetch_all_alerts(student_id=student_id)

        # Check if CSV export is requested via query param or headers
        if format and format.lower() == "csv":
            output = io.StringIO()
            fieldnames = ["alert_id", "student_id", "student_name", "event_type", "description", "application_name", "timestamp"]
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            for alert in alerts:
                writer.writerow({
                    "alert_id": alert.get("alert_id"),
                    "student_id": alert.get("student_id"),
                    "student_name": alert.get("student_name") or "",
                    "event_type": alert.get("event_type"),
                    "description": alert.get("description") or "",
                    "application_name": alert.get("application_name") or "",
                    "timestamp": alert.get("timestamp") or "",
                })

            output.seek(0)
            filename = f"sentinel_audit_alerts_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            return Response(
                content=output.getvalue(),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )

        # Default JSON response
        return {
            "total_alerts": len(alerts),
            "alerts": alerts
        }
    except Exception as exc:
        logger.error(f"Error fetching alerts: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve alert records: {str(exc)}"
        )


# ============================================================================
# WebSocket Endpoints
# ============================================================================


@app.get("/api/students", tags=["Monitoring"])
async def get_students():
    """Return enrolled students with their actual live connection state."""
    students = fetch_all_students()
    connections = manager.get_status_overview()
    web_ids = set(connections["web_students"])
    os_ids = set(connections["os_students"])

    all_alerts = fetch_all_alerts()
    latest_alerts = {}
    alert_counts = {}

    for alert in all_alerts:
        sid = alert["student_id"]
        alert_counts[sid] = alert_counts.get(sid, 0) + 1
        if sid not in latest_alerts:
            latest_alerts[sid] = alert

    for student in students:
        sid = student["student_id"]
        student["web_connected"] = sid in web_ids
        student["os_connected"] = sid in os_ids
        student["online"] = student["web_connected"] or student["os_connected"]
        student["latest_alert"] = latest_alerts.get(sid)
        student["violation_count"] = alert_counts.get(sid, 0)

    return {
        "total_students": len(students),
        "connections": connections,
        "students": students
    }

@app.websocket("/ws/teacher")
async def websocket_teacher(websocket: WebSocket):
    """
    WebSocket endpoint for Teacher React Dashboard.
    - Broadcasts live alerts and screen streams from students.
    - Listens for proctor enforcement commands (WARNING / LOCK / UNLOCK)
    - Routes them to target student clients.
    """
    await manager.connect_teacher(websocket)
    try:
        # Send initial status telemetry on connection
        await websocket.send_json({
            "type": "INITIAL_SYNC",
            "active_overview": manager.get_status_overview(),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

        while True:
            data = await websocket.receive_json()

            # Expecting commands: {"student_id": "STU001", "action": "WARNING"|"LOCK"|"UNLOCK", "message": "..."}
            student_id = data.get("student_id")
            action = (data.get("action") or "").upper()
            message = data.get("message")
            target = data.get("target", "all")

            if not student_id or not action:
                await websocket.send_json({
                    "type": "ERROR",
                    "message": "Invalid command format: 'student_id' and 'action' are required."
                })
                continue

            # Update DB student status accordingly
            if action in ("LOCK", "LOCKED"):
                update_student_status(student_id, "LOCKED")
            elif action in ("UNLOCK", "UNLOCKED"):
                update_student_status(student_id, "ACTIVE")

            command_payload = {
                "type": "COMMAND",
                "action": action,
                "student_id": student_id,
                "message": message or f"Proctor action: {action}",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

            # Route command to student web UI and/or desktop OS agent
            delivery_result = await manager.send_command_to_student(
                student_id=student_id,
                command=command_payload,
                target=target
            )

            # Acknowledge execution to teacher
            await websocket.send_json({
                "type": "COMMAND_ACK",
                "student_id": student_id,
                "action": action,
                "delivery": delivery_result,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })

    except WebSocketDisconnect:
        await manager.disconnect_teacher(websocket)
    except Exception as exc:
        logger.error(f"Teacher WebSocket encountered error: {exc}", exc_info=True)
        await manager.disconnect_teacher(websocket)


@app.websocket("/ws/student/web/{student_id}")
async def websocket_student_web(websocket: WebSocket, student_id: str):
    """
    WebSocket endpoint for Student React Exam Interface.
    - Listens for 'BROWSER_SWITCH' JSON payloads.
    - Saves violations to SQLite database.
    - Broadcasts the alert to the teacher channel in real-time.
    """
    await manager.connect_student_web(student_id, websocket)
    try:
        # Confirm connection to student client
        await websocket.send_json({
            "type": "CONNECTION_ESTABLISHED",
            "student_id": student_id,
            "channel": "WEB",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        while True:
            data = await websocket.receive_json()

            # Handle heartbeat/ping
            if data.get("type") == "PING":
                await websocket.send_json({"type": "PONG"})
                continue

            event_type = data.get("event_type", "BROWSER_SWITCH")
            description = data.get("description", "Student navigated away from exam tab or switched browser windows.")
            application_name = data.get("application_name", "Browser Window")
            timestamp = data.get("timestamp") or datetime.now(timezone.utc).isoformat()

            # 1. Save violation into SQLite
            alert_record = insert_alert(
                student_id=student_id,
                event_type=event_type,
                description=description,
                application_name=application_name,
                timestamp=timestamp
            )

            # 2. Broadcast alert immediately to Teacher Dashboard
            teacher_payload = {
                "type": "ALERT",
                "source": "WEB",
                "student_id": student_id,
                "alert": alert_record
            }
            await manager.broadcast_to_teachers(teacher_payload)

            # 3. Send acknowledgment back to student client
            await websocket.send_json({
                "type": "ALERT_ACK",
                "alert_id": alert_record["alert_id"],
                "status": "RECORDED"
            })

    except WebSocketDisconnect:
        await manager.disconnect_student_web(student_id, websocket)
    except Exception as exc:
        logger.error(f"Student Web WebSocket encountered error for {student_id}: {exc}", exc_info=True)
        await manager.disconnect_student_web(student_id, websocket)


@app.websocket("/ws/student/os/{student_id}")
async def websocket_student_os(websocket: WebSocket, student_id: str):
    """
    WebSocket endpoint for Student Python OS Desktop Agent.
    - Listens for 'APPLICATION_SWITCH' events and live screen base64 strings.
    - Saves violations to SQLite database.
    - Broadcasts everything (violations + live screen stream) to the teacher channel.
    """
    await manager.connect_student_os(student_id, websocket)
    try:
        # Confirm connection to OS desktop agent
        await websocket.send_json({
            "type": "CONNECTION_ESTABLISHED",
            "student_id": student_id,
            "channel": "OS",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        while True:
            data = await websocket.receive_json()

            # Handle heartbeat/ping
            if data.get("type") == "PING":
                await websocket.send_json({"type": "PONG"})
                continue

            msg_type = (data.get("type") or data.get("event_type") or "").upper()

            # Case A: Live Screen Streaming Frame
            if msg_type in ("SCREEN_STREAM", "SCREEN_FRAME") or "image_base64" in data or "screen_base64" in data:
                image_base64 = data.get("image_base64") or data.get("screen_base64") or data.get("frame")
                frame_timestamp = data.get("timestamp") or datetime.now(timezone.utc).isoformat()

                # Broadcast live screen frame to all teacher dashboards
                # (Frames are kept in memory and broadcasted live to avoid SQLite bloat)
                await manager.broadcast_to_teachers({
                    "type": "SCREEN_STREAM",
                    "student_id": student_id,
                    "image_base64": image_base64,
                    "timestamp": frame_timestamp
                })
                continue

            # Case B: Security Violations (APPLICATION_SWITCH, UNAUTHORIZED_PROCESS, etc.)
            event_type = data.get("event_type", "APPLICATION_SWITCH")
            description = data.get("description", "Unauthorized application detected in foreground.")
            application_name = data.get("application_name") or data.get("app_name") or "External Application"
            timestamp = data.get("timestamp") or datetime.now(timezone.utc).isoformat()

            # 1. Save violation into SQLite
            alert_record = insert_alert(
                student_id=student_id,
                event_type=event_type,
                description=description,
                application_name=application_name,
                timestamp=timestamp
            )

            # 2. Broadcast violation alert to Teacher Dashboard
            teacher_payload = {
                "type": "ALERT",
                "source": "OS",
                "student_id": student_id,
                "alert": alert_record
            }
            await manager.broadcast_to_teachers(teacher_payload)

            # 3. Send acknowledgment back to OS Desktop Agent
            await websocket.send_json({
                "type": "ALERT_ACK",
                "alert_id": alert_record["alert_id"],
                "status": "RECORDED"
            })

    except WebSocketDisconnect:
        await manager.disconnect_student_os(student_id, websocket)
    except Exception as exc:
        logger.error(f"Student OS WebSocket encountered error for {student_id}: {exc}", exc_info=True)
        await manager.disconnect_student_os(student_id, websocket)

