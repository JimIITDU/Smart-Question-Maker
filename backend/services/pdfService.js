const PDFDocument = require("pdfkit");

/**
 * PDF Service for generating exam papers and answer keys
 */

// Set labels for exam sets
const SET_LABELS = ["A", "B", "C", "D"];

/**
 * Deterministic shuffle using a seed string
 * @param {Array} array - Array to shuffle
 * @param {string} seed - Seed string for deterministic shuffle
 * @returns {Array} - Shuffled array
 */
function seededShuffle(array, seed) {
  const result = [...array];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  for (let i = result.length - 1; i > 0; i--) {
    hash = Math.abs((hash * 9301 + 49297) % 233280);
    const j = hash % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Shuffle MCQ options for a question while tracking correct answer
 * @param {Object} question - Question object from DB
 * @param {string} seed - Seed for deterministic shuffle
 * @returns {Object} - Question with shuffled options
 */
function shuffleQuestionOptions(question, seed) {
  if (question.question_type !== "mcq" || !question.option_text_a) {
    return { ...question };
  }

  const options = [
    { label: "A", text: question.option_text_a },
    { label: "B", text: question.option_text_b },
    { label: "C", text: question.option_text_c },
    { label: "D", text: question.option_text_d },
  ].filter((opt) => opt.text);

  const shuffled = seededShuffle(options, seed + question.question_id);

  // Determine new correct option label
  const originalCorrect = question.correct_option
    ? question.correct_option.trim().toUpperCase()
    : "";
  const correctTexts = originalCorrect
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const newCorrectLabels = correctTexts.map((origLabel) => {
    const origOption = options.find((o) => o.label === origLabel);
    if (!origOption) return origLabel;
    const newPos = shuffled.findIndex((o) => o.text === origOption.text);
    return shuffled[newPos]?.label || origLabel;
  });

  const shuffledQuestion = {
    ...question,
    option_text_a: shuffled[0]?.text || "",
    option_text_b: shuffled[1]?.text || "",
    option_text_c: shuffled[2]?.text || "",
    option_text_d: shuffled[3]?.text || "",
    correct_option: newCorrectLabels.join(", "),
  };

  return shuffledQuestion;
}

/**
 * Generate a set of questions with shuffled order and options
 * @param {Array} questions - Original questions array
 * @param {string} setLabel - Set label (A, B, C, D)
 * @returns {Array} - Shuffled questions for this set
 */
function generateSet(questions, setLabel) {
  const shuffledQuestions = seededShuffle(questions, `set-${setLabel}`);
  return shuffledQuestions.map((q, idx) => ({
    ...shuffleQuestionOptions(q, `opts-${setLabel}-${idx}`),
    displayNumber: idx + 1,
  }));
}

/**
 * Calculate total marks for questions
 * @param {Array} questions - Questions array
 * @returns {number} - Total marks
 */
function calculateTotalMarks(questions) {
  return questions.reduce((sum, q) => sum + (parseInt(q.max_marks) || 0), 0);
}

/**
 * Generate an exam PDF for a specific set
 * @param {Object} exam - Exam object from DB
 * @param {Object} center - Center object from DB
 * @param {Array} questions - Questions for this set (already shuffled)
 * @param {string} setLabel - Set label (A, B, C, D)
 * @returns {Promise<Buffer>} - PDF as buffer
 */
async function generateExamPDF(exam, center, questions, setLabel) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // === HEADER SECTION ===
      const pageWidth = doc.page.width - 100;

      // Center Name
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text(center?.center_name || "Coaching Center", 50, 50, {
          align: "center",
          width: pageWidth,
        });

      // Decorative line
      doc
        .moveTo(50, 75)
        .lineTo(doc.page.width - 50, 75)
        .stroke("#2563eb");
      doc.moveDown(0.5);

      // Exam Title and Set Label
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text(`${exam.title || "Untitled Exam"}`, {
          align: "center",
          width: pageWidth,
        });

      doc
        .fontSize(14)
        .font("Helvetica")
        .fillColor("#dc2626")
        .text(`SET ${setLabel}`, { align: "center", width: pageWidth });

      doc.fillColor("#000000");

      // Exam Info Box
      const infoY = doc.y + 10;
      doc.rect(50, infoY, pageWidth, 60).stroke("#cccccc");

      doc.fontSize(10).font("Helvetica");
      const colWidth = pageWidth / 3;
      doc.text(`Subject: ${exam.subject_name || "N/A"}`, 60, infoY + 8);
      doc.text(
        `Duration: ${exam.duration_minutes || 60} minutes`,
        60 + colWidth,
        infoY + 8,
      );
      doc.text(
        `Total Marks: ${calculateTotalMarks(questions)}`,
        60 + colWidth * 2,
        infoY + 8,
      );

      doc.text(`Batch: ${exam.batch_name || "N/A"}`, 60, infoY + 32);
      doc.text(
        `Date: ${exam.start_time ? new Date(exam.start_time).toLocaleDateString() : "__________"}`,
        60 + colWidth,
        infoY + 32,
      );
      doc.text(
        `Access Code: ${exam.access_code || "N/A"}`,
        60 + colWidth * 2,
        infoY + 32,
      );

      // Student Info Section
      doc.moveDown(3);
      doc.fontSize(12).font("Helvetica-Bold").text("Student Information:", 50);
      doc.moveDown(0.5);

      const studentInfoY = doc.y;
      doc.fontSize(11).font("Helvetica");

      const fields = [
        { label: "Name", value: "" },
        { label: "Roll Number", value: "" },
        { label: "Class / Section", value: "" },
        { label: "Signature", value: "" },
      ];

      fields.forEach((field, i) => {
        const y = studentInfoY + Math.floor(i / 2) * 30;
        const x = i % 2 === 0 ? 50 : 50 + pageWidth / 2 + 10;
        doc.text(`${field.label}: ${field.value}`, x, y);
        doc
          .moveTo(x + doc.widthOfString(`${field.label}: `), y + 12)
          .lineTo(x + pageWidth / 2 - 20, y + 12)
          .stroke("#999999");
      });

      doc.moveDown(2);

      // === INSTRUCTIONS ===
      doc.fontSize(11).font("Helvetica-Bold").text("Instructions:");
      doc.moveDown(0.3);
      doc.fontSize(9).font("Helvetica");
      doc.text("1. Read all questions carefully before answering.", {
        indent: 10,
      });
      doc.text("2. All questions are compulsory unless stated otherwise.", {
        indent: 10,
      });
      doc.text("3. Write your answers clearly and legibly.", { indent: 10 });
      doc.text(
        "4. Do not write anything on this question paper except your name and roll number.",
        { indent: 10 },
      );
      doc.text(
        "5. Use of calculators or mobile phones is strictly prohibited.",
        { indent: 10 },
      );

      doc.moveDown(1.5);
      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke("#cccccc");
      doc.moveDown(1);

      // === QUESTIONS SECTION ===
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .text("QUESTIONS", { align: "center" });
      doc.moveDown(1);

      questions.forEach((q, idx) => {
        // Check if we need a new page
        if (doc.y > doc.page.height - 150) {
          doc.addPage();
          doc
            .fontSize(10)
            .fillColor("#666666")
            .text(`Set ${setLabel} - ${exam.title || "Exam"}`, 50, 30);
          doc
            .moveTo(50, 45)
            .lineTo(doc.page.width - 50, 45)
            .stroke("#eeeeee");
          doc.y = 55;
          doc.fillColor("#000000");
        }

        // Question number and text
        const questionY = doc.y;
        doc.fontSize(11).font("Helvetica-Bold");
        doc.text(`Q${idx + 1}.`, 50, questionY);
        doc.font("Helvetica");

        const questionTextWidth = doc.page.width - 130;
        doc.text(q.question_text, 80, questionY, {
          width: questionTextWidth,
          align: "left",
        });

        doc.moveDown(0.5);

        // Marks and type
        const metaY = doc.y;
        doc.fontSize(8).fillColor("#666666");
        doc.text(
          `[${q.max_marks || 1} mark${q.max_marks > 1 ? "s" : ""}]`,
          80,
          metaY,
        );
        doc.text(`(${q.difficulty || "medium"})`, 140, metaY);
        doc.fillColor("#000000");

        doc.moveDown(0.5);

        // Options for MCQ
        if (q.question_type === "mcq") {
          const options = [];
          if (q.option_text_a)
            options.push({ label: "A", text: q.option_text_a });
          if (q.option_text_b)
            options.push({ label: "B", text: q.option_text_b });
          if (q.option_text_c)
            options.push({ label: "C", text: q.option_text_c });
          if (q.option_text_d)
            options.push({ label: "D", text: q.option_text_d });

          const col1X = 100;
          const col2X = doc.page.width / 2 + 20;

          options.forEach((opt, optIdx) => {
            const x = optIdx % 2 === 0 ? col1X : col2X;
            const y = doc.y + Math.floor(optIdx / 2) * 20;
            doc.fontSize(10).font("Helvetica");
            doc.text(`${opt.label}. ${opt.text}`, x, y);
          });

          doc.moveDown(options.length > 2 ? 1.5 : 1);
        } else if (q.question_type === "true_false") {
          doc.fontSize(10).font("Helvetica");
          doc.text("   [  ] True      [  ] False", 80);
          doc.moveDown(1);
        } else {
          // Descriptive - provide answer space
          doc.moveDown(0.5);
          const answerBoxY = doc.y;
          const boxHeight = Math.max(60, 100 - (q.max_marks || 1) * 5);
          doc
            .rect(80, answerBoxY, doc.page.width - 160, boxHeight)
            .stroke("#dddddd");
          doc.moveDown(boxHeight / 14 + 0.5);
        }

        // Spacing between questions
        doc.moveDown(0.5);
      });

      // === FOOTER ===
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor("#999999");
        doc.text(
          `Page ${i + 1} of ${totalPages}  |  Set ${setLabel}  |  Good Luck!`,
          50,
          doc.page.height - 50,
          { align: "center", width: doc.page.width - 100 },
        );
        doc.fillColor("#000000");
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate an answer key PDF for a specific set
 * @param {Object} exam - Exam object from DB
 * @param {Object} center - Center object from DB
 * @param {Array} questions - Questions for this set (already shuffled with correct answers)
 * @param {string} setLabel - Set label (A, B, C, D)
 * @returns {Promise<Buffer>} - PDF as buffer
 */
async function generateAnswerKeyPDF(exam, center, questions, setLabel) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      const pageWidth = doc.page.width - 100;

      // Header
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text(center?.center_name || "Coaching Center", 50, 50, {
          align: "center",
          width: pageWidth,
        });

      doc
        .moveTo(50, 75)
        .lineTo(doc.page.width - 50, 75)
        .stroke("#16a34a");
      doc.moveDown(0.5);

      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text(`${exam.title || "Untitled Exam"}`, {
          align: "center",
          width: pageWidth,
        });

      doc
        .fontSize(14)
        .font("Helvetica")
        .fillColor("#dc2626")
        .text(`ANSWER KEY - SET ${setLabel}`, {
          align: "center",
          width: pageWidth,
        });

      doc.fillColor("#000000");
      doc.moveDown(1);

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Subject: ${exam.subject_name || "N/A"}  |  Duration: ${exam.duration_minutes || 60} mins  |  Total Marks: ${calculateTotalMarks(questions)}`,
          { align: "center" },
        );

      doc.moveDown(1.5);
      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke("#cccccc");
      doc.moveDown(1);

      // Answer table header
      const tableY = doc.y;
      doc.fontSize(11).font("Helvetica-Bold");
      doc.text("Q#", 50, tableY);
      doc.text("Type", 80, tableY);
      doc.text("Correct Answer", 150, tableY);
      doc.text("Marks", 380, tableY);
      doc.text("Model Answer / Explanation", 430, tableY);

      doc
        .moveTo(50, tableY + 18)
        .lineTo(doc.page.width - 50, tableY + 18)
        .stroke("#333333");
      doc.moveDown(1.5);

      questions.forEach((q, idx) => {
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
          doc
            .fontSize(10)
            .fillColor("#16a34a")
            .text(
              `Answer Key - Set ${setLabel} - ${exam.title || "Exam"}`,
              50,
              30,
            );
          doc
            .moveTo(50, 45)
            .lineTo(doc.page.width - 50, 45)
            .stroke("#eeeeee");
          doc.y = 55;
          doc.fillColor("#000000");
        }

        const rowY = doc.y;
        doc.fontSize(10).font("Helvetica");

        // Question number
        doc.text(`${idx + 1}`, 50, rowY);

        // Question type
        const typeColor =
          q.question_type === "mcq"
            ? "#2563eb"
            : q.question_type === "descriptive"
              ? "#9333ea"
              : "#d97706";
        doc.fillColor(typeColor).text(q.question_type.toUpperCase(), 80, rowY);
        doc.fillColor("#000000");

        // Correct answer
        doc.font("Helvetica-Bold").fillColor("#16a34a");
        if (q.question_type === "mcq") {
          doc.text(q.correct_option || "N/A", 150, rowY);
        } else if (q.question_type === "true_false") {
          doc.text(q.correct_option || "N/A", 150, rowY);
        } else {
          doc.text("See below", 150, rowY);
        }
        doc.font("Helvetica").fillColor("#000000");

        // Marks
        doc.text(`${q.max_marks || 1}`, 380, rowY);

        // Model answer
        const modelText = q.expected_answer || q.correct_option || "N/A";
        doc.text(modelText, 430, rowY, { width: doc.page.width - 480 });

        const textHeight = doc.heightOfString(modelText, {
          width: doc.page.width - 480,
        });
        doc.moveDown(Math.max(1, textHeight / 14 + 0.3));
      });

      // Footer
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor("#999999");
        doc.text(
          `Page ${i + 1} of ${totalPages}  |  Answer Key - Set ${setLabel}  |  Confidential`,
          50,
          doc.page.height - 50,
          { align: "center", width: doc.page.width - 100 },
        );
        doc.fillColor("#000000");
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate multiple exam sets with their answer keys
 * @param {Object} exam - Exam object from DB
 * @param {Object} center - Center object from DB
 * @param {Array} questions - Original questions array
 * @param {number} numSets - Number of sets to generate (1-4)
 * @returns {Promise<Array>} - Array of { setLabel, examPDF, answerKeyPDF }
 */
async function generateExamSets(exam, center, questions, numSets = 2) {
  const setsCount = Math.min(Math.max(numSets, 1), 4);
  const results = [];

  for (let i = 0; i < setsCount; i++) {
    const setLabel = SET_LABELS[i];
    const setQuestions = generateSet(questions, setLabel);

    const [examPDF, answerKeyPDF] = await Promise.all([
      generateExamPDF(exam, center, setQuestions, setLabel),
      generateAnswerKeyPDF(exam, center, setQuestions, setLabel),
    ]);

    results.push({
      setLabel,
      examPDF,
      answerKeyPDF,
      examFilename: `${exam.title || "Exam"}_Set_${setLabel}.pdf`.replace(
        /\s+/g,
        "_",
      ),
      answerKeyFilename:
        `${exam.title || "Exam"}_Answer_Key_Set_${setLabel}.pdf`.replace(
          /\s+/g,
          "_",
        ),
    });
  }

  return results;
}

/**
 * Generate single combined PDF with all sets and answer keys
 * @param {Object} exam 
 * @param {Object} center 
 * @param {Array} questions 
 * @param {number} numSets 
 * @returns {Promise<Buffer>}
 */
async function generateCombinedPDF(exam, center, questions, numSets = 1) {
  const setsCount = Math.min(Math.max(numSets, 1), 4);
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const buffers = [];

  doc.on("data", (chunk) => buffers.push(chunk));
  doc.on("end", () => {});

  try {
    const pageWidth = doc.page.width - 100;

    // COVER PAGE
    doc.fontSize(20).font("Helvetica-Bold").text(center?.center_name || "Coaching Center", 50, 80, { align: "center", width: pageWidth });
    doc.moveTo(50, 110).lineTo(doc.page.width - 50, 110).stroke("#2563eb");
    doc.moveDown(0.5);

    doc.fontSize(22).font("Helvetica-Bold").text(exam.title || "Exam Paper", { align: "center", width: pageWidth });
    doc.fontSize(16).text(`Multiple Sets Included (${setsCount} sets: A-${SET_LABELS[setsCount-1]})`, { align: "center", width: pageWidth });
    doc.moveDown(1);

    doc.fontSize(12).font("Helvetica").text(`Duration: ${exam.duration_minutes || 60} minutes | Total Marks: ${calculateTotalMarks(questions)}`, { align: "center", width: pageWidth });
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, { align: "center", width: pageWidth });
    
    doc.addPage();

    // GENERATE EACH SET
    for (let i = 0; i < setsCount; i++) {
      const setLabel = SET_LABELS[i];
      const setQuestions = generateSet(questions, setLabel);

      // SET EXAM PAPER SECTION
      doc.fontSize(18).font("Helvetica-Bold").fillColor("#dc2626").text(`SET ${setLabel} - EXAM PAPER`, 50, 50);
      doc.fillColor("#000");

      // Exam info box (reuse logic from generateExamPDF)
      const infoY = doc.y + 10;
      doc.rect(50, infoY, pageWidth, 60).stroke("#cccccc");
      doc.fontSize(10).text(`Subject: ${exam.subject_name || "N/A"}`, 60, infoY + 8);
      doc.text(`Duration: ${exam.duration_minutes || 60} minutes`, 60 + pageWidth/3, infoY + 8);
      doc.text(`Total Marks: ${calculateTotalMarks(setQuestions)}`, 60 + 2*(pageWidth/3), infoY + 8);
      doc.text(`Batch: ${exam.batch_name || "N/A"}`, 60, infoY + 32);
      doc.text(`Set: ${setLabel}`, 60 + pageWidth/3, infoY + 32);
      
      doc.moveDown(3);

      // Instructions
      doc.fontSize(11).font("Helvetica-Bold").text("Instructions:", 50);
      doc.moveDown(0.3);
      doc.fontSize(9);
      doc.text("1. Read all questions carefully before answering.", { indent: 10 });
      doc.text("2. All questions are compulsory unless stated otherwise.", { indent: 10 });
      doc.text("3. Write your answers clearly and legibly.", { indent: 10 });
      doc.moveDown(1.5);
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke("#cccccc");
      doc.moveDown(1);

      // Questions (mimic generateExamPDF question rendering)
      setQuestions.forEach((q, idx) => {
        if (doc.y > doc.page.height - 150) {
          doc.addPage();
          doc.fontSize(10).fillColor("#666").text(`SET ${setLabel} - EXAM PAPER`, 50, 30);
          doc.y = 55;
          doc.fillColor("#000");
        }

        const questionY = doc.y;
        doc.fontSize(11).font("Helvetica-Bold").text(`Q${idx+1}.`, 50, questionY);
        doc.font("Helvetica");
        doc.text(q.question_text, 80, questionY, { width: pageWidth - 50 });

        doc.moveDown(0.5);
        doc.fontSize(8).fillColor("#666");
        doc.text(`[${q.max_marks || 1} marks] (${q.difficulty || "medium"})`, 80, doc.y);
        doc.fillColor("#000");
        doc.moveDown(0.5);

        if (q.question_type === "mcq") {
          const options = [];
          if (q.option_text_a) options.push({label: "A", text: q.option_text_a});
          if (q.option_text_b) options.push({label: "B", text: q.option_text_b});
          if (q.option_text_c) options.push({label: "C", text: q.option_text_c});
          if (q.option_text_d) options.push({label: "D", text: q.option_text_d});

          const col1X = 100, col2X = doc.page.width / 2 + 20;
          options.forEach((opt, optIdx) => {
            const x = optIdx % 2 === 0 ? col1X : col2X;
            const y = doc.y + Math.floor(optIdx / 2) * 20;
            doc.fontSize(10).text(`${opt.label}. ${opt.text}`, x, y);
          });
          doc.moveDown(options.length > 2 ? 1.5 : 1);
        } else {
          // Descriptive space
          const boxHeight = 80;
          doc.rect(80, doc.y, doc.page.width - 160, boxHeight).stroke("#dddddd");
          doc.moveDown(boxHeight / 14 + 0.5);
        }
        doc.moveDown(0.5);
      });

      doc.addPage();

      // SET ANSWER KEY SECTION
      doc.fontSize(18).font("Helvetica-Bold").fillColor("#16a34a").text(`SET ${setLabel} - ANSWER KEY`, 50, 50);
      doc.fillColor("#000");
      doc.moveDown(1.5);
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke("#cccccc");
      doc.moveDown(1);

      // Answer table header
      const tableY = doc.y;
      doc.fontSize(11).font("Helvetica-Bold");
      doc.text("Q#", 50, tableY);
      doc.text("Type", 80, tableY);
      doc.text("Correct Answer", 150, tableY);
      doc.text("Marks", 380, tableY);
      doc.text("Model Answer", 430, tableY);
      doc.moveTo(50, tableY + 18).lineTo(doc.page.width - 50, tableY + 18).stroke("#333");
      doc.moveDown(1.5);

      setQuestions.forEach((q, idx) => {
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
          doc.fontSize(10).fillColor("#16a34a").text(`SET ${setLabel} - ANSWER KEY`, 50, 30);
          doc.y = 55;
          doc.fillColor("#000");
        }

        const rowY = doc.y;
        doc.fontSize(10).font("Helvetica");
        doc.text(`${idx + 1}`, 50, rowY);
        const typeColor = q.question_type === "mcq" ? "#2563eb" : q.question_type === "descriptive" ? "#9333ea" : "#d97706";
        doc.fillColor(typeColor).text(q.question_type.toUpperCase(), 80, rowY);
        doc.fillColor("#000").font("Helvetica-Bold").fillColor("#16a34a");
        doc.text(q.correct_option || "N/A", 150, rowY);
        doc.font("Helvetica").fillColor("#000");
        doc.text(`${q.max_marks || 1}`, 380, rowY);
        const modelText = q.expected_answer || q.correct_option || "N/A";
        doc.text(modelText, 430, rowY, { width: doc.page.width - 480 });
        doc.moveDown(1);
      });
    }

    // Global footers
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor("#999");
      doc.text(`Page ${i+1} of ${totalPages} | Combined Sets PDF | Confidential`, 50, doc.page.height - 50, { align: "center", width: pageWidth });
      doc.fillColor("#000");
    }

    doc.end();
    return Buffer.concat(buffers);
  } catch (error) {
    doc.end();
    throw error;
  }
}

module.exports = {
  generateExamSets,
  generateCombinedPDF,
  SET_LABELS,
  generateSet,
  calculateTotalMarks,
};
