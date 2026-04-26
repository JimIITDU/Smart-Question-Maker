import os
from pathlib import Path
from pypdf import PdfReader
from PIL import Image
import pytesseract
from docx import Document as DocxDocument
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS, Chroma
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class DocumentProcessor:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        self.embeddings = self._get_embeddings_model()

    def _get_embeddings_model(self):
        """Return an embeddings model object for use with vector stores."""
        if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY:
            try:
                from langchain_openai import OpenAIEmbeddings
                logger.info("Using OpenAI embeddings model.")
                return OpenAIEmbeddings(
                    openai_api_key=settings.OPENAI_API_KEY,
                    model="text-embedding-ada-002"
                )
            except Exception as e:
                logger.warning(f"OpenAI embeddings failed, falling back to HuggingFace: {e}")

        # Free local fallback using sentence-transformers
        try:
            from langchain_huggingface import HuggingFaceEmbeddings
            logger.info("Using HuggingFace local embeddings model.")
            return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        except Exception as e:
            logger.error(f"Failed to load HuggingFace embeddings: {e}")
            raise

    def extract_text_from_pdf(self, file_path: str) -> tuple[str, int]:
        """Extract text from PDF file with page count."""
        reader = PdfReader(file_path)
        pages = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages.append(text.strip())
        return "\n\n".join(pages), len(reader.pages)

    def extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file."""
        doc = DocxDocument(file_path)
        paragraphs = []
        for para in doc.paragraphs:
            if para.text.strip():
                paragraphs.append(para.text.strip())
        return "\n\n".join(paragraphs)

    def extract_text_from_image(self, file_path: str) -> str:
        """Extract text from image using OCR."""
        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
        return text.strip()

    def extract_text_from_txt(self, file_path: str) -> str:
        """Extract text from plain text file."""
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read().strip()

    def process_document(self, document) -> str:
        """Process document and extract text based on file type."""
        file_path = document.file.path
        ext = Path(file_path).suffix.lower()

        try:
            if ext == '.pdf':
                text, pages = self.extract_text_from_pdf(file_path)
                document.page_count = pages
            elif ext == '.docx':
                text = self.extract_text_from_docx(file_path)
            elif ext in ['.txt', '.text']:
                text = self.extract_text_from_txt(file_path)
            elif ext in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff']:
                text = self.extract_text_from_image(file_path)
            else:
                raise ValueError(f"Unsupported file type: {ext}")

            document.extracted_text = text
            document.status = 'completed'
            document.save()
            return text

        except Exception as e:
            logger.error(f"Failed to process document: {e}")
            document.status = 'failed'
            document.extracted_text = f"Error processing document: {str(e)}"
            document.save()
            raise

    def create_vector_store(self, document_id: int, text: str) -> str:
        """Create and save a vector store from document text."""
        try:
            chunks = self.text_splitter.split_text(text)
            store_path = str(settings.VECTOR_STORE_PATH / str(document_id))
            os.makedirs(store_path, exist_ok=True)

            if settings.VECTOR_STORE_TYPE == 'faiss':
                vectorstore = FAISS.from_texts(
                    texts=chunks,
                    embedding=self.embeddings,
                    metadatas=[{"doc_id": document_id, "chunk": i} for i in range(len(chunks))]
                )
                vectorstore.save_local(store_path)
            else:
                vectorstore = Chroma.from_texts(
                    texts=chunks,
                    embedding=self.embeddings,
                    persist_directory=store_path,
                    collection_name=f"doc_{document_id}"
                )
                vectorstore.persist()

            logger.info(f"Vector store created at {store_path}")
            return store_path

        except Exception as e:
            logger.error(f"Failed to create vector store: {e}")
            raise

    def load_vector_store(self, store_path: str):
        """Load an existing vector store from disk."""
        try:
            if settings.VECTOR_STORE_TYPE == 'faiss':
                return FAISS.load_local(
                    store_path,
                    self.embeddings,
                    allow_dangerous_deserialization=True
                )
            else:
                return Chroma(
                    persist_directory=store_path,
                    embedding_function=self.embeddings
                )
        except Exception as e:
            logger.error(f"Failed to load vector store from {store_path}: {e}")
            raise