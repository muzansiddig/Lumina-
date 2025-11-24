import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { useAppContext } from '../App';
import { generateCourseMetadata } from '../services/geminiService';
import { Course } from '../types';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { addCourse } = useAppContext();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        
        let type: 'text' | 'image' | 'video' = 'text';
        if (file.type.startsWith('image/')) type = 'image';
        if (file.type.startsWith('video/')) type = 'video';
        
        let metadata;
        
        if (type === 'image') {
           metadata = await generateCourseMetadata("Analyze this image content", 'image'); 
        } else {
           metadata = await generateCourseMetadata(content, 'text');
        }
        
        const newCourse: Course = {
          id: crypto.randomUUID(),
          title: metadata.title || "Untitled Upload",
          description: metadata.description || "No description generated.",
          type: type as any,
          source: 'local',
          uploadDate: new Date(),
          content: content,
          summary: metadata.summary,
          keyPoints: metadata.keyPoints,
          objectives: metadata.objectives,
          thumbnail: type === 'image' ? content : undefined,
          progress: 0,
          hasSummary: !!metadata.summary,
          hasQuiz: false
        };

        addCourse(newCourse);
        navigate(`/course/${newCourse.id}`);
      };

      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }

    } catch (err) {
      console.error(err);
      setError("Failed to process file. Please try a valid text file or image.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Learning Material</h1>
        <p className="text-gray-500">
          Upload notes, articles, or papers. Believer will analyze them and create a study plan.
        </p>
      </div>

      <div 
        className={`bg-white border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!isProcessing ? (
          <>
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
              <UploadIcon size={32} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Drag & drop files here</h3>
            <p className="text-gray-500 mb-8 text-sm">Supported formats: TXT, MD, CSV (PDF text extraction coming soon)</p>
            
            <div className="relative inline-block">
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                onChange={handleFileSelect}
                accept=".txt,.md,.csv,image/*"
              />
              <label 
                htmlFor="file-upload" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold cursor-pointer transition-colors shadow-lg"
              >
                Browse Files
              </label>
            </div>
            
            <div className="mt-8 flex justify-center gap-8 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <FileText size={16} /> Documents
              </div>
              <div className="flex items-center gap-2">
                <ImageIcon size={16} /> Images
              </div>
            </div>
          </>
        ) : (
          <div className="py-10">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Analyzing Content...</h3>
            <p className="text-gray-500 mt-2">Gemini is extracting key insights and generating your course.</p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}
    </div>
  );
};

export default UploadPage;