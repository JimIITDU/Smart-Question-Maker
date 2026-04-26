class RubricScorer:
    RUBRICS = {
        'knowledge': {
            'description': 'Factual recall and identification of key concepts',
            'weight': 0.25
        },
        'understanding': {
            'description': 'Comprehension and explanation in own words',
            'weight': 0.25
        },
        'application': {
            'description': 'Using knowledge in new/real contexts',
            'weight': 0.25
        },
        'higher_order': {
            'description': 'Analysis, evaluation, synthesis, critical thinking',
            'weight': 0.25
        }
    }

    def calculate_final_score(self, llm_score: float, rule_score: float,
                               question_type: str, total_marks: int) -> dict:
        if question_type == 'mcq':
            final_pct = rule_score  # MCQ is objective
        elif question_type == 'short':
            final_pct = (llm_score * 0.7) + (rule_score * 0.3)
        else:  # written
            final_pct = (llm_score * 0.8) + (rule_score * 0.2)
        marks_obtained = round((final_pct / 100) * total_marks, 1)
        return {
            'percentage': round(final_pct, 1),
            'marks_obtained': marks_obtained,
            'total_marks': total_marks,
            'grade': self._get_grade(final_pct)
        }

    def _get_grade(self, pct: float) -> str:
        if pct >= 90: return 'A+'
        if pct >= 80: return 'A'
        if pct >= 70: return 'B'
        if pct >= 60: return 'C'
        if pct >= 50: return 'D'
        return 'F'