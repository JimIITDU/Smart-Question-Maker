import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiUserPlus } from "react-icons/fi";

const ManageTeachers = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    subject_specialization: "",
    salary: "",
    employment_status: "full_time",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        "https://smart-question-maker-backend.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ ...formData, role_id: 3 }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Teacher account created!");
        setShowForm(false);
        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          subject_specialization: "",
          salary: "",
          employment_status: "full_time",
        });
      } else {
        toast.error(data.message || "Failed to create teacher");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Manage <span className="text-amber-400">Teachers</span>
          </h1>
          <p className="text-gray-400">Create and manage teacher accounts</p>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 space-y-4"
          >
            <h2 className="text-lg font-bold text-white">
              Create Teacher Account
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Teacher's full name"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
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
                  placeholder="teacher@example.com"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="01700000000"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  name="subject_specialization"
                  value={formData.subject_specialization}
                  onChange={handleChange}
                  placeholder="e.g. Mathematics, Physics"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Salary (BDT)
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g. 25000"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Employment Status
                </label>
                <select
                  name="employment_status"
                  value={formData.employment_status}
                  onChange={handleChange}
                  className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Create Teacher Account"
              )}
            </button>
          </form>
        )}

        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
          <FiUserPlus className="text-4xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Teacher list coming soon</p>
          <p className="text-gray-600 text-sm">
            Use the button above to add teacher accounts
          </p>
        </div>
      </main>
    </div>
  );
};

export default ManageTeachers;
