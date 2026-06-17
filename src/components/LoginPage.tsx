import React, { useState } from "react";
import { useLmsStore } from "../store/index";
import {
  Lock,
  Mail,
  ArrowRight,
  User,
  GraduationCap,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { getRegisteredStudents } from "../utils/localStorage";
import { authAPI, academicAPI } from "../services/api";
import type { Profile } from "../store/types";
import { PlanetLogo } from "./PlanetLogo";

export const LoginPage: React.FC = () => {
  const { setView, boards, setActiveCourseContext } = useLmsStore();
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");

  const getLoginEmails = () => {
    const value = usernameOrEmail.trim();
    const normalized = value.toLowerCase();
    if (normalized.includes("@")) return [normalized];
    if (role === "student")
      return [`${normalized}@nexoralearning.com`, `${normalized}@nexoralearning.in`];
    return [normalized];
  };

  const openStudentWorkspace = (profile: Profile) => {
    const currentBoards = useLmsStore.getState().boards;
    const activeBoard =
      currentBoards.find((b) => b.id === profile.selectedBoardId) ||
      currentBoards[0];
    const activeClass =
      activeBoard?.classes.find((c) => c.id === profile.selectedClassId) ||
      activeBoard?.classes[0];
    const subjects = activeClass?.subjects || [];
    const optedSubject =
      subjects.find((s) => s.id === profile.optedSubjectId) || subjects[0];

    if (optedSubject) {
      const firstChapter = optedSubject.chapters[0];
      const firstTopic = firstChapter?.topics[0];
      setActiveCourseContext(
        optedSubject.id,
        firstChapter?.id || null,
        firstTopic?.id || null,
      );
      setView("student-dash");
    } else {
      setView("student-dash");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError("Please provide correct credentials.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const loginEmails = getLoginEmails();
      let result: Awaited<ReturnType<typeof authAPI.login>> | null = null;

      for (const email of loginEmails) {
        try {
          result = await authAPI.login(email, password);
          break;
        } catch {
          // Try the next supported student demo domain before falling back offline.
        }
      }

      if (!result) {
        throw new Error("Login failed");
      }

      localStorage.setItem("auth_token", result.token);

      let boards = useLmsStore.getState().boards;
      try {
        boards = await academicAPI.getFullStructure();
      } catch {
        // keep existing boards if structure fetch fails
      }

      const profile = {
        ...result.user,
        role: result.role as "student" | "teacher" | "admin",
        subjectArea: result.role === "teacher" ? selectedSubject : undefined,
      };

      if (profile.role === "student" && !profile.optedSubjectId) {
        const activeBoard =
          boards.find((b) => b.id === profile.selectedBoardId) || boards[0];
        const activeClass =
          activeBoard?.classes.find((c) => c.id === profile.selectedClassId) ||
          activeBoard?.classes[0];
        profile.optedSubjectId = activeClass?.subjects[0]?.id ?? "";
      }

      useLmsStore.setState({
        boards,
        profile,
        auth: {
          isAuthenticated: true,
          user: null,
          token: result.token,
          loading: false,
          error: null,
        },
      });

      const { addNotification } = useLmsStore.getState();
      addNotification(
        "Welcome back!",
        `Successfully logged in as ${profile.name}.`,
        "success",
      );

      if (profile.role === "student") {
        openStudentWorkspace(profile);
      } else if (profile.role === "teacher") {
        setView("teacher-dash");
      } else {
        setView("admin-analytics");
      }
      return;
    } catch (err: any) {
      setError("Invalid academic email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4 font-sans overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute rounded-full blur-[120px] opacity-[0.06] pointer-events-none w-[400px] h-[400px] bg-brand-royal -top-20 -left-20" />
      <div className="absolute rounded-full blur-[120px] opacity-[0.06] pointer-events-none w-[450px] h-[450px] bg-brand-violet -bottom-20 -right-20" />

      {/* Floating brand header */}
      <div className="absolute top-6 left-6 flex items-center gap-3 z-10 select-none">
        <div
          onClick={() => setView("landing")}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <PlanetLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
          <span className="font-extrabold font-display text-sm tracking-tight text-slate-900 group-hover:text-brand-violet transition-colors">
            Nexora Learning
          </span>
        </div>
        <div className="h-4 w-px bg-slate-300" />
        <button
          onClick={() => setView("landing")}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Login Form Card */}
      <div className="w-full max-w-md bg-white border border-slate-300 p-8 rounded-2xl shadow-2xl relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold font-display text-slate-900 tracking-tight">
            Access Scholar Workspace
          </h2>
          <p className="text-xs text-slate-600 mt-2">
            Sign in using your parents' billing credential or institutional key.
          </p>
        </div>

        {/* Role Select Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 border border-slate-300 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setRole("student");
              setError("");
            }}
            className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              role === "student"
                ? "bg-brand-royal text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole("teacher");
              setError("");
            }}
            className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              role === "teacher"
                ? "bg-brand-royal text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Teacher</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole("admin");
              setError("");
            }}
            className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              role === "admin"
                ? "bg-brand-royal text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          {/* Identifier (Username or Email) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              {role === "student" ? "Gmail Address" : "Academic Email"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder={
                  role === "student" ? "e.g. prathamesh@gmail.com" : "you@nexoralearning.in"
                }
                value={usernameOrEmail}
                onChange={(e) => {
                  setUsernameOrEmail(e.target.value);
                  setError("");
                }}
                className="premium-input pl-10 text-xs sm:text-sm"
                required
              />
            </div>
          </div>

          {role === "teacher" && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Subject Area
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-brand-royal"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
              </select>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Secured Password
              </label>
              <a
                href="#"
                className="text-[10px] text-brand-violet hover:underline font-semibold"
              >
                Forgot?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="premium-input pl-10 pr-10 text-xs sm:text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-800"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="w-4 h-4 bg-white border-slate-300 rounded focus:ring-brand-royal text-brand-royal"
            />
            <label
              htmlFor="remember"
              className="ml-2 text-xs text-slate-600 select-none"
            >
              Remember this device for 30 days
            </label>
          </div>

          <button
            type="submit"
            className="w-full premium-btn-primary py-3.5 text-xs font-bold"
          >
            <span>{loading ? "Signing in..." : "Authenticate Securely"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Login Controls */}
        <div className="mt-5 pt-5 border-t border-slate-100 text-left">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Demo Accounts (Click to Auto-fill)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setRole("student");
                setUsernameOrEmail("leelakrishna.kurra7@gmail.com");
                setPassword("Nexora@5574");
              }}
              className="text-[11px] p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 text-left transition-all"
            >
              <div className="font-semibold text-brand-royal">Student (Active)</div>
              <div className="text-[9px] text-slate-500 truncate">leelakrishna.kurra7@gmail.com</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("student");
                setUsernameOrEmail("student@nexoralearning.com");
                setPassword("password123");
              }}
              className="text-[11px] p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 text-left transition-all"
            >
              <div className="font-semibold text-slate-700">Student (Seeded)</div>
              <div className="text-[9px] text-slate-500 truncate">student@nexoralearning.com</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("teacher");
                setUsernameOrEmail("teacher@nexoralearning.com");
                setPassword("password123");
                setSelectedSubject("Mathematics");
              }}
              className="text-[11px] p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 text-left transition-all"
            >
              <div className="font-semibold text-emerald-700">Teacher</div>
              <div className="text-[9px] text-slate-500 truncate">teacher@nexoralearning.com</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("admin");
                setUsernameOrEmail("admin@nexoralearning.com");
                setPassword("password123");
              }}
              className="text-[11px] p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 text-left transition-all"
            >
              <div className="font-semibold text-rose-700">Admin Portal</div>
              <div className="text-[9px] text-slate-500 truncate">admin@nexoralearning.com</div>
            </button>
          </div>
        </div>

        <div className="text-center mt-5 pt-5 border-t border-slate-100 text-xs text-slate-600">
          Not yet registered?{" "}
          <button
            onClick={() => setView("signup")}
            className="text-brand-violet font-semibold hover:underline"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};
