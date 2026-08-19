import time
import uuid
import logging
import numpy as np

from ..schemas.test import TestRequest, TestResponse, SemanticDetails, FactJudgeDetails, DecisionDetails
from ..config import settings
from ..embeddings.local import embedding_provider
from ..vault.service import vault_service
from ..decision.engine import decision_engine

# Provider selection: LLM_PROVIDER=openrouter (default, unchanged behavior),
# LLM_PROVIDER=grok, or LLM_PROVIDER=groq. All providers implement the same
# AgentProvider / FactJudgeProvider interfaces (see app/agent/provider.py,
# app/judge/provider.py).
if settings.LLM_PROVIDER.lower() == "grok":
    from ..agent.grok import agent_provider
    from ..judge.grok import fact_judge_provider
elif settings.LLM_PROVIDER.lower() == "groq":
    from ..agent.groq import agent_provider
    from ..judge.groq import fact_judge_provider
else:
    from ..agent.openrouter import agent_provider
    from ..judge.openrouter import fact_judge_provider

# Configure logging
logger = logging.getLogger(__name__)

class DetectionService:
    """
    This service orchestrates the entire detection pipeline.
    """

    def run_detection_pipeline(self, request: TestRequest) -> TestResponse:
        """
        Runs the full detection pipeline from agent response to final decision.
        """
        start_time = time.time()
        request_id = str(uuid.uuid4())
        
        # 1. Get agent response
        logger.info(f"[{request_id}] Getting agent response for query: '{request.query}' in mode '{request.mode}'")
        agent_output = agent_provider.generate_response(mode=request.mode, query=request.query)

        # 2. Semantic Analysis
        logger.info(f"[{request_id}] Performing semantic analysis on agent output.")
        output_embedding = embedding_provider.get_embedding(agent_output)
        
        search_results = vault_service.search(output_embedding, k=1)
        
        semantic_details: SemanticDetails
        top_doc = None
        if search_results:
            score, top_doc = search_results[0]
            # TODO: Convert L2 distance to a more intuitive similarity score
            semantic_details = SemanticDetails(score=score, matched_document_id=top_doc.document_id)
            logger.info(f"[{request_id}] Semantic search found top match: doc_id={top_doc.document_id} with score={score}")
        else:
            semantic_details = SemanticDetails(score=None, matched_document_id=None)
            logger.info(f"[{request_id}] No similar documents found in the vault.")

        # 3. Factual Overlap Analysis
        fact_judge_details: FactJudgeDetails
        if top_doc:
            logger.info(f"[{request_id}] Performing factual overlap analysis against doc_id={top_doc.document_id}")
            fact_judge_details = fact_judge_provider.judge_leak(agent_output, top_doc)
        else:
            # If no document is semantically similar, we can skip the fact judge
            fact_judge_details = FactJudgeDetails(is_derived=False, reason="Skipped: No semantically similar document found.")

        # 4. Decision
        logger.info(f"[{request_id}] Making final decision.")
        decision_details = decision_engine.decide(semantic_details, fact_judge_details)

        end_time = time.time()
        processing_ms = (end_time - start_time) * 1000
        
        logger.info(f"[{request_id}] Pipeline completed in {processing_ms:.2f}ms. Decision: {decision_details.action}")

        # 5. Assemble response
        return TestResponse(
            request_id=request_id,
            mode=request.mode,
            query=request.query,
            agent_output=agent_output,
            semantic=semantic_details,
            fact_judge=fact_judge_details,
            decision=decision_details,
            lineage_tag=top_doc.lineage_tag if top_doc else None,
            processing_ms=processing_ms,
        )

# Singleton instance
detection_service = DetectionService()
