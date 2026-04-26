import re
from difflib import SequenceMatcher


class QuestionFilter:
    MIN_QUESTION_LENGTH = 20
    MAX_QUESTION_LENGTH = 500

    def filter_and_rank(self, questions: list, q_type: str) -> list:
        filtered = [q for q in questions if self._passes_filters(q, q_type)]
        deduplicated = self._remove_duplicates(filtered)
        ranked = self._rank_questions(deduplicated, q_type)
        return ranked

    def _passes_filters(self, q: dict, q_type: str) -> bool:
        question_text = q.get('question', '')
        if len(question_text) < self.MIN_QUESTION_LENGTH:
            return False
        if len(question_text) > self.MAX_QUESTION_LENGTH:
            return False
        if not question_text.endswith('?'):
            question_text += '?'
        if q_type == 'mcq':
            if 'options' not in q or len(q.get('options', {})) != 4:
                return False
            if 'correct_answer' not in q:
                return False
        if q_type in ['short', 'written']:
            if not q.get('model_answer'):
                return False
        return True

    def _remove_duplicates(self, questions: list, threshold: float = 0.8) -> list:
        unique = []
        for q in questions:
            is_dup = any(
                SequenceMatcher(None, q['question'], u['question']).ratio() > threshold
                for u in unique
            )
            if not is_dup:
                unique.append(q)
        return unique

    def _score_question(self, q: dict, q_type: str) -> float:
        score = 0.0
        question = q.get('question', '')
        # Clarity: proper length
        score += min(len(question) / 100, 1.0) * 25
        # Has explanation/model answer
        if q.get('explanation') or q.get('model_answer'):
            score += 25
        # Difficulty assigned
        if q.get('difficulty'):
            score += 20
        # Topic assigned
        if q.get('topic') or q.get('bloom_level'):
            score += 15
        # Not too simple (avoids "what is")
        if not re.match(r'^what is\b', question, re.IGNORECASE):
            score += 15
        return score

    def _rank_questions(self, questions: list, q_type: str) -> list:
        for q in questions:
            q['_score'] = self._score_question(q, q_type)
        return sorted(questions, key=lambda x: x['_score'], reverse=True)