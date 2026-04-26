import os
import logging
from pathlib import Path
from django.conf import settings
from langchain_community.vectorstores import FAISS
from .llm_client import get_embeddings
import json

logger = logging.getLogger(__name__)

VECTOR_STORE_PATH = settings.VECTOR_STORE_PATH
os.makedirs(VECTOR_STORE_PATH, exist_ok=True)


def create_vector_store(documents_list: list, store_name: str) -> str:
    """
    Create a FAISS vector store from a list of documents.
    Uses free HuggingFace embeddings (no API keys needed).
    Returns the store ID (directory name).
    """
    try:
        embeddings = get_embeddings()
        
        # Create store directory
        store_path = VECTOR_STORE_PATH / store_name
        os.makedirs(store_path, exist_ok=True)
        
        # Create FAISS vector store
        vectorstore = FAISS.from_documents(documents_list, embeddings)
        
        # Save to disk
        vectorstore.save_local(str(store_path))
        
        logger.info(f"Created vector store: {store_name}")
        return store_name
    except Exception as e:
        logger.error(f"Error creating vector store: {str(e)}")
        raise


def get_relevant_context(store_id: str, query: str, k: int = 5) -> str:
    """
    Retrieve relevant context from a vector store based on a query.
    """
    try:
        store_path = VECTOR_STORE_PATH / store_id
        embeddings = get_embeddings()
        
        # Load vector store from disk with deserialization enabled
        vectorstore = FAISS.load_local(
            str(store_path), 
            embeddings,
            allow_dangerous_deserialization=True
        )
        
        # Search for relevant documents
        docs = vectorstore.similarity_search(query, k=k)
        
        # Combine document content
        context = "\n\n".join([doc.page_content for doc in docs])
        return context
    except Exception as e:
        logger.error(f"Error retrieving context from vector store {store_id}: {str(e)}")
        return ""


def delete_vector_store(store_id: str) -> bool:
    """
    Delete a vector store by store ID.
    """
    try:
        store_path = VECTOR_STORE_PATH / store_id
        import shutil
        if os.path.exists(store_path):
            shutil.rmtree(store_path)
            logger.info(f"Deleted vector store: {store_id}")
            return True
        return False
    except Exception as e:
        logger.error(f"Error deleting vector store {store_id}: {str(e)}")
        return False
