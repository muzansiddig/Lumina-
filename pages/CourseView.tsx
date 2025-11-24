import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../App';
import { generateQuiz, chatWithDocument, generateStudyPlan } from '../services/geminiService';
import { QuizQuestion, ChatMessage } from '../types';
import { 
  ArrowLeft, BookOpen, MessageSquare, HelpCircle, CalendarRange,
  Send, Bot, User as UserIcon, CheckCircle, XCircle, Target, Cloud, HardDrive, MoreHorizontal, Sparkles
} from 'lucide-react';

const CourseView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCourse, addActivity, updateCourseProgress, activeTeacher } = useAppContext();
  const course = getCourse(id || '');
  const [activeTab, setActiveTab] = useState<'summary' | 'chat' | 'quiz' | 'studyPlan'>('summary');
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quiz State
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: number}>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Study Plan State
  const [studyPlan, setStudyPlan] = useState<any>(null);
  const [planLoading, setPlanLoading] = useState(false);

  // Initialize chat when teacher changes or component mounts
  useEffect(() => {
    if (activeTab === 'chat' && messages.length === 0) {
      setMessages([{ 
        id: '0', 
        role: 'model', 
        text: `Hello! I'm ${activeTeacher.name}. I've read the document and I'm ready to answer your questions in my style.`, 
        timestamp: new Date() 
      }]);
    }
  }, [activeTab, activeTeacher]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Progress Updates based on Activity
  useEffect(() => {
    if (!course) return;
    
    let currentProgress = course.progress;
    let newProgress = currentProgress;

    if (activeTab === 'summary' && currentProgress < 30) {
       newProgress = Math.max(newProgress, 30);
    }

    if (currentProgress !== newProgress) {
      updateCourseProgress(course.id, newProgress);
    }
  }, [activeTab, course, updateCourseProgress]);

  if (!course) {
    return <div className="p-20 text-center text-stone-500">Course not found</div>;
  }

  // Handle Chat
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    if (course.progress < 60) {
      updateCourseProgress(course.id, Math.max(course.progress, 60));
    }

    addActivity({
      type: 'chat',
      description: `Asked "${userMsg.text.substring(0, 30)}${userMsg.text.length > 30 ? '...' : ''}" in ${course.title}`,
      courseId: course.id
    });

    const history = messages.slice(1).map(m => ({ // Skip the first welcome message for history to keep it clean, or keep it.
      role: m.role,
      parts: [{ text: m.text }]
    }));

    // Pass the active teacher's instruction to the document chat service
    const responseText = await chatWithDocument(history, userMsg.text, course.content, activeTeacher.systemInstruction);
    
    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() };
    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  // Handle Quiz Gen
  const loadQuiz = async () => {
    if (quiz.length > 0) return;
    setQuizLoading(true);
    const questions = await generateQuiz(course.content);
    setQuiz(questions);
    setQuizLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'quiz') {
      loadQuiz();
    }
  }, [activeTab]);

  const handleQuizSubmit = () => {
    let score = 0;
    quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) score++;
    });
    setQuizScore(score);
    
    if (course.progress < 100) {
      updateCourseProgress(course.id, 100);
    }

    addActivity({
      type: 'quiz',
      description: `Completed Quiz: ${course.title} (Score: ${score}/${quiz.length})`,
      courseId: course.id
    });
  };

  // Handle Study Plan Gen
  const loadStudyPlan = async () => {
    if (studyPlan) return;
    setPlanLoading(true);
    const plan = await generateStudyPlan(course.content);
    setStudyPlan(plan);
    setPlanLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'studyPlan') {
      loadStudyPlan();
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-stone-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-stone-200 px-8 py-5 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-6">
          <Link to="/library" className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {course.title}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    course.source === 'online' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-stone-100 border-stone-200 text-stone-700'
                }`}>
                    {course.source}
                </span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-32 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                 <div className="bg-indigo-600 h-1.5 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)] transition-all duration-700" style={{width: `${course.progress}%`}}></div>
               </div>
               <span className="text-xs font-semibold text-stone-500">{course.progress}% Complete</span>
            </div>
          </div>
        </div>
        <button className="text-stone-400 hover:text-stone-600">
            <MoreHorizontal size={24} />
        </button>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-72 bg-white flex flex-col shrink-0 border-r border-stone-100 shadow-sm z-10">
          <div className="p-6 space-y-3">
            <p className="px-4 text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Modules</p>
            {[
                { id: 'summary', icon: <BookOpen size={18} />, label: 'Overview & Summary' },
                { id: 'chat', icon: <MessageSquare size={18} />, label: 'AI Tutor Chat' },
                { id: 'quiz', icon: <HelpCircle size={18} />, label: 'Knowledge Check' },
                { id: 'studyPlan', icon: <CalendarRange size={18} />, label: 'Smart Study Plan' },
            ].map((item) => (
                <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === item.id 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
                >
                {item.icon} {item.label}
                </button>
            ))}
          </div>
          
          <div className="mt-auto p-8 border-t border-stone-50">
             <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">About Content</h3>
                <div className="text-sm text-stone-600 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-stone-400">Type</span>
                    <span className="font-semibold bg-white px-2 py-1 rounded shadow-sm capitalize">{course.type}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-stone-400">Added</span>
                    <span className="font-semibold">{new Date(course.uploadDate).toLocaleDateString()}</span>
                </div>
                </div>
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto bg-stone-50/50 scrollbar-hide">
          
          {/* SUMMARY TAB */}
          {activeTab === 'summary' && (
            <div className="max-w-4xl mx-auto p-12">
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Objectives Section */}
                {course.objectives && course.objectives.length > 0 && (
                  <div className="bg-white border border-indigo-100 rounded-2xl p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <h2 className="text-lg font-bold text-indigo-900 mb-6 flex items-center gap-2 relative z-10">
                      <Target size={20} className="text-indigo-600" /> Learning Objectives
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                      {course.objectives.map((obj, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                          <span className="text-slate-700 text-sm leading-relaxed font-medium">{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-10">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 font-display">Executive Summary</h2>
                  {course.hasSummary ? (
                    <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-8">
                      {course.summary}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                      <p className="text-stone-500 mb-3">No summary generated yet.</p>
                      <button className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors">Generate Summary</button>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 px-2 font-display">Key Concepts</h2>
                  <div className="grid gap-5">
                    {course.keyPoints?.map((point, i) => (
                      <div key={i} className="flex gap-6 p-6 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all border border-transparent hover:border-indigo-100 group">
                        <div className="shrink-0 w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                          {i + 1}
                        </div>
                        <p className="text-slate-700 leading-relaxed pt-1.5 font-medium">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full relative bg-white">
              {/* Teacher Indicator */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b border-stone-100 px-8 py-3 flex items-center gap-3">
                 <span className="text-xl">{activeTeacher.avatar}</span>
                 <span className="text-sm font-bold text-slate-700">Talking to {activeTeacher.name}</span>
                 <Link to="/teachers" className="text-xs text-indigo-600 font-bold ml-auto hover:underline">Switch Teacher</Link>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-8 pt-20">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-white border border-stone-200 text-indigo-600'}`}>
                      {msg.role === 'user' ? <UserIcon size={18} /> : <span className="text-lg">{activeTeacher.avatar}</span>}
                    </div>
                    <div className={`max-w-[75%] rounded-3xl px-8 py-5 shadow-sm leading-7 ${
                      msg.role === 'user' 
                        ? 'bg-slate-800 text-white rounded-tr-none shadow-xl shadow-slate-900/10' 
                        : 'bg-stone-50 text-slate-800 rounded-tl-none border border-stone-100'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-5">
                     <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-indigo-600 shrink-0">
                       <span className="text-lg">{activeTeacher.avatar}</span>
                     </div>
                     <div className="bg-stone-50 px-6 py-4 rounded-3xl rounded-tl-none border border-stone-100 flex items-center gap-1.5">
                       <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                       <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                       <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                     </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-6 bg-white border-t border-stone-100 sticky bottom-0 z-10">
                <div className="max-w-3xl mx-auto relative group">
                  <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-xl group-focus-within:bg-indigo-500/10 transition-colors"></div>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={`Ask ${activeTeacher.name} about specific concepts...`}
                    className="w-full bg-white text-slate-800 rounded-full pl-8 pr-16 py-4 border border-stone-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all shadow-lg shadow-stone-200/50 relative z-10 placeholder-stone-400"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-slate-900 text-white rounded-full hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors z-20 shadow-md"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* QUIZ TAB */}
          {activeTab === 'quiz' && (
            <div className="max-w-3xl mx-auto p-12">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-2 font-display">Knowledge Check</h2>
                <p className="text-stone-500">Test your understanding of the material.</p>
              </div>
              
              {quizLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                  <p className="text-stone-500 font-medium">Crafting questions...</p>
                </div>
              ) : quiz.length > 0 ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                  {quizScore !== null && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center">
                      <p className="text-2xl font-bold text-emerald-800">
                        Score: {quizScore} / {quiz.length}
                      </p>
                    </div>
                  )}

                  {quiz.map((q, qIdx) => {
                    return (
                      <div key={qIdx} className="bg-white border border-stone-100 rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        <h3 className="font-bold text-slate-800 text-lg mb-6 leading-relaxed">{qIdx + 1}. {q.question}</h3>
                        <div className="space-y-3">
                          {q.options.map((option, oIdx) => {
                             let btnClass = "w-full text-left p-5 rounded-xl border-2 transition-all duration-200 font-medium ";
                             if (quizScore !== null) {
                               if (oIdx === q.correctAnswer) btnClass += "bg-emerald-50 border-emerald-500 text-emerald-700";
                               else if (quizAnswers[qIdx] === oIdx) btnClass += "bg-rose-50 border-rose-500 text-rose-700";
                               else btnClass += "border-transparent bg-stone-50 opacity-60";
                             } else {
                               btnClass += quizAnswers[qIdx] === oIdx 
                                 ? "bg-slate-800 border-slate-800 text-white shadow-lg shadow-slate-900/20" 
                                 : "border-stone-100 hover:border-indigo-200 hover:bg-stone-50 text-slate-600";
                             }

                             return (
                               <button
                                 key={oIdx}
                                 onClick={() => setQuizAnswers(prev => ({...prev, [qIdx]: oIdx}))}
                                 disabled={quizScore !== null}
                                 className={btnClass}
                               >
                                 <div className="flex items-center justify-between">
                                   <span>{option}</span>
                                   {quizScore !== null && oIdx === q.correctAnswer && <CheckCircle size={20} className="text-emerald-600" />}
                                   {quizScore !== null && quizAnswers[qIdx] === oIdx && oIdx !== q.correctAnswer && <XCircle size={20} className="text-rose-600" />}
                                 </div>
                               </button>
                             );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  
                  {quizScore === null && (
                    <button 
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(quizAnswers).length < quiz.length}
                      className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-600/20"
                    >
                      Submit Answers
                    </button>
                  )}
                  
                   {quizScore !== null && (
                    <button 
                      onClick={() => { setQuizScore(null); setQuizAnswers({}); }}
                      className="w-full bg-white text-slate-800 border-2 border-slate-200 py-5 rounded-2xl font-bold text-lg hover:bg-stone-50 transition-colors"
                    >
                      Retake Quiz
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-stone-400">
                  <p>No questions generated yet.</p>
                </div>
              )}
            </div>
          )}

          {/* STUDY PLAN TAB (Thinking Model) */}
          {activeTab === 'studyPlan' && (
            <div className="max-w-4xl mx-auto p-12">
               <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-2 font-display">Smart Study Plan</h2>
                <p className="text-stone-500">A 3-day structured schedule generated by Lumina AI.</p>
              </div>

              {planLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
                  <Sparkles className="w-12 h-12 text-indigo-500 animate-pulse mb-6" />
                  <p className="text-lg font-bold text-slate-800 mb-1">Thinking...</p>
                  <p className="text-stone-400">Gemini is analyzing complexity and structuring your schedule.</p>
                </div>
              ) : studyPlan?.days ? (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    {studyPlan.days.map((day: any, i: number) => (
                      <div key={i} className="bg-white border border-stone-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                         <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 group-hover:bg-indigo-600 transition-colors"></div>
                         <div className="ml-4">
                            <div className="flex items-center gap-3 mb-4">
                               <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs bg-indigo-50 px-3 py-1 rounded-full">{day.day}</span>
                               <h3 className="text-xl font-bold text-slate-900">{day.topic}</h3>
                            </div>
                            <ul className="space-y-3">
                               {day.activities.map((act: string, k: number) => (
                                  <li key={k} className="flex items-start gap-3 text-stone-600">
                                     <div className="mt-2 w-1.5 h-1.5 rounded-full bg-stone-300"></div>
                                     <span className="leading-relaxed">{act}</span>
                                  </li>
                               ))}
                            </ul>
                         </div>
                      </div>
                    ))}
                    <div className="flex justify-center mt-8">
                       <button className="text-indigo-600 font-bold hover:bg-indigo-50 px-6 py-3 rounded-full transition-colors text-sm uppercase tracking-wider">
                          Sync to Calendar
                       </button>
                    </div>
                 </div>
              ) : (
                <div className="text-center py-20 text-stone-400">
                  <p>Unable to generate plan. Please try again.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CourseView;