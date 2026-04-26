# from rest_framework import generics, viewsets, status, permissions
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from .models import Answer
# from .serializers import AnswerSerializer, SubmitAnswerSerializer
# from .rule_based import RuleBasedEvaluator
# from .llm_evaluator import LLMEvaluator
# from .rubric import RubricScorer
# from apps.questions.models import Question, QuestionSession
# from django.contrib.auth import get_user_model

# User = get_user_model()


# class AnswerViewSet(viewsets.ModelViewSet):
#     """ViewSet for managing Student Answers with evaluation."""
#     serializer_class = AnswerSerializer
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get_queryset(self):
#         return Answer.objects.filter(user=self.request.user)
    
#     def perform_create(self, serializer):
#         """Override create to set the user and evaluate the answer."""
#         serializer.save(user=self.request.user)
    
#     def create(self, request, *args, **kwargs):
#         """
#         Submit an answer for evaluation.
#         POST /api/answers/
#         """
#         serializer = SubmitAnswerSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         data = serializer.validated_data

#         try:
#             question = Question.objects.get(id=data['question_id'])
#         except Question.DoesNotExist:
#             return Response(
#                 {'error': 'Question not found.'}, 
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         rule_eval = RuleBasedEvaluator()
#         llm_eval = LLMEvaluator()
#         rubric = RubricScorer()

#         rule_result = rule_eval.evaluate(
#             question_type=question.question_type,
#             student_answer=data.get('answer_text', ''),
#             model_answer=question.model_answer,
#             correct_option=question.correct_answer,
#             student_option=data.get('selected_option', '')
#         )

#         # MCQ: skip LLM eval (objective)
#         if question.question_type == 'mcq':
#             llm_score = rule_result['rule_score']
#             is_correct = rule_result.get('is_correct')
#             llm_feedback = {
#                 "feedback": "Correct!" if is_correct
#                     else f"The correct answer is {question.correct_answer}.",
#                 "score": llm_score,
#                 "breakdown": {
#                     "accuracy": 100 if is_correct else 0,
#                     "completeness": 100,
#                     "clarity": 100,
#                     "relevance": 100
#                 }
#             }
#         else:
#             llm_feedback = llm_eval.evaluate(question, data.get('answer_text', ''))
#             llm_score = llm_feedback.get('score', 0)

#         final = rubric.calculate_final_score(
#             llm_score=llm_score,
#             rule_score=rule_result.get('rule_score', 0),
#             question_type=question.question_type,
#             total_marks=question.total_marks
#         )

#         answer = Answer.objects.create(
#             user=request.user,
#             question=question,
#             answer_text=data.get('answer_text', ''),
#             selected_option=data.get('selected_option', ''),
#             score_percentage=final['percentage'],
#             marks_obtained=final['marks_obtained'],
#             llm_feedback=llm_feedback,
#             rule_feedback=rule_result,
#             grade=final['grade']
#         )
        
#         output_serializer = AnswerSerializer(answer)
#         return Response(output_serializer.data, status=status.HTTP_201_CREATED)
    
#     @action(detail=False, methods=['get'])
#     def session_results(self, request):
#         """
#         Get results for a specific session.
#         GET /api/answers/session_results/?session_id=<id>
#         """
#         session_id = request.query_params.get('session_id')
#         if not session_id:
#             return Response(
#                 {'error': 'session_id parameter required.'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         try:
#             session = QuestionSession.objects.get(id=session_id, user=request.user)
#         except QuestionSession.DoesNotExist:
#             return Response(
#                 {'error': 'Session not found.'}, 
#                 status=status.HTTP_404_NOT_FOUND
#             )
        
#         answers = self.get_queryset().filter(
#             question__session=session
#         ).select_related('question')

#         total_marks = sum(a.question.total_marks for a in answers)
#         obtained = sum(a.marks_obtained for a in answers)
#         overall = (obtained / total_marks * 100) if total_marks > 0 else 0

#         grade = RubricScorer()._get_grade(overall)

#         # Aggregate breakdown from llm_feedback
#         breakdown = {'accuracy': 0, 'completeness': 0, 'clarity': 0, 'application': 0}
#         count = 0
#         for ans in answers:
#             fb = ans.llm_feedback or {}
#             bd = fb.get('breakdown', {})
#             if bd:
#                 for key in breakdown:
#                     breakdown[key] += bd.get(key, 0)
#                 count += 1
#         if count:
#             for key in breakdown:
#                 breakdown[key] = round(breakdown[key] / count, 1)

