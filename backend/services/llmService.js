// LLM Service for Written Answer Evaluation
// This is a mock service that simulates LLM evaluation.
// In production, replace with OpenAI, Claude, or other LLM API calls.

const llmService = {

  /**
   * Evaluate a student's written answer against an expected answer
   * @param {string} questionText - The question text
   * @param {string} studentAnswer - The student's submitted answer
   * @param {string} expectedAnswer - The reference/expected answer
   * @param {number} maxMarks - Maximum marks for this question
   * @returns {Promise<{marks_obtained: number, feedback: string, confidence_score: number}>}
   */
  evaluateWrittenAnswer: async (questionText, studentAnswer, expectedAnswer, maxMarks) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

    // Handle empty answer
    if (!studentAnswer || studentAnswer.trim().length === 0) {
      return {
        marks_obtained: 0,
        feedback: 'No answer was provided. Please ensure you submit a response for evaluation.',
        confidence_score: 0.99,
      }
    }

    // Handle missing expected answer
    if (!expectedAnswer || expectedAnswer.trim().length === 0) {
      return {
        marks_obtained: Math.round(maxMarks * 0.7 * 100) / 100, // Give 70% partial credit
        feedback: 'Answer submitted successfully. No reference answer was available for automated grading. This answer has been marked for manual review.',
        confidence_score: 0.5,
      }
    }

    // Normalize answers
    const studentText = studentAnswer.toLowerCase().trim()
    const expectedText = expectedAnswer.toLowerCase().trim()

    const studentWords = studentText.split(/\s+/).filter((w) => w.length > 0)
    const expectedWords = expectedText.split(/\s+/).filter((w) => w.length > 0)

    // Extract keywords (words longer than 4 characters)
    const studentKeywords = new Set(
      studentWords.filter((w) => w.length > 4).map((w) => w.replace(/[^a-z]/g, ''))
    )
    const expectedKeywords = expectedWords
      .filter((w) => w.length > 4)
      .map((w) => w.replace(/[^a-z]/g, ''))

    // Calculate keyword match ratio
    const matchedKeywords = expectedKeywords.filter((w) => studentKeywords.has(w))
    const keywordMatchRatio =
      expectedKeywords.length > 0 ? matchedKeywords.length / expectedKeywords.length : 0

    // Length factor - penalize very short answers
    const minExpectedLength = Math.max(expectedWords.length * 0.5, 10)
    const lengthRatio = Math.min(studentWords.length / minExpectedLength, 1.5)

    // Semantic similarity score (0 to 1)
    let score = keywordMatchRatio * 0.65 + Math.min(lengthRatio * 0.25, 0.25)

    // Bonus for exact phrase matches
    const exactPhrases = [
      expectedText.substring(0, 50),
      expectedText.substring(0, 100),
    ]
    const hasExactMatch = exactPhrases.some((phrase) => studentText.includes(phrase))
    if (hasExactMatch) score += 0.1

    score = Math.min(score, 1) // Cap at 1

    const marksObtained = Math.round(score * maxMarks * 100) / 100

    // Generate contextual feedback
    let feedback = ''
    let suggestions = ''

    // Identify missing keywords
    const missingKeywords = expectedKeywords
      .filter((w) => !studentKeywords.has(w))
      .slice(0, 5)

    if (score >= 0.9) {
      feedback =
        'Excellent answer! You covered all the key points accurately and comprehensively. Your understanding of the topic is outstanding.'
    } else if (score >= 0.75) {
      feedback =
        'Good answer! You covered most of the important points accurately. Minor improvements could include adding more detail about: ' +
        missingKeywords.slice(0, 3).join(', ') +
        '.'
    } else if (score >= 0.6) {
      feedback =
        'Satisfactory answer. You demonstrated understanding of the core concepts but missed some important details. Consider including: ' +
        missingKeywords.slice(0, 4).join(', ') +
        '.'
    } else if (score >= 0.4) {
      feedback =
        'Partial answer. You mentioned some relevant concepts but the response needs significant improvement. Key concepts to address: ' +
        missingKeywords.slice(0, 5).join(', ') +
        '.'
    } else if (score >= 0.2) {
      feedback =
        'Limited answer. You touched on the topic but the response lacks depth and misses most key concepts. Please review: ' +
        missingKeywords.slice(0, 5).join(', ') +
        '.'
    } else {
      feedback =
        'The answer does not adequately address the question. Please review the topic thoroughly and ensure you understand the fundamental concepts: ' +
        missingKeywords.slice(0, 5).join(', ') +
        '.'
    }

    // Add length feedback if applicable
    if (studentWords.length < expectedWords.length * 0.3) {
      feedback += ' Your answer appears too brief. Try to expand your response with more detail.'
    }

    // Calculate confidence score based on evaluation quality
    const confidenceScore = Math.min(0.65 + score * 0.3, 0.95)

    return {
      marks_obtained: marksObtained,
      feedback: feedback,
      confidence_score: Math.round(confidenceScore * 100) / 100,
    }
  },

  /**
   * Batch evaluate multiple written answers
   * @param {Array<{questionText, studentAnswer, expectedAnswer, maxMarks}>} answers
   * @returns {Promise<Array>} Array of evaluation results
   */
  batchEvaluate: async (answers) => {
    const results = []
    for (const answer of answers) {
      const result = await llmService.evaluateWrittenAnswer(
        answer.questionText,
        answer.studentAnswer,
        answer.expectedAnswer,
        answer.maxMarks
      )
      results.push(result)
    }
    return results
  },

  /**
   * Generate questions using different modes
   * @param {string} mode - 'random', 'guided', 'zero-shot'
   * @param {object} params - topic, hints, subject_id, question_type, difficulty, count
   * @returns {Promise<Array>} Array of generated questions
   */
  generateQuestion: async (mode, params) => {
    const { topic = '', hints = '', subject_id = '', question_type = 'mcq', difficulty = 'medium', count = 5 } = params;
    
    // Simulate LLM delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));

    const sampleQuestions = {
      physics: [
        {
          question_text: "What is Newton's first law of motion?",
          question_type: 'descriptive',
          difficulty: 'easy',
          max_marks: 5,
          expected_answer: "An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.",
          correct_option: null
        },
        {
          question_text: "Which of the following is true about acceleration due to gravity?",
          question_type: 'mcq',
          difficulty: 'medium',
          max_marks: 2,
          option_text_a: "It is constant everywhere on Earth",
          option_text_b: "It varies with latitude",
          option_text_c: "It is zero at the equator",
          option_text_d: "It increases with altitude",
          correct_option: "B"
        }
      ],
      math: [
        {
          question_text: "Solve for x: 2x + 5 = 15",
          question_type: 'descriptive',
          difficulty: 'easy',
          max_marks: 3,
          expected_answer: "x = 5"
        }
      ],
      // Add more subjects as needed
    };

    let questions = [];

    switch (mode) {
      case 'random':
        // Pure AI based on topic
        questions = Array.from({ length: count }, (_, i) => ({
          question_text: `Sample ${question_type.toUpperCase()} question #${i+1} on "${topic}" (${difficulty})`,
          question_type,
          difficulty,
          max_marks: question_type === 'descriptive' ? 5 : 2,
          source: 'ai_random'
        }));
        if (question_type === 'mcq') {
          questions.forEach(q => {
            q.option_text_a = 'Option A';
            q.option_text_b = 'Option B';
            q.option_text_c = 'Option C';
            q.option_text_d = 'Option D';
            q.correct_option = 'A';
          });
        }
        break;

      case 'guided':
        // Use hints/structure
        questions = Array.from({ length: count }, (_, i) => ({
          question_text: `Guided question #${i+1}: ${topic} [Hints: ${hints.substring(0,50)}...]`,
          question_type,
          difficulty,
          max_marks: 5,
          expected_answer: hints.substring(0,100),
          source: 'ai_guided'
        }));
        break;

      case 'zero-shot':
        // Subject-only
        const subjectQuestions = sampleQuestions[subject_id.toLowerCase()] || sampleQuestions.physics;
        questions = subjectQuestions.slice(0, count);
        break;

      default:
        questions = sampleQuestions.physics.slice(0, count);
    }

    return questions;
  }
}

module.exports = llmService
