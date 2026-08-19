from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from mangum import Mangum
from .api import test_endpoints, audit_endpoints, vault_endpoints
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="SemanticGuard API",
    description="API for the Semantic Data Exfiltration Detector.",
    version="0.1.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "SemanticGuard API is running."}

@app.get("/health", tags=["Monitoring"])
def health_check():
    return {"status": "ok"}

# Include the API routers
app.include_router(test_endpoints.router, prefix="/api", tags=["Testing"])
app.include_router(audit_endpoints.router, prefix="/api", tags=["Auditing"])
app.include_router(vault_endpoints.router, prefix="/api", tags=["Vault"])

handler = Mangum(app)
