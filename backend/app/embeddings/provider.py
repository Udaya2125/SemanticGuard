from abc import ABC, abstractmethod
from typing import List
import numpy as np

class EmbeddingProvider(ABC):
    """
    Abstract base class for an embedding provider.
    """
    
    @abstractmethod
    def get_embedding(self, text: str) -> np.ndarray:
        """
        Get the embedding for a single string of text.
        
        Args:
            text: The text to embed.
            
        Returns:
            A numpy array representing the embedding.
        """
        pass
        
    @abstractmethod
    def get_embeddings(self, texts: List[str]) -> List[np.ndarray]:
        """
        Get the embeddings for a list of texts.
        
        Args:
            texts: A list of strings to embed.
            
        Returns:
            A list of numpy arrays representing the embeddings.
        """
        pass
