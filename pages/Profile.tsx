import React, { useEffect, useState } from 'react';
import { useAppContext } from '../App';
import { supabase, checkSupabaseConnection } from '../services/supabase';
import { 
  User, Mail, Calendar, Settings, Award, 
  CheckCircle, Clock, BookOpen, Activity as ActivityIcon, 
  TrendingUp, CheckSquare, Zap, Shield, Cloud
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, tasks, activities, toggleTask, courses } = useAppContext();
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkSupabaseConnection();
      setIsCloudConnected(connected);
    };
    checkConnection();
  }, []);

  // Calculate generic stats
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const totalHours = Math.round(courses.length * 1.5); 

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-100 overflow-hidden mb-10 group hover:shadow-lg transition-shadow duration-500">
        <div className="h-40 bg-slate-900 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>
           
           <div className="absolute top-6 right-6">
            <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors backdrop-blur-md">
              <Settings size={20} />
            </button>
          </div>
        </div>
        <div className="px-10 pb-10 flex flex-col md:flex-row items-end md:items-center gap-8 -mt-16">
          <div className="w-32 h-32 bg-white p-1.5 rounded-3xl shadow-xl relative z-10 rotate-3 transition-transform group-hover:rotate-0 duration-500">
            <div className="w-full h-full bg-slate-100 rounded-2xl flex items-center justify-center text-slate-700 text-3xl font-bold font-display border border-stone-100">
              {user.avatar}
            </div>
          </div>
          <div className="flex-grow pt-4 md:pt-0">
            <h1 className="text-3xl font-bold text-slate-900 font-display">{user.name}</h1>
            <p className="text-stone-500 font-medium text-lg mt-1">{user.role}</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0 mb-2">
             <div className="px-5 py-2.5 bg-indigo-50 text-indigo-800 rounded-xl text-sm font-bold flex items-center gap-2 border border-indigo-100 shadow-sm">
                <Award size={18} className="text-indigo-600" />
                <span>Level 12 Scholar</span>
             </div>
          </div>
        </div>
        
        {/* Personal Details */}
        <div className="px-10 py-8 border-t border-stone-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center gap-4 group/item">
             <div className="w-10 h-10 rounded-full bg-stone-50 group-hover/item:bg-indigo-50 flex items-center justify-center text-stone-400 group-hover/item:text-indigo-500 transition-colors">
               <Mail size={18} />
             </div>
             <div>
               <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Email</p>
               <p className="text-sm font-semibold text-slate-700">{user.email}</p>
             </div>
          </div>
          <div className="flex items-center gap-4 group/item">
             <div className="w-10 h-10 rounded-full bg-stone-50 group-hover/item:bg-indigo-50 flex items-center justify-center text-stone-400 group-hover/item:text-indigo-500 transition-colors">
               <Calendar size={18} />
             </div>
             <div>
               <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Joined</p>
               <p className="text-sm font-semibold text-slate-700">{user.joinDate.toLocaleDateString()}</p>
             </div>
          </div>
          <div className="flex items-center gap-4 col-span-1 md:col-span-2 group/item">
             <div className="w-10 h-10 rounded-full bg-stone-50 group-hover/item:bg-indigo-50 flex items-center justify-center text-stone-400 group-hover/item:text-indigo-500 transition-colors">
               <User size={18} />
             </div>
             <div>
               <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Bio</p>
               <p className="text-sm text-stone-600 leading-relaxed">{user.bio}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Dashboard Stats & Tasks */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <BookOpen size={22} />
                  </div>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">+2 new</span>
               </div>
               <p className="text-3xl font-bold text-slate-900">{courses.length}</p>
               <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mt-1">Active Courses</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Clock size={22} />
                  </div>
               </div>
               <p className="text-3xl font-bold text-slate-900">{totalHours}h</p>
               <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mt-1">Study Time</p>
            </div>

             <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Zap size={22} />
                  </div>
               </div>
               <p className="text-3xl font-bold text-slate-900">{progressPercent}%</p>
               <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mt-1">Completion Rate</p>
            </div>
          </div>

          {/* Tasks List */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-stone-50 flex justify-between items-center bg-stone-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                <CheckSquare size={20} className="text-indigo-500" />
                Priorities
              </h2>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider">View All</button>
            </div>
            <div className="divide-y divide-stone-50">
              {tasks.map(task => (
                <div key={task.id} className="p-6 flex items-center gap-5 hover:bg-stone-50 transition-colors group">
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-stone-300 text-transparent hover:border-emerald-400'
                    }`}
                  >
                    <CheckCircle size={14} />
                  </button>
                  <div className="flex-grow">
                    <p className={`font-semibold text-base transition-colors ${task.completed ? 'text-stone-400 line-through' : 'text-slate-800 group-hover:text-indigo-900'}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-stone-400 font-medium mt-1">Due {task.dueDate.toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    task.completed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {task.completed ? 'Done' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

           {/* Learning Progress Chart (Visual Only) */}
           <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8">
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                 <TrendingUp size={20} className="text-indigo-500" />
                 Weekly Activity
               </h2>
             </div>
             <div className="h-48 flex items-end justify-between gap-4">
               {[35, 60, 25, 80, 55, 90, 45].map((h, i) => (
                 <div key={i} className="w-full flex flex-col items-center gap-3 group">
                   <div 
                    className="w-full bg-stone-100 rounded-xl relative group-hover:bg-indigo-100 transition-all duration-500 overflow-hidden" 
                    style={{height: '100%'}}
                   >
                     <div 
                        className="absolute bottom-0 left-0 right-0 bg-slate-800 group-hover:bg-indigo-600 transition-colors duration-500 rounded-xl"
                        style={{height: `${h}%`}}
                     ></div>
                   </div>
                   <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
                     {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                   </span>
                 </div>
               ))}
             </div>
           </div>

        </div>

        {/* Right Column: Timeline & Notifications */}
        <div className="space-y-8">
           <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8">
             <h2 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-3">
               <ActivityIcon size={20} className="text-indigo-500" />
               Timeline
             </h2>
             <div className="relative pl-4 border-l-2 border-stone-100 space-y-8">
               {activities.map(activity => (
                 <div key={activity.id} className="relative group">
                   <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ring-2 ring-stone-50 transition-colors ${
                     activity.type === 'upload' ? 'bg-blue-500' : 
                     activity.type === 'quiz' ? 'bg-emerald-500' : 'bg-indigo-500'
                   }`}></div>
                   <div className="group-hover:translate-x-1 transition-transform">
                     <p className="text-sm font-semibold text-slate-800 leading-snug">{activity.description}</p>
                     <p className="text-xs text-stone-400 font-medium mt-1.5 flex items-center gap-1">
                       {activity.timestamp.toLocaleDateString()} 
                       <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                       {activity.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </p>
                   </div>
                 </div>
               ))}
             </div>
           </div>

           {/* Login & Security */}
           <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <Shield size={20} className="text-indigo-500" />
                    Security
                </h2>
                <div className="space-y-6">
                    <div className="pb-4 border-b border-stone-50">
                        <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-1">Username</p>
                        <p className="text-sm font-bold text-slate-800">@{user.username}</p>
                    </div>
                     <div className="pb-4 border-b border-stone-50">
                        <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-1">Password</p>
                        <p className="text-sm font-bold text-slate-800 tracking-widest text-lg leading-none mt-1">
                            {'•'.repeat(8)}
                        </p>
                    </div>
                    <div className="pb-4 border-b border-stone-50">
                        <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-1">Cloud Sync</p>
                        <div className={`flex items-center gap-2 text-sm font-bold ${isCloudConnected ? 'text-emerald-600' : 'text-stone-400'}`}>
                            <Cloud size={16} /> {isCloudConnected ? 'Active' : 'Connecting...'}
                        </div>
                    </div>
                     <div>
                        <div className="flex items-center justify-between">
                             <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">2FA</p>
                             <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-md">
                                <CheckCircle size={12} /> On
                            </div>
                        </div>
                    </div>
                </div>
            </div>

           {/* Quick Access */}
           <div className="bg-slate-900 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 group-hover:opacity-30 transition-opacity"></div>
             
             <h3 className="text-xl font-bold mb-3 relative z-10">Need Help?</h3>
             <p className="text-slate-300 text-sm mb-6 leading-relaxed relative z-10 font-light">Your AI Tutor is ready to answer questions about your uploaded documents.</p>
             <button className="w-full bg-white text-slate-900 font-bold py-3.5 rounded-xl hover:bg-indigo-50 transition-colors relative z-10 shadow-lg">
               Start Chatting
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;