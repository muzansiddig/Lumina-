import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, User as UserIcon, Eye, GraduationCap } from 'lucide-react';
import { Course, AppState, UserProfile, Task, Activity, Teacher } from './types';
import HomePage from './pages/Home';
import LibraryPage from './pages/Library';
import CourseView from './pages/CourseView';
import ProfilePage from './pages/Profile';
import TeachersPage from './pages/Teachers';
import FloatingChat from './components/FloatingChat';

// --- Teachers Data ---
const TEACHERS: Teacher[] = [
  {
    id: 'lumina',
    name: 'Lumina',
    role: 'Balanced Guide',
    description: 'The standard Lumina experience. Balanced, academic, and resourceful. Specializes in finding OER materials.',
    avatar: '👁️',
    style: 'balanced',
    color: 'bg-indigo-100 text-indigo-700',
    systemInstruction: `You are 'Lumina', a balanced and helpful educational guide.
    You prioritize clarity, academic accuracy, and providing Open Educational Resources (OER).
    Your tone is professional yet encouraging.
    Always structure your answers with clear headings and bullet points.`
  },
  {
    id: 'socrates',
    name: 'Socrates',
    role: 'Philosopher',
    description: 'Teaches by asking questions. Helps you discover the truth yourself through critical thinking.',
    avatar: '🏛️',
    style: 'socratic',
    color: 'bg-stone-100 text-stone-700',
    systemInstruction: `You are Socrates. You do not give direct answers easily. 
    Instead, you use the Socratic method: you ask probing questions to guide the student to the answer.
    Your goal is to foster critical thinking. Challenge assumptions.
    Keep your tone wise, slightly archaic but accessible, and patient.`
  },
  {
    id: 'feynman',
    name: 'Dr. Feynman',
    role: 'Simplifier',
    description: 'The great explainer. Uses simple analogies and plain language to explain complex topics.',
    avatar: '⚛️',
    style: 'simplified',
    color: 'bg-amber-100 text-amber-700',
    systemInstruction: `You are modeled after Richard Feynman. 
    Your superpower is explaining complex topics in simple, intuitive ways using real-world analogies.
    Avoid jargon. If you must use a technical term, define it immediately.
    Be enthusiastic, informal, and focus on the "why" and "how" things work.`
  },
  {
    id: 'ada',
    name: 'Ada',
    role: 'Technologist',
    description: 'Precise, logical, and code-focused. Perfect for STEM, programming, and structural analysis.',
    avatar: '💻',
    style: 'technical',
    color: 'bg-cyan-100 text-cyan-700',
    systemInstruction: `You are Ada. You are precise, logical, and technically rigorous.
    You prefer structured data, code snippets, and mathematical proofs over prose.
    When explaining, break things down into algorithms or step-by-step logic.
    You are efficient and direct.`
  },
  {
    id: 'maya',
    name: 'Maya',
    role: 'Storyteller',
    description: 'Weaves facts into narratives. Great for history, literature, and making content memorable.',
    avatar: '📜',
    style: 'storytelling',
    color: 'bg-rose-100 text-rose-700',
    systemInstruction: `You are Maya, a master storyteller.
    You believe humans learn best through stories.
    When explaining a concept, weave it into a narrative or provide historical context.
    Focus on the human element, emotions, and the dramatic arc of information.
    Your tone is warm, empathetic, and engaging.`
  }
];

// --- State Management ---
const AppContext = createContext<AppState | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTeacher, setActiveTeacherState] = useState<Teacher>(TEACHERS[0]);
  
  // Mock User Data
  const [user] = useState<UserProfile>({
    name: "Alex Morgan",
    email: "alex.morgan@university.edu",
    role: "Undergraduate Student",
    avatar: "AM",
    joinDate: new Date('2023-09-01'),
    bio: "Computer Science major with a passion for AI and history.",
    username: "alex_morgan_edu",
    password: "password123"
  });

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Review "Intro to Psychology"', dueDate: new Date(Date.now() + 86400000), completed: false },
    { id: '2', title: 'Complete Quiz: Modern History', dueDate: new Date(Date.now() - 3600000), completed: true },
    { id: '3', title: 'Upload Thesis Draft', dueDate: new Date(Date.now() + 172800000), completed: false },
  ]);

  const [activities, setActivities] = useState<Activity[]>([
    { id: '1', type: 'upload', description: 'Uploaded "Advanced Calculus Notes"', timestamp: new Date(Date.now() - 7200000) },
    { id: '2', type: 'quiz', description: 'Scored 85% in "Biology 101"', timestamp: new Date(Date.now() - 86400000) },
    { id: '3', type: 'chat', description: 'Asked about "Quantum Mechanics"', timestamp: new Date(Date.now() - 172800000) },
  ]);

  // Load courses from local storage
  useEffect(() => {
    const savedCourses = localStorage.getItem('lumina_courses');
    if (savedCourses) {
      try {
        const parsed = JSON.parse(savedCourses);
        parsed.forEach((c: any) => c.uploadDate = new Date(c.uploadDate));
        setCourses(parsed);
      } catch (e) {
        console.error("Failed to load courses", e);
      }
    }
  }, []);

  // Load activities from local storage
  useEffect(() => {
    const savedActivities = localStorage.getItem('lumina_activities');
    if (savedActivities) {
      try {
        const parsed = JSON.parse(savedActivities);
        parsed.forEach((a: any) => a.timestamp = new Date(a.timestamp));
        setActivities(parsed);
      } catch (e) {
        console.error("Failed to load activities", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lumina_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('lumina_activities', JSON.stringify(activities));
  }, [activities]);

  const addActivity = (activityData: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      timestamp: new Date(),
      ...activityData
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const addCourse = (course: Course) => {
    setCourses(prev => [course, ...prev]);
    addActivity({
      type: 'upload',
      description: `Added "${course.title}" to Library`,
      courseId: course.id
    });
  };

  const getCourse = (id: string) => courses.find(c => c.id === id);

  const updateCourseProgress = (id: string, progress: number) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, progress } : c));
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const setActiveTeacher = (teacherId: string) => {
    const teacher = TEACHERS.find(t => t.id === teacherId);
    if (teacher) {
      setActiveTeacherState(teacher);
    }
  };

  return (
    <AppContext.Provider value={{ 
      courses, user, tasks, activities, teachers: TEACHERS, activeTeacher,
      addCourse, getCourse, updateCourseProgress, toggleTask, addActivity, setActiveTeacher 
    }}>
      {children}
    </AppContext.Provider>
  );
};

