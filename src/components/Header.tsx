import React, { useState } from "react";
import { useLmsStore } from "../store/index";
import {
  Sun,
  Moon,
  BookOpen,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    activeView,
    setView,
    profile,
    notifications,
    readAllNotifications,
    isDarkMode,
    setTheme,
  } = useLmsStore();
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const viewTitles: Record<string, string> = {
    "student-dash": "Student Portal",
    "course-view": "Deep Learning Space",
    "quiz-view": "Quiz Assessment",
    "assignment-view": "Assignments Center",
    "profile-view": "Academic Profile",
    "teacher-dash": "Educator Dashboard",
    "content-upload": "Content Upload Studio",
    "quiz-builder": "Assessment Constructor",
    "admin-structure": "SaaS Registry & Structure",
    "admin-analytics": "Platform Core Analytics",
    "webrtc-live": "WebRTC Elite Classroom",
    "ai-tutor": "AI Personal Tutor",
    "drm-security": "DRM Security Console",
    "parent-portal": "Parent Monitor Shield",
  };

  const handleNotifClick = () => {
    setShowNotifMenu(!showNotifMenu);
    if (!showNotifMenu) {
      readAllNotifications();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-none rounded-none border-b border-white/5 dark:border-white/5 py-4 px-6 flex items-center justify-between font-sans">
      {/* Mobile Sidebar Trigger & Breadcrumb */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            {viewTitles[activeView] || "Nexora Learning"}
          </h1>
        </div>
      </div>

      {/* Top Navigation Options / Badges */}
      <div className="flex items-center gap-4">
        {/* User Card Dropdown (Quick exit to Landing) */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/10">
          <div className="hidden sm:block text-right">
            <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
              {profile.name}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-500 capitalize">
              {profile.role}
            </p>
          </div>
          <button
            onClick={() => setView("landing")}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-royal text-white font-bold text-xs shadow-md shadow-brand-royal/10 hover:shadow-brand-royal/25 transition-all hover:scale-105"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
