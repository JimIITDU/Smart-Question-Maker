import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiUpload } from "react-icons/fi";

const UploadMaterial = () => {
  const [formData, setFormData] = useState({
    subject_id: "",
    title: "",
    description: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success("Material uploaded successfully!");
      setLoading(false);
      setFile(null);
      setFormData({ subject_id: "", title: "", description: "" });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6"
        >
          <h2 className="text-xl font-bold text-white">
            Upload Study Material
          </h2>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Subject ID
            </label>
            <input
              type="number"
              name="subject_id"
              value={formData.subject_id}
              onChange={handleChange}
              required
              placeholder="e.g. 1"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g. Chapter 1 Notes"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description..."
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              File (PDF, DOCX, Image)
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${file ? "border-rose-500/50 bg-rose-500/5" : "border-white/10 hover:border-white/20"}`}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="fileInput"
              />
              <label htmlFor="fileInput" className="cursor-pointer">
                <FiUpload className="text-3xl text-gray-500 mx-auto mb-3" />
                {file ? (
                  <p className="text-rose-400 font-medium">{file.name}</p>
                ) : (
                  <p className="text-gray-500">
                    Click to select file or drag and drop
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-2">
                  PDF, DOCX, JPG, PNG up to 10MB
                </p>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <FiUpload /> Upload Material
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default UploadMaterial;
