import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getPaymentDetails, confirmPayment } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const MockPayment = () => {
  const { enrollmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const courseTitle = location.state?.courseTitle || 'Course';
  const amount = location.state?.amount || 0;

  useEffect(() => {
    loadPaymentDetails();
  }, [enrollmentId]);

  const loadPaymentDetails = async () => {
    try {
      const res = await getPaymentDetails(enrollmentId);
      setPaymentData(res.data.data);
    } catch (error) {
      console.error('Error loading payment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!confirm(`Confirm payment of ₹${amount} for "${courseTitle}"?`)) return;
    
    setProcessing(true);
    try {
      await confirmPayment({ enrollment_id: parseInt(enrollmentId) });
      alert('Payment successful! You are now enrolled in the course.');
      navigate('/student/courses');
    } catch (error) {
      alert(error.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    navigate('/student/courses');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Confirm Payment</h1>
          
          <div className="bg-gray-50 rounded p-4 mb-6">
            <p className="text-gray-600 text-sm">Course</p>
            <p className="font-semibold text-lg">{courseTitle}</p>
          </div>

          <div className="border-t border-b border-gray-200 py-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount</span>
              <span className="text-2xl font-bold text-green-600">₹{amount}</span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This is a mock payment. No real money will be charged. 
              In production, this would integrate with a payment gateway like Razorpay or Stripe.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPayment}
              disabled={processing}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {processing ? <LoadingSpinner /> : `Pay ₹${amount}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockPayment;
