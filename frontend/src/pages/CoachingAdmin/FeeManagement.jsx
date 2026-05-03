import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiDollarSign, FiPlus } from "react-icons/fi";

const FeeManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    amount: "",
    payment_for: "course_purchase",
    payment_method: "cash",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "https://smart-question-maker-backend.onrender.com/api/subscriptions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formData),
        },
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Fee record created!");
        setShowForm(false);
      } else {
        toast.error(data.message || "Failed");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      
      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Fee <span className="text-cyan-400">Management</span>
          </h1>
          <p className="text-gray-400">Track and manage student fee payments</p>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 space-y-4"
          >
            <h2 className="text-lg font-bold text-white">Create Fee Record</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Student User ID
                </label>
                <input
                  type="number"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 10"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Amount (BDT)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 5000"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Payment For
                </label>
                <select
                  name="payment_for"
                  value={formData.payment_for}
                  onChange={handleChange}
                  className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500"
                >
                  <option value="course_purchase">Course Purchase</option>
                  <option value="monthly_subscription">
                    Monthly Subscription
                  </option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Payment Method
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500"
                >
                  <option value="cash">Cash</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Create Fee Record
            </button>
          </form>
        )}

        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
          <FiDollarSign className="text-4xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">
            Fee records will appear here
          </p>
          <p className="text-gray-600 text-sm">
            Use the button above to add fee records manually
          </p>
        </div>
      </main>
    </div>
  );
};

export default FeeManagement;
