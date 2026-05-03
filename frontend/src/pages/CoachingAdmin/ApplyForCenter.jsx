import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { applyForCenterMultipart } from "../../services/api";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave } from "react-icons/fi";

const ApplyForCenter = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    center_name: "",
    location: "",
    contact_number: "",
    email: "",
    established_date: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await applyForCenterMultipart(formData);
      toast.success("Application submitted! Waiting for approval.");
      navigate("/coaching-admin");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to submit application",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-6">
          <p className="text-indigo-400 font-semibold mb-1">How it works</p>
          <p className="text-gray-400 text-sm">
            Submit your coaching center details. A Super Admin will review and
            approve your application. Once approved, you can start managing
            courses, batches, and students.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6"
        >
          <h2 className="text-xl font-bold text-white">Center Details</h2>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Center Name
            </label>
            <input
              type="text"
              name="center_name"
              value={formData.center_name}
              onChange={handleChange}
              required
              placeholder="e.g. Excellence Coaching Center"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="e.g. Dhaka, Bangladesh"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Contact Number
              </label>
              <input
                type="text"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                required
                placeholder="e.g. 01700000000"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="center@example.com"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Established Date
            </label>
            <input
              type="date"
              name="established_date"
              value={formData.established_date}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 [color-scheme:dark]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <FiSave /> Submit Application
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ApplyForCenter;
