import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Image as ImageIcon, Video, Cloud, HardDrive, MoreVertical } from 'lucide-react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const getIcon = () => {
    switch (course.type) {
      case 'image': return <ImageIcon className="w-5 h-5 text-violet-700" />;
      case 'video': return <Video className="w-5 h-5 text-violet-700" />;
      default: return <FileText className="w-5 h-5 text-violet-700" />;
    }
  };

  return (
    <Link to={`/course/${course.id}`} className="block h-full">
      {/* Distinctive M3 Card: Soft Surface, Clean Elevation */}
      <div className="bg-[#FFFBFE] hover:bg-[#F3EDF7] rounded-[24px] overflow-hidden transition-all duration-300 group relative border border-[#E7E0EC] hover:border-[#D0BCFF] hover:shadow-lg h-full flex flex-col">
        
        {/* Progress Indicator (M3 LinearProgress) */}
        {course.progress > 0 && (
           <div className="absolute top-0 left-0 right-0 h-1 bg-[#F3EDF7]">
              <div 
                className="h-full bg-violet-600 transition-all duration-700 ease-out"
                style={{ width: `${course.progress}%` }}
              ></div>
           </div>
        )}

        <div className="p-5 flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
             <div className="w-12 h-12 rounded-2xl bg-[#F3EDF7] group-hover:bg-white flex items-center justify-center shadow-sm transition-colors duration-300">
               {getIcon()}
             </div>
             <button className="text-[#49454F] hover:bg-[#1D192B]/5 rounded-full p-2 -mr-2 -mt-2 transition-colors">
                <MoreVertical size={20} />
             </button>
          </div>
          
          <div className="mb-4 flex-grow">
            <h3 className="text-lg font-display font-medium text-[#1D192B] leading-tight mb-2 line-clamp-2 group-hover:text-violet-900 transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-[#49454F] leading-relaxed line-clamp-3 font-light">
              {course.description}
            </p>
          </div>

          <div className="mt-auto pt-4 border-t border-[#E7E0EC]/50 flex items-center justify-between">
             <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
               course.source === 'online' 
                 ? 'bg-blue-50 text-blue-700' 
                 : 'bg-violet-50 text-violet-700'
             }`}>
               {course.source === 'online' ? <Cloud size={12} /> : <HardDrive size={12} />}
               {course.source === 'online' ? 'Online' : 'Local'}
             </span>
             <span className="text-[11px] text-[#49454F] font-medium">
               {new Date(course.uploadDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
             </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;