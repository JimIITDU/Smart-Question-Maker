import React, { useState, useEffect } from "react";
import {
  getCenterApplications,
  approveApplication,
  rejectApplication,
  getAvailableTeachers,
} from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const TeacherApplications = () => {
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [activeTab, setActiveTab] = useState("applications");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appsRes, teachersRes] = await Promise.all([
        getCenterApplications(),
        getAvailableTeachers(),
      ]);
      setApplications(appsRes.data.data || []);
      setAvailableTeachers(teachersRes.data.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleApprove = async (applicationId) => {
    if (!confirm("Are you sure you want to approve this application?")) return;
    setLoading(true);
    try {
      await approveApplication(applicationId);
      alert("Application approved!");
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (applicationId) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    setLoading(true);
    try {
      await rejectApplication(applicationId, { reason });
      alert("Application rejected!");
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject");
    } finally {
      setLoading(false);
    }
  };

  const pendingApps = applications.filter((a) => a.status === "pending");
  const processedApps = applications.filter((a) => a.status !== "pending");

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Teacher Applications</h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-4 py-2 rounded ${activeTab === "applications" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Pending ({pendingApps.length})
          </button>
          <button
            onClick={() => setActiveTab("processed")}
            className={`px-4 py-2 rounded ${activeTab === "processed" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Processed ({processedApps.length})
          </button>
          <button
            onClick={() => setActiveTab("teachers")}
            className={`px-4 py-2 rounded ${activeTab === "teachers" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Available Teachers ({availableTeachers.length})
          </button>
        </div>

        {activeTab === "applications" && (
          <div>
            {pendingApps.length === 0 ? (
              <p className="text-gray-500">No pending applications.</p>
            ) : (
              pendingApps.map((app) => (
                <div
                  key={app.application_id}
                  className="bg-white shadow rounded-lg p-4 mb-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {app.teacher_name}
                      </h3>
                      <p className="text-gray-600">{app.teacher_email}</p>
                      <div className="mt-2">
                        <p>
                          <strong>Specialization:</strong>{" "}
                          {app.subjects_specialization}
                        </p>
                        <p>
                          <strong>Experience:</strong> {app.experience_years}{" "}
                          years
                        </p>
                        <p>
                          <strong>Bio:</strong> {app.bio}
                        </p>
                        {app.expected_salary && (
                          <p>
                            <strong>Expected Salary:</strong>{" "}
                            {app.expected_salary}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          Applied:{" "}
                          {new Date(app.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(app.application_id)}
                        disabled={loading}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(app.application_id)}
                        disabled={loading}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "processed" && (
          <div>
            {processedApps.length === 0 ? (
              <p className="text-gray-500">No processed applications.</p>
            ) : (
              processedApps.map((app) => (
                <div
                  key={app.application_id}
                  className={`bg-white shadow rounded-lg p-4 mb-4 ${
                    app.status === "approved"
                      ? "border-l-4 border-green-500"
                      : "border-l-4 border-red-500"
                  }`}
                >
                  <h3 className="font-semibold text-lg">{app.teacher_name}</h3>
                  <p className="text-gray-600">{app.teacher_email}</p>
                  <p>
                    <strong>Status:</strong> {app.status}
                  </p>
                  {app.reviewed_at && (
                    <p className="text-sm text-gray-500">
                      Reviewed: {new Date(app.reviewed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "teachers" && (
          <div>
            {availableTeachers.length === 0 ? (
              <p className="text-gray-500">No approved teachers available.</p>
            ) : (
              availableTeachers.map((teacher) => (
                <div
                  key={teacher.user_id}
                  className="bg-white shadow rounded-lg p-4 mb-4"
                >
                  <h3 className="font-semibold text-lg">{teacher.name}</h3>
                  <p className="text-gray-600">{teacher.email}</p>
                  <p>
                    <strong>Specialization:</strong>{" "}
                    {teacher.subject_specialization || "N/A"}
                  </p>
                  <p>
                    <strong>Experience:</strong> {teacher.experience || 0} years
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherApplications;
