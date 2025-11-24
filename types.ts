export interface Course {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'image' | 'text' | 'video';
  source: 'local' | 'online';
  uploadDate: Date;
  content: string; // Text content or Base64
  summary?: string;
  keyPoints?: string[];
  objectives?: string[];
  thumbnail?: string;
  progress: number; // 0-100
  hasSummary: boolean;
  hasQuiz: boolean;
  studyPlan?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  attachment?: {
    type: 'image' | 'audio' | 'file';
    data: string; // Base64
    mimeType: string;
    fileName?: string;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
  joinDate: Date;
  bio: string;
  username: string;
  password: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: Date;
  completed: boolean;
  courseId?: string;
}

export interface Activity {
  id: string;
  type: 'upload' | 'quiz' | 'chat' | 'complete';
  description: string;
  timestamp: Date;
  courseId?: string;
}

export interface Teacher {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  style: 'balanced' | 'socratic' | 'simplified' | 'technical' | 'storytelling';
  systemInstruction: string;
  color: string;
}

export interface AppState {
  courses: Course[];
  user: UserProfile;
  tasks: Task[];
  activities: Activity[];
  teachers: Teacher[];
  activeTeacher: Teacher;
  addCourse: (course: Course) => void;
  getCourse: (id: string) => Course | undefined;
  updateCourseProgress: (id: string, progress: number) => void;
  toggleTask: (id: string) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  setActiveTeacher: (teacherId: string) => void;
}