import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCpu,
  FiFilter,
  FiZap,
  FiSave,
  FiCheckCircle,
  FiEdit2,
  FiXCircle,
  FiRefreshCw,
  FiUpload,
  FiPenTool,
  FiBookOpen,
  FiFileText,
} from "react-icons/fi";
import { aiGenerate, bulkCreateQuestions } from "../../services/api";

// Class options
const CLASS_OPTIONS = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9-10 (Secondary)",
  "11-12 (Higher Secondary)",
  "Bachelor(Hons)",
  "Masters",
  "MPhil",
  "Others",
];

// Paper options
const PAPER_OPTIONS = ["1st", "2nd", "3rd"];

// Chapter number options (1-50)
const CHAPTER_OPTIONS = Array.from({ length: 50 }, (_, i) =>
  (i + 1).toString(),
);

// School level classes (1-12) - for Subject/Course label logic
const SCHOOL_CLASSES = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9-10 (Secondary)",
  "11-12 (Higher Secondary)",
];

const isSchoolClass = (className) => SCHOOL_CLASSES.includes(className);

// Normalise question from API response to consistent format
const normaliseQuestion = (raw) => {
  const q = { ...raw };
  // Parse options from JSON if present
  if (raw.options && typeof raw.options === "object") {
    q.option_text_a = raw.options.a || raw.option_text_a;
    q.option_text_b = raw.options.b || raw.option_text_b;
    q.option_text_c = raw.options.c || raw.option_text_c;
    q.option_text_d = raw.options.d || raw.option_text_d;
  }
  // Parse correct_answers from array if present
  if (raw.correct_answers && Array.isArray(raw.correct_answers)) {
    q.correct_option = raw.correct_answers.join(",");
    q.is_multiple_correct = raw.correct_answers.length > 1;
  }
  // Descriptive uses expected_answer as model_answer
  if (raw.question_type === "descriptive" && raw.model_answer) {
    q.expected_answer = raw.model_answer;
  }
  // Ensure difficulty exists
  if (!q.difficulty) q.difficulty = "medium";
  return q;
};

// ─── Component ─────────────────────────────────────────────────────────

