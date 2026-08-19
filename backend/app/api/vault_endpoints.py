from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas.vault import VaultDocument
from ..vault.service import vault_service

router = APIRouter()

# ... existing /test endpoint ...

@router.get("/vault", response_model=List[VaultDocument])
def get_vault_contents():
    """
    Retrieves the contents of the protected data vault.
    """
    try:
        return vault_service.documents
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
