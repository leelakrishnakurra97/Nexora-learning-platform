import React, { useState, useEffect, useRef } from "react";
import { useLmsStore } from "../store/index";
import { authAPI } from "../services/api";
import { getApiBaseUrl } from "../utils/apiBase";
import {
  Plus,
  Settings,
  BarChart3,
  Users,
  DollarSign,
  Activity,
  Database,
  Upload,
  FileText,
  Trash2,
  Lock,
  Unlock,
  Calendar,
  BookOpen,
  ChevronDown,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  File,
  Folder,
  Video,
  ArrowLeft,
  Pencil,
  Search,
  Mail,
  Send,
  Brain,
} from "lucide-react";

const locationSuggestions = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman & Nicobar Islands",
  "Chandigarh",
  "Dadra & Nagar Haveli and Daman & Diu",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

// ─── helpers ────────────────────────────────────────────────────────────────
const getSubjectSolidColor = (color: string) => {
  if (color?.startsWith("bg-")) return color;
  const c = (color || "").toLowerCase();
  if (c.includes("blue") || c.includes("sky") || c.includes("indigo")) return "bg-blue-600";
  if (c.includes("violet") || c.includes("purple")) return "bg-purple-600";
  if (c.includes("emerald") || c.includes("teal")) return "bg-emerald-600";
  if (c.includes("rose") || c.includes("pink")) return "bg-rose-600";
  if (c.includes("orange") || c.includes("amber")) return "bg-orange-600";
  return "bg-brand-royal";
};

const PremiumEmptyState = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 h-full min-h-[320px] rounded-2xl border-2 border-dashed border-slate-200/80 dark:border-white/5 bg-slate-50/20 dark:bg-slate-950/10">
      <div className="mb-4 flex items-center justify-center">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-brand-royal dark:text-brand-royal-300">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-300 tracking-wider uppercase">{title}</h5>
      <p className="text-[11px] text-slate-500 max-w-[220px] mt-1.5 leading-relaxed">{description}</p>
    </div>
  );
};

const API = `${getApiBaseUrl()}/api`;
const authHeaders = () => {
  const token = localStorage.getItem("auth_token") || "";
  return { Authorization: `Bearer ${token}` };
};

// ─── types ────────────────────────────────────────────────────────────────
interface UploadSubject { id: string; name: string; }
interface UploadClass { id: string; name: string; subjects: UploadSubject[]; }
interface UploadBoard { id: string; name: string; classes: UploadClass[]; }

interface NoteRecord {
  id: string; title: string; fileUrl: string;
}
interface AssignmentRecord {
  id: string; title: string; deadline: string; fileUrl?: string; isLocked: boolean;
}

const drmPromptText = `You are working on my LMS web application. Implement a secure DRM-style video protection system for course videos.

Project stack:
- Frontend: React
- Backend: Node.js + Express
- Database: PostgreSQL + Prisma
- Storage: MinIO (S3 compatible)
- Video player: Use Shaka Player
- Authentication: Existing JWT/session authentication

Goal:
Protect course videos from direct downloading and unauthorized access.

Implement the following:

1. Video Storage Security
- Do NOT serve raw MP4 files directly.
- Convert uploaded videos into encrypted HLS/DASH streams.
- Use FFmpeg for video processing.
- Generate:
  - .m3u8 playlists
  - encrypted video segments
  - encryption keys
- Store processed videos inside MinIO.

Folder structure:
storage/
  courses/
    {courseId}/
      {videoId}/
        manifest.m3u8
        segments/
        keys/

2. Backend DRM Access Layer
Create a secure video access API.

Add:
GET /api/videos/:videoId/playback

Flow:
- Verify user authentication
- Verify user is enrolled in the course
- Generate a short-lived playback token
- Return secure playback URL

Token:
- Expire after 10 minutes
- Include:
  userId
  courseId
  videoId
  expiry

3. Secure Streaming Endpoint
Create:
GET /api/videos/:videoId/stream/*

Requirements:
- Validate playback token
- Reject expired tokens
- Prevent unauthorized users
- Add proper CORS protection
- Prevent hotlinking

4. Frontend Player
Integrate Shaka Player.

Create:
components/DRMVideoPlayer.jsx

Features:
- Load secure playback URL
- Request license/key endpoint
- Handle errors
- Show loading state
- Show playback failure message

5. Add Watermark Protection
Add dynamic watermark overlay:

Display:
- Logged-in username
- User ID
- Current timestamp

Watermark should:
- Move position every few seconds
- Be semi-transparent
- Appear over video

6. Database Changes

Update Prisma schema.

Add fields if needed:

Video:
- encryptedPath
- manifestPath
- drmEnabled
- encryptionKeyId

Create migration.

7. Upload Pipeline

When admin uploads a video:

Flow:
Upload MP4
↓
FFmpeg processing
↓
Encrypt
↓
Generate HLS/DASH
↓
Upload to MinIO
↓
Save metadata in PostgreSQL

8. Security

Implement:
- Signed URLs
- Short expiry tokens
- No public MinIO bucket
- No direct object URLs
- Disable browser download controls
- Rate limit playback API

9. Code Quality

Requirements:
- Follow existing project structure
- Do not break current LMS features
- Use environment variables for secrets
- Add comments explaining DRM flow
- Add error handling
- Provide setup instructions

After implementation:
- Show all changed files
- Explain database changes
- Provide commands to run migrations
- Provide FFmpeg installation/setup steps`;

