from ..schemas.test import SemanticDetails, FactJudgeDetails, DecisionDetails
from ..config import settings

class DecisionEngine:
    """
    A deterministic engine that makes a final decision based on semantic
    and factual analysis signals.
    """

    def decide(self, semantic_details: SemanticDetails, fact_judge_details: FactJudgeDetails) -> DecisionDetails:
        """
        Makes a decision based on the provided analysis.

        Args:
            semantic_details: The results from the semantic similarity scan.
            fact_judge_details: The results from the factual overlap judge.

        Returns:
            A DecisionDetails object with the final action and reasoning.
        """
        
        # Rule 1: Strong factual leak is always a BLOCK
        if fact_judge_details.is_derived and fact_judge_details.confidence >= settings.FACT_CONFIDENCE_THRESHOLD:
            return DecisionDetails(
                action="BLOCK",
                reason=f"Blocked due to high-confidence ({fact_judge_details.confidence:.2f}) factual overlap. "
                       f"Reason: {fact_judge_details.reason}"
            )
            
        # Rule 2: High semantic similarity can also be a BLOCK.
        # NOTE: The score from FAISS is L2 distance, so lower is more similar.
        # We need to convert this to a similarity score where higher is more similar.
        # A simple conversion: similarity = 1 - (distance / max_possible_distance).
        # This is a rough approximation. For normalized vectors, a better way is 1 - (distance^2 / 2).
        # Let's use a simple inversion for now: higher score = more similar.
        similarity_score = 1 - semantic_details.score if semantic_details.score is not None else 0.0

        is_high_similarity = (
            semantic_details.score is not None and
            similarity_score >= settings.SEMANTIC_BLOCK_THRESHOLD
        )
        
        if is_high_similarity and not fact_judge_details.is_derived:
             return DecisionDetails(
                action="BLOCK",
                reason=f"Blocked due to high semantic similarity ({similarity_score:.2f}) "
                       f"to protected document '{semantic_details.matched_document_id}' without a conclusive fact judge opinion."
            )

        # Rule 3: Medium suspicion cases go to REVIEW
        is_medium_similarity = (
            semantic_details.score is not None and
            settings.REVIEW_THRESHOLD <= similarity_score < settings.SEMANTIC_BLOCK_THRESHOLD
        )
        is_uncertain_fact_judge = (
            fact_judge_details.is_derived and
            fact_judge_details.confidence < settings.FACT_CONFIDENCE_THRESHOLD
        )

        if is_medium_similarity or is_uncertain_fact_judge:
            return DecisionDetails(
                action="REVIEW",
                reason="The output is suspicious but does not meet the threshold for an automatic block. "
                       f"Similarity: {semantic_details.score:.2f}, "
                       f"Fact Judge Confidence: {fact_judge_details.confidence:.2f}."
            )

        # Rule 4: Default to ALLOW
        return DecisionDetails(
            action="ALLOW",
            reason="The output does not show significant semantic or factual overlap with protected data."
        )

# Singleton instance
decision_engine = DecisionEngine()
