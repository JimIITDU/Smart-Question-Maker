import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ApplicationHistory = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { getApplicationHistory } = await import('../../services/api');
        const response = await getApplicationHistory();
// API returns { success, count, data }
        const payload = response.data?.data;
        setApplications(Array.isArray(payload) ? payload : []);
        console.log('ApplicationHistory response:', response.data);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Application History</h1>
        <Link
          to="/coachingadmin/apply-for-center"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Application
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No applications found.</p>
          <Link
            to="/coachingadmin/apply-for-center"
            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Apply for Coaching Center
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div key={app.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{app.center_name}</h3>
                  <p className="text-gray-600">{app.location}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Applied on {new Date(app.applied_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  app.status === 'approved' ? 'bg-green-100 text-green-800' :
                  app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {app.status}
                </span>
              </div>
              {app.status === 'rejected' && app.rejection_reason && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded">
                  Reason: {app.rejection_reason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationHistory;