#         return Response({
#             'session_id': session_id,
#             'overall_score': round(overall, 1),
#             'grade': grade,
#             'total_questions': session.total_questions,
#             'marks_obtained': obtained,
#             'total_marks': total_marks,
#             'breakdown': breakdown,
#             'answers': AnswerSerializer(answers, many=True).data
#         })

import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import Answer
from .serializers import AnswerSerializer, SubmitAnswerSerializer, BulkSubmitSerializer
from .rule_based import RuleBasedEvaluator
from .llm_evaluator import LLMEvaluator
from .rubric import RubricScorer
from apps.questions.models import Question, QuestionSession

logger = logging.getLogger(__name__)


class SubmitAnswerView(APIView):
    """Submit a single answer — no page refresh needed."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SubmitAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            question = Question.objects.get(id=data['question_id'])
        except Question.DoesNotExist:
            return Response({'error': 'Question not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check if already answered — update instead of duplicate
        existing = Answer.objects.filter(user=request.user, question=question).first()

        rule_eval = RuleBasedEvaluator()
        rubric = RubricScorer()

        rule_result = rule_eval.evaluate(
            question_type=question.question_type,
            student_answer=data.get('answer_text', ''),
            model_answer=question.model_answer or '',
            correct_option=question.correct_answer,
            student_option=data.get('selected_option', '')
        )

        # For MCQ: fast rule-based only (no LLM needed)
        if question.question_type == 'mcq':
            is_correct = rule_result.get('is_correct', False)
            llm_score = 100.0 if is_correct else 0.0
            llm_feedback = {
                "score": llm_score,
                "feedback": f"✓ Correct! The answer is {question.correct_answer}." if is_correct
                           else f"✗ Incorrect. The correct answer is {question.correct_answer}. {question.explanation}",
                "is_correct": is_correct,
                "breakdown": {
                    "accuracy": 25 if is_correct else 0,
                    "completeness": 25 if is_correct else 0,
                    "clarity": 25,
                    "application": 25 if is_correct else 0
                }
            }
        else:
            # LLM evaluation for short and written
            try:
                llm_eval = LLMEvaluator()
                llm_feedback = llm_eval.evaluate(question, data.get('answer_text', ''))
                llm_score = llm_feedback.get('score', 0)
            except Exception as e:
                logger.error(f"LLM evaluation failed: {e}")
                llm_score = rule_result.get('rule_score', 0)
                llm_feedback = {
                    "score": llm_score,
                    "feedback": "Automated scoring applied.",
                    "breakdown": {"accuracy": 0, "completeness": 0, "clarity": 0, "application": 0}
                }

        final = rubric.calculate_final_score(
            llm_score=llm_score,
            rule_score=rule_result.get('rule_score', 0),
            question_type=question.question_type,
            total_marks=question.total_marks
        )

        answer_data = {
            'answer_text': data.get('answer_text', ''),
            'selected_option': data.get('selected_option', ''),
            'score_percentage': final['percentage'],
            'marks_obtained': final['marks_obtained'],
            'llm_feedback': llm_feedback,
            'rule_feedback': rule_result,
            'grade': final['grade']
        }

        if existing:
            for k, v in answer_data.items():
                setattr(existing, k, v)
            existing.save()
            answer = existing
        else:
            answer = Answer.objects.create(user=request.user, question=question, **answer_data)

        return Response(AnswerSerializer(answer).data, status=status.HTTP_200_OK)


class BulkSubmitAnswerView(APIView):
    """Submit ALL answers at once — prevents page refresh issue."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        answers_data = request.data.get('answers', [])
        if not answers_data:
            return Response({'error': 'No answers provided.'}, status=status.HTTP_400_BAD_REQUEST)

        results = []
        for ans in answers_data:
            try:
                question = Question.objects.get(id=ans['question_id'])
                rule_eval = RuleBasedEvaluator()
                rubric = RubricScorer()

                rule_result = rule_eval.evaluate(
                    question_type=question.question_type,
                    student_answer=ans.get('answer_text', ''),
                    model_answer=question.model_answer or '',
                    correct_option=question.correct_answer,
                    student_option=ans.get('selected_option', '')
                )

                if question.question_type == 'mcq':
                    is_correct = rule_result.get('is_correct', False)
                    llm_score = 100.0 if is_correct else 0.0
                    llm_feedback = {
                        "score": llm_score,
                        "feedback": f"✓ Correct! The answer is {question.correct_answer}." if is_correct
                                   else f"✗ Incorrect. Correct answer: {question.correct_answer}. {question.explanation}",
                        "is_correct": is_correct,
                        "breakdown": {"accuracy": 25 if is_correct else 0, "completeness": 25 if is_correct else 0,
                                      "clarity": 25, "application": 25 if is_correct else 0}
                    }
                else:
                    try:
                        llm_eval = LLMEvaluator()
                        llm_feedback = llm_eval.evaluate(question, ans.get('answer_text', ''))
                        llm_score = llm_feedback.get('score', 0)
                    except Exception as e:
                        logger.error(f"LLM eval failed for Q{question.id}: {e}")
                        llm_score = rule_result.get('rule_score', 0)
                        llm_feedback = {"score": llm_score, "feedback": "Automated scoring.",
                                       "breakdown": {"accuracy": 0, "completeness": 0, "clarity": 0, "application": 0}}

                final = rubric.calculate_final_score(llm_score, rule_result.get('rule_score', 0),
                                                     question.question_type, question.total_marks)

                obj, _ = Answer.objects.update_or_create(
                    user=request.user, question=question,
                    defaults={
                        'answer_text': ans.get('answer_text', ''),
                        'selected_option': ans.get('selected_option', ''),
                        'score_percentage': final['percentage'],
                        'marks_obtained': final['marks_obtained'],
                        'llm_feedback': llm_feedback,
                        'rule_feedback': rule_result,
                        'grade': final['grade']
                    }
                )
                results.append({'question_id': question.id, 'status': 'ok', 'grade': final['grade']})
            except Exception as e:
                logger.error(f"Failed to process answer for Q{ans.get('question_id')}: {e}")
                results.append({'question_id': ans.get('question_id'), 'status': 'error'})

        return Response({'results': results, 'total': len(results)}, status=status.HTTP_200_OK)


class ResultsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, session_id):
        try:
            session = QuestionSession.objects.get(id=session_id, user=request.user)
        except QuestionSession.DoesNotExist:
            return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

        answers = Answer.objects.filter(
            user=request.user, question__session=session
        ).select_related('question')

        if not answers.exists():
            return Response({'error': 'No answers submitted yet.'}, status=status.HTTP_404_NOT_FOUND)

        total_marks = sum(a.question.total_marks for a in answers)
        obtained = sum(a.marks_obtained for a in answers)
        overall = (obtained / total_marks * 100) if total_marks > 0 else 0

        rubric = RubricScorer()
        grade = rubric._get_grade(overall)

        # Breakdown by type
        mcq_answers = [a for a in answers if a.question.question_type == 'mcq']
        short_answers = [a for a in answers if a.question.question_type == 'short']
        written_answers = [a for a in answers if a.question.question_type == 'written']

        def avg_score(ans_list):
            if not ans_list: return 0
            return round(sum(a.score_percentage for a in ans_list) / len(ans_list), 1)

        # Aggregate LLM feedback breakdown
        breakdown = {'accuracy': 0, 'completeness': 0, 'clarity': 0, 'application': 0}
        count = 0
        for ans in answers:
            bd = (ans.llm_feedback or {}).get('breakdown', {})
            if bd:
                for key in breakdown:
                    breakdown[key] += bd.get(key, 0)
                count += 1
        if count:
            for key in breakdown:
                breakdown[key] = round(breakdown[key] / count, 1)

        session.completed = True
        session.save()

        return Response({
            'session_id': session_id,
            'overall_score': round(overall, 1),
            'grade': grade,
            'total_questions': session.total_questions,
            'answered_questions': answers.count(),
            'marks_obtained': round(obtained, 1),
            'total_marks': total_marks,
            'breakdown': breakdown,
            'by_type': {
                'mcq': {'count': len(mcq_answers), 'avg_score': avg_score(mcq_answers)},
                'short': {'count': len(short_answers), 'avg_score': avg_score(short_answers)},
                'written': {'count': len(written_answers), 'avg_score': avg_score(written_answers)},
            },
            'answers': AnswerSerializer(answers, many=True).data
        })