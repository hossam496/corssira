import { motion } from 'framer-motion';
import { BookOpen, Users, Clock, Trash2, Edit3, User as UserIcon, Layers, ChevronLeft } from 'lucide-react';

const SubjectCard = ({ subject, teacher, isTeacherView = false, onDelete, onEdit }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8 }}
      className="bg-bg-card/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl transition-all duration-500"
      style={{ boxShadow: `0 20px 40px -15px ${subject.color || '#3b82f6'}20` }}
    >
      {/* Dynamic Background Glow */}
      <div 
        className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-[80px] opacity-20 pointer-events-none transition-all duration-700 group-hover:scale-150 group-hover:opacity-30"
        style={{ backgroundColor: subject.color || '#3b82f6' }}
      />

      <div className="flex justify-between items-start mb-6">
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-500 group-hover:scale-110 border border-white/5"
          style={{ backgroundColor: `${subject.color || '#3b82f6'}15` }}
        >
          {subject.icon || '📖'}
        </div>
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
          subject.status === 'نشط' 
          ? 'bg-accent-green/10 text-accent-green border-accent-green/20' 
          : 'bg-accent-red/10 text-accent-red border-accent-red/20'
        }`}>
          {subject.status || 'نشط'}
        </span>
      </div>

      <h3 className="text-xl font-black text-text-primary mb-2 group-hover:text-accent-blue transition-colors leading-tight">
        {subject.name}
      </h3>
      <p className="text-sm font-medium text-text-secondary line-clamp-2 mb-6 h-10 leading-relaxed">
        {subject.description || 'لا يوجد وصف متاح لهذه المادة الدراسية حالياً.'}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="flex items-center gap-2.5 text-xs font-black text-text-muted uppercase tracking-tighter bg-white/5 px-3 py-2 rounded-xl border border-white/5">
          <Clock size={14} className="text-accent-yellow" /> 
          <span>{subject.lecturesCount || 0} محاضرة</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-black text-text-muted uppercase tracking-tighter bg-white/5 px-3 py-2 rounded-xl border border-white/5">
          <Layers size={14} className="text-accent-purple" /> 
          <span>{subject.category || 'عام'}</span>
        </div>
      </div>

      {!isTeacherView && teacher && (
        <div className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5 group-hover:border-accent-blue/20 transition-all">
          <img 
            src={teacher.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.name}`} 
            alt={teacher.name} 
            className="w-10 h-10 rounded-xl border-2 border-accent-blue/30 object-cover shadow-lg" 
          />
          <div>
            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-0.5">المدرس المسؤول</div>
            <div className="text-sm font-black text-text-primary">{teacher.name}</div>
          </div>
        </div>
      )}

      {isTeacherView && (
        <div className="flex gap-3 mt-4">
          <button 
            onClick={() => onEdit(subject)} 
            className="flex-1 bg-white/5 hover:bg-white/10 text-text-primary text-xs font-black py-3 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Edit3 size={14} /> تعديل
          </button>
          <button 
            onClick={() => onDelete(subject._id)} 
            className="flex-1 bg-accent-red/10 hover:bg-accent-red text-accent-red hover:text-white text-xs font-black py-3 rounded-xl border border-accent-red/20 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={14} /> حذف
          </button>
        </div>
      )}

      {/* Hover Action Indicator */}
      {!isTeacherView && (
        <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
           <div className="w-10 h-10 rounded-full bg-accent-blue text-white flex items-center justify-center shadow-lg shadow-accent-blue/40">
              <ChevronLeft size={20} />
           </div>
        </div>
      )}
    </motion.div>
  );
};

export default SubjectCard;
