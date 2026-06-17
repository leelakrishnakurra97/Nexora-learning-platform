import os

store_path = r"d:\LMS1-main\src\store\index.ts"

with open(store_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace defaultProfile
old_profile = """const defaultProfile: Profile = {
  id: "student-001",
  name: "Prathamesh Sharma",
  username: "prathamesh",
  password: "1234",
  email: "prathamesh@nexoralearning.in",
  role: "student",
  selectedBoardId: "tnsb",
  selectedClassId: "class-12",
  optedSubjectId: "maths-12-v1",
  age: "17",
  location: "Chennai",
  xp: 2100,
  level: 7,
  coins: 84,
  streak: 9,
  achievements: [
    {
      id: "ach-1",
      title: "Fresh Scholar",
      description: "Created an Nexora Learning account",
      icon: "🌱",
      unlockedAt: new Date().toLocaleDateString("en-IN"),
    },
  ],
  certificates: [],
};"""

new_profile = """const defaultProfile: Profile = {
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
};"""

if old_profile in content:
    content = content.replace(old_profile, new_profile)
    print("Replaced defaultProfile")
else:
    print("Could not find defaultProfile precisely; trying substring replacement")

# We locate where defaultBoards starts: "const defaultBoards: Board[] = ["
# and where defaultNotifications ends.
# Let's search using indices.
start_str = "const defaultBoards: Board[] = ["
end_str = "const defaultNotifications: Notification[] = [\n  {\n    id: makeId(\"notif\"),\n    title: \"Welcome!\",\n    message:\n      \"Your Nexora Learning workspace is ready. Explore lessons, quizzes and assignments.\",\n    type: \"info\",\n    read: false,\n    time: new Date().toLocaleTimeString(\"en-IN\", {\n      hour: \"2-digit\",\n      minute: \"2-digit\",\n    }),\n  },\n];"

# We want to replace from start_str up to the end of the block.
# Let's use string split/find.
start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    end_block_idx = end_idx + len(end_str)
    
    new_static_block = """const defaultBoards: Board[] = [];
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
];"""
    
    content = content[:start_idx] + new_static_block + content[end_block_idx:]
    print("Replaced defaultBoards through defaultNotifications")
else:
    print(f"Indices not found. start_idx: {start_idx}, end_idx: {end_idx}")

# Also replace activeSubjectId, activeChapterId, activeTopicId
# Let's inspect the exact content near the end.
old_actives = """  activeSubjectId: getStoredProfile().optedSubjectId,
  activeChapterId: "maths-12-v1-ch1",
  activeTopicId: "cl12-maths-v1-ch1-t1","""

new_actives = """  activeSubjectId: getStoredProfile() ? getStoredProfile().optedSubjectId : "",
  activeChapterId: "",
  activeTopicId: "","""

if old_actives in content:
    content = content.replace(old_actives, new_actives)
    print("Replaced active IDs")

# Replace auth state logic
old_auth = 'isAuthenticated: localStorage.getItem("auth_token") !== null || (localStorage.getItem("lms_user_profile") !== null && JSON.parse(localStorage.getItem("lms_user_profile") || "{}").id !== "student-001"),'
new_auth = 'isAuthenticated: localStorage.getItem("auth_token") !== null,'

if old_auth in content:
    content = content.replace(old_auth, new_auth)
    print("Replaced auth check")

# Also replace getStoredActiveView to redirect standard guests
old_view = """const getStoredActiveView = (): string => {
  const stored = localStorage.getItem("lms_user_profile");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.id !== "student-001") {
        return parsed.role === "teacher" ? "teacher-dash" : "student-dash";
      }
    } catch {
      return "landing";
    }
  }
  return "landing";
};"""

new_view = """const getStoredActiveView = (): string => {
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
};"""

if old_view in content:
    content = content.replace(old_view, new_view)
    print("Replaced getStoredActiveView")

with open(store_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Finished store cleanup.")
