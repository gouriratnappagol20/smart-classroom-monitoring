/**
 * SENTINEL Student Interface API Service
 * Handles communication with the FastAPI backend with real endpoints and strict validation.
 */

import { API_BASE_URL } from './config';

/**
 * Authenticates candidate against backend enrolled roster.
 * POST /api/login
 */
export async function loginStudentApi(studentId, examCode) {
  const res = await fetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id: studentId.trim() }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.detail || `Authentication failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  if (data.success === false) {
    throw new Error(data.message || "Candidate session is not authorized or is locked.");
  }

  return data;
}

/**
 * Fetches active examination metadata, instructions, and questions.
 * GET /api/exam
 */
export async function getExamApi() {
  const res = await fetch(`${API_BASE_URL}/api/exam`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch exam details (status ${res.status})`);
  }

  return await res.json();
}

/**
 * Saves or updates a candidate's answer for a question in SQLite.
 * POST /api/exam/save-answer
 */
export async function saveAnswerApi(studentId, examId, questionId, selectedOption) {
  const res = await fetch(`${API_BASE_URL}/api/exam/save-answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: String(studentId),
      exam_id: String(examId),
      question_id: Number(questionId),
      selected_option: String(selectedOption),
      timestamp: new Date().toISOString()
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Save failed (${res.status})`);
  }

  return await res.json();
}

/**
 * Submits final examination answers and summary to the backend.
 * POST /api/exam/submit
 */
export async function submitExamApi(studentId, examId, answers, summary) {
  const res = await fetch(`${API_BASE_URL}/api/exam/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: String(studentId),
      exam_id: String(examId),
      answers: answers || {},
      summary: summary || {},
      submission_time: new Date().toISOString()
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Submission failed (${res.status})`);
  }

  return await res.json();
}

/**
 * Transmits a proctoring/security alert to the backend.
 * POST /api/monitoring/event
 */
export async function sendMonitoringEventApi(event) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/monitoring/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("[SENTINEL API] Failed to transmit event via REST:", err);
  }
}
