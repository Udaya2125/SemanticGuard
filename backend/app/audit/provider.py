from abc import ABC, abstractmethod
from typing import List
from ..schemas.test import TestResponse

class AuditProvider(ABC):
    """
    Abstract base class for an audit logging provider.
    """

    @abstractmethod
    def log_event(self, event: TestResponse):
        """
        Logs a detection event.

        Args:
            event: The TestResponse object containing all details of the detection.
        """
        pass

    @abstractmethod
    def get_events(self, limit: int = 100, offset: int = 0) -> List[TestResponse]:
        """
        Retrieves a list of logged events.

        Args:
            limit: The maximum number of events to return.
            offset: The number of events to skip.

        Returns:
            A list of TestResponse objects.
        """
        pass
