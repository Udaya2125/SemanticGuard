from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas.test import TestRequest, TestResponse
from ..detection.service import detection_service
from ..storage.local_sqlite import audit_provider
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/test", response_model=TestResponse)
def run_test(request: TestRequest):
    """
    Runs a full detection pipeline test and logs the event.
    """
    try:
        logger.info(f"Received test request with mode: {request.mode}")
        response = detection_service.run_detection_pipeline(request)
        # Log the event to the audit trail
        audit_provider.log_event(response)
        return response
    except Exception as e:
        logger.error(f"An error occurred during the test run: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