const AIQuestionGenerator = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ── Step tracking
  const [step, setStep] = useState(1);

  // ── Step 1: Filters
  const [filters, setFilters] = useState({
    class_name: "",
    subject_name: "",
    paper: "",
    chapter: "",
    chapter_name: "",
    topic: "",
  });

  // ── Step 2: Mode
  const [mode, setMode] = useState(null); // 'manual' | 'previous' | 'pdf_text' | 'filters_only'

  // ── Step 3: Question types
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [typeCounts, setTypeCounts] = useState({
    mcq: 0,
    true_false: 0,
    descriptive: 0,
  });

  // ── Step 4: Generation inputs per mode
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [hints, setHints] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Review state
  const [questions, setQuestions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // ─── Helpers ───────────────────────────────────────────────────────────

  const filtersComplete =
    filters.class_name && filters.subject_name && filters.chapter;

  const subjectLabel = isSchoolClass(filters.class_name) ? "Subject" : "Course";

  const handleFilterChange = (e) => {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const toggleType = (t) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  };

  const handleTypeCountChange = (type, value) => {
    setTypeCounts((prev) => ({ ...prev, [type]: parseInt(value) || 0 }));
  };

  const totalCount = Object.values(typeCounts).reduce(
    (sum, count) => sum + count,
    0,
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      toast.success(`PDF selected: ${file.name}`);
    } else if (file) {
      toast.error("Please upload a PDF file");
    }
  };

  // ─── Mode selection handlers ───────────────────────────────────────────

  const selectMode = (m) => {
    setMode(m);
    if (m === "manual") {
      // Navigate to create page with filters as URL params
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });
      navigate(`/teacher/questions/create?${params.toString()}`);
      return;
    }
    setStep(3);
  };

  // ─── Generate ──────────────────────────────────────────────────────────

  const buildPayload = () => {
    const base = {
      ...filters,
      question_types: selectedTypes,
      type_counts: typeCounts,
      count: totalCount,
      source_type:
        mode === "previous"
          ? "previous"
          : mode === "pdf_text"
            ? pdfFile
              ? "pdf"
              : "text"
            : "general",
    };

    if (mode === "previous" || mode === "pdf_text") {
      base.hints = hints || undefined;
      if (pdfFile) base.pdf = pdfFile;
    }

    if (mode === "filters_only") {
      base.difficulty =
        difficulty === "all" ? "mixed difficulty levels" : difficulty;
    }

    return base;
  };

  const handleGenerate = async () => {
    if (selectedTypes.length === 0 || totalCount === 0) {
      toast.error("Select types and set counts for at least one type");
      return;
    }
    if ((mode === "previous" || mode === "pdf_text") && !hints && !pdfFile) {
      toast.error("Provide hints or upload a PDF");
      return;
    }

    setLoading(true);
    try {
      const payload = buildPayload();
      const res = await aiGenerate(payload);
      const generated = (res.data?.data || []).map(normaliseQuestion);
      setQuestions(
        generated.map((q, idx) => ({
          ...q,
          _id: q.question_id || `temp-${idx}`,
          _status: "pending",
          _difficultyOverride: null,
        })),
      );
      setStep(4);
      toast.success(`${generated.length} questions generated!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  // ─── Review helpers ────────────────────────────────────────────────────

  const acceptQuestion = (id) => {
    setQuestions((qs) =>
      qs.map((q) => (q._id === id ? { ...q, _status: "accepted" } : q)),
    );
  };

  const rejectQuestion = (id) => {
    setQuestions((qs) =>
      qs.map((q) => (q._id === id ? { ...q, _status: "rejected" } : q)),
    );
  };

  const setDifficultyOverride = (id, diff) => {
    setQuestions((qs) =>
      qs.map((q) =>
        q._id === id
          ? { ...q, _difficultyOverride: diff === "auto" ? null : diff }
          : q,
      ),
    );
  };

  const startEdit = (q) => {
    setEditingId(q._id);
    setEditForm({
      question_text: q.question_text || "",
      option_text_a: q.option_text_a || "",
      option_text_b: q.option_text_b || "",
      option_text_c: q.option_text_c || "",
      option_text_d: q.option_text_d || "",
      correct_option: q.correct_option || "",
      expected_answer: q.expected_answer || "",
      explanation: q.explanation || "",
    });
  };

  const saveEdit = (id) => {
    setQuestions((qs) =>
      qs.map((q) =>
        q._id === id
          ? {
              ...q,
              ...editForm,
              _status: "accepted",
            }
          : q,
      ),
    );
    setEditingId(null);
    toast.success("Changes saved & accepted");
  };

  const cancelEdit = () => setEditingId(null);

  // ─── Regenerate rejected ───────────────────────────────────────────────

  const regenerateRejected = async () => {
    const rejectedCount = questions.filter(
      (q) => q._status === "rejected",
    ).length;
    if (rejectedCount === 0) return;

    setLoading(true);
    try {
      const payload = {
        ...buildPayload(),
        count: rejectedCount,
      };
      const res = await aiGenerate(payload);
      const newQs = (res.data?.data || []).map(normaliseQuestion);

      // Remove rejected, append new
      setQuestions((prev) => {
        const kept = prev.filter((q) => q._status !== "rejected");
        const appended = newQs.map((q, idx) => ({
          ...q,
          _id: q.question_id || `regen-${Date.now()}-${idx}`,
          _status: "pending",
          _difficultyOverride: null,
        }));
        return [...kept, ...appended];
      });

      toast.success(`${newQs.length} new questions generated`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Regeneration failed");
    } finally {
      setLoading(false);
    }
  };

  // ─── Save accepted ─────────────────────────────────────────────────────

  const saveAccepted = async () => {
    const accepted = questions.filter((q) => q._status === "accepted");
    if (accepted.length === 0) {
      toast.error("No accepted questions to save");
      return;
    }

    const payload = accepted.map((q) => {
      const finalDiff = q._difficultyOverride || q.difficulty || "medium";
      return {
        ...q,
        difficulty: finalDiff,
        source: "ai_generated",
        status: "active",
        coaching_center_id: undefined, // set by backend
        created_by: undefined, // set by backend
      };
    });

    setLoading(true);
    try {
      await bulkCreateQuestions({ questions: payload });
      toast.success(`${accepted.length} questions saved to bank!`);
      navigate("/teacher/questions");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  // ─── Stats ─────────────────────────────────────────────────────────────

  const total = questions.length;
  const acceptedCount = questions.filter(
    (q) => q._status === "accepted",
  ).length;
  const rejectedCount = questions.filter(
    (q) => q._status === "rejected",
  ).length;
  const pendingCount = questions.filter((q) => q._status === "pending").length;

  // ─── Render helpers ────────────────────────────────────────────────────

  const renderDifficultyBadge = (q) => {
    const diff = q._difficultyOverride || q.difficulty || "medium";
    const colors = {
      easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      hard: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded border ${colors[diff] || colors.medium}`}
      >
        {diff.charAt(0).toUpperCase() + diff.slice(1)}
      </span>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Background blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-20 space-y-8">
        {/* Header card */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <FiCpu className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-white font-bold">
              AI-Powered Question Generation
            </h2>
            <p className="text-gray-400 text-sm">
              {step === 1 && "Step 1: Set your filters"}
              {step === 2 && "Step 2: Choose creation mode"}
              {step === 3 && "Step 3: Select question types"}
              {step === 4 && "Step 4: Review & approve generated questions"}
            </p>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* STEP 1 — FILTERS                                                 */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <FiFilter className="text-purple-400" />
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Step 1 — Filters
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Class */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Class <span className="text-red-400">*</span>
              </label>
              <select
                name="class_name"
                value={filters.class_name}
                onChange={handleFilterChange}
                className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 appearance-none"
              >
                <option value="">Select Class</option>
                {CLASS_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject / Course */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                {subjectLabel} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="subject_name"
                value={filters.subject_name}
                onChange={handleFilterChange}
                placeholder={`e.g. ${isSchoolClass(filters.class_name) ? "Mathematics" : "Computer Science"}`}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Paper */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Paper{" "}
                <span className="text-gray-500 normal-case font-normal">
                  (optional)
                </span>
              </label>
              <select
                name="paper"
                value={filters.paper}
                onChange={handleFilterChange}
                className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 appearance-none"
              >
                <option value="">Select Paper</option>
                {PAPER_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter number */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Chapter <span className="text-red-400">*</span>
              </label>
              <select
                name="chapter"
                value={filters.chapter}
                onChange={handleFilterChange}
                className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 appearance-none"
              >
                <option value="">Select Chapter</option>
                {CHAPTER_OPTIONS.map((ch) => (
                  <option key={ch} value={ch}>
                    Chapter {ch}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter name */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Chapter Name{" "}
                <span className="text-gray-500 normal-case font-normal">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                name="chapter_name"
                value={filters.chapter_name}
                onChange={handleFilterChange}
                placeholder="e.g. Quadratic Equations"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Topic */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Topic{" "}
                <span className="text-gray-500 normal-case font-normal">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                name="topic"
                value={filters.topic}
                onChange={handleFilterChange}
                placeholder="e.g. Nature of Roots"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {filtersComplete && (
            <button
              onClick={() => setStep(2)}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-900/40 transition-all"
            >
              Continue to Step 2 <FiArrowRight />
            </button>
          )}
          {!filtersComplete && (
            <p className="text-xs text-gray-500">
              Fill Class, {subjectLabel}, and Chapter to proceed.
            </p>
          )}
        </section>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* STEP 2 — MODE SELECTOR (shown after filters complete)            */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {filtersComplete && step >= 2 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <FiCpu className="text-purple-400" />
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Step 2 — Creation Mode
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Manual */}
              <button
                onClick={() => selectMode("manual")}
                className={`text-left p-6 rounded-2xl border transition-all hover:scale-[1.01] ${
                  mode === "manual"
                    ? "bg-blue-500/10 border-blue-500/40"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <FiPenTool />
                  </div>
                  <h4 className="font-bold text-white">Manual</h4>
                </div>
                <p className="text-sm text-gray-400">
                  Write questions yourself. Opens the Create Question form with
                  your filters pre-filled.
                </p>
              </button>

              {/* Based on previous */}
              <button
                onClick={() => selectMode("previous")}
                className={`text-left p-6 rounded-2xl border transition-all hover:scale-[1.01] ${
                  mode === "previous"
                    ? "bg-purple-500/10 border-purple-500/40"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <FiBookOpen />
                  </div>
                  <h4 className="font-bold text-white">
                    Based on previous questions
                  </h4>
                </div>
                <p className="text-sm text-gray-400">
                  AI studies your existing question bank for this
                  subject/chapter and generates similar questions. Optionally
                  add a PDF or paste text to guide it further.
                </p>
              </button>

              {/* PDF and text based */}
              <button
                onClick={() => selectMode("pdf_text")}
                className={`text-left p-6 rounded-2xl border transition-all hover:scale-[1.01] ${
                  mode === "pdf_text"
                    ? "bg-emerald-500/10 border-emerald-500/40"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <FiFileText />
                  </div>
                  <h4 className="font-bold text-white">PDF and text based</h4>
                </div>
                <p className="text-sm text-gray-400">
                  Upload a PDF or paste text. AI generates questions strictly
                  from that content. At least one input is required.
                </p>
              </button>

              {/* Just the filters */}
              <button
                onClick={() => selectMode("filters_only")}
                className={`text-left p-6 rounded-2xl border transition-all hover:scale-[1.01] ${
                  mode === "filters_only"
                    ? "bg-pink-500/10 border-pink-500/40"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400">
                    <FiFilter />
                  </div>
                  <h4 className="font-bold text-white">Just the filters</h4>
                </div>
                <p className="text-sm text-gray-400">
                  AI generates questions using only the subject, chapter and
                  topic you selected above. No extra input needed.
                </p>
              </button>
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* STEP 3 — QUESTION TYPES + MODE INPUTS                            */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {step >= 3 && mode && mode !== "manual" && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <FiZap className="text-purple-400" />
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Step 3 — Configure Generation
              </h3>
            </div>

            {/* Question type selector */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  key: "descriptive",
                  label: "Descriptive",
                  countKey: "descriptive",
                },
                { key: "mcq", label: "MCQ", countKey: "mcq" },
                {
                  key: "true_false",
                  label: "True/False",
                  countKey: "true_false",
                },
              ].map((t) => (
                <div key={t.key} className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(t.key)}
                      onChange={() => toggleType(t.key)}
                      className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                    />
                    {t.label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={typeCounts[t.countKey]}
                    onChange={(e) =>
                      handleTypeCountChange(t.countKey, e.target.value)
                    }
                    placeholder="0"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 text-sm"
                  />
                </div>
              ))}
              <div className="md:col-span-3 pt-2">
                <p className="text-sm text-gray-400">
                  Total:{" "}
                  <span className="font-bold text-white">{totalCount}</span>
                </p>
              </div>
            </div>

            {/* Mode-specific inputs */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
              {/* Previous / PDF-text modes: hints + optional PDF */}
              {(mode === "previous" || mode === "pdf_text") && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                      {mode === "previous"
                        ? "Additional hints / guidance (optional)"
                        : "Paste text content (required if no PDF)"}
                    </label>
                    <textarea
                      value={hints}
                      onChange={(e) => setHints(e.target.value)}
                      rows={4}
                      placeholder={
                        mode === "previous"
                          ? "e.g. Focus on applications, include numerical problems..."
                          : "Paste the text content you want questions generated from..."
                      }
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                      {mode === "pdf_text"
                        ? "Upload PDF (required if no text)"
                        : "Upload PDF (optional)"}
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500/40 hover:bg-purple-500/5 transition-all"
                    >
                      <FiUpload className="mx-auto text-2xl text-gray-400 mb-2" />
                      <p className="text-sm text-gray-400">
                        {pdfFile ? pdfFile.name : "Click to upload PDF"}
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </>
              )}

              {/* Filters-only mode: difficulty selector */}
              {mode === "filters_only" && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 appearance-none"
                  >
                    <option value="all">All (Mixed)</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              )}

              {/* Count (all AI modes) */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Number of questions
                </label>
                <input
                  type="number"
                  value={count}
                  onChange={(e) =>
                    setCount(
                      Math.max(1, Math.min(50, parseInt(e.target.value) || 1)),
                    )
                  }
                  min={1}
                  max={50}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-900/40 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FiZap /> Generate Questions
                </>
              )}
            </button>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* STEP 4 — REVIEW                                                  */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {step === 4 && (
          <section className="space-y-6">
            {/* Summary bar */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total", value: total, color: "text-white" },
                {
                  label: "Accepted",
                  value: acceptedCount,
                  color: "text-emerald-400",
                },
                {
                  label: "Rejected",
                  value: rejectedCount,
                  color: "text-red-400",
                },
                {
                  label: "Pending",
                  value: pendingCount,
                  color: "text-yellow-400",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
                >
                  <div className={`text-2xl font-bold ${s.color}`}>
                    {s.value}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Question cards */}
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div
                  key={q._id}
                  className={`bg-white/5 border rounded-xl overflow-hidden transition-all ${
                    q._status === "accepted"
                      ? "border-emerald-500/20"
                      : q._status === "rejected"
                        ? "border-red-500/20 opacity-60"
                        : "border-white/10"
                  }`}
                >
                  {/* Card header */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-gray-500 font-mono text-sm">
                        #{idx + 1}
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">
                          {q.question_type}
                        </span>
                        {renderDifficultyBadge(q)}
                        {q.is_multiple_correct && (
                          <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                            Multiple Correct
                          </span>
                        )}
                        {q._status !== "pending" && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              q._status === "accepted"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {q._status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Edit mode */}
                    {editingId === q._id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">
                            Question
                          </label>
                          <textarea
                            value={editForm.question_text}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                question_text: e.target.value,
                              }))
                            }
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 resize-none"
                          />
                        </div>

                        {q.question_type === "mcq" && (
                          <div className="grid grid-cols-2 gap-3">
                            {["a", "b", "c", "d"].map((opt) => (
                              <div key={opt} className="relative">
                                <span className="absolute left-3 top-3 font-bold text-purple-400 uppercase text-sm">
                                  {opt}
                                </span>
                                <input
                                  type="text"
                                  value={editForm[`option_text_${opt}`] || ""}
                                  onChange={(e) =>
                                    setEditForm((f) => ({
                                      ...f,
                                      [`option_text_${opt}`]: e.target.value,
                                    }))
                                  }
                                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-purple-500 text-sm"
                                  placeholder={`Option ${opt.toUpperCase()}`}
                                />
                              </div>
                            ))}
                            <div className="col-span-2">
                              <label className="text-xs text-gray-400 block mb-1">
                                Correct Option(s) (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={editForm.correct_option}
                                onChange={(e) =>
                                  setEditForm((f) => ({
                                    ...f,
                                    correct_option: e.target.value,
                                  }))
                                }
                                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                                placeholder="A,B"
                              />
                            </div>
                          </div>
                        )}

                        {q.question_type === "descriptive" && (
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">
                              Model Answer
                            </label>
                            <textarea
                              value={editForm.expected_answer}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  expected_answer: e.target.value,
                                }))
                              }
                              rows={3}
                              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 resize-none"
                            />
                          </div>
                        )}

                        {q.question_type === "true_false" && (
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">
                              Correct Answer
                            </label>
                            <select
                              value={editForm.correct_option}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  correct_option: e.target.value,
                                }))
                              }
                              className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                            >
                              <option value="True">True</option>
                              <option value="False">False</option>
                            </select>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={() => saveEdit(q._id)}
                            className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 flex items-center justify-center gap-2"
                          >
                            <FiSave /> Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 bg-white/10 text-gray-400 border border-white/10 rounded-xl"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-200 mb-3">{q.question_text}</p>
                        {q.question_type === "mcq" && (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {(() => {
                              const correctOpts = q.correct_option
                                ? q.correct_option
                                    .split(",")
                                    .map((o) => o.trim().toUpperCase())
                                : [];
                              return ["a", "b", "c", "d"].map(
                                (opt) =>
                                  q[`option_text_${opt}`] && (
                                    <div
                                      key={opt}
                                      className={`text-xs p-2 rounded-lg border ${correctOpts.includes(opt.toUpperCase()) ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/5 text-gray-400"}`}
                                    >
                                      <span className="font-bold uppercase mr-1">
                                        {opt}.
                                      </span>
                                      {q[`option_text_${opt}`]}
                                      {correctOpts.includes(
                                        opt.toUpperCase(),
                                      ) && (
                                        <span className="ml-1 text-emerald-300">
                                          ✓
                                        </span>
                                      )}
                                    </div>
                                  ),
                              );
                            })()}
                          </div>
                        )}
                        {q.question_type === "true_false" && (
                          <div className="flex gap-2 mb-3">
                            {["True", "False"].map((opt) => (
                              <div
                                key={opt}
                                className={`text-xs px-3 py-2 rounded-lg border ${q.correct_option === opt ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/5 text-gray-400"}`}
                              >
                                {opt}
                                {q.correct_option === opt && (
                                  <span className="ml-1 text-emerald-300">
                                    ✓
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {q.question_type === "descriptive" &&
                          q.expected_answer && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3">
                              <p className="text-xs text-gray-500 uppercase mb-1">
                                Model Answer
                              </p>
                              <p className="text-sm text-gray-300">
                                {q.expected_answer}
                              </p>
                            </div>
                          )}
                        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/5">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 mr-2">
                              Difficulty:
                            </span>
                            {["easy", "medium", "hard", "auto"].map((d) => (
                              <button
                                key={d}
                                onClick={() => setDifficultyOverride(q._id, d)}
                                className={`text-xs px-2 py-1 rounded-lg border ${(d === "auto" && !q._difficultyOverride) || q._difficultyOverride === d ? (d === "easy" ? "bg-emerald-500/20 text-emerald-300" : d === "medium" ? "bg-yellow-500/20 text-yellow-300" : d === "hard" ? "bg-red-500/20 text-red-300" : "bg-purple-500/20 text-purple-300") : "bg-white/5 text-gray-500"}`}
                              >
                                {d === "auto"
                                  ? "Auto"
                                  : d.charAt(0).toUpperCase() + d.slice(1)}
                              </button>
                            ))}
                          </div>
                          <div className="flex-1" />
                          <button
                            onClick={() => acceptQuestion(q._id)}
                            disabled={q._status === "accepted"}
                            className="px-3 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl disabled:opacity-50 flex items-center gap-1 text-sm"
                          >
                            <FiCheckCircle /> Accept
                          </button>
                          <button
                            onClick={() => startEdit(q)}
                            className="px-3 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl flex items-center gap-1 text-sm"
                          >
                            <FiEdit2 /> Edit
                          </button>
                          <button
                            onClick={() => rejectQuestion(q._id)}
                            disabled={q._status === "rejected"}
                            className="px-3 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl disabled:opacity-50 flex items-center gap-1 text-sm"
                          >
                            <FiXCircle /> Reject
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <p className="text-sm text-gray-400">
                You have accepted{" "}
                <span className="text-emerald-400 font-bold">
                  {acceptedCount}
                </span>{" "}
                questions. You rejected{" "}
                <span className="text-red-400 font-bold">{rejectedCount}</span>{" "}
                questions.
              </p>
              {rejectedCount > 0 && (
                <button
                  onClick={regenerateRejected}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw /> Regenerate {rejectedCount} rejected
                    </>
                  )}
                </button>
              )}
              <button
                onClick={saveAccepted}
                disabled={loading || acceptedCount === 0}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave /> Save {acceptedCount} accepted to bank
                  </>
                )}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AIQuestionGenerator;
