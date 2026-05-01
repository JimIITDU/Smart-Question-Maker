import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { browseCourses, getMyCenter } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const BrowseCourses = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [coachingCenterId, setCoachingCenterId] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      // First get student's center
      const centerRes = await getMyCenter();
      if (centerRes.data.data) {
        setCoachingCenterId(centerRes.data.data.coaching_center_id);
      }
      
      // Then browse courses (optionally filtered by center)
      const coursesRes = coachingCenterId 
        ? await browseCourses(coachingCenterId)
        : await browseCourses();
      setCourses(coursesRes.data.data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!confirm('Do you want to enroll in this course?')) return;
    
    try {
      const res = await (await import('../../services/api')).enrollInCourse(courseId);
      const data = res.data;
      
      if (data.data.payment_required) {
        // Navigate to mock payment screen
        navigate(`/student/payment/${data.data.enrollment_id}`, {
          state: { 
            courseTitle: data.data.course_title,
            amount: data.data.amount
          }
        });
      } else {
        alert('Enrolled successfully!');
        navigate('/student/courses');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to enroll');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Browse Courses</h1>
        
        {courses.length === 0 ? (
          <p className="text-gray-500">No courses available at the moment.</p>
        ) : (
          <div className="grid gap-4">
            {courses.map(course => (
              <div key={course.course_id} className="bg-white shadow rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold">{course.course_title}</h2>
                    <p className="text-gray-600 mt-1">{course.course_description}</p>
                    <div className="mt-2 text-sm">
                      <p><strong>Duration:</strong> {course.duration}</p>
                      <p><strong>Start Date:</strong> {course.start_date ? new Date(course.start_date).toLocaleDateString() : 'TBD'}</p>
                      <p><strong>End Date:</strong> {course.end_date ? new Date(course.end_date).toLocaleDateString() : 'TBD'}</p>
                      <p><strong>Enrollment:</strong> {course.enrollment_type || 'open'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {course.fee === 0 || !course.fee ? 'FREE' : `₹${course.fee}`}
                    </p>
                    <button
                      onClick={() => handleEnroll(course.course_id)}
                      className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseCourses;
