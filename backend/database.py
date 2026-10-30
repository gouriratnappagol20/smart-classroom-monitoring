"""
SENTINEL Backend - Database Module
SQLite database setup, schema initialization, and helper functions for the SENTINEL Smart Classroom Monitoring System.
"""

import sqlite3
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from contextlib import contextmanager

# Local SQLite database file path (resolved relative to backend directory)
DB_PATH = Path(__file__).resolve().parent / "sentinel.db"


@contextmanager
def get_db():
    """
    Context manager providing a managed SQLite connection.
    Ensures commits on success, rollbacks on error, and closes connection safely.
    """
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row  # Enables dictionary-style column access
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    """
    Initialize SQLite database tables and seed baseline demonstration data.
    Creates:
      - students: student_id (PK), name, status
      - exams: exam_id (PK), title, duration, status
      - alerts: alert_id (PK), student_id, event_type, description, application_name, timestamp
      - student_answers: id (PK), student_id, exam_id, question_id, selected_option, timestamp
      - student_submissions: submission_id (PK), reference_id, student_id, exam_id, answers_json, summary_json, submitted_at
    """
    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Students Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS students (
                student_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'ACTIVE'
            );
            """
        )

        # 2. Exams Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS exams (
                exam_id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                duration INTEGER NOT NULL, -- Duration in minutes
                status TEXT NOT NULL DEFAULT 'ACTIVE'
            );
            """
        )

        # 3. Alerts Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS alerts (
                alert_id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL,
                event_type TEXT NOT NULL, -- e.g. BROWSER_SWITCH, APPLICATION_SWITCH
                description TEXT,
                application_name TEXT,
                timestamp TEXT NOT NULL
            );
            """
        )

        # Create index on alerts table for fast lookups by student_id & timestamp
        cursor.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_alerts_student ON alerts(student_id);
            """
        )
        cursor.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp);
            """
        )

        # Seed sample students for hackathon testing (INSERT OR IGNORE keeps existing data)
        seed_students = [
            ("STU001", "Alice Johnson", "ACTIVE"),
            ("STU002", "Bob Smith", "ACTIVE"),
            ("STU003", "Charlie Davis", "ACTIVE"),
            ("STU004", "Diana Prince", "ACTIVE"),
            ("STU005", "Evan Wright", "ACTIVE"),
            ("student1", "Test Student 1", "ACTIVE"),
            ("demo", "Demo Candidate", "ACTIVE"),
            ("STU-1048", "Sarah Jenkins", "ACTIVE"),
            ("STU-1092", "David Miller", "ACTIVE"),
            ("STU-1115", "Marcus Vance", "ACTIVE"),
            ("PC-01", "Sarah Jenkins", "ACTIVE"),
            ("PC-02", "David Miller", "ACTIVE"),
            ("PC-03", "Marcus Vance", "ACTIVE"),
        ]
        cursor.executemany(
            """
            INSERT OR IGNORE INTO students (student_id, name, status)
            VALUES (?, ?, ?);
            """,
            seed_students,
        )

        # 4. Student Answers Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS student_answers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL,
                exam_id TEXT NOT NULL,
                question_id INTEGER NOT NULL,
                selected_option TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                UNIQUE(student_id, exam_id, question_id) ON CONFLICT REPLACE
            );
            """
        )
        cursor.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_answers_student ON student_answers(student_id, exam_id);
            """
        )

        # 5. Student Submissions Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS student_submissions (
                submission_id INTEGER PRIMARY KEY AUTOINCREMENT,
                reference_id TEXT UNIQUE NOT NULL,
                student_id TEXT NOT NULL,
                exam_id TEXT NOT NULL,
                answers_json TEXT NOT NULL,
                summary_json TEXT,
                submitted_at TEXT NOT NULL
            );
            """
        )
        cursor.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_submissions_student ON student_submissions(student_id, exam_id);
            """
        )

        # Seed default exam
        seed_exam = (
            "EXAM_101",
            "CS401: Advanced Operating Systems Final Examination",
            60,
            "ACTIVE",
        )
        cursor.execute(
            """
            INSERT OR IGNORE INTO exams (exam_id, title, duration, status)
            VALUES (?, ?, ?, ?);
            """,
            seed_exam,
        )


def insert_alert(
    student_id: str,
    event_type: str,
    description: Optional[str] = None,
    application_name: Optional[str] = None,
    timestamp: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Insert a security or proctoring alert record into the database.

    Args:
        student_id: Unique student identifier.
        event_type: e.g. 'BROWSER_SWITCH', 'APPLICATION_SWITCH'.
        description: Details regarding the event.
        application_name: Detected foreground/external application if applicable.
        timestamp: ISO 8601 timestamp; if omitted, current UTC timestamp is used.

    Returns:
        Dict representing the newly inserted alert record including alert_id.
    """
    if not timestamp:
        timestamp = datetime.now(timezone.utc).isoformat()

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO alerts (student_id, event_type, description, application_name, timestamp)
            VALUES (?, ?, ?, ?, ?);
            """,
            (student_id, event_type, description, application_name, timestamp),
        )
        alert_id = cursor.lastrowid

        return {
            "alert_id": alert_id,
            "student_id": student_id,
            "event_type": event_type,
            "description": description,
            "application_name": application_name,
            "timestamp": timestamp,
        }


def fetch_all_alerts(student_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Fetch all alerts for audit reports and CSV exports.

    Args:
        student_id: Optional filter for a specific student.

    Returns:
        List of alert dictionaries sorted by alert_id descending.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        if student_id:
            cursor.execute(
                """
                SELECT a.alert_id, a.student_id, s.name as student_name, a.event_type,
                       a.description, a.application_name, a.timestamp
                FROM alerts a
                LEFT JOIN students s ON a.student_id = s.student_id
                WHERE a.student_id = ?
                ORDER BY a.alert_id DESC;
                """,
                (student_id,),
            )
        else:
            cursor.execute(
                """
                SELECT a.alert_id, a.student_id, s.name as student_name, a.event_type,
                       a.description, a.application_name, a.timestamp
                FROM alerts a
                LEFT JOIN students s ON a.student_id = s.student_id
                ORDER BY a.alert_id DESC;
                """
            )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def get_student(student_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch student details by student_id.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT student_id, name, status FROM students WHERE student_id = ?;",
            (student_id,),
        )
        row = cursor.fetchone()
        return dict(row) if row else None


def register_or_get_student(student_id: str, name: Optional[str] = None) -> Dict[str, Any]:
    """
    Helper for flexible hackathon testing: returns existing student or registers a new student if not present.
    """
    existing = get_student(student_id)
    if existing:
        return existing

    display_name = name or f"Student {student_id}"
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO students (student_id, name, status) VALUES (?, ?, 'ACTIVE');",
            (student_id, display_name),
        )
    return {"student_id": student_id, "name": display_name, "status": "ACTIVE"}


def get_active_exam() -> Optional[Dict[str, Any]]:
    """
    Fetch the currently active examination.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT exam_id, title, duration, status FROM exams WHERE status = 'ACTIVE' LIMIT 1;"
        )
        row = cursor.fetchone()
        return dict(row) if row else None


