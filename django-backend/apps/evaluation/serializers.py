# from rest_framework import serializers
# from .models import Answer

# class AnswerSerializer(serializers.ModelSerializer):
#     question_text = serializers.CharField(source='question.question_text', read_only=True)
#     question_type = serializers.CharField(source='question.question_type', read_only=True)
#     total_marks = serializers.IntegerField(source='question.total_marks', read_only=True)
#     correct_answer = serializers.CharField(source='question.correct_answer', read_only=True)
#     model_answer = serializers.CharField(source='question.model_answer', read_only=True)

#     class Meta:
#         model = Answer
#         fields = ['id', 'question_text', 'question_type', 'total_marks',
#                   'answer_text', 'selected_option', 'score_percentage',
#                   'marks_obtained', 'llm_feedback', 'rule_feedback',
#                   'grade', 'correct_answer', 'model_answer', 'submitted_at']

# class SubmitAnswerSerializer(serializers.Serializer):
#     question_id = serializers.IntegerField()
#     answer_text = serializers.CharField(required=False, allow_blank=True)
#     selected_option = serializers.CharField(required=False, allow_blank=True, max_length=5)


from rest_framework import serializers
from .models import Answer


class AnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    total_marks = serializers.IntegerField(source='question.total_marks', read_only=True)
    correct_answer = serializers.CharField(source='question.correct_answer', read_only=True)
    model_answer = serializers.CharField(source='question.model_answer', read_only=True)
    explanation = serializers.CharField(source='question.explanation', read_only=True)

    class Meta:
        model = Answer
        fields = [
            'id', 'question_text', 'question_type', 'total_marks',
            'answer_text', 'selected_option', 'score_percentage',
            'marks_obtained', 'llm_feedback', 'rule_feedback',
            'grade', 'correct_answer', 'model_answer', 'explanation', 'submitted_at'
        ]


class SubmitAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    answer_text = serializers.CharField(required=False, allow_blank=True, default='')
    selected_option = serializers.CharField(required=False, allow_blank=True, max_length=5, default='')


class BulkSubmitSerializer(serializers.Serializer):
    answers = SubmitAnswerSerializer(many=True)