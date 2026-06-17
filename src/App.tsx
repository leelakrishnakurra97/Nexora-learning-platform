import { useState, useEffect } from "react";
import { useLmsStore } from "./store/index";
import { Video } from "lucide-react";
import { academicAPI } from "./services/api";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { StudentDashboard } from "./components/StudentDashboard";
import { CourseLearningPage } from "./components/CourseLearningPage";
import { QuizInterface } from "./components/QuizInterface";
import { AssignmentPage } from "./components/AssignmentPage";
import { StudentProfile } from "./components/StudentProfile";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { AdminPortal } from "./components/AdminPortal";
import { AITutor } from "./components/AITutor";
import { RoomContainer } from "./components/LiveClass/RoomContainer";
import { NotesResourcesPage } from "./components/NotesResourcesPage";
import { ParentPortal } from "./components/ParentPortal";
import { DemoPanel } from "./components/DemoPanel";

function RoomJoinFallback() {
  const { setView, joinLiveRoom, profile } = useLmsStore();
  const [code, setCode] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [selectedClass, setSelectedClass] = useState("Class 11");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const allSubjects = ["Mathematics", "Physics", "Chemistry"];
  const allClasses = ["Class 9", "Class 10", "Class 11", "Class 12"];

  const handleJoinClass = async () => {
    if (!code.trim()) return;
    setErrorMsg("");
    setLoading(true);

    if (profile.role === "student") {
      try {
        const res = await fetch(`http://localhost:3000/api/live-class/mock/verify?roomName=${encodeURIComponent(code.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            joinLiveRoom({
              roomName: code.trim(),
              participantName: profile.name,
              isTeacher: false
            });
          } else {
            setErrorMsg("Invalid or inactive Room Code. Please wait for the teacher to start the session.");
          }
        } else {
          setErrorMsg("Could not verify room status. Please try again.");
        }
      } catch (err) {
        setErrorMsg("Network error: Could not reach verification endpoint.");
      } finally {
        setLoading(false);
      }
    } else {
      // Teachers can start/join any room code directly
      (window as any)._activeTeacherSubject = selectedSubject || "General Lecture";
      (window as any)._activeTeacherClass = selectedClass;
      joinLiveRoom({
        roomName: code.trim(),
        participantName: profile.name,
        isTeacher: true
      });
      setLoading(false);
    }
  };

  if (profile.role === "teacher") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-slate-350">
        <div className="glass-card rounded-none p-8 border-slate-200 dark:border-white/5 bg-emerald-500/5 flex flex-col max-w-md w-full shadow-2xl space-y-6">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-none flex items-center justify-center mb-4 text-emerald-500">
              <Video className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wider">Go Live</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center leading-normal">
              Enter a room code and select a subject to spin up an End-to-End Encrypted HD live stream.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Room Code
              </label>
              <input
                type="text"
                placeholder="Room code (e.g. physics-101)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-300 dark:border-white/10 rounded-none px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 text-center font-mono tracking-widest uppercase"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-white/10 rounded-none px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500/50"
              >
                {allClasses.map((cls) => (
                  <option key={cls} value={cls} className="text-slate-800 dark:text-slate-900">
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Subject Area
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-white/10 rounded-none px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500/50"
              >
                {allSubjects.map((sub) => (
                  <option key={sub} value={sub} className="text-slate-800 dark:text-slate-900">
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setView("teacher-dash")}
              className="flex-1 py-3 rounded-none bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-900 border border-slate-300 dark:border-white/5 text-slate-700 dark:text-slate-400 font-semibold text-xs transition-colors uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              onClick={handleJoinClass}
              disabled={!code.trim() || loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-none text-xs font-semibold disabled:opacity-50 transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Video className="w-4 h-4" />
              <span>{loading ? "Starting..." : "Start Live Session"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-slate-300">
      <div className="glass-card rounded-none p-8 border-slate-200 dark:border-white/5 bg-slate-900/50 flex flex-col items-center max-w-md w-full shadow-2xl">
        <div className="w-16 h-16 bg-brand-royal/20 rounded-none flex items-center justify-center mb-4 border border-white/5">
          <span className="text-2xl">🔒</span>
        </div>
        <h2 className="text-xl font-bold mb-2 text-white uppercase tracking-wider">Join Secure Session</h2>
        <p className="text-xs text-slate-400 mb-6 text-center leading-normal">
          Enter the room code provided by your teacher to connect to the End-to-End Encrypted stream.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-none bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center w-full">
            {errorMsg}
          </div>
        )}
        
        <input 
          type="text" 
          placeholder="e.g. maths-class-1" 
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setErrorMsg("");
          }}
          className="w-full bg-slate-950 border border-white/10 rounded-none px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-royal transition-colors mb-4 text-center font-mono tracking-widest uppercase"
        />
        
        <div className="flex gap-3 w-full">
          <button 
            onClick={() => setView("student-dash")} 
            className="flex-1 py-3 rounded-none bg-slate-950 hover:bg-slate-900 border border-white/5 text-slate-400 font-semibold text-xs transition-colors uppercase tracking-wider"
          >
            Cancel
          </button>
          <button 
            onClick={handleJoinClass}
            disabled={!code.trim() || loading}
            className="flex-1 bg-brand-royal hover:bg-brand-royal/90 text-white py-3 rounded-none text-xs font-semibold disabled:opacity-50 transition-colors uppercase tracking-wider"
          >
            {loading ? "Verifying..." : "Join Class"}
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { activeView, isDarkMode, setView, profile, boards, liveRoomState } = useLmsStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load academic structure from API when available
  useEffect(() => {
    academicAPI
      .getFullStructure()
      .then((boards) => {
        if (boards?.length) {
          useLmsStore.setState({ boards });
        }
      })
      .catch(() => {
        // keep demo boards when API is offline
      });
  }, []);

  // Synchronize mock IDs to database UUIDs whenever boards or profile changes
  useEffect(() => {
    if (boards?.length > 0 && profile && profile.id) {
      let updated = false;
      const newProfile = { ...profile };

      // 1. Board ID mapping
      const matchedBoard = boards.find(
        (b) =>
          b.id === profile.selectedBoardId ||
          b.code?.toLowerCase() === profile.selectedBoardId?.toLowerCase(),
      );
      if (matchedBoard && matchedBoard.id !== profile.selectedBoardId) {
        newProfile.selectedBoardId = matchedBoard.id;
        updated = true;
      }

      // 2. Class ID mapping
      const activeBoard = matchedBoard || boards[0];
      if (activeBoard) {
        const matchedClass = activeBoard.classes.find(
          (c) =>
            c.id === profile.selectedClassId ||
            c.title?.toLowerCase().replace(/\s+/g, "-") ===
              profile.selectedClassId?.toLowerCase().replace(/\s+/g, "-") ||
            (c.title === "Class 12" &&
              profile.selectedClassId === "class-12") ||
            (c.title === "Class 9" && profile.selectedClassId === "class-9"),
        );
        if (matchedClass && matchedClass.id !== profile.selectedClassId) {
          newProfile.selectedClassId = matchedClass.id;
          updated = true;
        }

        // 3. Subject ID mapping
        const activeClass = matchedClass || activeBoard.classes[0];
        if (activeClass) {
          const matchedSubject = activeClass.subjects.find(
            (s) =>
              s.id === profile.optedSubjectId ||
              s.title?.toLowerCase() ===
                profile.optedSubjectId?.toLowerCase() ||
              s.title?.toLowerCase().replace(/\s+/g, "-") ===
                profile.optedSubjectId?.toLowerCase().replace(/\s+/g, "-") ||
              (s.title === "Mathematics" &&
                profile.optedSubjectId === "maths-12") ||
              (s.title === "Chemistry" &&
                profile.optedSubjectId === "chemistry-12") ||
              (s.title === "Physics" &&
                profile.optedSubjectId === "physics-12"),
          );
          if (matchedSubject && matchedSubject.id !== profile.optedSubjectId) {
            newProfile.optedSubjectId = matchedSubject.id;
            updated = true;
          }
        }
      }

      if (updated) {
        useLmsStore.setState({
          profile: newProfile,
          activeSubjectId: newProfile.optedSubjectId,
        });
      }
    }
  }, [boards, profile]);

  // Sync URL hash with the store's activeView to support browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, "");
      const currentActiveView = useLmsStore.getState().activeView;
      if (hash && currentActiveView !== hash) {
        setView(hash);
      } else if (!hash && currentActiveView !== "landing") {
        setView("landing");
      }
    };

    window.addEventListener("hashchange", handleHashChange);

    // Sync on initial load
    const initialHash = window.location.hash.replace(/^#\/?/, "");
    const currentActiveView = useLmsStore.getState().activeView;
    if (initialHash && currentActiveView !== initialHash) {
      setView(initialHash);
    } else if (!initialHash) {
      window.location.hash = "/" + currentActiveView;
    }

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [setView]);

  // Sync window.location.hash when store state updates
  useEffect(() => {
    const currentHash = window.location.hash.replace(/^#\/?/, "");
    if (currentHash !== activeView) {
      window.location.hash = "/" + activeView;
    }
  }, [activeView]);

  // Define simple routing function based on state
  const renderActiveScreen = () => {
    switch (activeView) {
      case "student-dash":
        return <StudentDashboard />;
      case "course-view":
        return <CourseLearningPage />;
      case "notes-resources":
        return <NotesResourcesPage />;
      case "quiz-view":
        return <QuizInterface />;
      case "assignment-view":
        return <AssignmentPage />;
      case "profile-view":
        return <StudentProfile />;
      case "teacher-dash":
        return <TeacherDashboard />;
      case "admin-structure":
      case "admin-analytics":
      case "admin-upload":
        return <AdminPortal />;
      case "parent-portal":
        return <ParentPortal />;
      case "ai-tutor":
        return <AITutor />;
      case "webrtc-live":
        if (!liveRoomState) {
          return <RoomJoinFallback />;
        }
        return <RoomContainer roomName={liveRoomState.roomName} participantName={liveRoomState.participantName} isTeacher={liveRoomState.isTeacher} />;
      default:
        return <StudentDashboard />;
    }
  };

  const isPublicPage =
    activeView === "landing" ||
    activeView === "login" ||
    activeView === "signup" ||
    activeView === "ai-tutor" ||
    activeView === "quiz-view";

  return (
    <div
      className={`${isDarkMode ? "dark" : "light"} min-h-screen bg-white dark:bg-brand-navy-dark text-slate-800 dark:text-slate-100 transition-colors duration-300`}
    >
      {isPublicPage ? (
        // Public / Full-page screens do not require standard Sidebar/Header shells
        <>
          {activeView === "landing" && <LandingPage />}
          {activeView === "login" && <LoginPage />}
          {activeView === "signup" && <SignupPage />}
          {activeView === "ai-tutor" && <AITutor />}
          {activeView === "quiz-view" && <QuizInterface />}
        </>
      ) : (
        // Dashboard Shell structure
        <div className="flex min-h-screen">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-x-hidden">
            <Header onToggleSidebar={() => setIsSidebarOpen(true)} />

            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {renderActiveScreen()}
            </main>
          </div>
        </div>
      )}
      <DemoPanel />
    </div>
  );
}

export default App;
