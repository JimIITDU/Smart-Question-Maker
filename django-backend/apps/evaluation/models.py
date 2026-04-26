from django.db import models
from django.conf import settings

class Answer(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey('questions.Question', on_delete=models.CASCADE, related_name='answers')
    answer_text = models.TextField(blank=True)
    selected_option = models.CharField(max_length=5, blank=True)
    score_percentage = models.FloatField(default=0)
    marks_obtained = models.FloatField(default=0)
    llm_feedback = models.JSONField(null=True, blank=True)
    rule_feedback = models.JSONField(null=True, blank=True)
    grade = models.CharField(max_length=5, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'question']

    def __str__(self):
        return f"Answer by {self.user.email} - {self.score_percentage}%"