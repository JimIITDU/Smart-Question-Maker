from celery import shared_task
from apps.documents.models import Document
from apps.documents.processors import DocumentProcessor
import logging

logger = logging.getLogger(__name__)


@shared_task
def process_document_task(document_id):
    """
    Process a document by extracting text from it.
    Supports: PDF, DOCX, TXT, and image files (PNG, JPG, etc.)
    """
    try:
        doc = Document.objects.get(id=document_id)
        doc.status = 'processing'
        doc.save()
        
        # Use DocumentProcessor for consistent text extraction
        processor = DocumentProcessor()
        extracted_text = processor.process_document(doc)
        
        # Create vector store for the extracted text
        try:
            store_id = processor.create_vector_store(doc.id, extracted_text)
            doc.vector_store_id = store_id
            doc.save()
        except Exception as e:
            logger.warning(f"Failed to create vector store for document {document_id}: {str(e)}")
            # Continue even if vector store creation fails
        
        logger.info(f"Successfully processed document {document_id}")
        return True
        
    except Document.DoesNotExist:
        logger.error(f"Document {document_id} not found")
        return False
    except Exception as e:
        logger.error(f"Error processing document {document_id}: {str(e)}")
        try:
            doc = Document.objects.get(id=document_id)
            doc.status = 'failed'
            doc.extracted_text = f"Processing failed: {str(e)}"
            doc.save()
        except:
            pass
        return False
