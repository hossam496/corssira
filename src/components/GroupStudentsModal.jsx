import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Users, 
  Search, 
  UserMinus, 
  Mail, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  Copy, 
  GraduationCap, 
  UserCheck,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatTime12h = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  let h = parseInt(hours);
  const m = minutes;
  const ampm = h >= 12 ? 'م' : 'ص';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
};

const GroupStudentsModal = ({ isOpen, onClose, group, onRemoveStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen || !group) return null;

  const enrolledStudents = group.enrolledStudents || [];
  const maxStudents = group.maxStudents || 20;
  const enrolledCount = enrolledStudents.length;
  const isFull = enrolledCount >= maxStudents;
  const percentage = Math.min(Math.round((enrolledCount / maxStudents) * 100), 100);

  // Filter students based on search term
  const filteredStudents = enrolledStudents.filter(student => {
    const nameMatch = student.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || emailMatch;
  });

  const handleCopyEmail = (email, id) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    toast.success('تم نسخ البريد الإلكتروني');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 25 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-bg-card border border-accent-blue/30 rounded-[2.5rem] shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col max-h-[88vh] z-10"
          >
            {/* Ambient background decorative glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-accent-blue/10 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent-indigo/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Header */}
            <div className="relative p-6 sm:p-8 bg-gradient-to-r from-accent-blue/10 via-accent-indigo/5 to-transparent border-b border-border/60">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent-blue/15 border border-accent-blue/30 flex items-center justify-center text-accent-blue shadow-lg shadow-accent-blue/10 shrink-0">
                    <Users size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-3 py-1 rounded-full bg-accent-indigo/15 text-accent-indigo text-xs font-black border border-accent-indigo/25">
                        {group.schoolGrade || 'مجموعة دراسية'}
                      </span>
                      {group.subject?.name && (
                        <span className="px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue text-xs font-black border border-accent-blue/20">
                          {group.subject.name}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-black text-text-primary tracking-tight">
                      طلاب مجموعة: {group.name}
                    </h2>
                  </div>
                </div>

                {/* Close button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 text-text-muted hover:text-white hover:bg-white/10 transition-all flex items-center justify-center shrink-0"
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Schedule quick info */}
              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-text-secondary font-bold bg-white/[0.03] p-3 rounded-2xl border border-white/5">
                {group.days && group.days.length > 0 && (
                  <div className="flex items-center gap-2">
                    <CalendarDays size={15} className="text-accent-blue" />
                    <span>{group.days.join(' • ')}</span>
                  </div>
                )}
                {group.startTime && (
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-accent-yellow" />
                    <span>{formatTime12h(group.startTime)} - {formatTime12h(group.endTime)}</span>
                  </div>
                )}
              </div>

              {/* Capacity Progress Bar */}
              <div className="mt-5 space-y-2">
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="text-text-secondary flex items-center gap-1.5">
                    <UserCheck size={14} className="text-accent-blue" />
                    السعة الطلابية للمجموعة
                  </span>
                  <span className={isFull ? 'text-accent-red font-black' : 'text-accent-green font-black'}>
                    {enrolledCount} <span className="text-text-muted text-[10px]">/ {maxStudents} طالب ({percentage}%)</span>
                  </span>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full transition-all ${
                      isFull 
                        ? 'bg-gradient-to-r from-accent-red to-rose-500 shadow-[0_0_10px_var(--accent-red)]' 
                        : 'bg-gradient-to-r from-accent-blue via-accent-indigo to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Controls Bar: Search */}
            <div className="p-6 pb-2 border-b border-border/40 bg-bg-card/50 flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                  className="w-full bg-bg-secondary/60 border border-white/10 rounded-2xl py-3 pr-11 pl-10 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white text-xs bg-white/10 rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ✕
                  </button>
                )}
              </div>
              <span className="text-xs font-black text-text-muted shrink-0 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                العدد: {filteredStudents.length}
              </span>
            </div>

            {/* Students List */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1 custom-scrollbar max-h-[420px]">
              {enrolledStudents.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-accent-blue/10 text-accent-blue mx-auto flex items-center justify-center text-3xl border border-accent-blue/20">
                    👥
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-text-primary">لا يوجد طلاب مسجلون في هذه المجموعة</h4>
                    <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">عند انضمام الطلاب إلى هذه المجموعة سيظهرون جميعاً في هذه القائمة</p>
                  </div>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <AlertCircle size={36} className="text-accent-yellow mx-auto opacity-70" />
                  <p className="text-sm font-black text-text-secondary">
                    لم نجد أي طالب يطابق "{searchTerm}"
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-xs font-bold text-accent-blue hover:underline"
                  >
                    مسح كلمات البحث
                  </button>
                </div>
              ) : (
                filteredStudents.map((student, idx) => {
                  const initial = student.name ? student.name.trim()[0] : 'ط';
                  return (
                    <motion.div
                      key={student._id || idx}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: idx * 0.04 }}
                      className="group relative bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-accent-blue/40 rounded-2xl p-4 transition-all duration-300 flex items-center justify-between gap-4 shadow-md"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Index Badge */}
                        <span className="text-[11px] font-black text-text-muted bg-white/5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>

                        {/* Student Avatar */}
                        <div className="relative shrink-0">
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-12 h-12 rounded-2xl object-cover border-2 border-accent-blue/30 shadow-md"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-blue/30 to-accent-indigo/40 border border-accent-blue/40 flex items-center justify-center text-lg font-black text-white shadow-md">
                              {initial}
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-accent-green border-2 border-bg-card shadow-sm" />
                        </div>

                        {/* Student Info */}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-base font-black text-text-primary group-hover:text-accent-blue transition-colors truncate">
                            {student.name}
                          </h4>
                          {student.email && (
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted truncate">
                              <Mail size={13} className="shrink-0 text-accent-indigo" />
                              <span className="truncate">{student.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Copy email button */}
                        {student.email && (
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => handleCopyEmail(student.email, student._id)}
                            title="نسخ البريد الإلكتروني"
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-accent-blue/15 text-text-muted hover:text-accent-blue border border-white/10 hover:border-accent-blue/30 transition-all"
                          >
                            {copiedId === student._id ? <CheckCircle2 size={16} className="text-accent-green" /> : <Copy size={16} />}
                          </motion.button>
                        )}

                        {/* Remove Student from group */}
                        <motion.button
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => onRemoveStudent(group._id, student._id, student.name)}
                          title="حذف الطالب من المجموعة"
                          className="p-2.5 rounded-xl bg-accent-red/10 hover:bg-accent-red text-accent-red hover:text-white border border-accent-red/20 transition-all flex items-center gap-1.5 font-bold text-xs"
                        >
                          <UserMinus size={16} />
                          <span className="hidden sm:inline">حذف</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-white/[0.02] border-t border-border/50 flex items-center justify-between gap-4">
              <p className="text-xs font-bold text-text-muted">
                إجمالي الطلاب: <span className="text-text-primary font-black">{enrolledCount}</span> / <span className="text-text-secondary font-black">{maxStudents}</span>
              </p>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-black text-text-primary transition-all"
              >
                إغلاق
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GroupStudentsModal;
