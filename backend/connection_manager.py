"""
SENTINEL Backend - Connection Manager
Maintains and orchestrates WebSocket connection pools for Teachers, Student Web UIs,
and Student Python OS Agents.
"""

import asyncio
import logging
from typing import List, Dict, Any, Optional
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger("sentinel.connection_manager")
logging.basicConfig(level=logging.INFO)


class ConnectionManager:
    """
    Manages three isolated WebSocket connection pools:
      - active_teachers: Connected teacher dashboard web clients.
      - active_student_web: Connected student React exam web clients (keyed by student_id).
      - active_student_os: Connected student Python OS desktop agents (keyed by student_id).
    """

    def __init__(self):
        # Pool of active teacher WebSocket connections
        self.active_teachers: List[WebSocket] = []

        # Map student_id -> WebSocket for React exam browser sessions
        self.active_student_web: Dict[str, WebSocket] = {}

        # Map student_id -> WebSocket for Python OS background monitoring agents
        self.active_student_os: Dict[str, WebSocket] = {}

        # Lock for thread-safe state mutations
        self._lock = asyncio.Lock()

    # ---------------------------------------------------------
    # Teacher Connection Lifecycle
    # ---------------------------------------------------------
    async def connect_teacher(self, websocket: WebSocket) -> None:
        """Accept and register a new teacher dashboard connection."""
        await websocket.accept()
        async with self._lock:
            self.active_teachers.append(websocket)
        logger.info(f"[Teacher Connected] Total active teachers: {len(self.active_teachers)}")

    async def disconnect_teacher(self, websocket: WebSocket) -> None:
        """Safely unregister a teacher dashboard connection."""
        async with self._lock:
            if websocket in self.active_teachers:
                self.active_teachers.remove(websocket)
        logger.info(f"[Teacher Disconnected] Total active teachers: {len(self.active_teachers)}")

    # ---------------------------------------------------------
    # Student Web Connection Lifecycle
    # ---------------------------------------------------------
    async def connect_student_web(self, student_id: str, websocket: WebSocket) -> None:
        """
        Accept and register a student's React web exam interface.
        If an existing connection for this student exists, it is superseded cleanly.
        """
        await websocket.accept()
        async with self._lock:
            # If an old socket was open for this student, close it politely
            old_socket = self.active_student_web.get(student_id)
            if old_socket and old_socket != websocket:
                try:
                    await old_socket.close(reason="Superseded by new web connection")
                except Exception:
                    pass
            self.active_student_web[student_id] = websocket

        logger.info(f"[Student Web Connected] student_id={student_id}")

        # Notify teachers that student's web exam session is online
        await self.broadcast_to_teachers({
            "type": "STUDENT_STATUS",
            "student_id": student_id,
            "channel": "WEB",
            "status": "ONLINE",
            "message": f"Student {student_id} exam browser interface connected."
        })

    async def disconnect_student_web(self, student_id: str, websocket: Optional[WebSocket] = None) -> None:
        """Unregister a student's React web exam interface."""
        async with self._lock:
            current_ws = self.active_student_web.get(student_id)
            if current_ws and (websocket is None or current_ws == websocket):
                self.active_student_web.pop(student_id, None)

        logger.info(f"[Student Web Disconnected] student_id={student_id}")

        # Notify teachers of disconnect
        await self.broadcast_to_teachers({
            "type": "STUDENT_STATUS",
            "student_id": student_id,
            "channel": "WEB",
            "status": "OFFLINE",
            "message": f"Student {student_id} exam browser interface disconnected."
        })

    # ---------------------------------------------------------
    # Student OS Agent Connection Lifecycle
    # ---------------------------------------------------------
    async def connect_student_os(self, student_id: str, websocket: WebSocket) -> None:
        """
        Accept and register a student's Python OS Desktop background agent.
        If an existing connection exists, it is superseded cleanly.
        """
        await websocket.accept()
        async with self._lock:
            old_socket = self.active_student_os.get(student_id)
            if old_socket and old_socket != websocket:
                try:
                    await old_socket.close(reason="Superseded by new OS agent connection")
                except Exception:
                    pass
            self.active_student_os[student_id] = websocket

        logger.info(f"[Student OS Agent Connected] student_id={student_id}")

        # Notify teachers that student's OS background agent is active
        await self.broadcast_to_teachers({
            "type": "STUDENT_STATUS",
            "student_id": student_id,
            "channel": "OS",
            "status": "ONLINE",
            "message": f"Student {student_id} OS desktop agent connected."
        })

    async def disconnect_student_os(self, student_id: str, websocket: Optional[WebSocket] = None) -> None:
        """Unregister a student's Python OS Desktop background agent."""
        async with self._lock:
            current_ws = self.active_student_os.get(student_id)
            if current_ws and (websocket is None or current_ws == websocket):
                self.active_student_os.pop(student_id, None)

        logger.info(f"[Student OS Agent Disconnected] student_id={student_id}")

        # Notify teachers of OS agent disconnect
        await self.broadcast_to_teachers({
            "type": "STUDENT_STATUS",
            "student_id": student_id,
            "channel": "OS",
            "status": "OFFLINE",
            "message": f"Student {student_id} OS desktop agent disconnected."
        })

    # ---------------------------------------------------------
    # Broadcasting & Command Routing
    # ---------------------------------------------------------
    async def broadcast_to_teachers(self, message: Dict[str, Any]) -> None:
        """
        Broadcast a message (such as alert notifications, live screen frames,
        or telemetry updates) to all active teacher dashboards.
        Automatically prunes dead or unresponsive sockets.
        """
        if not self.active_teachers:
            return

        stale_teachers: List[WebSocket] = []

        # Iterate over a snapshot of active connections
        for ws in list(self.active_teachers):
            try:
                await ws.send_json(message)
            except Exception as exc:
                logger.warning(f"Error broadcasting to teacher socket: {exc}")
                stale_teachers.append(ws)

        if stale_teachers:
            async with self._lock:
                for ws in stale_teachers:
                    if ws in self.active_teachers:
                        self.active_teachers.remove(ws)

    async def send_command_to_student(
        self,
        student_id: str,
        command: Dict[str, Any],
        target: str = "all"
    ) -> Dict[str, bool]:
        """
        Route teacher enforcement actions (e.g. WARNING, LOCK) to a specific student.

        Args:
            student_id: Target student identifier.
            command: JSON-serializable dictionary with action, message, timestamp.
            target: "all", "web", or "os".

        Returns:
            Dict indicating delivery status to web and os channels:
            {"web_delivered": bool, "os_delivered": bool}
        """
        results = {"web_delivered": False, "os_delivered": False}

        # Send to React Web interface
        if target in ("all", "web") and student_id in self.active_student_web:
            web_ws = self.active_student_web[student_id]
            try:
                await web_ws.send_json(command)
                results["web_delivered"] = True
                logger.info(f"Delivered command to Web client of student {student_id}: {command.get('action')}")
            except Exception as exc:
                logger.warning(f"Failed to deliver command to student {student_id} Web: {exc}")
                await self.disconnect_student_web(student_id, web_ws)

        # Send to Python OS Desktop agent
        if target in ("all", "os") and student_id in self.active_student_os:
            os_ws = self.active_student_os[student_id]
            try:
                await os_ws.send_json(command)
                results["os_delivered"] = True
                logger.info(f"Delivered command to OS Agent of student {student_id}: {command.get('action')}")
            except Exception as exc:
                logger.warning(f"Failed to deliver command to student {student_id} OS: {exc}")
                await self.disconnect_student_os(student_id, os_ws)

        return results

    def get_status_overview(self) -> Dict[str, Any]:
        """
        Get an instantaneous snapshot of connected clients across all pools.
        """
        return {
            "teacher_count": len(self.active_teachers),
            "web_students": list(self.active_student_web.keys()),
            "os_students": list(self.active_student_os.keys()),
            "total_connected_students": len(
                set(self.active_student_web.keys()) | set(self.active_student_os.keys())
            ),
        }


# Singleton ConnectionManager instance to be imported by endpoints
manager = ConnectionManager()

