from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    file = serializers.FileField(required=True, help_text='Upload PDF, DOCX, image, or text file')
    
    class Meta:
        model = Document
        fields = ['id', 'file', 'title', 'file_type', 'status', 'page_count', 'extracted_text', 'created_at', 'vector_store_id']
        read_only_fields = ['title', 'file_type', 'status', 'page_count', 'extracted_text', 'vector_store_id', 'created_at']