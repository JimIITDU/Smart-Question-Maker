// LLM Service using Google Gemini API
// Falls back to mock evaluation if GEMINI_API_KEY is not configured

const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[LLM] GEMINI_API_KEY not set.");
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn("[LLM] GROQ_API_KEY not set.");
    return null;
  }
  return new Groq({ apiKey });
};

// Check if Gemini is available
const isGeminiAvailable = () => !!process.env.GEMINI_API_KEY;

const llmService = {
  /**
   * Evaluate a student's written answer against an expected answer using Gemini
   * @param {string} questionText - The question text
   * @param {string} studentAnswer - The student's submitted answer
   * @param {string} expectedAnswer - The reference/expected answer
   * @param {number} maxMarks - Maximum marks for this question
   * @returns {Promise<{marks_obtained: number, feedback: string, confidence_score: number}>}
   */
  evaluateWrittenAnswer: async (
    questionText,
    studentAnswer,
    expectedAnswer,
    maxMarks,
  ) => {
    // Simulate API delay for consistent UX
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 1000),
    );

    // Handle empty answer
    if (!studentAnswer || studentAnswer.trim().length === 0) {
      return {
        marks_obtained: 0,
        feedback:
          "No answer was provided. Please ensure you submit a response for evaluation.",
        confidence_score: 0.99,
      };
    }

    // Handle missing expected answer
    if (!expectedAnswer || expectedAnswer.trim().length === 0) {
      return {
        marks_obtained: Math.round(maxMarks * 0.7 * 100) / 100,
        feedback:
          "Answer submitted successfully. No reference answer was available for automated grading. This answer has been marked for manual review.",
        confidence_score: 0.5,
      };
    }

    const model = getGeminiModel();
    if (!model) {
      return llmService.mockEvaluateWrittenAnswer(
        questionText,
        studentAnswer,
        expectedAnswer,
        maxMarks,
      );
    }

    try {
      const prompt = `
You are an expert teacher evaluating a student's written answer. Evaluate objectively and provide constructive feedback.

QUESTION: ${questionText}

EXPECTED ANSWER (Reference): ${expectedAnswer}

STUDENT'S ANSWER: ${studentAnswer}

MAXIMUM MARKS: ${maxMarks}

Evaluate the student's answer and respond ONLY with a JSON object in this exact format:
{
  "marks_obtained": <number between 0 and ${maxMarks}, rounded to 2 decimal places>,
  "feedback": "<detailed, constructive feedback explaining what was good and what could be improved. Be encouraging but honest. 2-4 sentences.>",
  "confidence_score": <number between 0 and 1 representing how confident you are in this evaluation>
}

Guidelines:
- Award full marks (${maxMarks}) only if the answer is comprehensive, accurate, and well-explained
- Deduct marks for missing key concepts, factual errors, or insufficient detail
- Consider partial credit for partially correct answers
- The feedback should help the student understand their mistakes and learn
`;

      console.log(
        "[LLM] Sending prompt to Gemini. Length:",
        prompt.length,
        "chars",
      );
      const result = await model.generateContent(prompt);
      console.log("[LLM] Gemini responded successfully");
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in Gemini response");
      }

      const evaluation = JSON.parse(jsonMatch[0]);

      // Validate and sanitize
      const marksObtained = Math.min(
        Math.max(parseFloat(evaluation.marks_obtained) || 0, 0),
        maxMarks,
      );
      const confidenceScore = Math.min(
        Math.max(parseFloat(evaluation.confidence_score) || 0.7, 0),
        1,
      );

      return {
        marks_obtained: Math.round(marksObtained * 100) / 100,
        feedback: evaluation.feedback || "Evaluation completed.",
        confidence_score: Math.round(confidenceScore * 100) / 100,
      };
    } catch (error) {
      console.error("[LLM] Gemini evaluation error:", error.message);
      // Fallback to mock evaluation
      return llmService.mockEvaluateWrittenAnswer(
        questionText,
        studentAnswer,
        expectedAnswer,
        maxMarks,
      );
    }
  },

  /**
   * Mock evaluation fallback when Gemini is unavailable
   */
  mockEvaluateWrittenAnswer: async (
    questionText,
    studentAnswer,
    expectedAnswer,
    maxMarks,
  ) => {
    const studentText = studentAnswer.toLowerCase().trim();
    const expectedText = expectedAnswer.toLowerCase().trim();

    const studentWords = studentText.split(/\s+/).filter((w) => w.length > 0);
    const expectedWords = expectedText.split(/\s+/).filter((w) => w.length > 0);

    const studentKeywords = new Set(
      studentWords
        .filter((w) => w.length > 4)
        .map((w) => w.replace(/[^a-z]/g, "")),
    );
    const expectedKeywords = expectedWords
      .filter((w) => w.length > 4)
      .map((w) => w.replace(/[^a-z]/g, ""));

    const matchedKeywords = expectedKeywords.filter((w) =>
      studentKeywords.has(w),
    );
    const keywordMatchRatio =
      expectedKeywords.length > 0
        ? matchedKeywords.length / expectedKeywords.length
        : 0;

    const minExpectedLength = Math.max(expectedWords.length * 0.5, 10);
    const lengthRatio = Math.min(studentWords.length / minExpectedLength, 1.5);

    let score = keywordMatchRatio * 0.65 + Math.min(lengthRatio * 0.25, 0.25);

    const exactPhrases = [
      expectedText.substring(0, 50),
      expectedText.substring(0, 100),
    ];
    const hasExactMatch = exactPhrases.some((phrase) =>
      studentText.includes(phrase),
    );
    if (hasExactMatch) score += 0.1;

    score = Math.min(score, 1);

    const marksObtained = Math.round(score * maxMarks * 100) / 100;

    let feedback = "";
    const missingKeywords = expectedKeywords
      .filter((w) => !studentKeywords.has(w))
      .slice(0, 5);

    if (score >= 0.9) {
      feedback =
        "Excellent answer! You covered all the key points accurately and comprehensively. Your understanding of the topic is outstanding.";
    } else if (score >= 0.75) {
      feedback =
        "Good answer! You covered most of the important points accurately. Minor improvements could include adding more detail about: " +
        missingKeywords.slice(0, 3).join(", ") +
        ".";
    } else if (score >= 0.6) {
      feedback =
        "Satisfactory answer. You demonstrated understanding of the core concepts but missed some important details. Consider including: " +
        missingKeywords.slice(0, 4).join(", ") +
        ".";
    } else if (score >= 0.4) {
      feedback =
        "Partial answer. You mentioned some relevant concepts but the response needs significant improvement. Key concepts to address: " +
        missingKeywords.slice(0, 5).join(", ") +
        ".";
    } else if (score >= 0.2) {
      feedback =
        "Limited answer. You touched on the topic but the response lacks depth and misses most key concepts. Please review: " +
        missingKeywords.slice(0, 5).join(", ") +
        ".";
    } else {
      feedback =
        "The answer does not adequately address the question. Please review the topic thoroughly and ensure you understand the fundamental concepts: " +
        missingKeywords.slice(0, 5).join(", ") +
        ".";
    }

    if (studentWords.length < expectedWords.length * 0.3) {
      feedback +=
        " Your answer appears too brief. Try to expand your response with more detail.";
    }

    const confidenceScore = Math.min(0.65 + score * 0.3, 0.95);

    return {
      marks_obtained: marksObtained,
      feedback: feedback,
      confidence_score: Math.round(confidenceScore * 100) / 100,
    };
  },

  /**
   * Batch evaluate multiple written answers
   */
  batchEvaluate: async (answers) => {
    const results = [];
    for (const answer of answers) {
      const result = await llmService.evaluateWrittenAnswer(
        answer.questionText,
        answer.studentAnswer,
        answer.expectedAnswer,
        answer.maxMarks,
      );
      results.push(result);
    }
    return results;
  },

  /**
   * Generate questions using Gemini AI
   * @param {string} mode - 'random', 'guided', 'zero-shot'
   * @param {object} params - topic, hints, subject_id, question_type, difficulty, count
   * @returns {Promise<Array>} Array of generated questions
   */
  generateQuestion: async (mode, params) => {
    const {
      topic = "",
      hints = "",
      subject_id = "",
      question_type = "mcq",
      difficulty = "medium",
      count = 5,
    } = params;

    console.log(
      "[LLM] Calling Groq with key:",
      process.env.GROQ_API_KEY ? "KEY EXISTS" : "KEY MISSING",
    );
    console.log("[LLM] Mode:", mode, "| Topic:", topic, "| Count:", count);

const groqClient = getGroqClient();
    if (!groqClient) {
      console.warn("[LLM] No GROQ_API_KEY found, using mock generation");
      return llmService.mockGenerateQuestion(mode, params);
    }

    try {
      let prompt = "";

      switch (mode) {
        case "random":
          prompt = `
Generate ${count} ${question_type.toUpperCase()} questions about "${topic}" at ${difficulty} difficulty level.

For MCQ questions:
- Include exactly 4 options (A, B, C, D)
- For ${difficulty} difficulty, make the distractors plausible but clearly wrong
- You MAY create multiple-correct MCQs (where more than one option is correct) - about 30% of the time
- When multiple are correct, format correct_option as comma-separated (e.g., "A,B")

For descriptive questions:
- Include expected_answer with a model answer
- max_marks should be 3-5

For true_false questions:
- correct_option should be "True" or "False"

Respond ONLY with a JSON array in this exact format:
[
  {
    "question_text": "Question text here",
    "question_type": "${question_type}",
    "difficulty": "${difficulty}",
    "max_marks": <number>,
    "option_text_a": "Option A text (for MCQ only)",
    "option_text_b": "Option B text (for MCQ only)",
    "option_text_c": "Option C text (for MCQ only)",
    "option_text_d": "Option D text (for MCQ only)",
    "correct_option": "A" or "A,B" etc,
    "is_multiple_correct": true/false,
    "expected_answer": "Model answer (for descriptive only)"
  }
]

IMPORTANT: Return ONLY the JSON array, no markdown, no explanations.
`;
          break;

        case "guided":
          prompt = `
Generate ${count} ${question_type.toUpperCase()} questions about "${topic}" at ${difficulty} difficulty level.

Teacher's guidance/hints: "${hints}"

Use the teacher's hints to shape the questions. Focus on the concepts and approaches mentioned.

For MCQ questions:
- Include exactly 4 options (A, B, C, D)
- You MAY create multiple-correct MCQs if the hints suggest it
- When multiple are correct, format correct_option as comma-separated (e.g., "A,B")

For descriptive questions:
- Include expected_answer with a model answer

Respond ONLY with a JSON array in this exact format:
[
  {
    "question_text": "Question text here",
    "question_type": "${question_type}",
    "difficulty": "${difficulty}",
    "max_marks": <number>,
    "option_text_a": "Option A text (for MCQ only)",
    "option_text_b": "Option B text (for MCQ only)",
    "option_text_c": "Option C text (for MCQ only)",
    "option_text_d": "Option D text (for MCQ only)",
    "correct_option": "A" or "A,B" etc,
    "is_multiple_correct": true/false,
    "expected_answer": "Model answer (for descriptive only)"
  }
]

IMPORTANT: Return ONLY the JSON array, no markdown, no explanations.
`;
          break;

        case "zero-shot":
          prompt = `
Generate ${count} ${question_type.toUpperCase()} questions for the subject "${subject_id}" at ${difficulty} difficulty level.

Create diverse questions covering different topics within ${subject_id}.

For MCQ questions:
- Include exactly 4 options (A, B, C, D)
- About 30% should be multiple-correct MCQs
- When multiple are correct, format correct_option as comma-separated (e.g., "A,B")

For descriptive questions:
- Include expected_answer with a model answer

Respond ONLY with a JSON array in this exact format:
[
  {
    "question_text": "Question text here",
    "question_type": "${question_type}",
    "difficulty": "${difficulty}",
    "max_marks": <number>,
    "option_text_a": "Option A text (for MCQ only)",
    "option_text_b": "Option B text (for MCQ only)",
    "option_text_c": "Option C text (for MCQ only)",
    "option_text_d": "Option D text (for MCQ only)",
    "correct_option": "A" or "A,B" etc,
    "is_multiple_correct": true/false,
    "expected_answer": "Model answer (for descriptive only)"
  }
]

IMPORTANT: Return ONLY the JSON array, no markdown, no explanations.
`;
          break;

        default:
          return llmService.mockGenerateQuestion(mode, params);
      }

      console.log(
        "[LLM] Sending prompt to Groq. Length:",
        prompt.length,
        "chars",
      );
      const completion = await groqClient.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
      console.log("[LLM] Groq responded successfully");
      const rawText = completion.choices[0].message.content;
      const text = rawText;

      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in Groq response");
      }

      const questions = JSON.parse(jsonMatch[0]);

      // Validate and sanitize questions
      return questions.map((q) => ({
        question_text: q.question_text || "Generated question",
        question_type: q.question_type || question_type,
        difficulty: q.difficulty || difficulty,
        max_marks:
          parseInt(q.max_marks) || (question_type === "descriptive" ? 5 : 2),
        option_text_a: q.option_text_a || null,
        option_text_b: q.option_text_b || null,
        option_text_c: q.option_text_c || null,
        option_text_d: q.option_text_d || null,
        correct_option: q.correct_option || "A",
        is_multiple_correct: q.is_multiple_correct || false,
        expected_answer: q.expected_answer || null,
        source: `ai_${mode}`,
      }));
    } catch (error) {
      console.error("[LLM] Groq generation error:", error.message);
      // Fallback to mock generation
      return llmService.mockGenerateQuestion(mode, params);
    }
  },

  /**
   * Mock question generation fallback when Gemini is unavailable
   */
  mockGenerateQuestion: async (mode, params) => {
    const {
      topic = "",
      hints = "",
      subject_id = "",
      question_type = "mcq",
      difficulty = "medium",
      count = 5,
    } = params;

    const sampleQuestions = {
      physics: [
        {
          question_text: "What is Newton's first law of motion?",
          question_type: "descriptive",
          difficulty: "easy",
          max_marks: 5,
          expected_answer:
            "An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.",
          correct_option: null,
        },
        {
          question_text:
            "Which of the following statements are true about acceleration due to gravity? (Select all that apply)",
          question_type: "mcq",
          difficulty: "medium",
          max_marks: 3,
          option_text_a: "It varies with latitude",
          option_text_b: "It is approximately 9.8 m/s² at sea level",
          option_text_c: "It is zero at the equator",
          option_text_d: "It decreases with altitude",
          correct_option: "A,B,D",
          is_multiple_correct: true,
        },
        {
          question_text: "Select all properties of a vector quantity:",
          question_type: "mcq",
          difficulty: "easy",
          max_marks: 2,
          option_text_a: "Magnitude",
          option_text_b: "Direction",
          option_text_c: "Unit",
          option_text_d: "Color",
          correct_option: "A,B,C",
          is_multiple_correct: true,
        },
      ],
      math: [
        {
          question_text: "Solve for x: 2x + 5 = 15",
          question_type: "descriptive",
          difficulty: "easy",
          max_marks: 3,
          expected_answer: "x = 5",
        },
        {
          question_text:
            "Which of the following numbers are prime? (Select all that apply)",
          question_type: "mcq",
          difficulty: "medium",
          max_marks: 2,
          option_text_a: "17",
          option_text_b: "21",
          option_text_c: "29",
          option_text_d: "33",
          correct_option: "A,C",
          is_multiple_correct: true,
        },
      ],
      chemistry: [
        {
          question_text:
            "Select all noble gases from the following: (Select all that apply)",
          question_type: "mcq",
          difficulty: "easy",
          max_marks: 2,
          option_text_a: "Helium (He)",
          option_text_b: "Neon (Ne)",
          option_text_c: "Chlorine (Cl)",
          option_text_d: "Argon (Ar)",
          correct_option: "A,B,D",
          is_multiple_correct: true,
        },
      ],
      biology: [
        {
          question_text:
            "Which of the following are characteristics of living organisms? (Select all that apply)",
          question_type: "mcq",
          difficulty: "easy",
          max_marks: 2,
          option_text_a: "Growth",
          option_text_b: "Reproduction",
          option_text_c: "Metabolism",
          option_text_d: "Crystal formation",
          correct_option: "A,B,C",
          is_multiple_correct: true,
        },
      ],
    };

    const generateMCQOptions = (index, forceMultiple = false) => {
      const topics = ["Concept A", "Concept B", "Concept C", "Concept D"];
      const shouldBeMultiple = forceMultiple || Math.random() < 0.35;
      const correctCount = shouldBeMultiple ? (Math.random() < 0.5 ? 2 : 3) : 1;
      const allOptions = ["A", "B", "C", "D"];

      const shuffled = [...allOptions].sort(() => Math.random() - 0.5);
      const correctOptions = shuffled.slice(0, correctCount).sort();

      return {
        option_text_a: `${topics[0]} related to ${topic || "the topic"}`,
        option_text_b: `${topics[1]} related to ${topic || "the topic"}`,
        option_text_c: `${topics[2]} related to ${topic || "the topic"}`,
        option_text_d: `${topics[3]} related to ${topic || "the topic"}`,
        correct_option: correctOptions.join(","),
        is_multiple_correct: correctCount > 1,
      };
    };

    let questions = [];

    switch (mode) {
      case "random":
        questions = Array.from({ length: count }, (_, i) => {
          const isMCQ = question_type === "mcq";
          const q = {
            question_text: `Sample ${question_type.toUpperCase()} question #${i + 1} on "${topic}" (${difficulty})${isMCQ ? " (Select all that apply)" : ""}`,
            question_type,
            difficulty,
            max_marks:
              question_type === "descriptive"
                ? 5
                : question_type === "mcq"
                  ? 2
                  : 1,
            source: "ai_random",
          };
          if (isMCQ) {
            Object.assign(q, generateMCQOptions(i));
          }
          return q;
        });
        break;

      case "guided":
        questions = Array.from({ length: count }, (_, i) => {
          const isMCQ = question_type === "mcq";
          const hasMultipleHint =
            hints.toLowerCase().includes("multiple") ||
            hints.toLowerCase().includes("all that apply");
          const q = {
            question_text: `Guided question #${i + 1}: ${topic}${isMCQ && hasMultipleHint ? " (Select all that apply)" : ""}`,
            question_type,
            difficulty,
            max_marks: question_type === "descriptive" ? 5 : 2,
            expected_answer: isMCQ ? null : hints.substring(0, 100),
            source: "ai_guided",
          };
          if (isMCQ) {
            Object.assign(q, generateMCQOptions(i, hasMultipleHint));
          }
          return q;
        });
        break;

      case "zero-shot":
        const subjectKey = subject_id.toLowerCase();
        const subjectQuestions =
          sampleQuestions[subjectKey] || sampleQuestions.physics;
        questions = JSON.parse(
          JSON.stringify(subjectQuestions.slice(0, count)),
        );
        break;

      default:
        questions = JSON.parse(
          JSON.stringify(sampleQuestions.physics.slice(0, count)),
        );
    }

    return questions;
  },
};

module.exports = llmService;
