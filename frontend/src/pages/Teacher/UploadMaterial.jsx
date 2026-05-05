import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiUpload, FiFolder, FiFileText, FiDownload } from "react-icons/fi";

const UploadMaterial = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [materials, setMaterials] = useState([]); // Fetched course materials
  const [selectedCourse, setSelectedCourse] = useState("");

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Select files to upload");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('materials', file));
    formData.append('course_id', selectedCourse);
    formData.append('title', `Materials ${new Date().toLocaleDateString()}`);

    try {
      await uploadStudyMaterials(formData);
      toast.success(`${files.length} materials uploaded!`);
      setFiles([]);
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/teacher/courses" 
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 text-lg"
        >
          <FiArrowLeft /> Back to Courses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-6">
              Upload Study Materials
            </h1>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Select Course
                </label>
                <select 
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                  <option value="">Choose course...</option>
                  <option value="1">HSC Physics Complete</option>
                  <option value="2">SSC Math Preparation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <FiUpload className="text-emerald-400" />
                  Select Files (PDF, DOC, Images)
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
                  onChange={handleFileChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                />
              </div>

              {files.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-sm text-gray-300 mb-3">
                    {files.length} file(s) selected:
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                        <FiFileText className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium truncate flex-1">{file.name}</span>
                        <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-400 hover:text-red-300 p-1 -m-1 rounded-lg hover:bg-red-500/10"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 flex items-center justify-center gap-2 text-lg transition-all"
              >
                {uploading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FiUpload />
                    Upload Materials
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Materials List */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FiFolder className="text-orange-400" />
              Course Materials
            </h2>
            
            {materials.length === 0 ? (
              <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-600 rounded-xl">
                No materials uploaded yet
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map(material => (
                  <div key={material.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                    <FiFileText className="w-8 h-8 text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{material.title}</h3>
                      <p className="text-sm text-gray-400 truncate">{material.course_title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Uploaded: {new Date(material.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <a
                      href={material.file_url}
                      download
                      className="p-3 bg-blue-500/90 text-white rounded-xl hover:bg-blue-600 shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2"
                    >
                      <FiDownload className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadMaterial;

