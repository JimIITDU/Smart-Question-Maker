# import logging
# from apps.core.llm_client import get_llm, safe_parse_json
# from apps.core.prompts import MCQ_FEW_SHOT_PROMPT, SHORT_QUESTION_PROMPT, WRITTEN_QUESTION_PROMPT
# from apps.core.vector_store import get_relevant_context
# from .filters import QuestionFilter

# logger = logging.getLogger(__name__)


# class QuestionGenerator:
#     def __init__(self):
#         self.llm = get_llm(temperature=0.7)
#         self.filter = QuestionFilter()
#         self.ollama_available = self.llm is not None

#     def _get_context(self, document, query: str = "", max_tokens: int = 2000) -> str:
#         if document.vector_store_id:
#             try:
#                 return get_relevant_context(document.vector_store_id, query, k=5)
#             except Exception:
#                 pass
#         # Fallback to raw text (truncated)
#         return document.extracted_text[:max_tokens * 4]

#     def _generate_fallback_mcq(self, context: str, num_questions: int, difficulty: str) -> list:
#         """Generate fallback MCQ questions when Ollama is not available."""
#         questions = []
#         lines = context.split('\n')[:num_questions]
#         for i, line in enumerate(lines, 1):
#             if line.strip():
#                 questions.append({
#                     'question': f'What is the meaning of: "{line.strip()[:80]}"?',
#                     'options': {
#                         'A': line.strip()[:100],
#                         'B': 'Alternative explanation',
#                         'C': 'Another possibility',
#                         'D': 'Different meaning'
#                     },
#                     'correct_answer': 'A',
#                     'explanation': f'Based on the document: {line.strip()[:100]}',
#                     'difficulty': difficulty,
#                     'topic': 'Document content'
#                 })
#         return questions[:num_questions]

#     def _generate_fallback_short(self, context: str, num_questions: int, difficulty: str) -> list:
#         """Generate fallback short answer questions when Ollama is not available."""
#         questions = []
#         lines = context.split('\n')[:num_questions]
#         for i, line in enumerate(lines, 1):
#             if line.strip() and len(line.strip()) > 10:
#                 questions.append({
#                     'question': f'Summarize the following in 2-3 sentences: "{line.strip()[:80]}..."',
#                     'model_answer': line.strip()[:200],
#                     'difficulty': difficulty,
#                     'marks': 5
#                 })
#         return questions[:num_questions]

#     def _generate_fallback_written(self, context: str, num_questions: int) -> list:
#         """Generate fallback written questions when Ollama is not available."""
#         questions = []
#         paragraphs = context.split('\n\n')[:num_questions]
#         for i, para in enumerate(paragraphs, 1):
#             if len(para.strip()) > 50:
#                 questions.append({
#                     'question': f'Analyze and explain the following passage in detail:\n{para.strip()[:200]}...',
#                     'model_answer': f'This passage discusses: {para.strip()[:300]}',
#                     'rubric': {'Understanding': 5, 'Analysis': 5, 'Expression': 5},
#                     'bloom_level': 'Analyze',
#                     'total_marks': 20
#                 })
#         return questions[:num_questions]

#     def generate_mcq(self, document, num_questions: int = 5, difficulty: str = "medium") -> list:
#         if not self.ollama_available:
#             context = self._get_context(document, query="key concepts facts definitions")
#             return self._generate_fallback_mcq(context, num_questions, difficulty)
        
#         try:
#             context = self._get_context(document, query="key concepts facts definitions")
#             chain = MCQ_FEW_SHOT_PROMPT | self.llm
#             response = chain.invoke({"context": context, "num_questions": num_questions, "difficulty": difficulty})
#             response_text = response.content if hasattr(response, 'content') else str(response)
#             questions = safe_parse_json(response_text)
#             return self.filter.filter_and_rank(questions, q_type='mcq')
#         except Exception as e:
#             logger.warning(f"MCQ generation failed: {str(e)[:100]}, using fallback")
#             context = self._get_context(document, query="key concepts facts definitions")
#             return self._generate_fallback_mcq(context, num_questions, difficulty)

#     def generate_short_questions(self, document, num_questions: int = 5, difficulty: str = "medium") -> list:
#         if not self.ollama_available:
#             context = self._get_context(document, query="important concepts processes")
#             return self._generate_fallback_short(context, num_questions, difficulty)
        
#         try:
#             context = self._get_context(document, query="important concepts processes")
#             chain = SHORT_QUESTION_PROMPT | self.llm
#             response = chain.invoke({"context": context, "num_questions": num_questions, "difficulty": difficulty})
#             response_text = response.content if hasattr(response, 'content') else str(response)
#             questions = safe_parse_json(response_text)
#             return self.filter.filter_and_rank(questions, q_type='short')
#         except Exception as e:
#             logger.warning(f"Short question generation failed: {str(e)[:100]}, using fallback")
#             context = self._get_context(document, query="important concepts processes")
#             return self._generate_fallback_short(context, num_questions, difficulty)

#     def generate_written_questions(self, document, num_questions: int = 3) -> list:
#         if not self.ollama_available:
#             context = self._get_context(document, query="main themes arguments analysis evaluation")
#             return self._generate_fallback_written(context, num_questions)
        
#         try:
#             context = self._get_context(document, query="main themes arguments analysis evaluation")
#             chain = WRITTEN_QUESTION_PROMPT | self.llm
#             response = chain.invoke({"context": context, "num_questions": num_questions})
#             response_text = response.content if hasattr(response, 'content') else str(response)
#             questions = safe_parse_json(response_text)
#             return self.filter.filter_and_rank(questions, q_type='written')
#         except Exception as e:
#             logger.warning(f"Written question generation failed: {str(e)[:100]}, using fallback")
#             context = self._get_context(document, query="main themes arguments analysis evaluation")
#             return self._generate_fallback_written(context, num_questions)


