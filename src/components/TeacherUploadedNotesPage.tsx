import React, { useEffect, useState } from "react";
import { useLmsStore } from "../store/index";
import { getApiBaseUrl } from "../utils/apiBase";
import {
  ArrowLeft,
  BookOpen,
  Download,
  FileText,
  Loader2,
  User,
  GraduationCap,
  Calendar,
  Search,
} from "lucide-react";

interface TeacherNote {
  id: string;
  title: string;
  fileUrl: string;
  uploadedByName: string;
  subjectTitle: string;
  createdAt: string;
}

export const TeacherUploadedNotesPage: React.FC = () => {
  const { setView } = useLmsStore();
  const [notes, setNotes] = useState<TeacherNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setLoading(true);
    fetch(`${getApiBaseUrl()}/api/upload/notes/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setNotes(data.notes || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load notes. Please try again.");
        setLoading(false);
      });
  }, []);

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.uploadedByName.toLowerCase().includes(search.toLowerCase()) ||
      n.subjectTitle.toLowerCase().includes(search.toLowerCase()),
  );

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Pick a consistent card accent color per subject
  const subjectColor = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes("math")) return "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-600 dark:text-blue-400";
    if (s.includes("chem")) return "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
    if (s.includes("phys")) return "from-violet-500/20 to-violet-600/10 border-violet-500/30 text-violet-600 dark:text-violet-400";
    if (s.includes("bio")) return "from-green-500/20 to-green-600/10 border-green-500/30 text-green-600 dark:text-green-400";
    if (s.includes("eng")) return "from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-600 dark:text-orange-400";
    return "from-sky-500/20 to-sky-600/10 border-sky-500/30 text-sky-600 dark:text-sky-400";
  };

  return (
    <div className="min-h-screen space-y-8 font-sans">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-brand-royal p-8 shadow-xl">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        />
        <button
          onClick={() => setView("assignment-view")}
          className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Homework Space
        </button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-inner">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Teacher Uploaded Notes
            </h1>
            <p className="text-white/70 text-sm mt-0.5">
              Study materials shared by your educators · {notes.length} note{notes.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by title, teacher, or subject…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-royal/40 transition-all shadow-sm"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 text-brand-royal animate-spin" />
          <p className="text-sm text-slate-500 font-semibold">Loading study materials…</p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-500 font-semibold text-sm">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              {search ? "No notes match your search" : "No Notes Uploaded Yet"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {search
                ? "Try a different keyword."
                : "Your teachers haven't uploaded any study materials yet. Check back later!"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((note) => {
            const colorClasses = subjectColor(note.subjectTitle);
            return (
              <div
                key={note.id}
                className="group glass-card border border-slate-200 dark:border-white/5 p-5 space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default"
              >
                {/* Card Header */}
                <div className={`relative rounded-xl bg-gradient-to-br ${colorClasses} p-4 border overflow-hidden`}>
                  <div className="absolute top-2 right-2 w-12 h-12 rounded-full bg-white/10 blur-xl" />
                  <FileText className="w-8 h-8 text-current opacity-80" />
                  <span className="mt-2 block text-[10px] font-black uppercase tracking-widest opacity-80">
                    {note.subjectTitle}
                  </span>
                </div>

                {/* Note Title */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {note.title}
                  </h3>
                </div>

                {/* Teacher & Date */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-royal to-brand-violet flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-semibold truncate">{note.uploadedByName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Uploaded on {formatDate(note.createdAt)}</span>
                  </div>
                </div>

                {/* Download Button */}
                <a
                  href={note.fileUrl.includes('?') ? `${note.fileUrl}&download=true` : `${note.fileUrl}?download=true`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-royal/10 hover:bg-brand-royal text-brand-royal hover:text-white border border-brand-royal/20 hover:border-brand-royal text-xs font-bold transition-all duration-200 group-hover:shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  Open / Download
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
