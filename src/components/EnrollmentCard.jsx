import { motion } from 'framer-motion';
import { BookOpen, Users, Clock, Star, CheckCircle2, AlertCircle, ChevronLeft, Layers } from 'lucide-react';

const EnrollmentCard = ({ subject, onEnroll, isEnrolled }) => {
  const isFull = (subject.enrolledCount || 0) >= (subject.maxCapacity || 50);

  return (
    <motion.div
      layout
      whileHover={{ y: -8 }}
      className={`bg-bg-card/60 backdrop-blur-xl border rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl transition-all duration-500 ${
        isEnrolled ? 'border-accent-green/50 ring-4 ring-accent-green/5' : 'border-white/5'
      }`}
      style={{ boxShadow: isEnrolled ? `0 20px 40px -15px #10b98120` : `0 20px 40px -15px ${subject.color || '#3b82f6'}20` }}
    >
      {/* Background Glow */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[80px] opacity-10 pointer-events-none transition-all duration-700 group-hover:scale-150 group-hover:opacity-20"
        style={{ backgroundColor: subject.color || '#3b82f6' }}
      />

      <div className="flex justify-between items-start mb-8">
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-500 group-hover:scale-110 border border-white/5"
          style={{ backgroundColor: `${subject.color || '#3b82f6'}15` }}
        >
          {subject.icon || '📖'}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
            isFull ? 'bg-accent-red/10 text-accent-red border-accent-red/20' : 'bg-accent-green/10 text-accent-green border-accent-green/20'
          }`}>
            {isFull ? 'مكتمل' : 'متاح للتسجيل'}
          </span>
          <span className="px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue text-[10px] font-black uppercase tracking-widest border border-accent-blue/20">
            {subject.level || 'عام'}
          </span>
        </div>
      </div>

      <h3 className="text-xl font-black text-text-primary mb-2 group-hover:text-accent-blue transition-colors leading-tight">
        {subject.name}
      </h3>
      <p className="text-sm font-medium text-text-secondary line-clamp-2 mb-8 h-10 leading-relaxed">
        {subject.description || 'لا يوجد وصف متاح لهذه المادة الدراسية حالياً.'}
      </p>

      {/* Meta Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="flex items-center gap-2.5 text-xs font-black text-text-muted uppercase tracking-tighter bg-white/5 px-3 py-2.5 rounded-xl border border-white/5">
          <Clock size={14} className="text-accent-yellow" /> 
          <span>{subject.lectures || 0} محاضرة</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-black text-text-muted uppercase tracking-tighter bg-white/5 px-3 py-2.5 rounded-xl border border-white/5">
          <Users size={14} className="text-accent-blue" /> 
          <span>{subject.enrolledCount || 0}/{subject.maxCapacity || 50} طالب</span>
        </div>
      </div>

      {/* Teacher Profile Card */}
      <div className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5 mb-8 group-hover:border-accent-blue/20 transition-all">
        <img 
          src={subject.teacher?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${subject.teacher?.name}`} 
          alt={subject.teacher?.name} 
          className="w-10 h-10 rounded-xl border-2 border-accent-blue/30 object-cover shadow-lg" 
        />
        <div>
          <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-0.5">مدرس المادة</div>
          <div className="text-sm font-black text-text-primary">{subject.teacher?.name || 'مدرس المادة'}</div>
        </div>
      </div>

      <button
        onClick={() => !isFull && !isEnrolled && onEnroll(subject)}
        disabled={isFull && !isEnrolled}
        className={`w-full py-4 rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-xl active:scale-95 ${
          isEnrolled 
          ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' 
          : isFull 
            ? 'bg-accent-red/10 text-accent-red border border-accent-red/20 cursor-not-allowed' 
            : 'bg-accent-blue hover:bg-accent-blue-light text-white shadow-accent-blue/20'
        }`}
      >
        {isEnrolled ? (
          <><CheckCircle2 size={18} /> تم التسجيل بنجاح</>
        ) : isFull ? (
          <><AlertCircle size={18} /> المقاعد ممتلئة بالكامل</>
        ) : (
          <>تسجيل في المادة الآن <ChevronLeft size={18} className="rotate-180" /></>
        )}
      </button>
    </motion.div>
  );
};

export default EnrollmentCard;
