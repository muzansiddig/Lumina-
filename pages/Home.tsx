import React from 'react';
import { useAppContext } from '../App';
import CourseCard from '../components/CourseCard';
import { Link } from 'react-router-dom';
import { MessageSquare, HardDrive, Search } from 'lucide-react';

const HomePage: React.FC = () => {
  const { courses, user } = useAppContext();
  
  const localCourses = courses.filter(c => c.source === 'local').slice(0, 3);
  const onlineCourses = courses.filter(c => c.source === 'online').slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      
      {/* BEAUTIFUL EYE BANNER */}
      <div className="relative rounded-[32px] overflow-hidden mb-12 group shadow-xl shadow-violet-900/10">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[#6750A4]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[100px] opacity-40 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-fuchsia-500 rounded-full blur-[80px] opacity-30 -ml-20 -mb-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/50 to-transparent"></div>
        
        <div className="relative z-10 p-8 md:p-14 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h4 className="text-violet-200 font-medium tracking-wide text-sm uppercase mb-2">My Knowledge Hub</h4>
              <h1 className="text-4xl md:text-6xl font-display italic mb-6 leading-tight">
                Welcome back, <br/>
                <span className="not-italic font-normal">{user.name.split(' ')[0]}</span>
              </h1>
              <p className="text-violet-100 text-lg max-w-lg font-light leading-relaxed mb-8">
                Your AI-powered learning space is ready. Resume your studies or start a new journey with Believer.
              </p>
              
              <div className="flex flex-wrap gap-4">
                 <button className="bg-white text-violet-900 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-violet-50 transition-all shadow-lg flex items-center gap-2 group/btn">
                   <MessageSquare size={18} className="group-hover/btn:scale-110 transition-transform" />
                   Start Chat
                 </button>
                 <Link to="/library" className="glass hover:bg-white/20 text-white border border-white/30 px-8 py-3.5 rounded-full font-medium text-sm transition-all flex items-center gap-2">
                   Explore Library
                 </Link>
              </div>
            </div>

            {/* Decorative 'Eye' / Vision element */}
            <div className="hidden md:block relative">
               <div className="w-48 h-48 rounded-full border border-white/20 glass flex items-center justify-center relative animate-pulse" style={{animationDuration: '4s'}}>
                 <div className="w-32 h-32 rounded-full border border-white/30 glass flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.5)]"></div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Local Files Section */}
      <div className="mb-12">
        <div className="flex items-end justify-between mb-6 px-2">
          <div>
            <h2 className="text-3xl font-display text-[#1C1B1F]">Local Files</h2>
            <p className="text-stone-500 text-sm mt-1">From your device</p>
          </div>
          {localCourses.length > 0 && (
            <Link to="/library" className="text-[#6750A4] text-sm font-bold hover:bg-[#6750A4]/5 px-4 py-2 rounded-full transition-colors uppercase tracking-wider text-[11px]">
              View All
            </Link>
          )}
        </div>
        
        {localCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="bg-[#F3EDF7]/50 rounded-[24px] p-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-[#CAC4D0]/50 hover:border-[#6750A4]/30 transition-colors group">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
               <HardDrive className="text-[#49454F]" size={32} />
            </div>
            <h3 className="text-lg font-medium text-[#1C1B1F] mb-1">No local files yet</h3>
            <p className="text-[#49454F] text-sm">Use the chat to upload your first document.</p>
          </div>
        )}
      </div>

      {/* Online Resources Section */}
      <div className="mb-24">
        <div className="flex items-end justify-between mb-6 px-2">
          <div>
             <h2 className="text-3xl font-display text-[#1C1B1F]">Online Resources</h2>
             <p className="text-stone-500 text-sm mt-1">Curated from the web</p>
          </div>
          {onlineCourses.length > 0 && (
             <Link to="/library" className="text-[#6750A4] text-sm font-bold hover:bg-[#6750A4]/5 px-4 py-2 rounded-full transition-colors uppercase tracking-wider text-[11px]">
              View All
            </Link>
          )}
        </div>
        
        {onlineCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {onlineCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="bg-[#F3EDF7]/50 rounded-[24px] p-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-[#CAC4D0]/50 hover:border-[#6750A4]/30 transition-colors group">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Search className="text-[#49454F]" size={32} />
             </div>
             <h3 className="text-lg font-medium text-[#1C1B1F] mb-1">Explore the web</h3>
             <p className="text-[#49454F] text-sm">Ask the AI chat to find resources for you.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;