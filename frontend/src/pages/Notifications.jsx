import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getNotifications, markAsRead, markAllAsRead } from "../services/api";

// --- Icons (Styled for minimalism) ---
const BellIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const FileExamIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M8 13h2" />
    <path d="M8 17h2" />
    <path d="M14 13h2" />
    <path d="M14 17h2" />
  </svg>
);

const QuizIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const DollarSignIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const CheckIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.data);
    } catch (err) {
      console.error("fetchNotifications error:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      // Optimistic UI Update could go here for smoother feel
      await markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error("markAsRead error:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error("markAllAsRead error:", err);
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case "exam":
        return {
          icon: FileExamIcon,
          bgGlow: "bg-indigo-500/10",
          iconBg: "bg-indigo-500/20 border-indigo-500/30",
          iconText: "text-indigo-400",
          borderGlow: "border-indigo-500/30 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]",
          badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
        };
      case "quiz":
        return {
          icon: QuizIcon,
          bgGlow: "bg-purple-500/10",
          iconBg: "bg-purple-500/20 border-purple-500/30",
          iconText: "text-purple-400",
          borderGlow: "border-purple-500/30 shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]",
          badge: "bg-purple-500/20 text-purple-300 border-purple-500/30"
        };
      case "fee":
        return {
          icon: DollarSignIcon,
          bgGlow: "bg-emerald-500/10",
          iconBg: "bg-emerald-500/20 border-emerald-500/30",
          iconText: "text-emerald-400",
          borderGlow: "border-emerald-500/30 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]",
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
        };
      default:
        return {
          icon: BellIcon,
          bgGlow: "bg-pink-500/5",
          iconBg: "bg-pink-500/10 border-pink-500/20",
          iconText: "text-pink-400",
          borderGlow: "border-pink-500/20 shadow-[0_0_20px_-5px_rgba(236,72,153,0.2)]",
          badge: "bg-pink-500/20 text-pink-300 border-pink-500/30"
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden relative">
      
      {/* --- Ambient Background Effects --- */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-blob pointer-events-none"></div>
      <div className="fixed top-[20%] right-[-10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[120px] animate-blob animation-delay-4000 pointer-events-none"></div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 animate-fade-in-up">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-2">
              Notifications
            </h1>
            <p className="text-gray-400 text-base font-medium">
              Stay updated with your academic flow
            </p>
          </div>
          
          {notifications.some((n) => n.status === "unread") && (
            <button
              onClick={handleMarkAllAsRead}
              className="group mt-4 sm:mt-0 px-5 py-2.5 rounded-full glass-panel border border-white/10 hover:border-purple-500/50 text-sm font-semibold text-purple-300 hover:text-white transition-all duration-300 flex items-center gap-2 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              <CheckIcon />
              Mark all as read
            </button>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="glass-panel p-4 rounded-2xl mb-8 flex items-center gap-4 border-l-4 border-l-red-500 animate-fade-in-up">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <span className="text-red-200 font-medium">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up">
            <div className="w-16 h-16 border-4 border-white/5 border-t-purple-500 rounded-full animate-spin shadow-[0_0_20px_rgba(168,85,247,0.3)]"></div>
            <p className="mt-6 text-gray-400 text-sm font-mono tracking-widest animate-pulse">LOADING DATA...</p>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div className="glass-panel rounded-3xl p-12 text-center border border-dashed border-white/10 relative overflow-hidden animate-fade-in-up">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900/5"></div>
             <div className="relative z-10">
                <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 text-gray-600 shadow-inner">
                   <BellIcon width="32" height="32" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">All caught up!</h3>
                <p className="text-gray-400 max-w-sm mx-auto">You have no new notifications. Enjoy your focus time.</p>
             </div>
          </div>
        ) : (
          /* Notification List */
          <div className="space-y-4">
            {notifications.map((n, index) => {
              const typeStyle = getTypeStyle(n.type);
              const Icon = typeStyle.icon;
              const isUnread = n.status === "unread";

              return (
                <div
                  key={n.notification_id}
                  className={`group relative glass-panel rounded-2xl p-1 transition-all duration-300 hover:scale-[1.01] animate-fade-in-up`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Card Inner Container (for dynamic border glow) */}
                  <div className={`relative h-full rounded-xl overflow-hidden ${isUnread ? typeStyle.bgGlow : 'bg-transparent/50'}`}>
                    
                    {/* Unread Left Indicator Line */}
                    {isUnread && (
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 animate-pulse ${typeStyle.iconBg.replace('bg-', 'bg-').split(' ')[0]}`}></div>
                    )}

                    <div className="flex gap-5 p-5">
                      {/* Icon Container */}
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border backdrop-blur-md transition-colors duration-300 ${typeStyle.iconBg} ${isUnread ? 'shadow-lg' : 'opacity-60'}`}
                      >
                        <Icon className={typeStyle.iconText} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center justify-between gap-4 mb-2">
                          {/* Type Badge */}
                          <span
                            className={`text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded border ${typeStyle.badge} shadow-sm`}
                          >
                            {n.type}
                          </span>
                          
                          {/* Time - Monospace for Tech feel */}
                          <span className="text-[11px] text-gray-500 font-mono whitespace-nowrap tabular-nums">
                            {new Date(n.created_at).toLocaleString("en-BD", {
                              timeZone: "Asia/Dhaka",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Message */}
                        <p
                          className={`text-[15px] leading-relaxed transition-colors ${isUnread ? "text-white font-medium" : "text-gray-400"}`}
                        >
                          {n.message}
                        </p>
                      </div>

                      {/* Action Button */}
                      {isUnread && (
                        <div className="flex items-center">
                          <button
                            onClick={() => handleMarkAsRead(n.notification_id)}
                            className="self-center px-4 py-2 rounded-lg text-xs font-bold text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200 border border-transparent hover:border-indigo-500/30 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                          >
                            DISMISS
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;