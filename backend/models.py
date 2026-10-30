"""
SENTINEL Backend - Data Models
Pydantic schemas for request validation, event payloads, and REST responses.
"""

from enum import Enum
from typing import Optional, List, Any
from pydantic import BaseModel, Field


class TeacherAction(str, Enum):
    """Permitted teacher actions targeting student sessions."""
    WARNING = "WARNING"
    LOCK = "LOCK"
    UNLOCK = "UNLOCK"


class LoginRequest(BaseModel):
    """Schema for student login authentication."""
    student_id: str = Field(..., min_length=1, description="Unique identifier for the student")

    model_config = {
        "json_schema_extra": {
            "example": {
                "student_id": "STU001"
            }
        }
    }


class LoginResponse(BaseModel):
    """Response returned upon successful student verification."""
    success: bool
    student_id: str
    name: str
    status: str
    message: str


class AlertEvent(BaseModel):
    """
    Schema for security violations or proctoring events triggered by
    either the React Web UI or the Python OS Desktop Agent.
    """
    student_id: str = Field(..., description="Student ID associated with violation")
    event_type: str = Field(..., description="Type of alert, e.g. BROWSER_SWITCH, APPLICATION_SWITCH")
    description: Optional[str] = Field(None, description="Descriptive text of the violation")
    application_name: Optional[str] = Field(None, description="Name of external program if detected")
    timestamp: Optional[str] = Field(None, description="ISO timestamp of event")
    exam_id: Optional[str] = Field(None, description="Examination ID")
    subtype: Optional[str] = Field(None, description="Subtype of violation")
    warning_count: Optional[int] = Field(None, description="Warning counter")
    severity: Optional[str] = Field(None, description="Severity level")

    model_config = {
        "json_schema_extra": {
            "example": {
                "student_id": "STU001",
                "event_type": "BROWSER_SWITCH",
                "description": "Student navigated away from exam tab to another browser window.",
                "application_name": "Google Chrome",
                "timestamp": "2026-10-30T17:45:00Z"
            }
        }
    }


class TeacherCommand(BaseModel):
    """
    Schema for control commands issued from the Teacher Dashboard
    to be forwarded to a student's Web and/or OS clients.
    """
    student_id: str = Field(..., description="Target student ID")
    action: str = Field(..., description="Action: WARNING or LOCK (or UNLOCK)")
    message: Optional[str] = Field(None, description="Optional custom alert message for the student")

    model_config = {
        "json_schema_extra": {
            "example": {
                "student_id": "STU001",
                "action": "WARNING",
                "message": "Please return your focus to the exam window immediately."
            }
        }
    }


class ScreenFramePayload(BaseModel):
    """Schema for live screen streaming frames sent by OS Desktop Agent."""
    student_id: str
    image_base64: str
    timestamp: Optional[str] = None


class ExamInfo(BaseModel):
    """Exam metadata and instructions returned to the student UI."""
    exam_id: str
    title: str
    duration: int  # Duration in minutes
    status: str
    instructions: List[str]
    questions: Optional[List[dict]] = None


class AlertRecord(BaseModel):
    """Complete violation history record representation."""
    alert_id: int
    student_id: str
    student_name: Optional[str] = None
    event_type: str
    description: Optional[str] = None
    application_name: Optional[str] = None
    timestamp: str


class SaveAnswerRequest(BaseModel):
    """Schema for candidate answer autosave."""
    student_id: str = Field(..., min_length=1, description="Student ID")
    exam_id: str = Field(..., min_length=1, description="Exam ID")
    question_id: int = Field(..., description="Numerical Question ID")
    selected_option: str = Field(..., min_length=1, description="Selected option key (e.g. A, B, C, D)")
    timestamp: Optional[str] = None


class SaveAnswerResponse(BaseModel):
    """Response returned upon saving an answer."""
    success: bool
    student_id: str
    question_id: int
    selected_option: str
    message: str


class ExamSubmissionRequest(BaseModel):
    """Schema for candidate final exam submission."""
    student_id: str = Field(..., min_length=1, description="Student ID")
    exam_id: str = Field(..., min_length=1, description="Exam ID")
    answers: dict = Field(..., description="Map of question IDs to selected options")
    summary: Optional[dict] = Field(None, description="Completion summary statistics")
    submission_time: Optional[str] = None


class ExamSubmissionResponse(BaseModel):
    """Response returned upon successful exam submission."""
    success: bool
    reference_id: str
    status: str
    student_id: str
    exam_id: str
    timestamp: str


class MonitoringEventResponse(BaseModel):
    """Response returned when a monitoring event is recorded via REST."""
    success: bool
    alert_id: int
    status: str
