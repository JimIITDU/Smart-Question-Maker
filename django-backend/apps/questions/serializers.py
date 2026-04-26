from rest_framework import serializers
from .models import Question, QuestionSession


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            'id', 'question_type', 'question_text', 'options', 'correct_answer',
            'model_answer', 'rubric', 'explanation', 'difficulty', 'topic',
            'total_marks', 'bloom_level', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class QuestionSessionSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = QuestionSession
        fields = ['id', 'user', 'document', 'created_at', 'total_questions', 'completed', 'questions']
        read_only_fields = ['id', 'user', 'created_at']


class GenerateQuestionsSerializer(serializers.Serializer):
    document_id = serializers.IntegerField(required=True)
    include_mcq = serializers.BooleanField(default=True)
    num_mcq = serializers.IntegerField(default=5, min_value=1, max_value=20)
    include_short = serializers.BooleanField(default=True)
    num_short = serializers.IntegerField(default=5, min_value=1, max_value=20)
    include_written = serializers.BooleanField(default=False)
    num_written = serializers.IntegerField(default=2, min_value=1, max_value=10)
    difficulty = serializers.ChoiceField(
        choices=['easy', 'medium', 'hard'],
        default='medium'
    )
