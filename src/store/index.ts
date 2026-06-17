import { create } from "zustand";
import type {
  LMSStore,
  Board,
  ClassLevel,
  Subject,
  Topic,
  AuthState,
  Profile,
  Notification,
  Assignment,
  Quiz,
  QuizResult,
  Bookmark,
} from "./types";

const makeId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now()}`;

const defaultProfile: Profile = {
  id: "",
  name: "Guest",
  username: "guest",
  password: "",
  email: "",
  role: "student",
  selectedBoardId: "",
  selectedClassId: "",
  optedSubjectId: "",
  age: "",
  location: "",
  xp: 0,
  level: 1,
  coins: 0,
  streak: 0,
  achievements: [],
  certificates: [],
};

const defaultBoards: Board[] = [];
const defaultAssignments: Assignment[] = [];
const defaultQuizzes: Quiz[] = [];
const defaultNotifications: Notification[] = [
  {
    id: makeId("notif"),
    title: "Welcome!",
    message: "Your Nexora Learning workspace is ready. Explore lessons, quizzes and assignments.",
    type: "info",
    read: false,
    time: new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  },
];

const getStoredProfile = (): Profile => {
  const stored = localStorage.getItem("lms_user_profile");
  if (stored) {
    try {
      return JSON.parse(stored) as Profile;
    } catch {
      return defaultProfile;
    }
  }
  return defaultProfile;
};

const getStoredActiveView = (): string => {
  const token = localStorage.getItem("auth_token");
  const stored = localStorage.getItem("lms_user_profile");
  if (token && stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed) {
        if (parsed.role === "admin") return "admin-analytics";
        if (parsed.role === "teacher") return "teacher-dash";
        return "student-dash";
      }
    } catch {
      return "landing";
    }
  }
  return "landing";
};

export const useLmsStore = create<LMSStore>((set) => ({
  auth: {
    isAuthenticated: localStorage.getItem("auth_token") !== null,
    user: null,
    token: localStorage.getItem("auth_token") || null,
    loading: false,
    error: null,
  },

  setAuth: (authUpdate: Partial<AuthState>) =>
    set((state) => ({ auth: { ...state.auth, ...authUpdate } })),

  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("lms_user_profile");
    set({
      auth: {
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      },
      profile: defaultProfile,
      activeView: "landing",
    });
  },

  activeView: getStoredActiveView(),
  setView: (view: string) => set({ activeView: view }),

  isDarkMode: localStorage.getItem("darkMode") === "true",
  toggleDarkMode: () =>
    set((state) => {
      const newDarkMode = !state.isDarkMode;
      localStorage.setItem("darkMode", String(newDarkMode));
      return { isDarkMode: newDarkMode };
    }),
  setTheme: (value: boolean) => {
    localStorage.setItem("darkMode", String(value));
    set({ isDarkMode: value });
  },

  selectedBoard: null,
  selectedClass: null,
  selectedSubject: null,
  setSelectedBoard: (board: Board) => set({ selectedBoard: board }),
  setSelectedClass: (classLevel: ClassLevel) =>
    set({ selectedClass: classLevel }),
  setSelectedSubject: (subject: Subject) => set({ selectedSubject: subject }),

  currentTopic: null,
  setCurrentTopic: (topic: Topic) => set({ currentTopic: topic }),

  profile: getStoredProfile(),
  boards: defaultBoards,
  assignments: defaultAssignments,
  quizzes: defaultQuizzes,
  activeQuizId: null,
  quizResults: [],
  notifications: defaultNotifications,
  bookmarks: [],
  liveRoomState: null,
  activeSubjectId: getStoredProfile() ? getStoredProfile().optedSubjectId : "",
  activeChapterId: "",
  activeTopicId: "",

  submitAssignment: (assignmentId, submissionFile) =>
    set((state) => ({
      assignments: state.assignments.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, submissionFile, status: "Submitted" }
          : assignment,
      ),
    })),

  gradeAssignment: (assignmentId, grade, feedback) =>
    set((state) => ({
      assignments: state.assignments.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, status: "Graded", grade, feedback }
          : assignment,
      ),
    })),

  setActiveQuiz: (quizId) => set({ activeQuizId: quizId }),

  submitQuizResult: (result) =>
    set((state) => ({ quizResults: [...state.quizResults, result] })),

  addNotification: (title, message, type) =>
    set((state) => ({
      notifications: [
        {
          id: makeId("notif"),
          title,
          message,
          type,
          read: false,
          time: new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...state.notifications,
      ],
    })),

  readAllNotifications: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    })),

  addBookmark: (bookmark, timestamp) =>
    set((state) => ({
      bookmarks: [
        {
          id: makeId("bookmark"),
          timestamp,
          ...bookmark,
        },
        ...state.bookmarks,
      ],
    })),

  deleteBookmark: (bookmarkId) =>
    set((state) => ({
      bookmarks: state.bookmarks.filter(
        (bookmark) => bookmark.id !== bookmarkId,
      ),
    })),

  setActiveCourseContext: (subjectId, chapterId, topicId) =>
    set((state) => ({
      activeSubjectId: subjectId || state.activeSubjectId,
      activeChapterId: chapterId || state.activeChapterId,
      activeTopicId: topicId || state.activeTopicId,
    })),

  completeTopic: (boardId, classId, subjectId, chapterId, topicId) =>
    set((state) => ({
      boards: state.boards.map((board) =>
        board.id !== boardId
          ? board
          : {
              ...board,
              classes: board.classes.map((classLevel) =>
                classLevel.id !== classId
                  ? classLevel
                  : {
                      ...classLevel,
                      subjects: classLevel.subjects.map((subject) =>
                        subject.id !== subjectId
                          ? subject
                          : {
                              ...subject,
                              chapters: subject.chapters.map((chapter) =>
                                chapter.id !== chapterId
                                  ? chapter
                                  : {
                                      ...chapter,
                                      topics: chapter.topics.map((topic) =>
                                        topic.id !== topicId
                                          ? topic
                                          : { ...topic, isCompleted: true },
                                      ),
                                    },
                              ),
                            },
                      ),
                    },
              ),
            },
      ),
      profile: {
        ...state.profile,
        xp: state.profile.xp + 50,
        coins: state.profile.coins + 10,
        streak: state.profile.streak + 1,
      },
    })),

  joinLiveRoom: (state) => set({ liveRoomState: state }),

  addBoard: (title) =>
    set((state) => ({
      boards: [
        ...state.boards,
        {
          id: makeId("board"),
          title,
          classes: [],
        },
      ],
    })),

  addClass: (boardId, classTitle) =>
    set((state) => ({
      boards: state.boards.map((board) =>
        board.id !== boardId
          ? board
          : {
              ...board,
              classes: [
                ...board.classes,
                {
                  id: makeId("class"),
                  title: classTitle,
                  subjects: [],
                },
              ],
            },
      ),
    })),

  addSubject: (boardId, classId, subjectTitle, subjectColor) =>
    set((state) => ({
      boards: state.boards.map((board) =>
        board.id !== boardId
          ? board
          : {
              ...board,
              classes: board.classes.map((classLevel) =>
                classLevel.id !== classId
                  ? classLevel
                  : {
                      ...classLevel,
                      subjects: [
                        ...classLevel.subjects,
                        {
                          id: makeId("subject"),
                          title: subjectTitle,
                          color: subjectColor,
                          imageUrl: undefined,
                          chapters: [],
                        },
                      ],
                    },
              ),
            },
      ),
    })),
}));

useLmsStore.subscribe((state) => {
  if (state.profile && state.profile.id !== "student-001") {
    localStorage.setItem("lms_user_profile", JSON.stringify(state.profile));
  }
});

export type { LMSStore } from "./types";