import time
import logging
from apps.core.llm_client import get_llm, safe_parse_json
from apps.core.prompts import (
    MCQ_GENERATION_PROMPT,
    SHORT_QUESTION_PROMPT,
    WRITTEN_QUESTION_PROMPT
)
from .filters import QuestionFilter

logger = logging.getLogger(__name__)


def get_context(document, max_chars=6000):
    text = document.extracted_text or ""
    if len(text) > max_chars:
        chunk = max_chars // 3
        text = (
            text[:chunk] + "\n...\n" +
            text[len(text)//2 : len(text)//2 + chunk] + "\n...\n" +
            text[-chunk:]
        )
    return text.strip()


class QuestionGenerator:
    def __init__(self):
        self.llm = get_llm(temperature=0.5)
        self.filter = QuestionFilter()

    def _run_prompt(self, prompt_template, **kwargs):
        for attempt in range(3):
            try:
                chain = prompt_template | self.llm
                response = chain.invoke(kwargs)

                if hasattr(response, 'content'):
                    text = response.content
                else:
                    text = str(response)

                result = safe_parse_json(text)
                if isinstance(result, list) and len(result) > 0:
                    return result
                logger.warning(f"Attempt {attempt+1}: Empty result, retrying...")
            except Exception as e:
                logger.warning(f"Attempt {attempt+1} failed: {e}")
                if attempt < 2:
                    time.sleep(2)  # ২ সেকেন্ড অপেক্ষা করুন
        return []
    def _validate_mcq(self, q: dict) -> bool:
        options = q.get('options', {})
        if not isinstance(options, dict):
            return False
        if not all(k in options for k in ['A', 'B', 'C', 'D']):
            return False
        option_values = [str(v).strip() for v in options.values()]
        if any(len(v) < 3 for v in option_values):
            return False
        # Check no duplicate options
        for i, v1 in enumerate(option_values):
            for j, v2 in enumerate(option_values):
                if i != j and v1.lower()[:30] == v2.lower()[:30]:
                    return False
        if q.get('correct_answer', '').upper() not in ['A', 'B', 'C', 'D']:
            return False
        if len(q.get('question', '')) < 15:
            return False
        return True

    def generate_mcq(self, document, num_questions=5, difficulty='medium'):
        context = get_context(document)
        if not context:
            logger.error("No text extracted from document")
            return []
        questions = self._run_prompt(
            MCQ_GENERATION_PROMPT,
            context=context,
            num_questions=num_questions,
            difficulty=difficulty
        )
        valid = [q for q in questions if self._validate_mcq(q)]
        logger.info(f"MCQ: {len(questions)} generated, {len(valid)} valid")
        return self.filter.filter_and_rank(valid, q_type='mcq')

    def generate_short_questions(self, document, num_questions=5, difficulty='medium'):
        context = get_context(document)
        questions = self._run_prompt(
            SHORT_QUESTION_PROMPT,
            context=context,
            num_questions=num_questions,
            difficulty=difficulty
        )
        valid = [q for q in questions if q.get('question') and q.get('model_answer')]
        return self.filter.filter_and_rank(valid, q_type='short')

    def generate_written_questions(self, document, num_questions=2):
        context = get_context(document)
        questions = self._run_prompt(
            WRITTEN_QUESTION_PROMPT,
            context=context,
            num_questions=num_questions
        )
        valid = [q for q in questions if q.get('question') and q.get('model_answer')]
        return self.filter.filter_and_rank(valid, q_type='written')

    def _generate_fallback_mcq(self, context: str, num_questions: int, difficulty: str) -> list:
        """Generate fallback MCQ questions when LLM is not available."""
        questions = []
        lines = [line.strip() for line in context.split('\n') if line.strip()][:num_questions * 2]
        
        for i, line in enumerate(lines[:num_questions]):
            if len(line) > 15:
                questions.append({
                    'question': f'Based on the context, what can be inferred about: "{line[:50]}..."?',
                    'options': {
                        'A': line[:80],
                        'B': lines[(i + 1) % len(lines)][:80] if i + 1 < len(lines) else 'Alternative explanation',
                        'C': lines[(i + 2) % len(lines)][:80] if i + 2 < len(lines) else 'Another approach',
                        'D': 'None of the above'
                    },
                    'correct_answer': 'A',
                    'explanation': f'This is supported by the text: {line[:100]}',
                    'difficulty': difficulty,
                    'topic': 'Document content'
                })
        return questions[:num_questions]

    def _generate_fallback_short(self, context: str, num_questions: int, difficulty: str) -> list:
        """Generate fallback short answer questions when LLM is not available."""
        questions = []
        lines = [line.strip() for line in context.split('\n') if line.strip() and len(line.strip()) > 20][:num_questions]
        
        for line in lines:
            questions.append({
                'question': f'What is the main point in the following: "{line[:80]}..."?',
                'model_answer': line[:200],
                'difficulty': difficulty,
                'marks': 8
            })
        return questions[:num_questions]

    def _generate_fallback_written(self, context: str, num_questions: int) -> list:
        """Generate fallback written questions when LLM is not available."""
        questions = []
        paragraphs = [p.strip() for p in context.split('\n\n') if len(p.strip()) > 50][:num_questions]
        
        for para in paragraphs:
            questions.append({
                'question': f'Analyze and explain the following in detail:\n{para[:200]}...',
                'model_answer': f'Key points from this passage: {para[:300]}',
                'rubric': {'Understanding': 5, 'Analysis': 5, 'Expression': 5, 'Clarity': 5},
                'bloom_level': 'Analyze',
                'total_marks': 20
            })
        return questions[:num_questions]