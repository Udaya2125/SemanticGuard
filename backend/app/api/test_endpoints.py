from fastapi import APIRouter, HTTPException, Request
from typing import List, Optional
from datetime import datetime, timezone
from ..schemas.test import TestRequest, TestResponse
from ..detection.service import detection_service
from ..storage.local_sqlite import audit_provider
from ..config import settings
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()


def _get_client_ip(http_request: Request) -> Optional[str]:
    """
    Returns the requester's IP for audit purposes.

    Defaults to the direct TCP connection's address (request.client.host),
    which cannot be spoofed by the caller. X-Forwarded-For is only consulted
    when TRUST_PROXY_HEADERS is explicitly enabled, since that header is
    otherwise just an arbitrary, client-controllable string — see
    settings.TRUST_PROXY_HEADERS.
    """
    if settings.TRUST_PROXY_HEADERS:
        forwarded_for = http_request.headers.get("x-forwarded-for")
        if forwarded_for:
            # The first entry is the original client; anything after that
            # was appended by proxies in the chain.
            return forwarded_for.split(",")[0].strip()
    return http_request.client.host if http_request.client else None


@router.post("/test", response_model=TestResponse)
def run_test(request: TestRequest, http_request: Request):
    """
    Runs a full detection pipeline test and logs the event.
    """
    received_at = datetime.now(timezone.utc).isoformat()
    client_ip = _get_client_ip(http_request)

    try:
        logger.info(f"Received test request with mode: {request.mode}")
        response = detection_service.run_detection_pipeline(request)
        response.timestamp = received_at
        response.requester_ip = client_ip
        # Log the event to the audit trail
        audit_provider.log_event(response)
        return response
    except Exception as e:
        logger.error(f"An error occurred during the test run: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
