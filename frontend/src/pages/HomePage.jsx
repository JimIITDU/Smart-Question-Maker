import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiBook,
  FiUsers,
  FiAward,
  FiHardDrive, // Safe replacement for FiCpu
  FiCheck,     // Safe replacement for FiCheckCircle
  FiZap,
  FiLayers,
  FiHome,      // Safe replacement for FiBuilding
  FiFileText,
  FiEdit2,
  FiLogIn,     // Added Fi prefix
  FiUserPlus,  // Added Fi prefix
  FiActivity,
} from "react-icons/fi";

// --- Helper Component: Typing Animation for Hero ---
const TypingAnimation = () => {
  const [text, setText] = useState("");
  const fullText = "What is the primary function of chlorophyll in photosynthesis?";
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) clearInterval(interval);
    }, 50); // Typing speed
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-sm md:text-base text-gray-300">
      {text}
      <span className="animate-pulse text-purple-400">|</span>
    </div>
  );
};

// --- Helper Component: Animated Counter ---
const AnimatedCounter = ({ end, duration, label, icon: Icon }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    // Simple increment logic
    const incrementTime = (duration / end) * 1000;
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [isVisible, end, duration]);

  return (
    <div ref={ref} className="flex flex-col items-center justify-center p-6 bg-[#0F172A]/40 border border-white/5 rounded-2xl backdrop-blur-sm hover:border-purple-500/30 transition-all">
      <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
        <Icon className="text-xl" />
      </div>
      <h3 className="text-3xl font-bold text-white mb-1">
        {label === "AI-Powered" ? (count > 90 ? "100%" : `${count}%`) : count}
      </h3>
      <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-purple-500 selection:text-white relative overflow-hidden font-sans">
      {/* --- Ambient Background Glows (Purple/Pink Theme) --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px]"></div>
      </div>

      {/* --- 1. Navbar --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="font-bold text-lg">P</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white leading-none">
                Proshno<span className="text-purple-400">Ghor</span>
              </span>
              <span className="text-[14px] text-gray-500 uppercase tracking-widest font-medium mt-0.5 font-bold">
                প্রশ্নঘর
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-[0_0_20px_rgba(192,38,211,0.3)] hover:shadow-[0_0_30px_rgba(192,38,211,0.5)] hover:scale-105 transition-all duration-300"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* --- 2. Hero Section --- */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-40 pb-32 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              <span>AI-Powered Exam Platform</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              The Smartest Way to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400">
                Create Exams
              </span>
            </h1>
            
            <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
              ProshnoGhor helps coaching centers in Bangladesh create AI-powered question papers, run live quizzes, and evaluate written answers automatically.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
              <button
                onClick={() => navigate("/register")}
                className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-[0_0_30px_rgba(192,38,211,0.4)] transition-all duration-300 flex items-center justify-center gap-2"
              >
                Start Free
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-lg font-medium hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
              >
                Sign In
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5">
              {[
                "AI Question Generation",
                "Live Quiz",
                "Written Answer Evaluation"
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  {badge}
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual - Animated Card */}
          <div className="relative hidden lg:block animate-float">
            {/* Glow Backdrop */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-2xl blur-[80px] opacity-20"></div>
            
            {/* The Card */}
            <div className="relative bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <span className="text-xs text-gray-500 font-mono">AI Generating...</span>
              </div>
              
              {/* Body */}
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    AI
                  </div>
                  <div className="h-2 w-32 bg-gray-700 rounded-full"></div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-1.5 mb-2">
                    <div className="h-2 w-4 bg-gray-700 rounded-full"></div>
                    <div className="h-2 w-20 bg-purple-500/30 rounded-full"></div>
                  </div>
                  
                  {/* The Typing Question */}
                  <div className="bg-white/5 p-4 rounded-lg border border-purple-500/20">
                    <TypingAnimation />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <div className="h-8 w-full bg-white/5 rounded border border-white/5 flex items-center px-3 text-xs text-gray-500">
                      A) Absorb light energy
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-full bg-white/5 rounded border border-white/5 flex items-center px-3 text-xs text-gray-500">
                      B) Release oxygen
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-8 -left-8 bg-[#0F172A] border border-white/10 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-slow">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                <FiZap />
              </div>
              <div>
                <p className="text-xs text-gray-400">Time Saved</p>
                <p className="text-sm font-bold text-white">85% Faster</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 3. How It Works --- */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            How <span className="text-purple-400">ProshnoGhor</span> Works
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Automate your coaching center workflow in three simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-transparent z-0"></div>

          {[
            {
              step: "01",
              title: "Subscribe",
              desc: "Coaching center creates an account and selects a plan.",
              icon: FiHome, // Was FiBuilding
            },
            {
              step: "02",
              title: "Create AI Questions",
              desc: "Teachers generate unique question papers instantly.",
              icon: FiHardDrive, // Was FiCpu
            },
            {
              step: "03",
              title: "Exam & Results",
              desc: "Students take exams and get instant detailed results.",
              icon: FiAward,
            },
          ].map((item, index) => (
            <div
              key={index}
              className="relative z-10 flex flex-col items-center text-center p-8 bg-[#0F172A]/30 border border-white/5 rounded-2xl hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="w-24 h-24 rounded-full bg-[#030712] border-2 border-purple-500/20 flex items-center justify-center mb-6 group-hover:border-purple-500 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all">
                <item.icon className="text-3xl text-purple-400" />
              </div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                {item.step}
              </span>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              
              {/* Chevron for desktop - Using FiArrowRight to be safe */}
              {index < 2 && (
                <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-gray-700">
                  <FiArrowRight />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- 4. Core Features Grid --- */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 relative">
        {/* Decorative Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] -z-10"></div>

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Everything your coaching center needs
          </h2>
          <p className="text-gray-400 text-lg">
            Powerful tools designed specifically for the Bangladeshi education sector.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: FiHardDrive, // Was FiCpu
              title: "AI Question Generation",
              desc: "Create MCQ, written and true/false questions instantly with AI.",
              color: "text-purple-400",
              bg: "bg-purple-500/10",
              border: "hover:border-purple-500/30",
            },
            {
              icon: FiLayers,
              title: "Question Bank",
              desc: "Organize thousands of questions by subject, chapter and difficulty.",
              color: "text-indigo-400",
              bg: "bg-indigo-500/10",
              border: "hover:border-indigo-500/30",
            },
            {
              icon: FiZap,
              title: "Live Quiz",
              desc: "Run real-time quizzes with leaderboards and instant results.",
              color: "text-pink-400",
              bg: "bg-pink-500/10",
              border: "hover:border-pink-500/30",
            },
            {
              icon: FiFileText,
              title: "Multi-Set Exam",
              desc: "Generate Set A, B, C automatically with different question orders.",
              color: "text-cyan-400",
              bg: "bg-cyan-500/10",
              border: "hover:border-cyan-500/30",
            },
            {
              icon: FiEdit2,
              title: "Written Answer Evaluation",
              desc: "AI grades written answers and teachers can override easily.",
              color: "text-amber-400",
              bg: "bg-amber-500/10",
              border: "hover:border-amber-500/30",
            },
            {
              icon: FiHome, // Was FiBuilding
              title: "Center Management",
              desc: "Manage teachers, students, courses and subscriptions in one place.",
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
              border: "hover:border-emerald-500/30",
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`group p-6 rounded-2xl bg-[#0F172A]/40 border border-white/5 transition-all duration-300 hover:-translate-y-2 ${feature.border}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="text-xl" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- 5. Role Section --- */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Built for everyone in your center
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              role: "Coaching Admin",
              desc: "Manage your entire center, hire teachers, enroll students, track fees.",
              list: ["Student Enrollment", "Fee Tracking", "Teacher Hiring"],
              color: "from-blue-500 to-cyan-500",
              icon: FiUsers,
            },
            {
              role: "Teacher",
              desc: "Create questions with AI, build exam papers, run live quizzes.",
              list: ["AI Question Gen", "Exam Creation", "Live Quiz Host"],
              color: "from-purple-500 to-pink-500",
              icon: FiBook,
            },
            {
              role: "Student",
              desc: "Enroll in courses, take scheduled exams, join live quizzes.",
              list: ["Take Exams", "View Results", "Join Live Quiz"],
              color: "from-emerald-500 to-teal-500",
              icon: FiAward,
            },
            {
              role: "Parent",
              desc: "Monitor your child's exam results and academic progress.",
              list: ["Child Results", "Progress Report", "Notifications"],
              color: "from-orange-500 to-red-500",
              icon: FiActivity,
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-[#0F172A]/60 backdrop-blur-md rounded-2xl p-6 border-t border-white/5 hover:border-white/10 transition-all flex flex-col h-full group"
            >
              <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${item.color} mb-6 group-hover:h-12 transition-all duration-300`}></div>
              
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white mb-4">
                <item.icon />
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                {item.role}
              </h3>
              <p className="text-sm text-gray-400 mb-6 flex-grow">{item.desc}</p>
              
              <ul className="space-y-2">
                {item.list.map((listItem, i) => (
                  <li
                    key={i}
                    className="flex items-center text-gray-300 text-xs font-medium"
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${item.color} mr-2`}
                    ></div>
                    {listItem}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* --- 6. Stats Section --- */}
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <AnimatedCounter end={100} duration={2} label="AI-Powered" icon={FiHardDrive} /> {/* Was FiCpu */}
          <AnimatedCounter end={4} duration={1.5} label="Question Types" icon={FiFileText} />
          <AnimatedCounter end={3} duration={1.5} label="Exam Modes" icon={FiZap} />
          <AnimatedCounter end={100} duration={2.5} label="Multi-Center" icon={FiHome} /> {/* Was FiBuilding */}
        </div>
      </div>

      {/* --- 7. CTA Section --- */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-20 mb-12">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-700 via-pink-600 to-rose-600 px-8 py-16 md:px-16 md:py-20 text-center shadow-2xl shadow-purple-900/40">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Ready to transform your coaching center?
            </h2>
            <p className="text-purple-100 text-lg mb-10 max-w-2xl mx-auto">
              Join coaching centers across Bangladesh using ProshnoGhor to modernize their exam systems.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="px-10 py-4 bg-white text-purple-700 rounded-full font-bold text-lg hover:bg-purple-50 transition shadow-xl hover:scale-105 transform duration-300 flex items-center justify-center gap-2 mx-auto"
            >
              Get Started Free <FiArrowRight />
            </button>
          </div>
        </div>
      </div>

            {/* --- 8. Footer --- */}
      <footer className="border-t border-white/10 bg-[#030712] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            {/* Branding Column */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-lg">P</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white">
                    Proshno<span className="text-purple-400">Ghor</span>
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest -mt-1">
                    প্রশ্নঘর
                  </span>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Empowering coaching centers across Bangladesh with AI-powered education tools.
              </p>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="text-white font-bold mb-6">Product</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-500 hover:text-purple-400 transition-colors text-sm">Features</a></li>
                <li><a href="#" className="text-gray-500 hover:text-purple-400 transition-colors text-sm">Question Bank</a></li>
                <li><a href="#" className="text-gray-500 hover:text-purple-400 transition-colors text-sm">Live Quiz</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-500 hover:text-purple-400 transition-colors text-sm">About Us</a></li>
                <li><a href="#" className="text-gray-500 hover:text-purple-400 transition-colors text-sm">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Legal</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-500 hover:text-purple-400 transition-colors text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-500 hover:text-purple-400 transition-colors text-sm">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          {/* --- Copyright & Developer Info --- */}
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-gray-600 text-sm">
              © 2025–2026 ProshnoGhor. All rights reserved
            </p>
            
            <p className="text-gray-600 text-sm">
              Developed by{" "}
              <strong className="text-gray-300">Akidul Islam Jim</strong>
              <span className="mx-2">|</span>
              <a
                href="https://www.facebook.com/Akidul201103/"
                target="_blank"
                className="text-gray-500 hover:text-blue-500 transition-colors"
                title="Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="inline-block"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a
                href="https://wa.me/8801768962690"
                target="_blank"
                className="ml-2 text-gray-500 hover:text-green-500 transition-colors"
                title="WhatsApp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="inline-block"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Custom Keyframe Styles */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s infinite; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default HomePage;