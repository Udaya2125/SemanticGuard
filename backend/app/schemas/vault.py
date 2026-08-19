from pydantic import BaseModel, Field
from typing import Dict, Any

class VaultDocument(BaseModel):
    document_id: str = Field(..., description="Unique identifier for the document.")
    type: str = Field(..., description="Type of the document, e.g., 'Employee Record'.")
    classification: str = Field(..., description="Security classification, e.g., 'CONFIDENTIAL'.")
    lineage_tag: str = Field(..., description="The data lineage tag for auditing.")
    content: Dict[str, Any] = Field(..., description="The structured content of the document.")
    
    # The embedding will be managed by the vault service, not directly part of the base model
    # to avoid circular dependencies and keep the model clean.
