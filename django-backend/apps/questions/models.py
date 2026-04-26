from django.db import models
from django.conf import settings


class QuestionSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sessions')
    document = models.ForeignKey('documents.Document', on_delete=models.CASCADE, related_name='sessions')
    created_at = models.DateTimeField(auto_now_add=True)
    total_questions = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Session {self.id} - {self.user.email}"


class Question(models.Model):
    QUESTION_TYPES = [
        ('mcq', 'Multiple Choice'),
        ('short', 'Short Answer'),
        ('written', 'Written/Essay'),
    ]
    DIFFICULTY_LEVELS = [('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')]

    session = models.ForeignKey(QuestionSession, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(max_length=10, choices=QUESTION_TYPES)
    question_text = models.TextField()
    options = models.JSONField(null=True, blank=True)       # MCQ: {"A":..,"B":..}
    correct_answer = models.CharField(max_length=5, blank=True)  # MCQ only
    model_answer = models.TextField(blank=True)
    rubric = models.JSONField(null=True, blank=True)
    explanation = models.TextField(blank=True)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_LEVELS, default='medium')
    topic = models.CharField(max_length=200, blank=True)
    total_marks = models.IntegerField(default=10)
    bloom_level = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.question_type} - {self.question_text[:60]}"