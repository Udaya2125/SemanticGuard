import numpy as np
from typing import List
from sentence_transformers import SentenceTransformer
from .provider import EmbeddingProvider
from ..config import settings
import logging

# Set up logging
logger = logging.getLogger(__name__)

class LocalSentenceTransformerProvider(EmbeddingProvider):
    """
    An implementation of EmbeddingProvider that uses a local SentenceTransformer model.
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LocalSentenceTransformerProvider, cls).__new__(cls)
            try:
                logger.info(f"Loading local sentence transformer model: {settings.SEMANTIC_MODEL}")
                cls._instance.model = SentenceTransformer(settings.SEMANTIC_MODEL)
                logger.info("Sentence transformer model loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load sentence transformer model: {e}", exc_info=True)
                # In a real app, you might want to handle this more gracefully
                # For the hackathon, we'll let it raise to make the problem obvious on startup
                raise
        return cls._instance

    def get_embedding(self, text: str) -> np.ndarray:
        """
        Get the embedding for a single string of text.
        """
        if not text or not text.strip():
            # Return a zero vector for empty input
            embedding_dim = self.model.get_sentence_embedding_dimension()
            return np.zeros(embedding_dim, dtype=np.float32)
            
        return self.model.encode(text, convert_to_numpy=True)

    def get_embeddings(self, texts: List[str]) -> List[np.ndarray]:
        """
        Get the embeddings for a list of texts.
        """
        if not texts:
            return []
            
        return [self.get_embedding(text) for text in texts]

# Singleton instance
embedding_provider = LocalSentenceTransformerProvider()
