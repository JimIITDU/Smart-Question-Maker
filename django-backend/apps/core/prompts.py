# from langchain_core.prompts import PromptTemplate, FewShotPromptTemplate

# MCQ_FEW_SHOT_EXAMPLES = [
#     {
#         "context": "Photosynthesis is the process by which green plants convert sunlight into glucose using CO2 and water.",
#         "question": "What is the primary product of photosynthesis?\nA) Oxygen\nB) Glucose\nC) Carbon dioxide\nD) Water",
#         "answer": "B) Glucose",
#         "explanation": "Plants use sunlight to convert CO2 and H2O into glucose (C6H12O6)."
#     },
#     {
#         "context": "The French Revolution began in 1789 with the storming of the Bastille.",
#         "question": "In which year did the French Revolution begin?\nA) 1776\nB) 1789\nC) 1799\nD) 1804",
#         "answer": "B) 1789",
#         "explanation": "The French Revolution began in 1789 with the Storming of the Bastille on July 14."
#     }
# ]

# MCQ_EXAMPLE_TEMPLATE = PromptTemplate(
#     input_variables=["context", "question", "answer", "explanation"],
#     template="Context: {context}\nQuestion: {question}\nAnswer: {answer}\nExplanation: {explanation}"
# )

# MCQ_PREFIX = """You are an expert educational assessment creator. Generate high-quality multiple choice questions from the given context.

# Rules:
# - Each question must have exactly 4 options (A, B, C, D)
# - Only one correct answer
# - Distractors should be plausible but clearly wrong
# - Questions should test understanding, not just recall
# - Vary difficulty levels

# Here are examples of good MCQs:"""

# MCQ_SUFFIX = """
# Now generate {num_questions} MCQs from this context:
# Context: {context}
# Difficulty: {difficulty}

# Return ONLY valid JSON array:
# [
#   {{
#     "question": "...",
#     "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}},
#     "correct_answer": "A",
#     "explanation": "...",
#     "difficulty": "easy|medium|hard",
#     "topic": "..."
#   }}
# ]"""

# MCQ_FEW_SHOT_PROMPT = FewShotPromptTemplate(
#     examples=MCQ_FEW_SHOT_EXAMPLES,
#     example_prompt=MCQ_EXAMPLE_TEMPLATE,
#     prefix=MCQ_PREFIX,
#     suffix=MCQ_SUFFIX,
#     input_variables=["context", "num_questions", "difficulty"]
# )

# SHORT_QUESTION_PROMPT = PromptTemplate(
#     input_variables=["context", "num_questions", "difficulty"],
#     template="""You are an expert teacher. Create short answer questions from the context below.

# Context: {context}

# Generate {num_questions} short answer questions at {difficulty} difficulty.
# Each answer should be 2-3 sentences maximum.

# Return ONLY valid JSON:
# [
#   {{
#     "question": "...",
#     "model_answer": "...",
#     "key_points": ["point1", "point2"],
#     "marks": 5,
#     "difficulty": "easy|medium|hard"
#   }}
# ]"""
# )

# WRITTEN_QUESTION_PROMPT = PromptTemplate(
#     input_variables=["context", "num_questions"],
#     template="""You are an expert curriculum designer. Create comprehensive written/essay questions.

# Context: {context}

# Generate {num_questions} written questions requiring detailed answers (3-5 paragraphs).
# Apply Bloom's taxonomy: Knowledge, Comprehension, Application, Analysis, Synthesis, Evaluation.

# Return ONLY valid JSON:
# [
#   {{
#     "question": "...",
#     "model_answer": "...",
#     "rubric": {{
#       "knowledge": {{"marks": 5, "criteria": "..."}},
#       "understanding": {{"marks": 5, "criteria": "..."}},
#       "application": {{"marks": 5, "criteria": "..."}},
#       "higher_order": {{"marks": 5, "criteria": "..."}}
#     }},
#     "total_marks": 20,
#     "bloom_level": "analysis|synthesis|evaluation"
#   }}
# ]"""
# )

# EVALUATION_PROMPT = PromptTemplate(
#     input_variables=["question", "model_answer", "student_answer", "rubric", "question_type"],
#     template="""You are an expert examiner evaluating a student's answer.

# Question Type: {question_type}
# Question: {question}
# Model Answer: {model_answer}
# Rubric: {rubric}
# Student Answer: {student_answer}

# Evaluate based on:
# 1. Accuracy & correctness
# 2. Completeness of key points covered
# 3. Clarity and coherence
# 4. Application of concepts
# 5. Higher-order thinking (for written questions)

# Return ONLY valid JSON:
# {{
#   "score": 0-100,
#   "breakdown": {{
#     "accuracy": 0-25,
#     "completeness": 0-25,
#     "clarity": 0-25,
#     "application": 0-25
#   }},
#   "strengths": ["..."],
#   "weaknesses": ["..."],
#   "feedback": "detailed constructive feedback",
#   "missing_points": ["key points not addressed"],
#   "suggestions": "how to improve"
# }}"""
# )

