import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { confirmPayment, getCourseDetail } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const MockPayment = () => {
  const { course_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Get data from location state or fetch from API
  const initialFee = location.state?.fee || 0;
  const courseTitle = location.state?.title || "Course";

  // Card form state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    // If no location state, fetch course details
    if (!location.state?.fee) {
      loadCourseDetails();
    } else {
      setLoading(false);
    }
  }, [course_id]);

  const loadCourseDetails = async () => {
    try {
      const res = await getCourseDetail(course_id);
      if (res.data.data) {
        // Data loaded - already has fee from location state
      }
    } catch (error) {
      console.error("Error loading course details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();

    // Validate mock form
    if (!cardName || !cardNumber || !expiry || !cvv) {
      setError("Please fill in all card details");
      return;
    }

    if (!confirm(`Confirm payment of ৳${initialFee} for "${courseTitle}"?`))
      return;

    setProcessing(true);
    setError("");

    try {
      await confirmPayment(course_id, { amount_paid: initialFee });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Payment failed. Please try again.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    navigate("/student/browse-courses");
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Success State
  if (success) {
    return (
      <div className="min-h-screen bg-[#030712] p-4 md:p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-gray-800 rounded-2xl p-8 text-center">
            {/* Success Checkmark */}
            <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Enrolled!</h2>
            <p className="text-gray-400 mb-6">
              You have successfully enrolled in the course.
            </p>

            <button
              onClick={() => navigate("/student/courses")}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg transition-all"
            >
              Go to My Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] p-4 md:p-6">
      <div className="max-w-md mx-auto">
        <div className="bg-gray-800 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
            <h1 className="text-2xl font-bold text-white text-center">
              Complete Payment
            </h1>
          </div>

          {/* Course Info */}
          <div className="p-6 border-b border-gray-700">
            <div className="bg-gray-900/50 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Course</p>
              <p className="text-xl font-semibold text-white">{courseTitle}</p>
            </div>
          </div>

          {/* Amount */}
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Amount</span>
              <span className="text-3xl font-bold text-amber-400">
                ৳{initialFee}
              </span>
            </div>
          </div>

          {/* Mock Card Form */}
          <form onSubmit={handleConfirmPayment} className="p-6">
            <p className="text-gray-400 text-sm mb-4">
              Mock Card Details (any values work)
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Expiry
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Warning */}
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
              <p className="text-yellow-400 text-xs">
                <strong>Note:</strong> This is a mock payment. No real money
                will be charged. In production, this would integrate with a
                payment gateway.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-700 text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? <LoadingSpinner /> : `Pay ৳${initialFee}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MockPayment;
