import os
import json
import numpy as np
import faiss
import logging
from typing import List, Tuple, Optional

from ..schemas.vault import VaultDocument
from ..embeddings.local import embedding_provider

# Configure logging
logger = logging.getLogger(__name__)

def _flatten_content(content: dict) -> str:
    """Flattens a content dictionary into a single string for embedding."""
    return ". ".join([f"{key} is {value}" for key, value in content.items()])

class VaultService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            logger.info("Creating new VaultService instance.")
            cls._instance = super(VaultService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        self.documents: List[VaultDocument] = []
        self.index = None
        self.doc_id_map: List[str] = []
        
        try:
            self.load_and_index_vault()
            self._initialized = True
            logger.info("VaultService initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize VaultService: {e}", exc_info=True)
            # Prevent partial initialization
            self._initialized = False
            raise

    def load_and_index_vault(self):
        """Loads all documents from the vault directory and builds a FAISS index."""
        logger.info("Loading and indexing vault...")
        # Path is relative to the project root
        vault_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'vault')
        
        if not os.path.isdir(vault_path):
            logger.error(f"Vault directory not found at: {vault_path}")
            return

        docs_to_process = []
        for filename in os.listdir(vault_path):
            if filename.endswith(".json"):
                file_path = os.path.join(vault_path, filename)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        doc = VaultDocument(**data)
                        docs_to_process.append(doc)
                except Exception as e:
                    logger.error(f"Failed to load or parse vault document {filename}: {e}")

        if not docs_to_process:
            logger.warning("No documents found in the vault.")
            return

        self.documents = docs_to_process
        self.doc_id_map = [doc.document_id for doc in self.documents]

        # Generate embeddings
        logger.info(f"Generating embeddings for {len(self.documents)} documents...")
        content_strings = [_flatten_content(doc.content) for doc in self.documents]
        embeddings = embedding_provider.get_embeddings(content_strings)
        
        # We need to handle cases where embeddings might fail
        valid_embeddings = [emb for emb in embeddings if emb is not None and emb.ndim == 1]
        
        if not valid_embeddings:
            logger.error("No valid embeddings were generated. Cannot build index.")
            return

        embedding_dim = valid_embeddings[0].shape[0]
        
        # Build FAISS index
        logger.info(f"Building FAISS index with dimension {embedding_dim}.")
        self.index = faiss.IndexFlatL2(embedding_dim)
        embeddings_matrix = np.array(valid_embeddings).astype('float32')
        self.index.add(embeddings_matrix)
        logger.info(f"FAISS index built successfully with {self.index.ntotal} vectors.")

    def search(self, query_embedding: np.ndarray, k: int = 1) -> List[Tuple[float, VaultDocument]]:
        """
        Searches the vault for the most similar documents.

        Args:
            query_embedding: The embedding of the query text.
            k: The number of nearest neighbors to return.

        Returns:
            A list of tuples, each containing (similarity_score, VaultDocument).
            Returns an empty list if the index is not available.
        """
        if self.index is None or self.index.ntotal == 0:
            logger.warning("Search attempted but FAISS index is not available or empty.")
            return []

        if query_embedding.ndim == 1:
            query_embedding = np.expand_dims(query_embedding, axis=0)
        
        query_embedding = query_embedding.astype('float32')

        distances, indices = self.index.search(query_embedding, k)
        
        results = []
        for i in range(len(indices[0])):
            idx = indices[0][i]
            if idx != -1:
                # FAISS returns L2 distance. Cosine similarity is often more intuitive.
                # For normalized vectors, (2 - L2_distance^2) / 2 = cosine_similarity
                # Let's just use the distance as a score for now, lower is better.
                # Or we can re-implement with IndexFlatIP for dot product. For now, this is ok.
                score = distances[0][i]
                doc_id = self.doc_id_map[idx]
                doc = self.get_document_by_id(doc_id)
                if doc:
                    results.append((score, doc))
        
        return results

    def get_document_by_id(self, document_id: str) -> Optional[VaultDocument]:
        """Retrieves a document from the loaded documents by its ID."""
        for doc in self.documents:
            if doc.document_id == document_id:
                return doc
        return None

# Singleton instance of the VaultService
vault_service = VaultService()
