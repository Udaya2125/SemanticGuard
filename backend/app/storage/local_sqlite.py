import sqlite3
import json
import logging
from typing import List, Optional
from ..schemas.test import TestResponse
from ..audit.provider import AuditProvider

# Configure logging
logger = logging.getLogger(__name__)

DB_FILE = "local_audit.db"

class LocalSqliteAudit(AuditProvider):
    """
    An audit provider that logs events to a local SQLite database.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LocalSqliteAudit, cls).__new__(cls)
            cls._instance.conn = None
        return cls._instance

    def __init__(self):
        if self.conn is None:
            try:
                self.conn = sqlite3.connect(DB_FILE, check_same_thread=False)
                self.conn.row_factory = sqlite3.Row
                self._create_table()
                logger.info(f"Successfully connected to SQLite database: {DB_FILE}")
            except sqlite3.Error as e:
                logger.error(f"Error connecting to SQLite database: {e}", exc_info=True)
                raise

    def _create_table(self):
        """Creates the audit_events table if it doesn't exist."""
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS audit_events (
                    request_id TEXT PRIMARY KEY,
                    event_data TEXT NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            self.conn.commit()
        except sqlite3.Error as e:
            logger.error(f"Error creating table in SQLite: {e}", exc_info=True)
            raise

    def log_event(self, event: TestResponse):
        """Logs a detection event to the SQLite database."""
        try:
            event_json = event.model_dump_json()
            cursor = self.conn.cursor()
            cursor.execute(
                "INSERT INTO audit_events (request_id, event_data) VALUES (?, ?)",
                (event.request_id, event_json)
            )
            self.conn.commit()
            logger.info(f"Logged event {event.request_id} to SQLite.")
        except sqlite3.Error as e:
            logger.error(f"Error logging event to SQLite: {e}", exc_info=True)
            # Don't crash the app if logging fails
            pass

    def get_events(self, limit: int = 100, offset: int = 0) -> List[TestResponse]:
        """Retrieves a list of logged events from the SQLite database."""
        events = []
        try:
            cursor = self.conn.cursor()
            cursor.execute(
                "SELECT event_data FROM audit_events ORDER BY timestamp DESC LIMIT ? OFFSET ?",
                (limit, offset)
            )
            rows = cursor.fetchall()
            for row in rows:
                event_data = json.loads(row['event_data'])
                events.append(TestResponse(**event_data))
            return events
        except sqlite3.Error as e:
            logger.error(f"Error getting events from SQLite: {e}", exc_info=True)
            return []

# Singleton instance
audit_provider = LocalSqliteAudit()
