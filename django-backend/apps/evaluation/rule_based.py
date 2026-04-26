import re
from difflib import SequenceMatcher


class RuleBasedEvaluator:
    def evaluate(self, question_type: str, student_answer: str, model_answer: str,
                 correct_option: str = None, student_option: str = None) -> dict:
        if question_type == 'mcq':
            return self._evaluate_mcq(student_option, correct_option)
        elif question_type == 'short':
            return self._evaluate_short(student_answer, model_answer)
        elif question_type == 'written':
            return self._evaluate_written(student_answer, model_answer)
        return {}

    def _evaluate_mcq(self, student_option: str, correct_option: str) -> dict:
        correct = student_option.strip().upper() == correct_option.strip().upper()
        return {'rule_score': 100 if correct else 0, 'is_correct': correct}

    def _evaluate_short(self, student: str, model: str) -> dict:
        if not student.strip():
            return {'rule_score': 0, 'length_ok': False, 'keyword_score': 0}

        # Length check
        word_count = len(student.split())
        length_ok = 20 <= word_count <= 150

        # Keyword matching
        model_keywords = set(re.findall(r'\b[a-zA-Z]{4,}\b', model.lower()))
        student_words = set(re.findall(r'\b[a-zA-Z]{4,}\b', student.lower()))
        keyword_overlap = len(model_keywords & student_words) / max(len(model_keywords), 1)

        # Semantic similarity (basic)
        similarity = SequenceMatcher(None, student.lower(), model.lower()).ratio()
        rule_score = (keyword_overlap * 0.5 + similarity * 0.3 + (0.2 if length_ok else 0)) * 100
        return {'rule_score': min(rule_score, 100), 'length_ok': length_ok, 'keyword_score': keyword_overlap * 100}

    def _evaluate_written(self, student: str, model: str) -> dict:
        word_count = len(student.split())
        has_structure = any(
            student.lower().count(w) > 0
            for w in ['firstly', 'secondly', 'furthermore', 'however', 'therefore', 'in conclusion', 'finally']
        )
        paragraphs = len([p for p in student.split('\n') if len(p.strip()) > 20])
        model_keywords = set(re.findall(r'\b[a-zA-Z]{5,}\b', model.lower()))
        student_words = set(re.findall(r'\b[a-zA-Z]{5,}\b', student.lower()))
        coverage = len(model_keywords & student_words) / max(len(model_keywords), 1)
        length_score = min(word_count / 400, 1.0) * 30
        structure_score = 20 if has_structure else 0
        paragraph_score = min(paragraphs / 3, 1.0) * 20
        coverage_score = coverage * 30
        rule_score = length_score + structure_score + paragraph_score + coverage_score
        return {'rule_score': min(rule_score, 100), 'word_count': word_count, 'coverage': coverage * 100}