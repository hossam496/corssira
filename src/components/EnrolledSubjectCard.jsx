import { motion } from 'framer-motion';
import { PlayCircle, Award, Trash2, Calendar, FileText, Clock, ChevronLeft } from 'lucide-react';

const EnrolledSubjectCard = ({ subject, onUnenroll }) => {
  const progress = Math.floor(Math.random() * 60) + 20; // Simulated progress

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-bg-card/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl transition-all duration-500"
      style={{ boxShadow: `0 20px 40px -15px ${subject.color || '#3b82f6'}20` }}
    >
      <div className="flex gap-5 mb-8">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-500 group-hover:scale-110 border border-white/5 shrink-0"
          style={{ backgroundColor: `${subject.color || '#3b82f6'}15` }}
        >
          {subject.icon || '📖'}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-black text-text-primary mb-1 group-hover:text-accent-blue transition-colors leading-tight">{subject.name}</h3>
              <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                 <div className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
                 <span>المدرس: {subject.teacher?.name || 'مدرس المادة'}</span>
              </div>
            </div>
            <button 
              onClick={() => onUnenroll(subject._id)} 
              className="p-2 bg-accent-red/5 hover:bg-accent-red text-accent-red hover:text-white rounded-xl transition-all border border-accent-red/10"
              title="إلغاء التسجيل"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-8 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
        <div className="flex justify-between items-end mb-3">
          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">نسبة الإنجاز</span>
          <span className="text-sm font-black" style={{ color: subject.color || '#3b82f6' }}>{progress}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${progress}%` }} 
            transition={{ duration: 1.5, ease: 'easeOut' }} 
            className="h-full rounded-full"
            style={{ backgroundColor: subject.color || '#3b82f6', boxShadow: `0 0 15px ${subject.color || '#3b82f6'}40` }} 
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-8">
        <div className="text-center p-3 bg-white/[0.03] rounded-2xl border border-white/5">
          <div className="text-sm font-black text-text-primary leading-none mb-1">12/24</div>
          <div className="text-[9px] font-black text-text-muted uppercase tracking-tighter">حصص</div>
        </div>
        <div className="text-center p-3 bg-white/[0.03] rounded-2xl border border-white/5">
          <div className="text-sm font-black text-accent-blue leading-none mb-1">B+</div>
          <div className="text-[9px] font-black text-text-muted uppercase tracking-tighter">تقدير</div>
        </div>
        <div className="text-center p-3 bg-white/[0.03] rounded-2xl border border-white/5">
          <div className="text-sm font-black text-accent-green leading-none mb-1">95%</div>
          <div className="text-[9px] font-black text-text-muted uppercase tracking-tighter">حضور</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex-1 bg-accent-blue hover:bg-accent-blue-light text-white font-black py-3 rounded-xl shadow-lg shadow-accent-blue/20 transition-all flex items-center justify-center gap-2 text-xs">
          <PlayCircle size={16} /> دخول المحاضرة
        </button>
        <button className="flex-1 bg-white/5 hover:bg-white/10 text-text-primary font-black py-3 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 text-xs">
          <FileText size={16} /> الواجبات
        </button>
      </div>

      {/* Hover Indicator */}
      <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-accent-blue/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};

export default EnrolledSubjectCard;
