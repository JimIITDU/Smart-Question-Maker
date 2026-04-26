from django.db import models
from django.conf import settings

class Document(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='documents/%Y/%m/')
    file_type = models.CharField(max_length=10)  # pdf, image
    title = models.CharField(max_length=255, blank=True)
    extracted_text = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    vector_store_id = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    page_count = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.title} ({self.user.email})"