from langchain_core.prompts import PromptTemplate
# ============================================================
# MCQ PROMPT — Forces real, distinct, meaningful options
# ============================================================
MCQ_GENERATION_PROMPT = PromptTemplate(
    input_variables=["context", "num_questions", "difficulty"],
    template="""You are an expert teacher and exam setter. Your job is to create REAL, HIGH-QUALITY multiple choice questions.

CONTEXT (read carefully):
{context}

STRICT RULES — follow every rule or the output is invalid:
1. Each question must be directly based on facts in the context above.
2. Each question must have EXACTLY 4 options labeled A, B, C, D.
3. Options must be COMPLETELY DIFFERENT from each other — no repeating or near-identical options.
4. Only ONE option is correct. The other 3 are WRONG but plausible distractors.
5. Distractors must be real-sounding wrong answers (not "None of the above", "All of the above", "I don't know").
6. The correct answer must actually be correct based on the context.
7. Vary question styles: definition, cause-effect, example, comparison, application.
8. Difficulty: {difficulty}
9. Generate exactly {num_questions} questions.

EXAMPLE OF A GOOD MCQ:
{{
  "question": "What is the main function of mitochondria in a cell?",
  "options": {{
    "A": "To store genetic information",
    "B": "To produce energy in the form of ATP",
    "C": "To synthesize proteins for the cell",
    "D": "To control what enters and exits the cell"
  }},
  "correct_answer": "B",
  "explanation": "Mitochondria are known as the powerhouse of the cell because they produce ATP through cellular respiration.",
  "difficulty": "medium",
  "topic": "Cell Biology"
}}

EXAMPLE OF A BAD MCQ (DO NOT DO THIS):
{{
  "question": "What is photosynthesis?",
  "options": {{
    "A": "Photosynthesis is a process",
    "B": "Photosynthesis is a chemical process",
    "C": "Photosynthesis is a biological process",
    "D": "Photosynthesis is a natural process"
  }}
}}
The above is BAD because all 4 options say the same thing with minor wording changes.

Now generate {num_questions} MCQs from the context. Return ONLY a valid JSON array, no extra text:
[
  {{
    "question": "specific question about a fact in the context?",
    "options": {{
      "A": "first distinct option",
      "B": "second distinct option",
      "C": "third distinct option",
      "D": "fourth distinct option"
    }},
    "correct_answer": "A or B or C or D",
    "explanation": "why this answer is correct based on the context",
    "difficulty": "{difficulty}",
    "topic": "topic name from context"
  }}
]"""
)

# ============================================================
# SHORT QUESTION PROMPT
# ============================================================
SHORT_QUESTION_PROMPT = PromptTemplate(
    input_variables=["context", "num_questions", "difficulty"],
    template="""You are an expert teacher. Create short answer questions from the context below.

CONTEXT:
{context}

Generate exactly {num_questions} short answer questions.
Difficulty level: {difficulty}
Each answer should be 2-4 sentences.

Rules:
- Questions must test understanding, not just memory
- Model answers must be complete and accurate
- Key points must be 2-4 bullet points
- Marks should be 5 for easy, 8 for medium, 10 for hard

Return ONLY valid JSON array:
[
  {{
    "question": "...",
    "model_answer": "Complete 2-4 sentence answer here...",
    "key_points": ["key point 1", "key point 2", "key point 3"],
    "marks": 5,
    "difficulty": "{difficulty}"
  }}
]"""
)

# ============================================================
# WRITTEN/ESSAY QUESTION PROMPT
# ============================================================
WRITTEN_QUESTION_PROMPT = PromptTemplate(
    input_variables=["context", "num_questions"],
    template="""You are an expert curriculum designer. Create comprehensive written/essay questions from the context.

CONTEXT:
{context}

Generate exactly {num_questions} written questions requiring detailed answers (3-5 paragraphs).
Apply Bloom's taxonomy levels: analysis, synthesis, evaluation.

Return ONLY valid JSON array:
[
  {{
    "question": "...",
    "model_answer": "Detailed 3-5 paragraph model answer...",
    "rubric": {{
      "knowledge": {{"marks": 5, "criteria": "Correctly identifies and states key facts"}},
      "understanding": {{"marks": 5, "criteria": "Explains concepts clearly in own words"}},
      "application": {{"marks": 5, "criteria": "Applies concepts to examples or real situations"}},
      "higher_order": {{"marks": 5, "criteria": "Analyzes, evaluates or synthesizes ideas critically"}}
    }},
    "total_marks": 20,
    "bloom_level": "analysis"
  }}
]"""
)

# ============================================================
# EVALUATION PROMPT
# ============================================================
EVALUATION_PROMPT = PromptTemplate(
    input_variables=["question", "model_answer", "student_answer", "rubric", "question_type"],
    template="""You are an expert examiner. Evaluate the student's answer fairly and constructively.

Question Type: {question_type}
Question: {question}
Model Answer: {model_answer}
Rubric: {rubric}

Student's Answer: {student_answer}

Evaluate based on accuracy, completeness, clarity, and application.

Return ONLY valid JSON (no extra text):
{{
  "score": <number 0-100>,
  "breakdown": {{
    "accuracy": <number 0-25>,
    "completeness": <number 0-25>,
    "clarity": <number 0-25>,
    "application": <number 0-25>
  }},
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1"],
  "feedback": "Detailed constructive feedback here...",
  "missing_points": ["important point not covered"],
  "suggestions": "How to improve this answer..."
}}"""
)