// ─── component ───────────────────────────────────────────────────────────────
export const AdminPortal: React.FC = () => {
  const { boards, addBoard, addClass, addSubject, activeView, setView, profile } = useLmsStore();

  // ── User Management State ──
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);

  // Form State
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userRole, setUserRole] = useState<"STUDENT" | "TEACHER" | "ADMIN">("STUDENT");
  const [userBoardId, setUserBoardId] = useState("");
  const [userClassId, setUserClassId] = useState("");
  const [userDept, setUserDept] = useState("Operations");
  const [userBio, setUserBio] = useState("");
  const [userQualification, setUserQualification] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [activationLocation, setActivationLocation] = useState("");

  // ── New Student Activation & Filters States ──
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All Grades");
  const [subFilter, setSubFilter] = useState("All Subscriptions");
  
  // Activation modal
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [activatingStudent, setActivatingStudent] = useState<any>(null);
  const [activationPaymentStatus, setActivationPaymentStatus] = useState<"SUCCESS" | "PENDING">("SUCCESS");
  const [activationPassword, setActivationPassword] = useState("");
  const [activationLoading, setActivationLoading] = useState(false);
  const [activationError, setActivationError] = useState("");
  
  // Create student modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Teacher Registration Form State
  const [teacherFullName, setTeacherFullName] = useState("");
  const [teacherPhone, setTeacherPhone] = useState("");
  const [teacherSubjectArea, setTeacherSubjectArea] = useState("Mathematics");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherTempPassword, setTeacherTempPassword] = useState("");
  const [creatingTeacher, setCreatingTeacher] = useState(false);
  const [teacherError, setTeacherError] = useState("");

  // ── Analytics & Graph State ──
  const [analyticsData, setAnalyticsData] = useState<any>({
    activeSubscriptionsCount: 0,
    monthlyActiveSubscriptions: Array(12).fill(0),
    regionalDistribution: [],
    totalRevenue: 45000000,
    serverUptime: 0,
    databaseQueries: 145000
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [liveUptime, setLiveUptime] = useState<number>(0);
  const [liveQueries, setLiveQueries] = useState<number>(145000);

  // Helper to format live uptime duration
  const formatUptimeDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return "0s";
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0 || d > 0) parts.push(`${h}h`);
    if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);

    return parts.join(" ");
  };

  // Helper to format revenue in Crores/Lakhs/Rupees dynamically
  const formatRevenue = (rev: number) => {
    if (rev === undefined || rev === null) return "₹0";
    if (rev >= 10000000) {
      return `₹${(rev / 10000000).toFixed(2)} Crores`;
    }
    if (rev >= 100000) {
      return `₹${(rev / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${rev.toLocaleString()}`;
  };

  const handleCopyPrompt = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(drmPromptText);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = drmPromptText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      useLmsStore.getState().addNotification(
        "Prompt Copied",
        "DRM engineering guide copied to clipboard.",
        "success"
      );
    } catch (err) {
      useLmsStore.getState().addNotification(
        "Copy Failed",
        "Failed to copy prompt to clipboard.",
        "alert"
      );
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const data = await authAPI.getAdminAnalytics();
      setAnalyticsData(data);
      if (data.serverUptime !== undefined) setLiveUptime(data.serverUptime);
      if (data.databaseQueries !== undefined) setLiveQueries(data.databaseQueries);
    } catch (err) {
      console.warn("Failed to fetch admin analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (activeView === "admin-analytics" || activeView === "admin-users" || activeView === "admin-regional-distribution") {
      fetchAnalytics();
    }
  }, [activeView]);

  // Live ticking hook for real-time uptime and database queries updates
  useEffect(() => {
    if (activeView !== "admin-analytics") return;

    const interval = setInterval(() => {
      setLiveUptime((prev) => prev + 1);
      setLiveQueries((prev) => {
        const jitter = Math.floor(Math.random() * 3) + 1; // +1 to +3 queries
        return prev + jitter;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeView]);

  // Periodic backend polling hook
  useEffect(() => {
    if (activeView !== "admin-analytics" && activeView !== "admin-users" && activeView !== "admin-regional-distribution") return;

    const pollInterval = setInterval(() => {
      authAPI.getAdminAnalytics().then((data) => {
        setAnalyticsData(data);
        if (data.serverUptime !== undefined) setLiveUptime(data.serverUptime);
        if (data.databaseQueries !== undefined) setLiveQueries(data.databaseQueries);
      }).catch((err) => console.warn("Background analytics poll failed:", err));
    }, 20000); // Poll every 20 seconds

    return () => clearInterval(pollInterval);
  }, [activeView]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError("");
    try {
      const data = await authAPI.getUsers();
      setUsersList(data);
    } catch (err: any) {
      setUsersError("Failed to fetch users from database.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleActivateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activatingStudent) return;
    setActivationError("");
    setActivationLoading(true);
    try {
      await authAPI.activateUser(activatingStudent.id, {
        paymentStatus: activationPaymentStatus,
        password: activationPassword,
        location: activationLocation
      });
      setIsActivationModalOpen(false);
      setActivatingStudent(null);
      setActivationPassword("");
      useLmsStore.getState().addNotification(
        "Student Activated",
        `Account activated and credentials sent to ${activatingStudent.email}.`,
        "success"
      );
      fetchUsers();
      fetchAnalytics();
    } catch (err: any) {
      setActivationError(err.message || "Failed to activate student account.");
    } finally {
      setActivationLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === "admin-users" || activeView === "admin-teachers") {
      fetchUsers();
    }
  }, [activeView]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsersError("");
    try {
      const payload = {
        email: userEmail,
        password: userPassword,
        firstName: userFirstName,
        lastName: userLastName,
        role: userRole,
        boardId: userRole === "STUDENT" ? userBoardId : undefined,
        classId: userRole === "STUDENT" ? userClassId : undefined,
        dept: userRole === "ADMIN" ? userDept : undefined,
        bio: userRole === "TEACHER" ? userBio : undefined,
        qualification: userRole === "TEACHER" ? userQualification : undefined,
        location: userRole === "STUDENT" ? userLocation : undefined,
      };

      await authAPI.createUser(payload);
      setUserEmail("");
      setUserPassword("");
      setUserFirstName("");
      setUserLastName("");
      setUserBio("");
      setUserQualification("");
      fetchUsers();
      fetchAnalytics();
    } catch (err: any) {
      setUsersError(err.message || "Failed to create user.");
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError("");
    setCreatingTeacher(true);
    try {
      const nameParts = teacherFullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "Instructor";

      const payload = {
        email: teacherEmail.toLowerCase().trim(),
        password: teacherTempPassword,
        firstName,
        lastName,
        role: "TEACHER",
        phoneNumber: teacherPhone.trim(),
        qualification: teacherSubjectArea,
        bio: `${teacherSubjectArea} teacher at Nexora Learning`,
      };

      await authAPI.createUser(payload);
      
      // Reset form
      setTeacherFullName("");
      setTeacherPhone("");
      setTeacherEmail("");
      setTeacherTempPassword("");
      setTeacherSubjectArea("Mathematics");

      useLmsStore.getState().addNotification(
        "Teacher Registered",
        `Teacher ${firstName} has been registered and credentials email sent.`,
        "success"
      );

      fetchUsers();
      setView("admin-teachers");
    } catch (err: any) {
      setTeacherError(err.message || "Failed to create teacher account.");
    } finally {
      setCreatingTeacher(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUsersError("");
    try {
      const payload = {
        email: userEmail,
        password: userPassword || undefined,
        firstName: userFirstName,
        lastName: userLastName,
        role: userRole,
        boardId: userRole === "STUDENT" ? userBoardId : undefined,
        classId: userRole === "STUDENT" ? userClassId : undefined,
        dept: userRole === "ADMIN" ? userDept : undefined,
        bio: userRole === "TEACHER" ? userBio : undefined,
        qualification: userRole === "TEACHER" ? userQualification : undefined,
        location: userRole === "STUDENT" ? userLocation : undefined,
      };

      await authAPI.updateUser(editingUser.id, payload);
      setEditingUser(null);
      setUserEmail("");
      setUserPassword("");
      setUserFirstName("");
      setUserLastName("");
      setUserBio("");
      setUserQualification("");
      fetchUsers();
      fetchAnalytics();
    } catch (err: any) {
      setUsersError(err.message || "Failed to update user.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setUsersError("");
    try {
      await authAPI.deleteUser(id);
      fetchUsers();
      fetchAnalytics();
    } catch (err: any) {
      setUsersError("Failed to delete user.");
    }
  };

  // ── structure builder ──
  const [selectedBoardId, setSelectedBoardId] = useState(boards[0]?.id || "");
  const [selectedClassId, setSelectedClassId] = useState(boards[0]?.classes[0]?.id || "");
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newClassTitle, setNewClassTitle] = useState("");
  const [newSubjectTitle, setNewSubjectTitle] = useState("");
  const [newSubjectColor, setNewSubjectColor] = useState("bg-indigo-600");

  // ── upload module ──
  const [uploadBoards, setUploadBoards] = useState<UploadBoard[]>([]);
  const [upBoardId, setUpBoardId] = useState("");
  const [upClassId, setUpClassId] = useState("");
  const [upSubjectId, setUpSubjectId] = useState("");
  const [uploadTab, setUploadTab] = useState<"notes" | "assignments" | "videos">("notes");

  // notes form
  const [noteTitle, setNoteTitle] = useState("");
  const [noteFile, setNoteFile] = useState<File | null>(null);
  const noteFileRef = useRef<HTMLInputElement>(null);

  // assignment form
  const [assignTitle, setAssignTitle] = useState("");
  const [assignDesc, setAssignDesc] = useState("");
  const [assignDeadline, setAssignDeadline] = useState("");
  const [assignMaxMarks, setAssignMaxMarks] = useState("100");
  const [assignFile, setAssignFile] = useState<File | null>(null);
  const assignFileRef = useRef<HTMLInputElement>(null);

  // video form
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDuration, setVideoDuration] = useState("10"); // in minutes
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const [videoSourceType, setVideoSourceType] = useState<"file" | "url">("file");
  const [embeddedVideoUrl, setEmbeddedVideoUrl] = useState("");
  const [drmProtected, setDrmProtected] = useState(false);

  // lists
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // deadline edit
  const [editDeadlineId, setEditDeadlineId] = useState<string | null>(null);
  const [editDeadlineVal, setEditDeadlineVal] = useState("");

  const activeBoard = boards.find((b) => b.id === selectedBoardId) || boards[0];
  const activeClass = activeBoard?.classes?.find((c) => c.id === selectedClassId) || activeBoard?.classes?.[0];

  // ── fetch upload structure ─────────────────────────────────────────────────
  useEffect(() => {
    if (activeView !== "admin-upload") return;
    fetch(`${API}/upload/structure`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        if (d.boards) {
          setUploadBoards(d.boards);
          const first = d.boards[0];
          if (first) {
            setUpBoardId(first.id);
            const firstClass = first.classes?.[0];
            if (firstClass) {
              setUpClassId(firstClass.id);
              setUpSubjectId(firstClass.subjects?.[0]?.id || "");
            }
          }
        }
      })
      .catch(() => {
        // API offline – use store boards as fallback
        const mapped: UploadBoard[] = boards.map((b) => ({
          id: b.id,
          name: b.title,
          classes: b.classes.map((c) => ({
            id: c.id,
            name: c.title,
            subjects: c.subjects.map((s) => ({ id: s.id, name: s.title })),
          })),
        }));
        setUploadBoards(mapped);
        if (mapped[0]) {
          setUpBoardId(mapped[0].id);
          const fc = mapped[0].classes[0];
          if (fc) { setUpClassId(fc.id); setUpSubjectId(fc.subjects[0]?.id || ""); }
        }
      });
  }, [activeView]);

  // ── fetch notes/assignments/videos when subject changes ───────────────────
  useEffect(() => {
    if (!upSubjectId || activeView !== "admin-upload") return;
    fetch(`${API}/upload/notes?subjectId=${upSubjectId}`, { headers: authHeaders() })
      .then((r) => r.json()).then((d) => setNotes(d.notes || [])).catch(() => setNotes([]));
    fetch(`${API}/upload/assignments?subjectId=${upSubjectId}`, { headers: authHeaders() })
      .then((r) => r.json()).then((d) => setAssignments(d.assignments || [])).catch(() => setAssignments([]));
    fetch(`${API}/upload/videos?subjectId=${upSubjectId}`, { headers: authHeaders() })
      .then((r) => r.json()).then((d) => setVideos(d.videos || [])).catch(() => setVideos([]));
  }, [upSubjectId, activeView]);

  // ── helper: get class/subject name for R2 key ─────────────────────────────
  const upBoard = uploadBoards.find((b) => b.id === upBoardId);
  const upClass = upBoard?.classes?.find((c) => c.id === upClassId);
  const upSubject = upClass?.subjects?.find((s) => s.id === upSubjectId);

  // ── structure handlers ────────────────────────────────────────────────────
  const handleAddBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle) return;
    addBoard(newBoardTitle);
    useLmsStore.getState().addNotification("Board Added", `"${newBoardTitle}" registered.`, "success");
    setNewBoardTitle("");
  };
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoardId || !newClassTitle) return;
    addClass(selectedBoardId, newClassTitle);
    useLmsStore.getState().addNotification("Class Added", `"${newClassTitle}" added.`, "success");
    setNewClassTitle("");
  };
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoardId || !selectedClassId || !newSubjectTitle) return;
    addSubject(selectedBoardId, selectedClassId, newSubjectTitle, newSubjectColor);
    useLmsStore.getState().addNotification("Subject Added", `"${newSubjectTitle}" created.`, "success");
    setNewSubjectTitle("");
  };

  // ── upload helpers ────────────────────────────────────────────────────────
  const showStatus = (type: "success" | "error", msg: string) => {
    setUploadStatus({ type, msg });
    setTimeout(() => setUploadStatus(null), 4000);
  };

  const handleUploadNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteFile || !upSubjectId || !noteTitle) return showStatus("error", "Fill all fields and select a file.");
    setUploading(true);
    const fd = new FormData();
    fd.append("file", noteFile);
    fd.append("subjectId", upSubjectId);
    fd.append("title", noteTitle);
    fd.append("classTitle", upClass?.name || "general");
    fd.append("subjectTitle", upSubject?.name || "general");
    try {
      const r = await fetch(`${API}/upload/note`, { method: "POST", headers: authHeaders(), body: fd });
      const d = await r.json();
      if (r.ok) {
        showStatus("success", "Note uploaded successfully!");
        setNotes((prev) => [d.note, ...prev]);
        setNoteTitle(""); setNoteFile(null);
        if (noteFileRef.current) noteFileRef.current.value = "";
      } else { showStatus("error", d.error || "Upload failed."); }
    } catch { showStatus("error", "Server unreachable. Check if the backend is running."); }
    setUploading(false);
  };

  const handleUploadAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upSubjectId || !assignTitle || !assignDeadline) return showStatus("error", "Fill title, subject, and deadline.");
    setUploading(true);
    const fd = new FormData();
    fd.append("subjectId", upSubjectId);
    fd.append("title", assignTitle);
    fd.append("description", assignDesc);
    fd.append("deadline", new Date(assignDeadline).toISOString());
    fd.append("maxMarks", assignMaxMarks);
    fd.append("classTitle", upClass?.name || "general");
    fd.append("subjectTitle", upSubject?.name || "general");
    if (assignFile) fd.append("file", assignFile);
    try {
      const r = await fetch(`${API}/upload/assignment`, { method: "POST", headers: authHeaders(), body: fd });
      const d = await r.json();
      if (r.ok) {
        showStatus("success", "Assignment created successfully!");
        setAssignments((prev) => [{ ...d.assignment, isLocked: false }, ...prev]);
        setAssignTitle(""); setAssignDesc(""); setAssignDeadline(""); setAssignFile(null);
        if (assignFileRef.current) assignFileRef.current.value = "";
      } else { showStatus("error", d.error || "Failed."); }
    } catch { showStatus("error", "Server unreachable."); }
    setUploading(false);
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await fetch(`${API}/upload/note/${id}`, { method: "DELETE", headers: authHeaders() });
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch { showStatus("error", "Delete failed."); }
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      await fetch(`${API}/upload/assignment/${id}`, { method: "DELETE", headers: authHeaders() });
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch { showStatus("error", "Delete failed."); }
  };

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upSubjectId || !videoTitle) return showStatus("error", "Fill all required fields.");
    if (videoSourceType === "file" && !videoFile) return showStatus("error", "Please select a video file.");
    if (videoSourceType === "url" && !embeddedVideoUrl) return showStatus("error", "Please enter a video URL.");
    
    setUploading(true);
    const fd = new FormData();
    if (videoSourceType === "file" && videoFile) {
      fd.append("file", videoFile);
    } else {
      fd.append("videoUrl", embeddedVideoUrl);
    }
    fd.append("subjectId", upSubjectId);
    fd.append("title", videoTitle);
    fd.append("duration", videoDuration);
    fd.append("classTitle", upClass?.name || "general");
    fd.append("subjectTitle", upSubject?.name || "general");
    if (drmProtected && videoSourceType === "file") {
      fd.append("drmProtected", "true");
    }
    try {
      const r = await fetch(`${API}/upload/video`, { method: "POST", headers: authHeaders(), body: fd });
      const d = await r.json();
      if (r.ok) {
        showStatus("success", "Video lecture added successfully!");
        setVideos((prev) => [d.video, ...prev]);
        setVideoTitle(""); setVideoDuration("10"); setVideoFile(null); setEmbeddedVideoUrl(""); setDrmProtected(false);
        if (videoFileRef.current) videoFileRef.current.value = "";
      } else { showStatus("error", d.error || "Upload failed."); }
    } catch { showStatus("error", "Server unreachable."); }
    setUploading(false);
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      await fetch(`${API}/upload/video/${id}`, { method: "DELETE", headers: authHeaders() });
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch { showStatus("error", "Delete failed."); }
  };

  const handleUpdateDeadline = async (id: string) => {
    if (!editDeadlineVal) return;
    try {
      const r = await fetch(`${API}/upload/assignment/${id}/deadline`, {
        method: "PATCH", headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ deadline: new Date(editDeadlineVal).toISOString() }),
      });
      const d = await r.json();
      if (r.ok) {
        setAssignments((prev) => prev.map((a) => a.id === id ? { ...a, deadline: editDeadlineVal, isLocked: d.isLocked } : a));
        setEditDeadlineId(null);
        showStatus("success", "Deadline updated.");
      }
    } catch { showStatus("error", "Update failed."); }
  };

  const colors = [
    { value: "bg-indigo-600", label: "Indigo Space" },
    { value: "bg-violet-600", label: "Violet Glow" },
    { value: "bg-sky-600", label: "Royal Sky" },
    { value: "bg-emerald-600", label: "Emerald Deep" },
    { value: "bg-rose-600", label: "Rose Gold" },
  ];

  if (!activeBoard || !activeClass) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-royal"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-left">

      {/* ── STRUCTURE BUILDER ─────────────────────────────────────────────── */}
      {activeView === "admin-structure" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
          {/* Board Creator */}
          <div className="glass-card p-5 border-slate-200 dark:border-white/5 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-2">1. Board Standards</h4>
            <form onSubmit={handleAddBoard} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-600 dark:text-slate-500 uppercase">Board Title</label>
                <input type="text" placeholder="e.g. ICSE Board" value={newBoardTitle} onChange={(e) => setNewBoardTitle(e.target.value)} className="premium-input text-xs" required />
              </div>
              <button type="submit" className="w-full premium-btn-primary py-2 text-xs"><Plus className="w-3.5 h-3.5" /><span>Registry Board</span></button>
            </form>
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/5">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase">Board List</span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {boards.map((b) => (
                  <button key={b.id} onClick={() => { setSelectedBoardId(b.id); setSelectedClassId(b.classes[0]?.id || ""); }}
                    className={`w-full py-2 px-3 rounded-lg text-left text-xs transition-all border flex items-center justify-between ${selectedBoardId === b.id ? "border-brand-royal bg-brand-royal/10 text-brand-royal dark:text-white font-semibold" : "border-transparent text-slate-700 hover:text-slate-900 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/60"}`}>
                    <span>{b.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Class Creator */}
          <div className="glass-card p-5 border-slate-200 dark:border-white/5 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-2">2. Class Grade Levels</h4>
            <form onSubmit={handleAddClass} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-600 dark:text-slate-500 uppercase">Active Board</label>
                <div className="text-xs text-slate-800 bg-slate-100 p-2.5 rounded-lg border border-slate-300 font-semibold dark:text-slate-300 dark:bg-slate-950 dark:border-white/5">{activeBoard?.title || "None"}</div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-600 dark:text-slate-500 uppercase">Class Title</label>
                <input type="text" placeholder="e.g. Class 11" value={newClassTitle} onChange={(e) => setNewClassTitle(e.target.value)} className="premium-input text-xs" required />
              </div>
              <button type="submit" disabled={!selectedBoardId} className="w-full premium-btn-primary py-2 text-xs disabled:opacity-50"><Plus className="w-3.5 h-3.5" /><span>Add Class Grade</span></button>
            </form>
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/5">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase">Class List</span>
              {activeBoard?.classes.length === 0 ? <p className="text-xs text-slate-600 dark:text-slate-500 text-center py-4">No classes.</p> : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {activeBoard?.classes.map((c) => (
                    <button key={c.id} onClick={() => setSelectedClassId(c.id)}
                      className={`w-full py-2 px-3 rounded-lg text-left text-xs transition-all border flex items-center justify-between ${selectedClassId === c.id ? "border-brand-royal bg-brand-royal/10 text-brand-royal font-semibold" : "border-transparent text-slate-700 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/60"}`}>
                      <span>{c.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subject Creator */}
          <div className="glass-card p-5 border-slate-200 dark:border-white/5 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-2">3. Dynamic Subjects</h4>
            <form onSubmit={handleAddSubject} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-600 dark:text-slate-500 uppercase">Context</label>
                <div className="text-[10px] text-slate-800 bg-slate-100 p-2.5 rounded-lg border border-slate-300 font-mono dark:text-slate-300 dark:bg-slate-950 dark:border-white/5">{activeBoard?.title} &gt; {activeClass?.title || "None"}</div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-600 dark:text-slate-500 uppercase">Subject Title</label>
                <input type="text" placeholder="e.g. Biology Elective" value={newSubjectTitle} onChange={(e) => setNewSubjectTitle(e.target.value)} className="premium-input text-xs" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-600 dark:text-slate-500 uppercase">Visual Accent</label>
                <select value={newSubjectColor} onChange={(e) => setNewSubjectColor(e.target.value)} className="premium-input text-xs">
                  {colors.map((c, i) => (<option key={i} value={c.value}>{c.label}</option>))}
                </select>
              </div>
              <button type="submit" disabled={!selectedClassId} className="w-full premium-btn-primary py-2 text-xs disabled:opacity-50"><Plus className="w-3.5 h-3.5" /><span>Create Subject</span></button>
            </form>
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/5">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase">Subjects</span>
              {!activeClass || activeClass.subjects.length === 0 ? <p className="text-xs text-slate-600 text-center py-4">None registered.</p> : (
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {activeClass.subjects.map((sub) => (
                    <div key={sub.id} className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs flex justify-between items-center text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                      <span>{sub.title}</span>
                      <span className={`w-3.5 h-3.5 rounded ${getSubjectSolidColor(sub.color)}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENT UPLOAD MODULE ─────────────────────────────────────────── */}
      {activeView === "admin-upload" && (
        <div className="space-y-6 animate-fade-in-up">

          {/* Status Toast */}
          {uploadStatus && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold border ${uploadStatus.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"}`}>
              {uploadStatus.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {uploadStatus.msg}
            </div>
          )}

          {/* Class / Subject Picker */}
          <div className="glass-card p-5 border-slate-200 dark:border-white/5">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Folder className="w-4 h-4 text-brand-royal" /> Select Class &amp; Subject
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Board */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase">Board</label>
                <div className="relative">
                  <select value={upBoardId} onChange={(e) => {
                    setUpBoardId(e.target.value);
                    const b = uploadBoards.find((x) => x.id === e.target.value);
                    const fc = b?.classes[0]; setUpClassId(fc?.id || ""); setUpSubjectId(fc?.subjects[0]?.id || "");
                  }} className="w-full premium-input text-xs appearance-none pr-8">
                    {uploadBoards.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              {/* Class */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase">Class</label>
                <div className="relative">
                  <select value={upClassId} onChange={(e) => {
                    setUpClassId(e.target.value);
                    const cls = upBoard?.classes.find((c) => c.id === e.target.value);
                    setUpSubjectId(cls?.subjects[0]?.id || "");
                  }} className="w-full premium-input text-xs appearance-none pr-8">
                    {(uploadBoards.find((b) => b.id === upBoardId)?.classes || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              {/* Subject */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase">Subject</label>
                <div className="relative">
                  <select value={upSubjectId} onChange={(e) => setUpSubjectId(e.target.value)} className="w-full premium-input text-xs appearance-none pr-8">
                    {(upClass?.subjects || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Notes / Assignments / Videos tabs */}
          <div className="flex gap-3">
            <button onClick={() => setUploadTab("notes")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${uploadTab === "notes" ? "bg-brand-royal text-white border-brand-royal shadow-md" : "bg-white dark:bg-slate-950 text-slate-600 border-slate-300 dark:border-white/10 hover:border-brand-royal/40"}`}>
              <BookOpen className="w-3.5 h-3.5" /> Notes &amp; PDFs
            </button>
            <button onClick={() => setUploadTab("assignments")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${uploadTab === "assignments" ? "bg-brand-royal text-white border-brand-royal shadow-md" : "bg-white dark:bg-slate-950 text-slate-600 border-slate-300 dark:border-white/10 hover:border-brand-royal/40"}`}>
              <FileText className="w-3.5 h-3.5" /> Assignments
            </button>
            {profile?.role !== "teacher" && (
              <button onClick={() => setUploadTab("videos")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${uploadTab === "videos" ? "bg-brand-royal text-white border-brand-royal shadow-md" : "bg-white dark:bg-slate-950 text-slate-600 border-slate-300 dark:border-white/10 hover:border-brand-royal/40"}`}>
                <Video className="w-3.5 h-3.5" /> Video Lectures
              </button>
            )}
          </div>

          {/* ── Notes Tab ──────────────────────────────────────────────────── */}
          {uploadTab === "notes" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Form */}
              <div className="glass-card p-5 border-slate-200 dark:border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Upload className="w-4 h-4 text-brand-royal" /> Upload Note / PDF
                </h4>
                <form onSubmit={handleUploadNote} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase">Note Title</label>
                    <input type="text" placeholder="Enter the note title" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} className="premium-input text-xs" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase">PDF</label>
                    <div
                      onClick={() => noteFileRef.current?.click()}
                      className="w-full border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-brand-royal/50 transition-colors group">
                      <File className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2 group-hover:text-brand-royal/50 transition-colors" />
                      {noteFile ? (
                        <p className="text-xs font-semibold text-brand-royal">{noteFile.name}</p>
                      ) : (
                        <p className="text-xs text-slate-500">Click to select PDF</p>
                      )}
                      <input ref={noteFileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          if (!file.name.toLowerCase().endsWith('.pdf')) {
                            showStatus("error", "Only PDF files are allowed.");
                            e.target.value = "";
                            setNoteFile(null);
                          } else if (file.size > 5 * 1024 * 1024) {
                            showStatus("error", "File size exceeds 5MB limit. Please upload a smaller file.");
                            e.target.value = "";
                            setNoteFile(null);
                          } else {
                            setNoteFile(file);
                          }
                        }
                      }} />
                    </div>
                  </div>
                  <button type="submit" disabled={uploading || !noteFile || !noteTitle || !upSubjectId}
                    className="w-full premium-btn-primary py-2.5 text-xs disabled:opacity-50">
                    {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>{uploading ? "Uploading…" : "Upload"}</span>
                  </button>
                </form>
              </div>

              {/* Notes List */}
              <div className="glass-card p-5 border-slate-200 dark:border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" /> Uploaded Notes ({notes.length})
                </h4>
                {notes.length === 0 ? (
                  <PremiumEmptyState
                    icon={BookOpen}
                    title="No notes uploaded"
                    description="Upload PDFs, reference materials, or lesson notes to get started."
                  />
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {notes.map((n) => (
                      <div key={n.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl">
                        <div className="flex items-center gap-2 min-w-0">
                          <File className="w-4 h-4 text-brand-royal flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{n.title}</p>
                            <a href={n.fileUrl} target="_blank" rel="noreferrer" className="text-[10px] text-brand-violet hover:underline truncate block">{n.fileUrl.split("/").pop()}</a>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteNote(n.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Assignments Tab ────────────────────────────────────────────── */}
          {uploadTab === "assignments" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create Assignment */}
              <div className="glass-card p-5 border-slate-200 dark:border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-royal" /> Create Assignment
                </h4>
                <form onSubmit={handleUploadAssignment} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase">Title</label>
                    <input type="text" placeholder="Assignment title" value={assignTitle} onChange={(e) => setAssignTitle(e.target.value)} className="premium-input text-xs" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase">Description</label>
                    <textarea placeholder="Instructions for students…" value={assignDesc} onChange={(e) => setAssignDesc(e.target.value)} className="premium-input text-xs h-20 resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase flex items-center gap-1 h-4"><Calendar className="w-3 h-3" /> Deadline</label>
                      <input type="datetime-local" value={assignDeadline} onChange={(e) => setAssignDeadline(e.target.value)} className="premium-input text-xs h-11 py-2" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase flex items-center h-4">Max Marks</label>
                      <input type="number" min="1" value={assignMaxMarks} onChange={(e) => setAssignMaxMarks(e.target.value)} className="premium-input text-xs h-11 py-2" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase">Attachment (optional)</label>
                    <div onClick={() => assignFileRef.current?.click()} className="w-full border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-brand-royal/50 transition-colors">
                      {assignFile ? <p className="text-xs font-semibold text-brand-royal">{assignFile.name}</p> : <p className="text-xs text-slate-500">Click to attach a file</p>}
                      <input ref={assignFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.zip" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file && file.size > 5 * 1024 * 1024) {
                          showStatus("error", "File size exceeds 5MB limit. Please upload a smaller file.");
                          e.target.value = "";
                          setAssignFile(null);
                        } else {
                          setAssignFile(file);
                        }
                      }} />
                    </div>
                  </div>
                  <button type="submit" disabled={uploading || !assignTitle || !assignDeadline || !upSubjectId} className="w-full premium-btn-primary py-2.5 text-xs disabled:opacity-50">
                    {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>{uploading ? "Creating…" : "Publish Assignment"}</span>
                  </button>
                </form>
              </div>

              {/* Assignments List */}
              <div className="glass-card p-5 border-slate-200 dark:border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" /> Assignments ({assignments.length})
                </h4>
                {assignments.length === 0 ? (
                  <PremiumEmptyState
                    icon={FileText}
                    title="No assignments"
                    description="Publish problems, tasks, or evaluations for students to submit."
                  />
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {assignments.map((a) => {
                      const isLocked = a.isLocked || new Date(a.deadline) < new Date();
                      return (
                        <div key={a.id} className={`p-4 rounded-xl border transition-all ${isLocked ? "bg-red-50/50 dark:bg-red-900/10 border-red-300/40 dark:border-red-500/20" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/5"}`}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {isLocked
                                  ? <span className="flex items-center gap-1 text-[9px] font-bold bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-300/50 px-2 py-0.5 rounded-full"><Lock className="w-2.5 h-2.5" /> Locked</span>
                                  : <span className="flex items-center gap-1 text-[9px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300/50 px-2 py-0.5 rounded-full"><Unlock className="w-2.5 h-2.5" /> Open</span>
                                }
                              </div>
                              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{a.title}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Deadline: {new Date(a.deadline).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                              </p>
                            </div>
                            <button onClick={() => handleDeleteAssignment(a.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex-shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {/* Deadline edit */}
                          {editDeadlineId === a.id ? (
                            <div className="flex gap-2 mt-2">
                              <input type="datetime-local" value={editDeadlineVal} onChange={(e) => setEditDeadlineVal(e.target.value)} className="premium-input text-[11px] py-1.5 flex-1" />
                              <button onClick={() => handleUpdateDeadline(a.id)} className="px-3 py-1.5 bg-brand-royal text-white text-[10px] font-bold rounded-lg hover:bg-brand-royal/90 transition-colors">Save</button>
                              <button onClick={() => setEditDeadlineId(null)} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg">Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => { setEditDeadlineId(a.id); setEditDeadlineVal(a.deadline ? a.deadline.slice(0, 16) : ""); }}
                              className="mt-2 text-[10px] text-brand-violet hover:underline font-semibold flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Edit Deadline / {isLocked ? "Unlock" : "Lock"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Videos Tab — hidden for teachers ─────────────────────────── */}
          {uploadTab === "videos" && profile?.role !== "teacher" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Video Form */}
                <div className="glass-card p-5 border-slate-200 dark:border-white/5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Upload className="w-4 h-4 text-brand-royal" /> Add Video Lecture
                  </h4>
                  <form onSubmit={handleUploadVideo} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase">Video Title</label>
                      <input type="text" placeholder="e.g. Introduction to Calculus" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} className="premium-input text-xs" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase">Duration (Minutes)</label>
                      <input type="number" min="1" placeholder="e.g. 20" value={videoDuration} onChange={(e) => setVideoDuration(e.target.value)} className="premium-input text-xs" required />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase block">Video Source</label>
                      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setVideoSourceType("file")}
                          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                            videoSourceType === "file"
                              ? "bg-white dark:bg-slate-800 text-brand-royal shadow-sm"
                              : "text-slate-600 hover:text-slate-900 dark:hover:text-slate-300"
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideoSourceType("url")}
                          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                            videoSourceType === "url"
                              ? "bg-white dark:bg-slate-800 text-brand-royal shadow-sm"
                              : "text-slate-600 hover:text-slate-900 dark:hover:text-slate-300"
                          }`}
                        >
                          Video URL / Embed URL
                        </button>
                      </div>
                    </div>

                    {videoSourceType === "file" ? (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase">Video File</label>
                        <div
                          onClick={() => videoFileRef.current?.click()}
                          className="w-full border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-brand-royal/50 transition-colors group">
                          <Video className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2 group-hover:text-brand-royal/50 transition-colors" />
                          {videoFile ? (
                            <p className="text-xs font-semibold text-brand-royal">{videoFile.name}</p>
                          ) : (
                            <p className="text-xs text-slate-500">Click to select MP4, WebM, or MOV video</p>
                          )}
                          <input ref={videoFileRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/x-matroska" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            const maxSize = drmProtected ? 500 * 1024 * 1024 : 5 * 1024 * 1024;
                            if (file && file.size > maxSize) {
                              showStatus("error", drmProtected
                                ? "File size exceeds 500MB limit for DRM videos."
                                : "File size exceeds 5MB limit. Enable DRM for larger uploads or use a smaller file.");
                              e.target.value = "";
                              setVideoFile(null);
                            } else {
                              setVideoFile(file);
                            }
                          }} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase">Video / Embed URL</label>
                        <input
                          type="url"
                          placeholder="e.g. https://youtu.be/aojFzrZPB4k?si=..."
                          value={embeddedVideoUrl}
                          onChange={(e) => setEmbeddedVideoUrl(e.target.value)}
                          className="premium-input text-xs"
                          required={videoSourceType === "url"}
                        />
                      </div>
                    )}

                    {videoSourceType === "file" && (
                      <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-brand-royal/20 bg-brand-royal/5">
                        <input
                          type="checkbox"
                          checked={drmProtected}
                          onChange={(e) => setDrmProtected(e.target.checked)}
                          className="rounded border-slate-300 text-brand-royal focus:ring-brand-royal"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-white block">Enable DRM protection</span>
                          <span className="text-[10px] text-slate-500">Encrypts new uploads as HLS/DASH. Requires FFmpeg on the server. Existing videos are unaffected.</span>
                        </div>
                      </label>
                    )}

                    <button type="submit" disabled={uploading || !videoTitle || !upSubjectId || (videoSourceType === "file" ? !videoFile : !embeddedVideoUrl)}
                      className="w-full premium-btn-primary py-2.5 text-xs disabled:opacity-50">
                      {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>{uploading ? "Saving Video…" : "Save Video Lecture"}</span>
                    </button>
                  </form>
                </div>

                {/* Videos List */}
                <div className="glass-card p-5 border-slate-200 dark:border-white/5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Video className="w-4 h-4 text-emerald-500" /> Uploaded Video Lectures ({videos.length})
                  </h4>
                  {videos.length === 0 ? (
                    <PremiumEmptyState
                      icon={Video}
                      title="No video lectures"
                      description="Upload video classes, recording playbacks, or screen captures."
                  />
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {videos.map((v) => (
                        <div key={v.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl">
                          <div className="flex items-center gap-2 min-w-0 font-sans">
                            <Video className="w-4 h-4 text-brand-royal flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{v.title}</p>
                              <span className="text-[10px] text-slate-500 block">Duration: {Math.round(v.duration / 60)} mins</span>
                              {v.drmEnabled && (
                                <span className="text-[9px] font-bold text-brand-royal uppercase tracking-wider">DRM Protected</span>
                              )}
                              {!v.drmEnabled && (
                                <a href={v.videoUrl} target="_blank" rel="noreferrer" className="text-[10px] text-brand-violet hover:underline truncate block">{v.videoUrl}</a>
                              )}
                            </div>
                          </div>
                          <button onClick={() => handleDeleteVideo(v.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex-shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* DRM Prompt Assistance Card */}
              <div className="glass-card p-5 border-slate-200 dark:border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Lock className="w-4 h-4 text-brand-royal" /> AI Assistant DRM Video Protection Guide
                  </h4>
                  <button
                    onClick={handleCopyPrompt}
                    className="px-3 py-1.5 bg-brand-royal hover:bg-brand-royal/90 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Copy Prompt
                  </button>
                </div>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-sans">
                  <p>
                    Want to implement industry-grade secure DRM video protection in your LMS? You can copy the engineering prompt below and feed it directly to <strong>Anti-gravity</strong> or another AI coding agent to implement the secure streaming layer.
                  </p>
                  <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-[10px] font-mono whitespace-pre-wrap max-h-96 overflow-y-auto border border-white/10 select-all">
                    {drmPromptText}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ANALYTICS DASHBOARD ───────────────────────────────────────────── */}
      {activeView === "admin-analytics" && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Active Subscriptions", value: `${analyticsData.activeSubscriptionsCount || 0} Scholars`, icon: Users, color: "text-blue-500" },
              { label: "Total Platform Revenue", value: formatRevenue(analyticsData.totalRevenue), icon: DollarSign, color: "text-emerald-500" },
              { label: "Server Uptime", value: `99.98% (${formatUptimeDuration(liveUptime)})`, icon: Activity, color: "text-violet-500" },
              { label: "Database Queries", value: liveQueries.toLocaleString(), icon: Database, color: "text-indigo-500" },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="glass-card p-5 border-slate-200 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-600 dark:text-slate-500 font-bold uppercase tracking-wider block">{stat.label}</span>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 block">{stat.value}</span>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6 border-slate-200 dark:border-white/5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Monthly Active Registrations</h4>
                </div>
                <div className="text-[10px] font-bold text-brand-violet dark:text-brand-violet-light bg-violet-500/10 px-2 py-0.5 rounded border border-brand-violet/20">+12.4% QoQ Growth</div>
              </div>
              <div className="h-80 w-full flex items-end pt-4 border-b border-slate-200 dark:border-white/5 relative">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                  <path 
                    d={(() => {
                      const monthlyCounts = analyticsData.monthlyActiveSubscriptions || Array(12).fill(0);
                      const janToJun = monthlyCounts.slice(0, 6);
                      const maxVal = Math.max(...janToJun, 1);
                      const points = janToJun.map((val: number, idx: number) => {
                        const x = (idx * 2 + 1) * (400 / 12);
                        const y = 135 - (val / maxVal) * 110;
                        return [x, y];
                      });
                      
                      const getPath = (pts: number[][]) => {
                        return pts.reduce((acc, pt, i, a) => {
                          if (i === 0) return `M ${pt[0]},${pt[1]}`;
                          const prev = a[i - 1];
                          const next = a[i + 1] || pt;
                          const prevPrev = a[i - 2] || prev;
                          
                          const cp1X = prev[0] + (pt[0] - prevPrev[0]) * 0.16;
                          const cp1Y = prev[1] + (pt[1] - prevPrev[1]) * 0.16;
                          const cp2X = pt[0] - (next[0] - prev[0]) * 0.16;
                          const cp2Y = pt[1] - (next[1] - prev[1]) * 0.16;
                          
                          return `${acc} C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${pt[0]},${pt[1]}`;
                        }, "");
                      };
                      return getPath(points);
                    })()} 
                    fill="none" 
                    stroke="url(#grad)" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" /><stop offset="50%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="w-full flex text-[9px] text-slate-600 dark:text-slate-500 font-bold mb-[-20px] relative z-10">
                  {["Jan","Feb","Mar","Apr","May","Jun"].map((m) => (
                    <span key={m} className="flex-1 text-center">{m}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card p-5 border-slate-200 dark:border-white/5 space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-2">Regional Distribution</h4>
                <div className="space-y-3 mt-4">
                  {analyticsData.regionalDistribution && analyticsData.regionalDistribution.length > 0 ? (
                    analyticsData.regionalDistribution.slice(0, 5).map((r: any, i: number) => (
                      <div key={i} className="space-y-1 text-xs">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{r.state}</span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">{r.percentage}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-violet" style={{ width: r.percentage }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-xs text-slate-500">
                      No regional registrations found in database.
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setView("admin-regional-distribution")}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors uppercase tracking-wider active:scale-95"
              >
                View Detailed Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── USER MANAGEMENT (STUDENTS) ────────────────────────────────────────── */}
      {activeView === "admin-users" && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-royal/10 dark:bg-brand-royal/20 text-brand-royal dark:text-blue-300 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Students info</h2>
              </div>
            </div>
            
            <button
              onClick={() => {
                setUserEmail("");
                setUserPassword("");
                setUserFirstName("");
                setUserLastName("");
                setUserRole("STUDENT");
                setUserBoardId(boards[0]?.id || "");
                setUserClassId(boards[0]?.classes[0]?.id || "");
                setUserLocation("");
                setIsCreateModalOpen(true);
              }}
              className="premium-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 rounded-xl shadow-md hover:shadow-brand-royal/15 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          </div>


          {/* Filter row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full premium-input pl-9 text-xs py-3 h-11"
              />
            </div>
            {/* Grade */}
            <div className="relative">
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full premium-input text-xs appearance-none pr-8 py-2.5 h-11 bg-white dark:bg-slate-950"
              >
                <option value="All Grades">All Grades</option>
                {["Class 9", "Class 10", "Class 11", "Class 12"].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-4 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
            {/* Subscriptions */}
            <div className="relative">
              <select
                value={subFilter}
                onChange={(e) => setSubFilter(e.target.value)}
                className="w-full premium-input text-xs appearance-none pr-8 py-2.5 h-11 bg-white dark:bg-slate-950"
              >
                <option value="All Subscriptions">All Subscriptions</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Pending">Pending</option>
              </select>
              <ChevronDown className="absolute right-3 top-4 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Toast / Error */}
          {usersError && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl text-center">
              {usersError}
            </div>
          )}

          {/* Student list card table */}
          <div className="glass-card border-slate-200 dark:border-white/5 overflow-hidden">
            {loadingUsers && usersList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin mb-3 text-slate-350" />
                <p className="text-xs">Fetching postgres users...</p>
              </div>
            ) : (() => {
              const studentsOnly = usersList.filter((u) => u.role === "STUDENT");
              const filteredStudents = studentsOnly.filter((student) => {
                const nameMatch = `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
                const emailMatch = (student.email || "").toLowerCase().includes(searchQuery.toLowerCase());
                const locationMatch = (student.location || "").toLowerCase().includes(searchQuery.toLowerCase());
                
                const sub = student.studentProfile?.subscriptions?.[0];
                const subStatus = sub?.status || "PENDING";
                
                const gradeVal = student.studentProfile?.class?.name || "Class 12";
                const matchesGrade = gradeFilter === "All Grades" || gradeVal === gradeFilter;

                const matchesSub = subFilter === "All Subscriptions" ||
                  (subFilter === "Active" && subStatus === "ACTIVE") ||
                  (subFilter === "Pending" && subStatus === "PENDING") ||
                  (subFilter === "Expired" && subStatus === "EXPIRED");

                return (nameMatch || emailMatch || locationMatch) && matchesGrade && matchesSub;
              });

              if (filteredStudents.length === 0) {
                return (
                  <div className="text-center py-20 text-slate-500">
                    <Users className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-755" />
                    <p className="text-xs font-semibold">No scholars found matching the active filters.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <div className="px-5 pt-5 flex justify-between items-center">
                    <span className="text-[10px] text-slate-600 dark:text-slate-500 font-bold uppercase tracking-wider">
                      Showing {filteredStudents.length} of {studentsOnly.length} students
                    </span>
                    <button onClick={fetchUsers} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500">
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? "animate-spin" : ""}`} />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/5 text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-extrabold bg-slate-50/50 dark:bg-slate-950/20">
                          <th className="py-4 px-6">Student</th>
                          <th className="py-4 px-6">Grade</th>
                          <th className="py-4 px-6">State</th>
                          <th className="py-4 px-6">Subscription</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {filteredStudents.map((student) => {
                          const sub = student.studentProfile?.subscriptions?.[0];
                          const subStatus = sub?.status || "PENDING";
                          const pay = sub?.payments?.[0];
                          const payStatus = pay?.status || "PENDING";

                          return (
                            <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                              {/* Student Info */}
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-royal/10 to-brand-violet/10 dark:from-brand-royal/20 dark:to-brand-violet/20 border border-brand-royal/10 text-brand-royal dark:text-brand-royal-300 font-bold flex items-center justify-center text-xs">
                                    {(student.firstName?.[0] || "S").toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                      {student.firstName} {student.lastName}
                                    </p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                                      {student.email}
                                    </p>
                                    {student.location && (
                                      <p className="text-[9px] text-slate-400 flex items-center gap-0.5 mt-0.5 font-medium">
                                        <span className="w-1.5 h-1.5 bg-brand-violet/50 rounded-full inline-block" />
                                        {student.location}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Grade */}
                              <td className="py-4 px-6 text-xs text-slate-700 dark:text-slate-300 font-medium">
                                {student.studentProfile?.class?.name || "Class 12"}
                              </td>

                              {/* State */}
                              <td className="py-4 px-6 text-xs text-slate-700 dark:text-slate-300 font-medium">
                                {student.location || "Not Specified"}
                              </td>

                              {/* Subscription Badge */}
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                                  subStatus === "ACTIVE"
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                    : subStatus === "PENDING"
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                    : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                }`}>
                                  {subStatus === "ACTIVE" ? "Active" : subStatus === "PENDING" ? "Pending" : "Expired"}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setActivatingStudent(student);
                                      setActivationPaymentStatus(payStatus === "SUCCESS" ? "SUCCESS" : "SUCCESS");
                                      setActivationPassword("");
                                      setActivationLocation(student.location || "");
                                      setActivationError("");
                                      setIsActivationModalOpen(true);
                                    }}
                                    className="p-2 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-400 hover:text-brand-royal dark:hover:text-white transition-colors"
                                    title="Edit student subscription and activate"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleDeleteUser(student.id)}
                                    className="p-2 rounded-lg border border-transparent hover:border-red-500/20 text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-colors"
                                    title="Delete Student"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      )}

      {/* ── USER MANAGEMENT (TEACHERS) ────────────────────────────────────────── */}
      {activeView === "admin-teachers" && (
        <div className="space-y-6 animate-fade-in-up text-left">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Teachers info</h2>
                <p className="text-xs text-slate-500">Educators database, phone contact details, and qualifications</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                setTeacherFullName("");
                setTeacherPhone("");
                setTeacherEmail("");
                setTeacherTempPassword("");
                setTeacherSubjectArea("Mathematics");
                setTeacherError("");
                setView("admin-add-teacher");
              }}
              className="premium-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 rounded-xl shadow-md hover:shadow-brand-royal/15 self-start sm:self-auto font-sans"
            >
              <Plus className="w-4 h-4" />
              <span>Add Teacher</span>
            </button>
          </div>

          {/* Filter row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, qualification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full premium-input pl-9 text-xs py-3 h-11"
              />
            </div>
            {/* Refresh */}
            <div className="flex justify-end items-center">
              <button onClick={fetchUsers} className="p-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 text-slate-500 flex items-center gap-2 text-xs font-semibold">
                <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? "animate-spin" : ""}`} />
                <span>Sync Directory</span>
              </button>
            </div>
          </div>

          {/* Teacher list card table */}
          <div className="glass-card border-slate-200 dark:border-white/5 overflow-hidden">
            {loadingUsers && usersList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin mb-3 text-slate-350" />
                <p className="text-xs">Fetching postgres users...</p>
              </div>
            ) : (() => {
              const teachersOnly = usersList.filter((u) => u.role === "TEACHER");
              const filteredTeachers = teachersOnly.filter((t) => {
                const nameMatch = `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
                const emailMatch = (t.email || "").toLowerCase().includes(searchQuery.toLowerCase());
                const phoneMatch = (t.phoneNumber || "").toLowerCase().includes(searchQuery.toLowerCase());
                const qualMatch = (t.teacherProfile?.qualification || "").toLowerCase().includes(searchQuery.toLowerCase());
                
                return nameMatch || emailMatch || phoneMatch || qualMatch;
              });

              if (filteredTeachers.length === 0) {
                return (
                  <div className="text-center py-20 text-slate-500">
                    <Users className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-750" />
                    <p className="text-xs font-semibold">No teachers found matching search criteria.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <div className="px-5 pt-5 flex justify-between items-center">
                    <span className="text-[10px] text-slate-650 dark:text-slate-500 font-bold uppercase tracking-wider">
                      Showing {filteredTeachers.length} of {teachersOnly.length} educators
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/5 text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-extrabold bg-slate-50/50 dark:bg-slate-950/20">
                          <th className="py-4 px-6">Teacher</th>
                          <th className="py-4 px-6">Subject Area</th>
                          <th className="py-4 px-6">Contact Number</th>
                          <th className="py-4 px-6">Email Address</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {filteredTeachers.map((teacher) => (
                          <tr key={teacher.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                            {/* Teacher Info */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 border border-emerald-500/10 text-emerald-600 dark:text-teal-300 font-bold flex items-center justify-center text-xs">
                                  {(teacher.firstName?.[0] || "T").toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {teacher.firstName} {teacher.lastName}
                                  </p>
                                  <span className="text-[9px] text-slate-400 block mt-0.5">
                                    Nexora Learning Instructor
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Subject Area */}
                            <td className="py-4 px-6 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                              {teacher.teacherProfile?.qualification || "Mathematics"}
                            </td>

                            {/* Phone Number */}
                            <td className="py-4 px-6 text-xs text-slate-755 dark:text-slate-300 font-mono">
                              {teacher.phoneNumber || "Not Provided"}
                            </td>

                            {/* Email */}
                            <td className="py-4 px-6 text-xs text-slate-550 dark:text-slate-400 font-medium">
                              {teacher.email}
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => handleDeleteUser(teacher.id)}
                                className="p-2 rounded-lg border border-transparent hover:border-red-500/20 text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-colors"
                                title="Delete Teacher"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── REGISTER TEACHER FRESH PAGE ────────────────────────────────────────── */}
      {activeView === "admin-add-teacher" && (
        <div className="space-y-6 animate-fade-in-up text-left">
          {/* Header row with back link */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("admin-teachers")}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Register Educator</h2>
              <p className="text-xs text-slate-550">Create credentials and issue temporary portal password</p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto glass-card p-6 sm:p-8 border-slate-200 dark:border-white/5 space-y-6">
            <div className="border-b border-slate-200 dark:border-white/5 pb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Educator Credentials Form</h3>
              <p className="text-xs text-slate-550 mt-1">Temporary password will be generated and dispatched automatically via Gmail SMTP.</p>
            </div>

            {teacherError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl text-center">
                {teacherError}
              </div>
            )}

            <form onSubmit={handleCreateTeacher} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-400 text-xs font-semibold">FN</span>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Ramesh Prasad"
                    value={teacherFullName}
                    onChange={(e) => setTeacherFullName(e.target.value)}
                    className="premium-input pl-10 text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Gmail / Academic Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="e.g. ramesh@gmail.com"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      className="premium-input pl-10 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Contact Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-slate-400 text-xs font-semibold">+91</span>
                    <input
                      type="tel"
                      placeholder="e.g. 9845012345"
                      value={teacherPhone}
                      onChange={(e) => setTeacherPhone(e.target.value)}
                      className="premium-input pl-12 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Subject Area select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Subject Specialization</label>
                <select
                  value={teacherSubjectArea}
                  onChange={(e) => setTeacherSubjectArea(e.target.value)}
                  className="w-full bg-slate-550 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-brand-royal"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                </select>
              </div>

              {/* Temporary Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Temporary Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
                      const numbers = '0123456789';
                      const generated = Array(8).fill(0).map(() => (uppercase + lowercase + numbers)[Math.floor(Math.random() * 62)]).join('');
                      setTeacherTempPassword(generated);
                    }}
                    className="text-[10px] text-brand-violet hover:underline font-semibold"
                  >
                    Auto Generate Password
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter temporary password for the teacher"
                    value={teacherTempPassword}
                    onChange={(e) => setTeacherTempPassword(e.target.value)}
                    className="premium-input pl-10 text-xs sm:text-sm font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setView("admin-teachers")}
                  className="px-5 py-2.5 text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTeacher}
                  className="premium-btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2"
                >
                  {creatingTeacher ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Add Teacher &amp; Send Mail</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── REGIONAL DISTRIBUTION FRESH PAGE ────────────────────────────────── */}
      {activeView === "admin-regional-distribution" && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setView("admin-analytics")}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Regional Student Distribution</h2>
              <p className="text-xs text-slate-500">State-wise student registration statistics and percentages</p>
            </div>
          </div>

          <div className="glass-card p-6 border-slate-200 dark:border-white/5 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-royal" />
                <span>Geographical Breakdown</span>
              </h4>
              <span className="text-xs text-slate-500 font-medium">Total Registered States: {analyticsData.regionalDistribution?.length || 0}</span>
            </div>

            {analyticsData.regionalDistribution && analyticsData.regionalDistribution.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analyticsData.regionalDistribution.map((r: any, i: number) => (
                  <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-2xl space-y-3 hover:border-slate-300 dark:hover:border-white/10 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">{r.state}</span>
                      <span className="text-xs font-bold text-brand-violet dark:text-brand-violet-light font-mono bg-violet-500/10 px-2.5 py-1 rounded-lg border border-brand-violet/20">
                        {r.percentage}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-brand-royal to-brand-violet rounded-full transition-all duration-500" style={{ width: r.percentage }} />
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold block text-right">{r.students} Active Scholars</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-750 animate-pulse" />
                <p className="text-xs font-semibold">No registered student states found in database console.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DRM VIDEO SHIELD DASHBOARD ─────────────────────────────────────────── */}
      {activeView === "drm-security" && (
        <div className="space-y-6 animate-fade-in-up text-left">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-brand-royal" /> DRM Video Shield Console
              </h2>
              <p className="text-xs text-slate-500 mt-1">Monitor and configure dynamic video encryption and secure stream delivery.</p>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 text-xs rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              DRM Server Engine Online
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Lectures", value: `${videos.length} Lectures`, icon: Video, color: "text-blue-500" },
              { label: "DRM Encrypted", value: `${videos.filter(v => v.drmEnabled).length} Secure`, icon: Lock, color: "text-emerald-500" },
              { label: "Standard Streaming", value: `${videos.filter(v => !v.drmEnabled).length} Standard`, icon: Unlock, color: "text-amber-500" },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="glass-card p-5 border-slate-200 dark:border-white/5 flex items-center justify-between bg-white dark:bg-slate-950/40">
                  <div>
                    <span className="text-[10px] text-slate-600 dark:text-slate-500 font-bold uppercase tracking-wider block">{stat.label}</span>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1.5 block">{stat.value}</span>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* DRM Video list */}
            <div className="lg:col-span-2 glass-card p-5 border-slate-200 dark:border-white/5 space-y-4 bg-white dark:bg-slate-950/40">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-white/5">
                <Lock className="w-4 h-4 text-brand-royal" /> DRM Encrypted Lectures
              </h4>
              {videos.filter(v => v.drmEnabled).length === 0 ? (
                <PremiumEmptyState
                  icon={Lock}
                  title="No DRM Lectures Found"
                  description="Use the 'Contents and assignments' tab to upload protected MP4 files."
                />
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {videos.filter(v => v.drmEnabled).map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-xl">
                      <div className="flex items-center gap-2 min-w-0 font-sans">
                        <Lock className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{v.title}</p>
                          <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wide mt-0.5">ID: {v.videoId || "hls-dash-stream"}</span>
                        </div>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Active Shield
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prompt Copy / Dev Card */}
            <div className="glass-card p-5 border-slate-200 dark:border-white/5 space-y-4 flex flex-col justify-between bg-white dark:bg-slate-950/40">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-2 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-brand-violet" /> Developer prompt
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  The LMS is equipped with Shaka Player and HLS/DASH support. Feed the engineering guidelines to your AI assistant to expand active streaming pipelines.
                </p>
                <div className="p-3 bg-slate-900 text-slate-300 rounded-xl text-[9px] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto border border-white/5 select-all">
                  {drmPromptText}
                </div>
              </div>
              <button
                onClick={handleCopyPrompt}
                className="w-full premium-btn-primary py-2.5 text-[10px] uppercase font-bold tracking-wider"
              >
                Copy Developer Guide
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Activation Overlay Modal */}
      {isActivationModalOpen && activatingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
              <Settings className="w-5 h-5 text-brand-royal" />
              <span>Activate Student Subscription</span>
            </h3>
            
            {activationError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-lg text-center">
                {activationError}
              </div>
            )}
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Student Name</label>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-white/5">
                  {activatingStudent.firstName} {activatingStudent.lastName}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Registered Email</label>
                <div className="text-xs font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-white/5">
                  {activatingStudent.email}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Payment Status</label>
                <select
                  value={activationPaymentStatus}
                  onChange={(e) => setActivationPaymentStatus(e.target.value as any)}
                  className="w-full premium-input text-xs"
                >
                  <option value="SUCCESS">Paid (SUCCESS)</option>
                  <option value="PENDING">Unpaid (PENDING)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">State</label>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-white/5">
                  {activatingStudent.location || "Not Specified"}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Temporary Password</label>
                <input
                  type="text"
                  placeholder="Enter temporary password for the student"
                  value={activationPassword}
                  onChange={(e) => setActivationPassword(e.target.value)}
                  className="w-full premium-input text-xs"
                  required
                />
                <p className="text-[9px] text-slate-400 mt-1">
                  Once sent, the student will receive an email containing this temporary password to log in.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => {
                  setIsActivationModalOpen(false);
                  setActivatingStudent(null);
                  setActivationPassword("");
                }}
                className="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleActivateStudent}
                disabled={activationLoading || !activationPassword}
                className="premium-btn-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                {activationLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send Activation Email</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Student Overlay Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-white/5">
              Register New Scholar
            </h3>

            {usersError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-505 text-xs font-semibold rounded-xl text-center">
                {usersError}
              </div>
            )}

            <form onSubmit={async (e) => {
              e.preventDefault();
              setUsersError("");
              try {
                const payload = {
                  email: userEmail,
                  password: userPassword,
                  firstName: userFirstName,
                  lastName: userLastName,
                  role: "STUDENT",
                  boardId: userBoardId,
                  classId: userClassId,
                  location: userLocation,
                };
                await authAPI.createUser(payload);
                setIsCreateModalOpen(false);
                setUserEmail("");
                setUserPassword("");
                setUserFirstName("");
                setUserLastName("");
                setUserLocation("");
                fetchUsers();
                fetchAnalytics();
                useLmsStore.getState().addNotification("Scholar Registered", `Scholar account ${userEmail} registered successfully.`, "success");
              } catch (err: any) {
                setUsersError(err.message || "Failed to register scholar.");
              }
            }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">First Name</label>
                  <input type="text" placeholder="e.g. Aarav" value={userFirstName} onChange={(e) => setUserFirstName(e.target.value)} className="premium-input text-xs" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Last Name</label>
                  <input type="text" placeholder="e.g. Sharma" value={userLastName} onChange={(e) => setUserLastName(e.target.value)} className="premium-input text-xs" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Academic Email</label>
                <input type="email" placeholder="e.g. aarav@gmail.com" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="premium-input text-xs" required />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Password</label>
                <input type="password" placeholder="e.g. password123" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} className="premium-input text-xs" required />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">State</label>
                <select
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  className="w-full premium-input text-xs"
                  required
                >
                  <option value="">-- Select State --</option>
                  {locationSuggestions.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-905 rounded-xl border border-slate-200 dark:border-white/5">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Opted Board</label>
                  <select value={userBoardId} onChange={(e) => {
                    setUserBoardId(e.target.value);
                    const matched = boards.find((b) => b.id === e.target.value);
                    setUserClassId(matched?.classes[0]?.id || "");
                  }} className="premium-input text-[11px] bg-white dark:bg-slate-950" required>
                    <option value="">-- Select Board --</option>
                    {boards.map((b) => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Class Grade</label>
                  <select value={userClassId} onChange={(e) => setUserClassId(e.target.value)} className="premium-input text-[11px] bg-white dark:bg-slate-950" required>
                    <option value="">-- Select Class --</option>
                    {boards.find((b) => b.id === userBoardId)?.classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="premium-btn-primary px-5 py-2 text-xs font-bold">Register Scholar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