def update_student_status(student_id: str, status: str) -> bool:
    """
    Update a student's status (e.g. 'ACTIVE', 'WARNING', 'LOCKED').
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE students SET status = ? WHERE student_id = ?;",
            (status, student_id),
        )
        return cursor.rowcount > 0


def save_student_answer(
    student_id: str,
    exam_id: str,
    question_id: int,
    selected_option: str,
    timestamp: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Persist or update a student's answer for an exam question.
    """
    if not timestamp:
        timestamp = datetime.now(timezone.utc).isoformat()

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO student_answers (student_id, exam_id, question_id, selected_option, timestamp)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(student_id, exam_id, question_id) DO UPDATE SET
                selected_option = excluded.selected_option,
                timestamp = excluded.timestamp;
            """,
            (student_id, exam_id, question_id, selected_option, timestamp),
        )
        return {
            "student_id": student_id,
            "exam_id": exam_id,
            "question_id": question_id,
            "selected_option": selected_option,
            "timestamp": timestamp,
        }


def save_student_submission(
    student_id: str,
    exam_id: str,
    reference_id: str,
    answers: Dict[str, Any],
    summary: Optional[Dict[str, Any]] = None,
    submitted_at: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Persist final examination submission record into the database.
    """
    import json
    if not submitted_at:
        submitted_at = datetime.now(timezone.utc).isoformat()

    answers_json = json.dumps(answers)
    summary_json = json.dumps(summary) if summary else "{}"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO student_submissions (reference_id, student_id, exam_id, answers_json, summary_json, submitted_at)
            VALUES (?, ?, ?, ?, ?, ?);
            """,
            (reference_id, student_id, exam_id, answers_json, summary_json, submitted_at),
        )
        return {
            "submission_id": cursor.lastrowid,
            "reference_id": reference_id,
            "student_id": student_id,
            "exam_id": exam_id,
            "submitted_at": submitted_at,
        }


def get_student_answers(student_id: str, exam_id: str) -> List[Dict[str, Any]]:
    """
    Fetch all saved answers for a student on a specific exam.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT question_id, selected_option, timestamp
            FROM student_answers
            WHERE student_id = ? AND exam_id = ?
            ORDER BY question_id ASC;
            """,
            (student_id, exam_id),
        )
        return [dict(row) for row in cursor.fetchall()]


def get_student_submission(student_id: str, exam_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch final submission record for a student if already submitted.
    """
    import json
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT submission_id, reference_id, student_id, exam_id, answers_json, summary_json, submitted_at
            FROM student_submissions
            WHERE student_id = ? AND exam_id = ?
            ORDER BY submission_id DESC LIMIT 1;
            """,
            (student_id, exam_id),
        )
        row = cursor.fetchone()
        if not row:
            return None
        res = dict(row)
        res["answers"] = json.loads(res.pop("answers_json"))
        res["summary"] = json.loads(res.pop("summary_json"))
        return res

def fetch_all_students() -> List[Dict[str, Any]]:
    """Return the enrolled student roster from SQLite."""
    with get_db() as conn:
        rows = conn.execute(
            "SELECT student_id, name, status FROM students ORDER BY student_id;"
        ).fetchall()
        return [dict(row) for row in rows]