// --- Material 3 Navigation Bar ---

const NavBarItem: React.FC<{ to: string; icon: React.ReactNode; label: string; activeIcon: React.ReactNode }> = ({ to, icon, label, activeIcon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link to={to} className="flex flex-col items-center justify-center gap-1.5 group w-16 my-1">
      <div className={`w-14 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
        isActive ? 'bg-[#E8DEF8] text-[#1D192B]' : 'bg-transparent text-[#49454F] group-hover:bg-[#F4EFF4]'
      }`}>
        {isActive ? activeIcon : icon}
      </div>
      <span className={`text-[11px] font-medium tracking-wide transition-colors ${
        isActive ? 'text-[#1D192B]' : 'text-[#49454F]'
      }`}>
        {label}
      </span>
    </Link>
  );
};

const NavigationRail = () => {
  return (
    <nav className="fixed bottom-0 left-0 w-full h-20 bg-[#F3EDF7] border-t border-gray-200/50 flex items-center justify-around md:justify-center md:gap-8 z-40 md:static md:w-24 md:h-screen md:flex-col md:justify-start md:pt-10 md:bg-[#FFFBFE] md:border-r md:border-t-0 shadow-sm md:shadow-none">
       <div className="hidden md:flex mb-12 flex-col items-center">
         {/* DISTINCTIVE EYE LOGO */}
         <Link to="/" className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-800 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-violet-200 rotate-3 hover:rotate-0 transition-transform duration-500 cursor-pointer group">
           <Eye size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
         </Link>
       </div>
       <NavBarItem 
         to="/" 
         icon={<Home size={24} strokeWidth={1.5} />} 
         activeIcon={<Home size={24} fill="currentColor" className="text-[#1D192B]" />}
         label="Home" 
       />
       <NavBarItem 
         to="/library" 
         icon={<LayoutGrid size={24} strokeWidth={1.5} />} 
         activeIcon={<LayoutGrid size={24} fill="currentColor" className="text-[#1D192B]" />}
         label="Library" 
       />
       <NavBarItem 
         to="/teachers" 
         icon={<GraduationCap size={24} strokeWidth={1.5} />} 
         activeIcon={<GraduationCap size={24} fill="currentColor" className="text-[#1D192B]" />}
         label="Teachers" 
       />
       <NavBarItem 
         to="/profile" 
         icon={<UserIcon size={24} strokeWidth={1.5} />} 
         activeIcon={<UserIcon size={24} fill="currentColor" className="text-[#1D192B]" />}
         label="Profile" 
       />
    </nav>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <div className="flex flex-col md:flex-row min-h-screen bg-[#FFFBFE] text-[#1C1B1F]">
          <NavigationRail />
          
          <div className="flex-grow flex flex-col h-screen overflow-hidden relative">
            {/* Mobile Top Bar */}
            <header className="md:hidden h-16 bg-[#F3EDF7] flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
               <span className="text-xl font-display font-medium text-[#1C1B1F]">Lumina</span>
               <div className="w-8 h-8 rounded-full bg-violet-200 text-violet-800 flex items-center justify-center font-bold text-xs">
                 AM
               </div>
            </header>

            <main className="flex-grow overflow-y-auto pb-24 md:pb-0 scroll-smooth">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/course/:id" element={<CourseView />} />
                <Route path="/teachers" element={<TeachersPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </main>
          </div>
          
          <FloatingChat />
        </div>
      </HashRouter>
    </AppProvider>
  );
};

export default App;