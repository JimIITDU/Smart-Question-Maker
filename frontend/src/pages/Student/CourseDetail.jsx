import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseDetail, checkEnrollment, getCourseExams } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const CourseDetail = () => {
  const { course_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [exams, setExams] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [activeTab, setActiveTab] = useState('exams');

  useEffect(() => {
    loadData();
  }, [course_id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // First check enrollment
      const enrollmentRes = await checkEnrollment(course_id);
      setEnrollment(enrollmentRes.data.data);
      
      // If not enrolled, redirect to browse
      if (!enrollmentRes.data.data) {
        navigate('/student/browse-courses');
        return;
      }
      
      // Load course details
      const detailRes = await getCourseDetail(course_id);
      setCourse(detailRes.data.data);
      
      // Load exams
      const examsRes = await getCourseExams(course_id);
      setExams(examsRes.data.data || []);
    } catch (error) {
      console.error('Error loading course:', error);
      navigate('/student/browse-courses');
    } finally {
      setLoading(false);
    }
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const start = exam.start_time ? new Date(exam.start_time) : null;
    const end = exam.end_time ? new Date(exam.end_time) : null;
    
    if (start && now < start) {
      return { status: 'upcoming', label: 'Upcoming', class: 'bg-gray-700 text-gray-300' };
    }
    if (start && end && now >= start && now <= end) {
      return { status: 'live', label: 'Live Now', class: 'bg-emerald-600 text-white animate-pulse' };
    }
    if (end && now > end) {
      return { status: 'completed', label: 'Completed', class: 'bg-gray-600 text-gray-300' };
    }
    return { status: 'upcoming', label: 'Upcoming', class: 'bg-gray-700 text-gray-300' };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!course) {
    return <LoadingSpinner />;
  }

  // Separate exams by type
  const scheduledExams = exams.filter(e => e.exam_type === 'scheduled' || !e.exam_type);
  const liveQuizzes = exams.filter(e => e.exam_type === 'live_quiz');
  const practiceExams = exams.filter(e => e.exam_type === 'practice');

  return (
    <div className="min-h-screen bg-[#030712] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                  {course.center_name || 'Coaching Center'}
                </span>
                {enrollment?.status === 'active' && (
                  <span className="px-2 py-1 bg-emerald-900 text-emerald-400 text-xs rounded">Enrolled</span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {course.course_title}
              </h1>
              <p className="text-gray-400 mb-4">{course.course_description}</p>
              
              {/* Dates */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {course.start_date ? new Date(course.start_date).toLocaleDateString() : 'TBD'}
                    {course.end_date && ` - ${new Date(course.end_date).toLocaleDateString()}`}
                  </span>
                </div>
                
                {course.duration && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{course.duration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Teacher Avatars */}
          {course.teachers && course.teachers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-2">Teachers</p>
              <div className="flex flex-wrap gap-2">
                {course.teachers.map(teacher => (
                  <div key={teacher.user_id} className="flex items-center gap-2 bg-gray-700 rounded-full px-3 py-1">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      {teacher.name?.charAt(0).toUpperCase() || 'T'}
                    </div>
                    <span className="text-sm text-gray-300">{teacher.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'exams' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Exams
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'live' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Live Quiz
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'practice' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Practice
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'materials' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Study Materials
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 rounded-xl p-6">
          {/* Exams Tab */}
          {activeTab === 'exams' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Scheduled Exams</h2>
              {scheduledExams.length === 0 ? (
                <p className="text-gray-400">No scheduled exams yet.</p>
              ) : (
                <div className="grid gap-4">
                  {scheduledExams.map(exam => {
                    const statusInfo = getExamStatus(exam);
                    return (
                      <div key={exam.exam_id} className="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{exam.title}</h3>
                          <p className="text-sm text-gray-400">
                            {exam.start_time && new Date(exam.start_time).toLocaleString()}
                            {exam.end_time && ` - ${new Date(exam.end_time).toLocaleString()}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm ${statusInfo.class}`}>
                            {statusInfo.label}
                          </span>
                          {statusInfo.status === 'live' && (
                            <button
                              onClick={() => navigate(`/student/exams/${exam.exam_id}/take`)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
                            >
                              Start Exam
                            </button>
                          )}
                          {statusInfo.status === 'completed' && (
                            <button
                              onClick={() => navigate(`/student/results/${exam.exam_id}`)}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                            >
                              View Results
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Live Quiz Tab */}
          {activeTab === 'live' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Live Quiz</h2>
              {liveQuizzes.length === 0 ? (
                <p className="text-gray-400">No active quiz at the moment.</p>
              ) : (
                <div className="bg-gray-900 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">{liveQuizzes[0].title}</h3>
                  <p className="text-gray-400 mb-4">A live quiz is available now!</p>
                  <button
                    onClick={() => navigate(`/student/join-quiz`)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-8 rounded-lg"
                  >
                    Join Quiz
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Practice Tab */}
          {activeTab === 'practice' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Practice Tests</h2>
              {practiceExams.length === 0 ? (
                <p className="text-gray-400">No practice tests available yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {practiceExams.map(exam => (
                    <div key={exam.exam_id} className="bg-gray-900 rounded-lg p-4">
                      <h3 className="font-semibold text-white mb-2">{exam.title}</h3>
                      <button
                        onClick={() => navigate(`/student/exams/${exam.exam_id}/take`)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
                      >
                        Start Practice
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Study Materials Tab */}
          {activeTab === 'materials' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Study Materials</h2>
              <p className="text-gray-400">Study materials will be available soon.</p>
              {/* Placeholder for future implementation */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
