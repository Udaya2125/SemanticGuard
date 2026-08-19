from abc import ABC, abstractmethod
from typing import Dict, Any

class AgentProvider(ABC):
    """
    Abstract base class for a demo agent provider.
    """

    @abstractmethod
    def generate_response(self, mode: str, query: str, context: Dict[str, Any] = None) -> str:
        """
        Generates a response from the agent based on the given mode and query.

        Args:
            mode: The behavior mode of the agent (e.g., 'SAFE', 'LEAKY').
            query: The user's input query.
            context: Optional additional context, such as a protected document.

        Returns:
            The agent's generated response as a string.
        """
        pass
