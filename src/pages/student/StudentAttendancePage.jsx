import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock, Loader2, User, BookOpen, Layers, ChevronLeft } from 'lucide-react';
import api from '../../api/axios';

const StudentAttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance/my')
      .then(res => {
        setAttendance(res.data.data || []);
        setStats(res.data.stats || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-accent-blue" size={48} />
    </div>
  );

  return (
    <div className="page-container max-w-[1200px]">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mb-12 relative"
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent-green/5 blur-[80px] rounded-full -z-10" />
        <h1 className="text-4xl font-black text-text-primary mb-3">سجل الحضور والغياب</h1>
        <p className="text-text-secondary max-w-2xl text-lg font-medium">تابع التزامك الدراسي ونسبة حضورك في جميع المحاضرات والحصص الدراسية.</p>
      </motion.div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[
          { label: 'إجمالي الحصص', value: stats.total || 0, icon: <Calendar size={24} />, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
          { label: 'أيام الحضور', value: stats.present || 0, icon: <CheckCircle size={24} />, color: 'text-accent-green', bg: 'bg-accent-green/10' },
          { label: 'أيام الغياب', value: stats.absent || 0, icon: <XCircle size={24} />, color: 'text-accent-red', bg: 'bg-accent-red/10' },
          { label: 'مرات التأخير', value: stats.late || 0, icon: <Clock size={24} />, color: 'text-accent-yellow', bg: 'bg-accent-yellow/10' },
        ].map((s, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: i * 0.1 }}
            className="bg-bg-card border border-border rounded-3xl p-6 flex flex-col gap-4 shadow-lg group hover:border-accent-blue/30 transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              {s.icon}
            </div>
            <div>
              <div className="text-3xl font-black text-text-primary mb-1">{s.value}</div>
              <div className="text-xs font-black text-text-secondary uppercase tracking-widest">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Attendance History */}
      <div className="bg-bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-8 border-b border-border bg-bg-card/50 flex justify-between items-center">
           <h3 className="text-xl font-black text-text-primary flex items-center gap-3">
              <Layers className="text-accent-blue" size={24} />
              تفاصيل السجل الدراسي
           </h3>
           <div className="text-xs font-black text-text-muted uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-full border border-white/5">
              إجمالي السجلات: <span className="text-accent-blue">{attendance.length}</span>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-white/[0.02] border-b border-border/50">
                <th className="px-8 py-5 text-xs font-black text-text-muted uppercase tracking-widest">المادة</th>
                <th className="px-8 py-5 text-xs font-black text-text-muted uppercase tracking-widest text-center">التاريخ</th>
                <th className="px-8 py-5 text-xs font-black text-text-muted uppercase tracking-widest text-center">الحالة</th>
                <th className="px-8 py-5 text-xs font-black text-text-muted uppercase tracking-widest text-left">المدرس</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <div className="text-7xl mb-6 opacity-20">📅</div>
                    <p className="text-text-secondary font-black text-lg">لا يوجد سجل حضور مسجل لك حالياً</p>
                  </td>
                </tr>
              ) : (
                attendance.map((a, idx) => (
                  <motion.tr 
                    key={a._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">📚</div>
                         <div className="font-black text-text-primary text-base group-hover:text-accent-blue transition-colors leading-tight">{a.subject?.name}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-bold text-text-secondary bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                        {new Date(a.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                         a.status === 'حاضر' 
                         ? 'bg-accent-green/10 text-accent-green border-accent-green/20' 
                         : a.status === 'غائب' 
                           ? 'bg-accent-red/10 text-accent-red border-accent-red/20' 
                           : 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20'
                       }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-left">
                      <div className="flex items-center justify-end gap-3">
                        <div className="text-right">
                           <div className="text-sm font-black text-text-primary leading-none mb-1">{a.teacher?.name || 'مدرس المادة'}</div>
                           <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">معلم مسؤول</div>
                        </div>
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${a.teacher?.name}`} 
                          className="w-9 h-9 rounded-xl border border-accent-blue/20"
                          alt="" 
                        />
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendancePage;
