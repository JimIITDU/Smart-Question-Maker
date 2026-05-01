import React, { useState, useEffect } from 'react';
import { getMyEnrollments, getMyActiveEnrollments } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const MyCourses = () => {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    loadEnrollments();
  }, [activeTab]);

  const loadEnrollments = async () => {
    setLoading(true);
    try {
      const res = activeTab === 'active' 
        ? await getMyActiveEnrollments()
        : await getMyEnrollments();
      setEnrollments(res.data.data || []);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const isExpired = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Courses</h1>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded ${activeTab === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All Courses
          </button>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
            <a href="/student/browse-courses" className="text-blue-600 hover:underline">
              Browse Courses
            </a>
          </div>
        ) : (
          <div className="grid gap-4">
            {enrollments.map(enrollment => (
              <div key={enrollment.enrollment_id} className="bg-white shadow rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold">{enrollment.course_title}</h2>
                    <p className="text-gray-600 mt-1">{enrollment.course_description}</p>
                    <div className="mt-2 text-sm">
                      <p><strong>Enrolled:</strong> {new Date(enrollment.enrolled_at).toLocaleDateString()}</p>
                      {enrollment.paid_at && (
                        <p><strong>Paid:</strong> {new Date(enrollment.paid_at).toLocaleDateString()}</p>
                      )}
                      {enrollment.expires_at && (
                        <p className={isExpired(enrollment.expires_at) ? 'text-red-600' : 'text-green-600'}>
                          <strong>Expires:</strong> {new Date(enrollment.expires_at).toLocaleDateString()}
                          {isExpired(enrollment.expires_at) && ' (Expired)'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded text-sm ${
                      enrollment.status === 'active' ? 'bg-green-100 text-green-800' :
                      enrollment.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {enrollment.status}
                    </span>
                  </div>
                </div>

                {enrollment.status === 'active' && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Exams available in this course:</p>
                    <div className="flex flex-wrap gap-2">
                      {enrollment.exams && enrollment.exams.length > 0 ? (
                        enrollment.exams.map(exam => (
                          <a
                            key={exam.exam_id}
                            href={`/student/exams/${exam.exam_id}/take`}
                            className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
                          >
                            {exam.title}
                          </a>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No exams available yet</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
