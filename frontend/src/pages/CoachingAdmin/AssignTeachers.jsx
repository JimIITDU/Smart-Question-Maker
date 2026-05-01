import React, { useState, useEffect } from 'react';
import { getAllCourses, getAllSubjects, getAvailableTeachers, getCourseAssignments, assignTeacherToCourse, removeAssignment } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AssignTeachers = () => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseAssignments, setCourseAssignments] = useState([]);
  const [formData, setFormData] = useState({
    teacher_id: '',
    subject_id: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [coursesRes, subjectsRes, teachersRes] = await Promise.all([
        getAllCourses(),
        getAllSubjects(),
        getAvailableTeachers()
      ]);
      setCourses(coursesRes.data.data || []);
      setSubjects(subjectsRes.data.data || []);
      setAvailableTeachers(teachersRes.data.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCourseSelect = async (courseId) => {
    setSelectedCourse(courseId);
    try {
      const assignmentsRes = await getCourseAssignments(courseId);
      setCourseAssignments(assignmentsRes.data.data || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!formData.teacher_id || !formData.subject_id) {
      alert('Please select both a teacher and a subject.');
      return;
    }
    setLoading(true);
    try {
      await assignTeacherToCourse({
        teacher_id: parseInt(formData.teacher_id),
        course_id: parseInt(selectedCourse),
        subject_id: parseInt(formData.subject_id)
      });
      alert('Teacher assigned successfully!');
      setFormData({ teacher_id: '', subject_id: '' });
      const assignmentsRes = await getCourseAssignments(selectedCourse);
      setCourseAssignments(assignmentsRes.data.data || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to assign teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (assignmentId) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return;
    setLoading(true);
    try {
      await removeAssignment(assignmentId);
      alert('Assignment removed successfully!');
      const assignmentsRes = await getCourseAssignments(selectedCourse);
      setCourseAssignments(assignmentsRes.data.data || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove assignment');
    } finally {
      setLoading(false);
    }
  };

  const courseSubjects = subjects.filter(s => s.course_id === parseInt(selectedCourse));

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Assign Teachers to Courses</h1>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Course</label>
          <select
            value={selectedCourse || ''}
            onChange={(e) => handleCourseSelect(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Choose a course...</option>
            {courses.map(course => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_title}
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Current Assignments</h2>
            
            {courseAssignments.length === 0 ? (
              <p className="text-gray-500 mb-4">No teachers assigned yet.</p>
            ) : (
              <div className="mb-6">
                {courseAssignments.map(assignment => (
                  <div key={assignment.assignment_id} className="flex justify-between items-center bg-gray-50 p-3 rounded mb-2">
                    <div>
                      <p className="font-medium">{assignment.teacher_name}</p>
                      <p className="text-sm text-gray-600">Subject: {assignment.subject_name}</p>
                    </div>
                    <button
                      onClick={() => handleRemove(assignment.assignment_id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <h3 className="text-md font-semibold mb-3">Add New Assignment</h3>
            <form onSubmit={handleAssign}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Select Teacher</label>
                <select
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Choose a teacher...</option>
                  {availableTeachers.map(teacher => (
                    <option key={teacher.user_id} value={teacher.user_id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Select Subject</label>
                <select
                  value={formData.subject_id}
                  onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Choose a subject...</option>
                  {courseSubjects.map(subject => (
                    <option key={subject.subject_id} value={subject.subject_id}>
                      {subject.subject_name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? <LoadingSpinner /> : 'Assign Teacher'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignTeachers;
