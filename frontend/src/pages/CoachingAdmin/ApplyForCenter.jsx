import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { applyForCenter, getMyApplication } from "../../services/api";
import toast from "react-hot-toast";
import { FiSave, FiCheckCircle } from "react-icons/fi";

const ApplyForCenter = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingApp, setLoadingApp] = useState(true);
  const [hasApplication, setHasApplication] = useState(false);
  const [formData, setFormData] = useState({
    center_name: "",
    center_type: "science",
    established_year: "",
    address_division: "",
    address_district: "",
    address_upazila: "",
    address_full: "",
    center_phone: "",
    center_email: "",
    website: "",
    description: "",
    owner_name: "",
    owner_nid: "",
    owner_phone: "",
    location: "",
  });


  const handleTextChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    const required = ['center_name', 'center_type', 'address_full', 'center_phone', 'center_email', 'owner_name', 'owner_nid', 'owner_phone'];
    for (let field of required) {
      if (!formData[field]?.trim()) {
        toast.error(`Please fill ${field.replace('_', ' ')}`);
        return false;
      }
    }
    if (!/^\d{11}$/.test(formData.center_phone.replace(/[^0-9]/g, ''))) {
      toast.error('Center phone must be 11 digits');
      return false;
    }
    if (!/^\d{11,17}$/.test(formData.owner_nid.replace(/[^0-9]/g, ''))) {
      toast.error('Owner NID must be valid length');
      return false;
    }
    return true;
  };



  const computeLocation = () => {
    const parts = [
      formData.address_full?.trim(),
      formData.address_upazila?.trim(),
      formData.address_district?.trim(),
      formData.address_division?.trim(),
    ].filter(Boolean);
    return parts.join(', ').replace(/,+$/, '') || '';
  };

  useEffect(() => {
    const checkApplication = async () => {
      try {
        const res = await getMyApplication();
        setHasApplication(!!res.data.data);
      } catch (err) {
        setHasApplication(false);
      } finally {
        setLoadingApp(false);
      }
    };
    checkApplication();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = new FormData();
    
    // Add text fields
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    
    // Override location with computed value
    submitData.set('location', computeLocation());
    

    
    // Default established year
    if (!formData.established_year.trim()) {
      submitData.set('established_year', new Date().getFullYear().toString());
    }
    
    setLoading(true);
    try {
      await applyForCenter(submitData);
      toast.success("✅ Application submitted successfully! View your application in History.");
      navigate("/coachingadmin/application-history", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit application";
      toast.error(`❌ ${msg}`);
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };



  if (loadingApp) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (hasApplication) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-8">
        <div className="text-center max-w-md bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-12 backdrop-blur-xl">
          <div className="w-24 h-24 bg-emerald-500/20 rounded-3xl mx-auto mb-8 flex items-center justify-center">
            <FiSave className="text-emerald-400 text-4xl" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">Application Submitted!</h2>
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">Your coaching center application is under review by Super Admin.</p>
          <p className="text-emerald-400 font-semibold mb-8">Expected response: 2-3 working days</p>
          <button 
            onClick={() => navigate('/coachingadmin')}
            className="w-full px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all shadow-xl"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-[-5%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-8 mb-12 shadow-2xl">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Coaching Center Application
          </h1>
          <div className="flex items-center gap-3 text-indigo-300">
            <div className="w-6 h-6 border-2 border-indigo-400 rounded-full flex items-center justify-center text-xs font-bold bg-indigo-500/20">1</div>
            <span>Submit application → Super Admin reviews → Get notified</span>
          </div>
          <p className="text-gray-400 mt-2 text-sm">Approval typically within 2-3 working days</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-3xl p-10 space-y-8 backdrop-blur-xl">
          {/* Basic Info */}
          <section>
            <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Center Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3 required-asterisk">
                  Center Name *
                </label>
                <input required name="center_name" value={formData.center_name} onChange={handleTextChange}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all" 
                  placeholder="Excellence Coaching Center" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3 required-asterisk">
                  Center Type *
                </label>
                <select required name="center_type" value={formData.center_type} onChange={handleTextChange}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30">
                  <option value="">Select type</option>
                  <option value="science">Science (Physics, Chemistry, Higher Math)</option>
                  <option value="commerce">Commerce (Accounting, Economics, Business)</option>
                  <option value="arts">Arts &amp; Humanities (English, History, Civics)</option>
                  <option value="cadet">Cadet College Preparation</option>
                  <option value="medical">Medical Admission Test Prep</option>
                </select>
              </div>
            </div>
          </section>

          {/* Address & Contact */}
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3 required-asterisk">
                  Full Address *
                </label>
                <textarea required name="address_full" value={formData.address_full} onChange={handleTextChange}
                  rows="2" className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 resize-vertical"
                  placeholder="House #123, Road #5, Mirpur DOHS, Dhaka-1216" 
                />
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <input name="address_division" value={formData.address_division} onChange={handleTextChange} 
                    placeholder="Division" className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm" />
                  <input name="address_district" value={formData.address_district} onChange={handleTextChange} 
                    placeholder="District" className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm" />
                  <input name="address_upazila" value={formData.address_upazila} onChange={handleTextChange} 
                    placeholder="Upazila" className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm" />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3 required-asterisk">
                    Center Phone *
                  </label>
                  <input required type="tel" name="center_phone" value={formData.center_phone} onChange={handleTextChange}
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30" 
                    placeholder="01712345678" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3 required-asterisk">
                    Center Email *
                  </label>
                  <input required type="email" name="center_email" value={formData.center_email} onChange={handleTextChange}
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30" 
                    placeholder="info@yourcenter.com" 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Additional Info */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">
                Website (optional)
              </label>
              <input name="website" value={formData.website} onChange={handleTextChange} type="url"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30" 
                placeholder="https://yourcenter.com" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">
                Established Year
              </label>
              <input name="established_year" value={formData.established_year} onChange={handleTextChange} type="number"
                min="1980" max={new Date().getFullYear()} className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30" 
                placeholder="2020" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">
                Center Description
              </label>
              <textarea name="description" value={formData.description} onChange={handleTextChange} rows="4"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 resize-vertical" 
                placeholder="Briefly describe your coaching center, specialties, achievements..." 
              />
            </div>
          </section>

          {/* Owner Information */}
          <section>
            <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Owner Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3 required-asterisk">
                  Owner Full Name *
                </label>
                <input required name="owner_name" value={formData.owner_name} onChange={handleTextChange}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30" 
                  placeholder="John Doe" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3 required-asterisk">
                  Owner NID Number *
                </label>
                <input required name="owner_nid" value={formData.owner_nid} onChange={handleTextChange}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30" 
                  placeholder="1234567890123" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3 required-asterisk">
                  Owner Phone *
                </label>
                <input required type="tel" name="owner_phone" value={formData.owner_phone} onChange={handleTextChange}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30" 
                  placeholder="01712345678" 
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Documents</h3>
            <div className="p-10 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-3xl text-center">
              <FiCheckCircle className="mx-auto text-emerald-400 text-5xl mb-6" />
              <h4 className="text-2xl font-bold text-emerald-300 mb-4">No Upload Required</h4>
              <p className="text-gray-300 text-lg mb-4 max-w-md mx-auto leading-relaxed">
                Document verification handled during Super Admin review process.
              </p>
              <p className="text-emerald-400 font-semibold text-sm">NID details provided above will be verified</p>
            </div>
          </section>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 py-6 px-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Submitting Application...</span>
              </>
            ) : (
              <>
                <FiSave className="text-xl" />
                <span>Submit Coaching Center Application</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ApplyForCenter;

