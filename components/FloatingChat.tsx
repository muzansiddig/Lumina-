import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Paperclip, Camera, Mic, Square, Trash2, File as FileIcon, Image as ImageIcon, Music, Loader2 } from 'lucide-react';
import { chatGeneral, generateCourseMetadata } from '../services/geminiService';
import { ChatMessage, Course } from '../types';
import { useAppContext } from '../App';

interface Attachment {
  type: 'image' | 'audio' | 'file';
  data: string;
  mimeType: string;
  fileName?: string;
}

const FloatingChat: React.FC = () => {
  const { addActivity, addCourse, activeTeacher } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message when teacher changes
  useEffect(() => {
    setMessages([{ 
      id: '0', 
      role: 'model', 
      text: `Hello! I'm ${activeTeacher.name}. ${activeTeacher.id === 'lumina' ? 'How can I assist your learning today?' : 'I am ready to teach you in my unique style.'}`, 
      timestamp: new Date() 
    }]);
  }, [activeTeacher]);

  // Attachment State
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Handle File Select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isCamera = false) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = (event.target?.result as string).split(',')[1];
        let type: Attachment['type'] = 'file';
        if (file.type.startsWith('image/')) type = 'image';
        if (file.type.startsWith('audio/')) type = 'audio';

        setAttachment({
          type,
          data: base64Data,
          mimeType: file.type,
          fileName: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const result = reader.result as string;
            setAttachment({
              type: 'audio',
              data: result.split(',')[1],
              mimeType: 'audio/webm',
              fileName: 'voice-note.webm'
            });
            stream.getTracks().forEach(track => track.stop());
          };
          setIsRecording(false);
        };
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        alert("Microphone access denied.");
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !attachment) return;

    const currentAttachment = attachment;
    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: input || (currentAttachment ? `Uploaded ${currentAttachment.fileName}` : ''), 
      timestamp: new Date(),
      attachment: currentAttachment ? { ...currentAttachment } : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachment(null);
    setIsTyping(true);

    // ... (Course creation logic) ...
    let systemResponsePrefix = "";
     if (currentAttachment) {
      try {
         let contentType: 'text' | 'image' | 'video' = 'text';
         if (currentAttachment.mimeType.startsWith('image/')) contentType = 'image';
         if (currentAttachment.mimeType.startsWith('video/')) contentType = 'video';
         
         let contentForAnalysis = currentAttachment.data;
         if (contentType === 'text') {
            try { contentForAnalysis = atob(currentAttachment.data); } catch (e) {}
         }

         const metadata = await generateCourseMetadata(
            contentType === 'image' ? "Analyze this image" : contentForAnalysis, 
            contentType as any
         );

         const newCourse: Course = {
           id: crypto.randomUUID(),
           title: metadata.title || currentAttachment.fileName || "Untitled Upload",
           description: metadata.description || "Uploaded via Chat",
           type: contentType as any,
           source: 'local',
           uploadDate: new Date(),
           content: contentForAnalysis,
           summary: metadata.summary,
           keyPoints: metadata.keyPoints,
           objectives: metadata.objectives,
           thumbnail: contentType === 'image' ? `data:${currentAttachment.mimeType};base64,${currentAttachment.data}` : undefined,
           progress: 0,
           hasSummary: !!metadata.summary,
           hasQuiz: false
         };
         addCourse(newCourse);
         systemResponsePrefix = `Analyzed "${currentAttachment.fileName}" & added to library. `;
      } catch (error) {
        systemResponsePrefix = "File received. Analysis pending. ";
      }
    }

    // Chat Logic
    const history = messages.map(m => {
        const parts: any[] = [];
        if (m.text) parts.push({ text: m.text });
        if (m.attachment) parts.push({ inlineData: { mimeType: m.attachment.mimeType, data: m.attachment.data } });
        return { role: m.role, parts };
    });

    const messageParts: any[] = [];
    if (userMsg.text) messageParts.push({ text: userMsg.text });
    if (userMsg.attachment) messageParts.push({ inlineData: { mimeType: userMsg.attachment.mimeType, data: userMsg.attachment.data } });

    let responseText = "";
    try { 
      // Pass the active teacher's system instruction
      responseText = await chatGeneral(history, messageParts, activeTeacher.systemInstruction); 
    } catch (e) { 
      responseText = "Connection error."; 
    }

    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: systemResponsePrefix + responseText, timestamp: new Date() };
    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[360px] h-[600px] bg-[#FFFBFE] rounded-[28px] shadow-xl border border-[#CAC4D0] flex flex-col overflow-hidden origin-bottom-right animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#6750A4] p-4 flex justify-between items-center text-white shrink-0">
             <div className="flex items-center gap-3">
               <div className="bg-white/20 p-1.5 rounded-lg text-xl">{activeTeacher.avatar}</div>
               <div>
                  <span className="font-medium text-lg block leading-none">{activeTeacher.name}</span>
                  <span className="text-[10px] opacity-80 uppercase tracking-widest">{activeTeacher.role}</span>
               </div>
             </div>
             <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10 rounded-full p-2">
               <Minimize2 size={20} />
             </button>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#FFFBFE]">
             {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                       msg.role === 'user' ? 'bg-[#6750A4] text-white' : 'bg-[#E8DEF8] text-[#1D192B]'
                   }`}>
                      {msg.role === 'user' ? <User size={16} /> : <span className="text-lg">{activeTeacher.avatar}</span>}
                   </div>
                   <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                       msg.role === 'user' ? 'bg-[#6750A4] text-white rounded-tr-sm' : 'bg-[#F3EDF7] text-[#1C1B1F] rounded-tl-sm'
                   }`}>
                      {msg.attachment && (
                          <div className="mb-2 p-2 bg-black/10 rounded-lg flex items-center gap-2">
                             <FileIcon size={16}/> <span className="text-xs truncate">{msg.attachment.fileName}</span>
                          </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                   </div>
                </div>
             ))}
             {isTyping && <div className="text-xs text-[#49454F] ml-12">{activeTeacher.name} is thinking...</div>}
             <div ref={messagesEndRef} />
          </div>

          {attachment && (
             <div className="px-4 py-2 bg-[#F3EDF7] flex justify-between items-center text-xs">
                <span>{attachment.fileName}</span>
                <button onClick={() => setAttachment(null)}><Trash2 size={14}/></button>
             </div>
          )}

          <div className="p-2 bg-[#FFFBFE]">
             <div className="bg-[#F3EDF7] rounded-full flex items-center px-2 py-2">
                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-[#49454F] hover:bg-[#1D192B]/10 rounded-full"><Paperclip size={20}/></button>
                <button onClick={toggleRecording} className={`p-2 rounded-full ${isRecording ? 'text-red-500' : 'text-[#49454F] hover:bg-[#1D192B]/10'}`}>
                   {isRecording ? <Square size={20}/> : <Mic size={20}/>}
                </button>
                <input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Message..."
                  className="bg-transparent flex-grow px-2 outline-none text-[#1C1B1F]"
                />
                <button onClick={handleSend} className="p-2 text-[#6750A4] hover:bg-[#6750A4]/10 rounded-full">
                   <Send size={20} />
                </button>
             </div>
             <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileSelect(e)} />
          </div>
        </div>
      )}

      {/* M3 Large FAB */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 md:w-16 md:h-16 bg-[#EADDFF] hover:bg-[#D0BCFF] text-[#21005D] rounded-[16px] md:rounded-[20px] shadow-lg flex items-center justify-center transition-all duration-300"
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
};

export default FloatingChat;