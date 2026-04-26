from rest_framework import generics, viewsets, status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Document
from .serializers import DocumentSerializer
from rest_framework import serializers


class DocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing Documents (create, list, retrieve, destroy)."""
    serializer_class = DocumentSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Document.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        """Override create to set the user and skip async processing."""
        file = self.request.FILES.get('file')
        if not file:
            raise serializers.ValidationError({'file': 'This field is required.'})
        
        ext = file.name.split('.')[-1].lower()
        # Save with 'pending' status - will be processed on-demand when questions are generated
        doc = serializer.save(user=self.request.user, file_type=ext, title=file.name, status='pending')
        
        # Note: Async processing removed - documents are now processed synchronously
        # when users attempt to generate questions. This eliminates the dependency
        # on Celery/Redis and ensures immediate processing without delays.
    
    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """
        Get the processing status of a document.
        GET /api/documents/{id}/status/
        """
        document = self.get_object()
        return Response({
            'id': document.id,
            'title': document.title,
            'status': document.status,
            'file_type': document.file_type,
            'extracted_text_length': len(document.extracted_text) if document.extracted_text else 0,
            'page_count': document.page_count,
            'created_at': document.created_at,
            'vector_store_id': document.vector_store_id
        })