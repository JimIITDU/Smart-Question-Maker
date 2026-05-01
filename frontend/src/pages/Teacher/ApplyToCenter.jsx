import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applyToCenter, getMyApplications, getMyCenter } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ApplyToCenter = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [hasCenter, setHasCenter] = useState(false);
  const [formData, setFormData] = useState({
    subjects_specialization: '',
    experience_years: '',
    bio: '',
    expected_salary: ''
  });

  useEffect(() => {
    checkExistingData();
  }, []);

  const checkExistingData = async () => {
    try {
      const [centerRes, appsRes] = await Promise.all([
        getMyCenter(),
        getMyApplications()
      ]);
      if (centerRes.data.data) {
        setHasCenter(true);
      }
      if (appsRes.data.data) {
        setApplications(appsRes.data.data);
      }
    } catch (error) {
      console.log('No existing data');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await applyToCenter(formData);
      alert('Application submitted successfully!');
      const appsRes = await getMyApplications();
      setApplications(appsRes.data.data);
      setFormData({
        subjects_specialization: '',
        experience_years: '',
        bio: '',
        expected_salary: ''
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (hasCenter) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-yellow-800">Already Have a Center</h2>
          <p className="text-yellow-700">You already have a coaching center application.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Apply as Teacher</h1>
        
        {applications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Your Applications</h2>
            {applications.map(app => (
              <div key={app.application_id} className={`p-4 rounded-lg mb-2 ${
                app.status === 'approved' ? 'bg-green-50 border border-green-200' :
                app.status === 'rejected' ? 'bg-red-50 border border-red-200' :
                'bg-yellow-50 border border-yellow-200'
              }`}>
                <p className="font-medium">Status: {app.status}</p>
                <p className="text-sm text-gray-600">Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
                {app.status === 'approved' && (
                  <p className="text-green-600 text-sm mt-1">Congratulations! You have been approved.</p>
                )}
                {app.status === 'rejected' && (
                  <p className="text-red-600 text-sm mt-1">Your application was rejected.</p>
                )}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Subjects Specialization</label>
            <input
              type="text"
              name="subjects_specialization"
              value={formData.subjects_specialization}
              onChange={handleChange}
              placeholder="e.g., Mathematics, Physics"
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Years of Experience</label>
            <input
              type="number"
              name="experience_years"
              value={formData.experience_years}
              onChange={handleChange}
              placeholder="e.g., 5"
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Bio / Introduction</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about your teaching experience..."
              rows="4"
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Expected Salary (Monthly)</label>
            <input
              type="number"
              name="expected_salary"
              value={formData.expected_salary}
              onChange={handleChange}
              placeholder="e.g., 50000"
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <LoadingSpinner /> : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyToCenter;
