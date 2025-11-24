import React from 'react';
import { useAppContext } from '../App';
import { CheckCircle } from 'lucide-react';

const TeachersPage: React.FC = () => {
  const { teachers, activeTeacher, setActiveTeacher } = useAppContext();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-3">AI Teachers</h1>
        <p className="text-lg text-stone-500 max-w-2xl font-light">
          Select your personal AI instructor. Each teacher has a unique personality and teaching methodology tailored to different learning styles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => {
          const isActive = activeTeacher.id === teacher.id;
          return (
            <button
              key={teacher.id}
              onClick={() => setActiveTeacher(teacher.id)}
              className={`relative text-left p-6 rounded-[28px] transition-all duration-300 border-2 group hover:-translate-y-1 ${
                isActive 
                  ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-100' 
                  : 'bg-white border-transparent hover:border-stone-200 shadow-sm hover:shadow-lg'
              }`}
            >
              {isActive && (
                <div className="absolute top-4 right-4 text-indigo-600">
                  <CheckCircle size={24} fill="currentColor" className="text-white" />
                </div>
              )}
              
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm ${teacher.color}`}>
                {teacher.avatar}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-1 font-display">{teacher.name}</h3>
              <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">{teacher.role}</p>
              
              <p className="text-sm text-stone-600 leading-relaxed mb-6 min-h-[60px]">
                {teacher.description}
              </p>
              
              <div className={`py-3 px-4 rounded-xl text-xs font-bold text-center transition-colors ${
                isActive 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-stone-50 text-stone-500 group-hover:bg-stone-100'
              }`}>
                {isActive ? 'Currently Active' : 'Select Teacher'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TeachersPage;