import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { uploadDocument } from '../../api/aiQuestionapi';
import { fetchGenerateQuestions } from '../../store/questionSlice';

const STEPS = { IDLE: 'idle', UPLOADING: 'uploading', READY: 'ready', GENERATING: 'generating' };

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(STEPS.IDLE);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [docId, setDocId] = useState(null);
  const [error, setError] = useState('');
  const [config, setConfig] = useState({
    include_mcq: true, num_mcq: 5,
    include_short: true, num_short: 3,
    include_written: false, num_written: 2,
    difficulty: 'medium'
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) {
      setError('File too large. Max 10MB.');
      return;
    }
    setFile(selected);
    setDocId(null);
    setStep(STEPS.IDLE);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setError('');
    setStep(STEPS.UPLOADING);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await uploadDocument(formData, (e) => {
        setUploadProgress(Math.round((e.loaded * 100) / e.total));
      });
      setDocId(data.id);
      setStep(STEPS.READY);
    } catch (err) {
      setStep(STEPS.IDLE);
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    }
  };

  const handleGenerate = async () => {
    if (!docId) return;
    setStep(STEPS.GENERATING);
    setError('');
    try {
      const result = await dispatch(fetchGenerateQuestions({ document_id: docId, ...config }));
      if (fetchGenerateQuestions.fulfilled.match(result)) {
        navigate(`/questions/${result.payload.id}`);
      } else {
        setError(result.payload?.error || 'Question generation failed.');
        setStep(STEPS.READY);
      }
    } catch {
      setError('Generation failed. Please try again.');
      setStep(STEPS.READY);
    }
  };

  const isUploading = step === STEPS.UPLOADING;
  const isReady = step === STEPS.READY;
  const isGenerating = step === STEPS.GENERATING;

  return (
    <div className="min-h-screen bg-[#0B0C15] pb-20">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0C15]/70 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/questions')} className="text-gray-400 hover:text-white text-sm transition-colors">
            ← Back to Question Bank
          </button>
          <span className="text-white font-semibold text-sm">AI Question Generator</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-2xl mx-auto px-6 pt-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Generate with <span className="text-indigo-400">AI</span>
          </h1>
          <p className="text-gray-400 text-sm">Upload a PDF or image and let AI create exam questions</p>
        </div>

        {/* File Input */}
        <div className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all mb-4 ${
          isReady ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-white/5 hover:border-indigo-500/50'
        }`}>
          {isReady ? (
            <div className="flex flex-col items-center gap-2">
              <p className="font-semibold text-emerald-300">✓ Document ready!</p>
              <p className="text-sm text-gray-400">{file?.name}</p>
            </div>
          ) : isUploading ? (
            <div className="flex flex-col items-center gap-3 w-full">
              <p className="font-medium text-gray-300">Uploading... {uploadProgress}%</p>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          ) : file ? (
            <div className="flex flex-col items-center gap-2">
              <p className="font-semibold text-white">{file.name}</p>
              <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <p className="text-gray-400 font-medium">Click below to select a file</p>
              <p className="text-sm text-gray-600">PDF or image · Max 10MB</p>
            </div>
          )}

          {!isUploading && !isReady && (
            <label className="mt-6 inline-block cursor-pointer bg-white/10 hover:bg-white/15 text-white text-sm px-5 py-2.5 rounded-xl transition-colors">
              Choose File
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleFileChange} />
            </label>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Config */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-5">
          <h2 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Configuration</h2>
          <div className="space-y-4">
            {[
              { key: 'include_mcq', label: 'Multiple Choice (MCQ)', numKey: 'num_mcq' },
              { key: 'include_short', label: 'Short Answer', numKey: 'num_short' },
              { key: 'include_written', label: 'Written / Essay', numKey: 'num_written' },
            ].map(({ key, label, numKey }) => (
              <div key={key} className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={config[key]}
                    onChange={e => setConfig(c => ({ ...c, [key]: e.target.checked }))}
                    className="w-4 h-4 accent-indigo-500" />
                  <span className="text-gray-300 text-sm">{label}</span>
                </label>
                {config[key] && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Count:</span>
                    <input type="number" min={1} max={10} value={config[numKey]}
                      onChange={e => setConfig(c => ({ ...c, [numKey]: Math.min(10, Math.max(1, +e.target.value)) }))}
                      className="w-16 bg-white/5 border border-white/10 text-white rounded-lg px-2 py-1 text-center text-sm outline-none focus:border-indigo-500" />
                  </div>
                )}
              </div>
            ))}

            <div className="pt-3 border-t border-white/10">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 block">Difficulty</label>
              <div className="flex gap-2">
                {['easy', 'medium', 'hard'].map(d => (
                  <button key={d} onClick={() => setConfig(c => ({ ...c, difficulty: d }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                      config.difficulty === d
                        ? d === 'easy' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : d === 'medium' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-white/5 text-gray-500 border border-white/10 hover:border-white/20'
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button onClick={handleUpload} disabled={!file || isUploading || isReady || isGenerating}
            className="flex-1 bg-white/10 text-white border border-white/10 rounded-xl py-3 font-medium disabled:opacity-40 hover:bg-white/15 transition-colors">
            {isReady ? '✓ Uploaded' : isUploading ? `Uploading ${uploadProgress}%` : 'Upload Document'}
          </button>
          <button onClick={handleGenerate} disabled={!isReady || isGenerating}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl py-3 font-medium disabled:opacity-40 hover:shadow-lg transition-all flex items-center justify-center gap-2">
            {isGenerating ? 'Generating...' : 'Generate Questions'}
          </button>
        </div>

        {isGenerating && (
          <p className="mt-3 text-sm text-gray-500 text-center">Processing your document... this may take a moment.</p>
        )}

        {(isReady || error) && (
          <button onClick={() => { setFile(null); setDocId(null); setStep(STEPS.IDLE); setError(''); setUploadProgress(0); }}
            className="mt-3 w-full text-gray-600 text-sm hover:text-gray-400 py-2 transition-colors">
            ↺ Start over
          </button>
        )}
      </main>
    </div>
  );
}