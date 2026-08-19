from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas.test import TestResponse
from ..storage.local_sqlite import audit_provider
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/audit", response_model=List[TestResponse])
def get_audit_logs(limit: int = 100, offset: int = 0):
    """
    Retrieves a list of audit log events.
    """
    try:
        return audit_provider.get_events(limit=limit, offset=offset)
    except Exception as e:
        logger.error(f"An error occurred while retrieving audit logs: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
