import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import {
  getMyCenterSettings,
  patchMyCenterSettings,
  getSubscriptionPlans,
} from "../../services/api";

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-start justify-between gap-4 py-3">
    <div>
      <div className="font-semibold">{label}</div>
      {description && <div className="text-sm text-gray-400 mt-1">{description}</div>}
    </div>
    <button
      onClick={onChange}
      className={`w-14 h-8 rounded-full border transition-all flex items-center px-1 border-white/15 ${
        checked ? "bg-emerald-500/20" : "bg-white/5"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`w-6 h-6 rounded-full transition-transform bg-white/90 ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

const CenterSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [center, setCenter] = useState(null);
  const [error, setError] = useState(null);
  const [planName, setPlanName] = useState(null);

  const [form, setForm] = useState({
    center_name: "",
    center_type: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    description: "",
    exam_layout: "horizontal",
    question_mode: "mandatory",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getMyCenterSettings();
        const d = res.data?.data;
        setCenter(d);

        setForm({
          center_name: d.center_name || "",
          center_type: d.center_type || "",
          phone: d.center_phone || "",
          email: d.center_email || "",
          website: d.website || "",
          address: d.address_full || d.address_full || d.location || "",
          description: d.description || "",
          exam_layout: d.exam_layout || "horizontal",
          question_mode: d.question_mode || "mandatory",
        });

        // read-only plan
        setPlanName(d.current_plan_name || null);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const isHorizontal = form.exam_layout === "horizontal";
  const isSkipAllowed = form.question_mode === "skip_allowed";

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    try {
      setSaving(true);
      await patchMyCenterSettings({
        center_name: form.center_name,
        center_type: form.center_type,
        center_phone: form.phone,
        center_email: form.email,
        website: form.website,
        address_full: form.address,
        description: form.description,
        exam_layout: form.exam_layout,
        question_mode: form.question_mode,
      });
      toast.success("Center settings saved");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const subscriptionLabel = planName || center?.current_plan_name || "-";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#030712] text-white p-8">
        <div className="max-w-5xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="text-red-300 font-semibold">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Center Settings</h1>
            <p className="text-gray-400 mt-2">Update center details and exam configuration.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-emerald-500/90 hover:bg-emerald-600 rounded-xl font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Section 1 */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="text-xl font-semibold mb-4">Center Information</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-gray-400">Center Name</span>
              <input
                value={form.center_name}
                onChange={(e) => update("center_name", e.target.value)}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-400">Center Type</span>
              <input
                value={form.center_type}
                onChange={(e) => update("center_type", e.target.value)}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-400">Phone</span>
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-400">Email</span>
              <input
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-400">Website</span>
              <input
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-400">Address</span>
              <input
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm text-gray-400">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white min-h-[96px]"
              />
            </label>
          </div>
        </div>

        {/* Section 2 */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="text-xl font-semibold mb-4">Exam Configuration</div>

          <div className="border border-white/10 rounded-2xl p-4 mb-4">
            <Toggle
              checked={isHorizontal}
              onChange={() => update("exam_layout", isHorizontal ? "vertical" : "horizontal")}
              label="Question Layout"
              description="Horizontal or vertical question layout"
            />
            <div className="mt-2 text-sm text-gray-400">
              Current: <span className="text-white font-semibold">{form.exam_layout}</span>
            </div>
          </div>

          <div className="border border-white/10 rounded-2xl p-4">
            <Toggle
              checked={!isSkipAllowed}
              onChange={() =>
                update("question_mode", isSkipAllowed ? "mandatory" : "skip_allowed")
              }
              label="Question Mode"
              description="Skip allowed or mandatory attempts"
            />
            <div className="mt-2 text-sm text-gray-400">
              Current: <span className="text-white font-semibold">{form.question_mode}</span>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="text-xl font-semibold mb-4">Subscription Plan</div>

          <div className="flex items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
            <div>
              <div className="text-sm text-gray-400">Current plan</div>
              <div className="text-lg font-semibold text-white mt-1">{subscriptionLabel}</div>
            </div>
            <div className="text-green-300 flex items-center gap-2">
              <FiCheckCircle />
              <span className="text-sm">Active</span>
            </div>
          </div>
          <div className="text-sm text-gray-400 mt-3">
            Plan details are read-only. Contact support to change your subscription.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterSettings;

