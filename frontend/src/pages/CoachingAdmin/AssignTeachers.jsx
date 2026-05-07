import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  getApprovedTeachersForAdmin,
  getAdminCourses,
  assignTeacherToCourse,
  getCourseAssignments,
  removeAssignment,
  getAvailableTeachersForAssignment,
} from "../../services/api";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";

const AssignTeachers = () => {
  // Expected existing structure: route may pass courseId, but we keep UI generic.
  const { courseId } = useParams();

  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);

  const [assigning, setAssigning] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(courseId || null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  const [assignments, setAssignments] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const [tRes, cRes] = await Promise.all([
        getApprovedTeachersForAdmin(),
        getAdminCourses(),
      ]);
      setTeachers(tRes.data?.data || []);
      setCourses(cRes.data?.data || cRes.data?.data || []);

      if (courseId) {
        const aRes = await getCourseAssignments(courseId);
        setAssignments(aRes.data?.data || []);
      } else {
        setAssignments([]);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load assign teachers data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const activeCourse = useMemo(() => {
    return courses.find((c) => String(c.course_id) === String(selectedCourse)) || null;
  }, [courses, selectedCourse]);

  const availableSubjects = useMemo(() => {
    return activeCourse?.subjects || [];
  }, [activeCourse]);

  const openAssignModal = (teacher) => {
    setSelectedTeacher(teacher);
    setSelectedCourse(courseId || (courses[0]?.course_id ? String(courses[0].course_id) : null));
    setSelectedSubjectId(null);
    setModalOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedTeacher || !selectedCourse) return;
    try {
      setAssigning(true);
      await assignTeacherToCourse({
        teacher_id: selectedTeacher.user_id || selectedTeacher.teacher_id,
        course_id: selectedCourse,
        subject_id: selectedSubjectId || null,
      });
      toast.success("Teacher assigned");
      setModalOpen(false);
      const aRes = await getCourseAssignments(selectedCourse);
      setAssignments(aRes.data?.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to assign teacher");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (assignmentId) => {
    if (!window.confirm("Remove this assignment?")) return;
    try {
      await removeAssignment(assignmentId);
      toast.success("Assignment removed");
      const aRes = await getCourseAssignments(selectedCourse);
      setAssignments(aRes.data?.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to remove assignment");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/coachingadmin/manage-courses" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-lg font-medium">
            <FiArrowLeft />
            Back to Courses
          </Link>
          <div className="flex-1" />
          {!courseId && courses[0]?.course_id && (
            <div className="text-sm text-gray-400">Assign on: {courses[0].course_title || courses[0].course_name}</div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Approved Teachers */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-xl font-semibold mb-4">Approved Teachers ({teachers.length})</div>
            {teachers.length === 0 ? (
              <div className="text-gray-400 text-sm">No approved teachers.</div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                {teachers.map((t) => (
                  <button
                    key={t.user_id || t.teacher_id}
                    onClick={() => openAssignModal(t)}
                    className="w-full text-left bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="font-semibold">{t.name || t.teacher_name}</div>
                    <div className="text-sm text-gray-400 mt-1">{t.email || t.teacher_email}</div>
                    {t.subject_specialization && (
                      <div className="text-xs text-indigo-200 mt-2">{t.subject_specialization}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Courses */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-xl font-semibold mb-4">Courses</div>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
              {courses.length === 0 ? (
                <div className="text-gray-400 text-sm">No courses.</div>
              ) : (
                courses.map((c) => (
                  <button
                    key={c.course_id}
                    onClick={() => setSelectedCourse(String(c.course_id))}
                    className={`w-full text-left border rounded-xl p-4 transition-all ${
                      String(selectedCourse) === String(c.course_id)
                        ? "border-purple-400 bg-purple-500/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="font-semibold">{c.course_title || c.title}</div>
                    <div className="text-sm text-gray-400 mt-1">{c.status || "active"}</div>
                  </button>
                ))
              )}
            </div>

            {selectedCourse && (
              <div className="mt-6 text-sm text-gray-300">
                Click a teacher to assign to this course.
              </div>
            )}
          </div>
        </div>

        {/* Assignments table */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xl font-semibold">Existing Assignments</div>
              <div className="text-sm text-gray-400 mt-1">For selected course.</div>
            </div>
            {selectedCourse ? (
              <div className="text-sm text-gray-400">Course ID: {selectedCourse}</div>
            ) : (
              <div className="text-sm text-gray-400">Select a course to view assignments.</div>
            )}
          </div>

          {!selectedCourse ? (
            <div className="text-gray-400">No course selected.</div>
          ) : assignments.length === 0 ? (
            <div className="text-gray-400">No assignments yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-gray-400">
                    <th className="text-left py-3 px-3">Teacher</th>
                    <th className="text-left py-3 px-3">Subject</th>
                    <th className="text-left py-3 px-3">Assigned At</th>
                    <th className="text-left py-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.assignment_id || a.assignmentId} className="border-t border-white/10 hover:bg-white/5">
                      <td className="py-3 px-3">{a.teacher_name || a.name}</td>
                      <td className="py-3 px-3">{a.subject_name || a.subject || "-"}</td>
                      <td className="py-3 px-3">
                        {a.assigned_at ? new Date(a.assigned_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleRemove(a.assignment_id)}
                          className="text-red-300 hover:text-red-200"
                          title="Remove assignment"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-[#0b1220] text-white w-full max-w-lg rounded-2xl border border-white/10">
              <div className="p-5 border-b border-white/10">
                <div className="text-lg font-semibold">Assign Teacher</div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="text-sm text-gray-400">Teacher</div>
                  <div className="font-semibold mt-1">{selectedTeacher?.name || selectedTeacher?.teacher_name}</div>
                </div>

                <label className="block">
                  <span className="text-sm text-gray-400">Course</span>
                  <select
                    value={selectedCourse || ""}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                  >
                    {courses.map((c) => (
                      <option key={c.course_id} value={String(c.course_id)}>
                        {c.course_title || c.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm text-gray-400">Subject</span>
                  <select
                    value={selectedSubjectId || ""}
                    onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : null)}
                    className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                  >
                    <option value="">(No subject)</option>
                    {availableSubjects.map((s) => (
                      <option key={s.subject_id} value={String(s.subject_id)}>
                        {s.subject_name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="p-5 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={assigning}
                  className="px-4 py-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-600 disabled:opacity-50"
                >
                  {assigning ? "Assigning..." : "Assign"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignTeachers;

