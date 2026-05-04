import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { applyForCenterMultipart, getMyApplication } from "../../services/api";
import toast from "react-hot-toast";
import { FiSave } from "react-icons/fi";

const ApplyForCenter = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingApp, setLoadingApp] = useState(true);
  const [hasApplication, setHasApplication] = useState(false);
  const [formData, setFormData] = useState({
    center_name: "",
    center_type: "science",
    established_year: "",
    address_division: "",
    address_district: "",
    address_upazila: "",
    address_full: "",
    center_phone: "",
    center_email: "",
    website: "",
    description: "",
    owner_name: "",
    owner_nid: "",
    owner_phone: "",
    location: "",
  });
  const [files, setFiles] = useState({
    owner_photo: null,
    nid_front: null,
    nid_back: null,
  });

  const handleTextChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error(`${field.replace('_', ' ')} must be under 5MB`);
      return;
    }
    setFiles({ ...files, [field]: file });
  };

  useEffect(() => {
    const checkApplication = async () => {
      try {
        await getMyApplication();
        setHasApplication(true);
      } catch (err) {
        if (err.response?.status !== 404) {
          toast.error('Error checking application status');
        }
        setHasApplication(false);
      } finally {
        setLoadingApp(false);
      }
    };
    checkApplication();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    
    submitData.append('established_year', formData.established_year || new Date().getFullYear().toString());
    
    Object.keys(files).forEach(key => {
      if (files[key]) {
        submitData.append(key, files[key]);
      }
    });
    
    if (!files.owner_photo || !files.nid_front || !files.nid_back) {
      toast.error('Please upload all three required documents');
      return;
    }
    
    setLoading(true);
    try {
      await applyForCenterMultipart(submitData);
      toast.success("Application submitted! Waiting for approval.");
      navigate("/coachingadmin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  if (loadingApp) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (hasApplication) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10">
          <h2 className="text-2xl font-bold text-gray-300 mb-4">Application Pending</h2>
          <p className="text-gray-400 mb-6">Your coaching center application is under review.</p>
          <button 
            onClick={() => navigate('/coachingadmin')}
            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-[-5%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-8">
          <p className="text-indigo-400 font-semibold mb-2">How it works</p>
          <p className="text-gray-400 text-sm">
            Submit your coaching center details and documents. Super Admin will review within 2-3 days.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4">Coaching Center Application</h2>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2 required-asterisk">
                Center Name *
              </label>
              <input
                required
                name="center_name"
                value={formData.center_name}
                onChange={handleTextChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Excellence Coaching"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2 required-asterisk">
                Center Type *
              </label>
              <select
                required
                name="center_type"
                value={formData.center_type}
                onChange={handleTextChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">Select type</option>
                <option value="science">Science (Physics, Chemistry, Math)</option>
                <option value="commerce">Commerce (Accounting, Economics)</option>
                <option value="arts">Arts (English, History)</option>
                <option value="cadet">Cadet College Prep</option>
                <option value="medical">Medical Admission</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-4 required-asterisk">
              Full Address *
            </label>
            <input
              required
              name="address_full"
              value={formData.address_full}
              onChange={handleTextChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="House #123, Road #5, Mirpur DOHS, Dhaka-1216"
            />
            <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
              <input name="address_division" value={formData.address_division} onChange={handleTextChange} placeholder="Division" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" />
              <input name="address_district" value={formData.address_district} onChange={handleTextChange} placeholder="District" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" />
              <input name="address_upazila" value={formData.address_upazila} onChange={handleTextChange} placeholder="Upazila" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2 required-asterisk">
                Center Phone *
              </label>
              <input
                required
                type="tel"
                name="center_phone"
                value={formData.center_phone}
                onChange={handleTextChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="01712-345678"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2 required-asterisk">
                Center Email *
              </label>
              <input
                required
                type="email"
                name="center_email"
                value={formData.center_email}
                onChange={handleTextChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="info@excellencecoaching.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Website (optional)
              </label>
              <input
                name="website"
                value={formData.website}
                onChange={handleTextChange}
                type="url"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="https://excellencecoaching.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Established Year
              </label>
              <input
                name="established_year"
                value={formData.established_year}
                onChange={handleTextChange}
                type="number"
                min="1980"
                max="2024"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="2020"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleTextChange}
              rows="3"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-vertical"
              placeholder="Tell us about your coaching center (max 500 chars)..."
            />
          </div>

          <h3 className="text-xl font-bold text-white border-b border-white/10 pb-3 pt-8">Owner Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2 required-asterisk">
                Owner Full Name *
              </label>
              <input
                required
                name="owner_name"
                value={formData.owner_name}
                onChange={handleTextChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2 required-asterisk">
                Owner NID Number *
              </label>
              <input
                required
                name="owner_nid"
                value={formData.owner_nid}
                onChange={handleTextChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="1234567890123"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2 required-asterisk">
              Owner Phone *
            </label>
            <input
              required
              type="tel"
              name="owner_phone"
              value={formData.owner_phone}
              onChange={handleTextChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="01712-345678"
            />
          </div>

          <h3 className="text-xl font-bold text-white border-b border-white/10 pb-3 pt-8">Required Documents * (Images only, max 5MB each)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                1. Owner Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'owner_photo')}
                className="w-full file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-indigo-600 file:to-purple-600 file:text-white hover:file:from-indigo-700 hover:file:to-purple-700 bg-white/5 border border-white/10 rounded-xl px-4 py-10 text-sm cursor-pointer text-center"
                required
              />
              {files.owner_photo && (
                <div className="mt-3 p-2 bg-white/5 rounded-lg">
                  <img src={URL.createObjectURL(files.owner_photo)} alt="Preview" className="w-full max-w-[150px] h-32 object-cover rounded-lg border border-white/20" />
                  <p className="text-xs text-green-400 mt-1">✅ {files.owner_photo.name}</p>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                2. NID Front Side
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'nid_front')}
                className="w-full file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-indigo-600 file:to-purple-600 file:text-white hover:file:from-indigo-700 hover:file:to-purple-700 bg-white/5 border border-white/10 rounded-xl px-4 py-10 text-sm cursor-pointer text-center"
                required
              />
              {files.nid_front && (
                <div className="mt-3 p-2 bg-white/5 rounded-lg">
                  <img src={URL.createObjectURL(files.nid_front)} alt="Preview" className="w-full max-w-[150px] h-32 object-cover rounded-lg border border-white/20" />
                  <p className="text-xs text-green-400 mt-1">✅ {files.nid_front.name}</p>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                3. NID Back Side
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'nid_back')}
                className="w-full file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-indigo-600 file:to-purple-600 file:text-white hover:file:from-indigo-700 hover:file:to-purple-700 bg-white/5 border border-white/10 rounded-xl px-4 py-10 text-sm cursor-pointer text-center"
                required
              />
              {files.nid_back && (
                <div className="mt-3 p-2 bg-white/5 rounded-lg">
                  <img src={URL.createObjectURL(files.nid_back)} alt="Preview" className="w-full max-w-[150px] h-32 object-cover rounded-lg border border-white/20" />
                  <p className="text-xs text-green-400 mt-1">✅ {files.nid_back.name}</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <FiSave />
                Submit Coaching Center Application
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ApplyForCenter;

