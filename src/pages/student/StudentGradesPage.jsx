import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, BookOpen, Download, AlertCircle, FileText, Loader2, Star, TrendingUp, Calendar, ChevronLeft } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const StudentGradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/grades/my')
      .then(res => setGrades(res.data.data || []))
      .catch((err) => {
        console.error("Grades Fetch Error:", err);
        toast.error('خطأ في تحميل الدرجات');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-accent-blue" size={48} />
    </div>
  );

  const averagePercentage = grades.length > 0 
    ? Math.round(grades.reduce((acc, g) => acc + (g.score / g.totalScore), 0) / grades.length * 100) 
    : 0;

  return (
    <div className="page-container max-w-[1200px]">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12"
      >
        <div>
          <h1 className="text-4xl font-black text-text-primary mb-3">سجل الدرجات</h1>
          <p className="text-text-secondary max-w-2xl text-lg font-medium">نظرة شاملة ومفصلة على أدائك الدراسي في جميع المواد والاختبارات.</p>
        </div>
        <button className="bg-white/5 hover:bg-white/10 text-text-primary px-6 py-3 rounded-2xl border border-border transition-all flex items-center gap-2 font-black text-sm">
          <Download size={18} /> تحميل الشهادة الكاملة
        </button>
      </motion.div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-bg-card border border-border rounded-3xl p-6 shadow-lg flex flex-col gap-4 group hover:border-accent-blue/30 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award size={24} />
            </div>
            <div className="text-xs font-black text-text-muted uppercase tracking-widest">متوسط التقدير العام</div>
          </div>
          <div className="text-3xl font-black text-text-primary">{averagePercentage >= 85 ? 'امتياز' : averagePercentage >= 75 ? 'جيد جداً' : averagePercentage >= 65 ? 'جيد' : averagePercentage >= 50 ? 'مقبول' : 'راسب'} <span className="text-sm font-bold text-accent-blue">({averagePercentage}%)</span></div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="bg-bg-card border border-border rounded-3xl p-6 shadow-lg flex flex-col gap-4 group hover:border-accent-green/30 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-green/10 text-accent-green flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <div className="text-xs font-black text-text-muted uppercase tracking-widest">إجمالي الاختبارات</div>
          </div>
          <div className="text-3xl font-black text-text-primary">{grades.length} <span className="text-sm font-bold text-accent-green">اختبار مكتمل</span></div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="bg-bg-card border border-border rounded-3xl p-6 shadow-lg flex flex-col gap-4 group hover:border-accent-purple/30 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-purple/10 text-accent-purple flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <div className="text-xs font-black text-text-muted uppercase tracking-widest">المواد الدراسية</div>
          </div>
          <div className="text-3xl font-black text-text-primary">{new Set(grades.map(g => g.subject?._id)).size} <span className="text-sm font-bold text-accent-purple">مادة فعالة</span></div>
        </motion.div>
      </div>

      {/* Grades Table */}
      <div className="bg-bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-8 border-b border-border bg-bg-card/50 flex justify-between items-center">
           <h3 className="text-xl font-black text-text-primary flex items-center gap-3">
              <TrendingUp className="text-accent-blue" size={24} />
              تفاصيل النتائج
           </h3>
        </div>

        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-right border-collapse responsive-table">
            <thead>
              <tr className="bg-white/[0.02] border-b border-border/50">
                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">المادة</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">الاختبار</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">الدرجة</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">النسبة</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">التقدير</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {grades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="text-7xl mb-6 opacity-20">📊</div>
                    <p className="text-text-secondary font-black text-lg">لا توجد درجات مرصودة لك حالياً</p>
                  </td>
                </tr>
              ) : (
                grades.map((g, idx) => (
                  <motion.tr 
                    key={g._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/[0.02] transition-colors group border-b border-white/5 last:border-0"
                  >
                    <td className="px-6 py-6" data-label="المادة">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">📚</div>
                         <div className="font-black text-text-primary text-base group-hover:text-accent-blue transition-colors truncate">{g.subject?.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6" data-label="الاختبار">
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-accent-blue/5 text-accent-blue border border-accent-blue/10 px-3 py-1.5 rounded-lg inline-block max-w-[150px] truncate">
                          {g.examTitle}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center" data-label="الدرجة">
                      <div className="flex items-baseline justify-center gap-1" dir="ltr">
                        <span className="text-xl font-black text-text-primary leading-none">{g.score}</span>
                        <span className="text-[10px] font-black text-text-muted uppercase">/ {g.totalScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6" data-label="النسبة">
                      <div className="flex flex-col items-center md:items-center gap-2">
                        <span className="text-sm font-black text-text-primary">{Math.round((g.score / (g.totalScore || 1)) * 100)}%</span>
                        <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className={`h-full transition-all duration-700 ${g.score/g.totalScore >= 0.5 ? 'bg-accent-green' : 'bg-accent-red'}`} 
                            style={{ width: `${Math.min((g.score / (g.totalScore || 1)) * 100, 100)}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center" data-label="التقدير">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all inline-block min-w-[80px] ${
                         ['امتياز', 'جيد جداً', 'جيد', 'مقبول'].includes(g.status) 
                         ? 'bg-accent-green/10 text-accent-green border-accent-green/20' 
                         : 'bg-accent-red/10 text-accent-red border-accent-red/20'
                       }`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-left" data-label="التاريخ">
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter flex items-center justify-end gap-1.5">
                        <Calendar size={12} className="text-accent-blue/40" /> {new Date(g.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                      </span>
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

export default StudentGradesPage;
