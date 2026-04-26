# from apps.core.llm_client import get_llm, safe_parse_json
# from apps.core.prompts import EVALUATION_PROMPT
# from .rubric import RubricScorer


# class LLMEvaluator:
#     def __init__(self):
#         self.llm = get_llm(temperature=0.2)  # Low temp for consistent scoring
#         self.chain = EVALUATION_PROMPT | self.llm
#         self.rubric_scorer = RubricScorer()

#     def evaluate(self, question, student_answer: str) -> dict:
#         rubric_str = str(question.rubric) if question.rubric else "Standard evaluation rubric"
#         response = self.chain.invoke(
#             question=question.question_text,
#             model_answer=question.model_answer,
#             student_answer=student_answer,
#             rubric=rubric_str,
#             question_type=question.question_type
#         )
#         response_text = response.content if hasattr(response, 'content') else str(response)
#         return safe_parse_json(response_text)


import logging
from apps.core.llm_client import get_llm, safe_parse_json
from apps.core.prompts import EVALUATION_PROMPT
from .rubric import RubricScorer

logger = logging.getLogger(__name__)


class LLMEvaluator:
    def __init__(self):
        self.llm = get_llm(temperature=0.2)
        self.rubric_scorer = RubricScorer()

    def evaluate(self, question, student_answer: str) -> dict:
        rubric_str = str(question.rubric) if question.rubric else "Standard evaluation rubric"

        try:
            chain = EVALUATION_PROMPT | self.llm
            response = chain.invoke({
                'question': question.question_text,
                'model_answer': question.model_answer or '',
                'student_answer': student_answer,
                'rubric': rubric_str,
                'question_type': question.question_type
            })

            text = response.content if hasattr(response, 'content') else str(response)
            return safe_parse_json(text)

        except Exception as e:
            logger.error(f"LLM evaluation error: {e}")
            return {
                'score': 0,
                'feedback': 'Evaluation could not be completed. Please try again.',
                'breakdown': {
                    'accuracy': 0,
                    'completeness': 0,
                    'clarity': 0,
                    'application': 0
                },
                'strengths': [],
                'weaknesses': [],
                'missing_points': [],
                'suggestions': ''
            }