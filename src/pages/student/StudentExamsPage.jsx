import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, FileText, CheckCircle, ChevronLeft, Calendar, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const StudentExamsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data } = await api.get('/exams');
        setExams(data.data || []);
      } catch (err) {
        toast.error('خطأ في تحميل الامتحانات');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
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
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent-blue/5 blur-[80px] rounded-full -z-10" />
        <h1 className="text-4xl font-black text-text-primary mb-3">الامتحانات المتاحة</h1>
        <p className="text-text-secondary max-w-2xl text-lg font-medium">استعد جيداً قبل البدء، تأكد من اتصالك بالإنترنت حيث لا يمكن التراجع بعد الدخول.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {exams.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-full py-32 text-center bg-bg-card/50 rounded-[3rem] border border-dashed border-border"
            >
              <div className="text-9xl mb-8 opacity-10">📝</div>
              <h3 className="text-2xl font-black text-text-primary mb-2">لا توجد امتحانات متاحة</h3>
              <p className="text-text-secondary max-w-md mx-auto">سيتم إخطارك فور توفر امتحانات جديدة من معلميك. تابع لوحة التحكم بانتظام.</p>
            </motion.div>
          ) : (
            exams.map((exam, idx) => (
              <motion.div 
                key={exam._id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.1 }}
                className="bg-bg-card border border-border rounded-[2.5rem] overflow-hidden group hover:border-accent-blue/40 transition-all duration-300 shadow-2xl flex flex-col h-full"
              >
                {/* Exam Card Header */}
                <div className="p-8 border-b border-white/5 relative">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue group-hover:scale-110 transition-transform">
                       <FileText size={24} />
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      (!exam.startTime || new Date() >= new Date(exam.startTime)) && (!exam.endTime || new Date() <= new Date(exam.endTime))
                      ? 'bg-accent-green/10 text-accent-green border-accent-green/20 animate-pulse'
                      : (exam.startTime && new Date() < new Date(exam.startTime))
                        ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/20'
                        : 'bg-accent-red/10 text-accent-red border-accent-red/20'
                    }`}>
                      {(!exam.startTime || new Date() >= new Date(exam.startTime)) && (!exam.endTime || new Date() <= new Date(exam.endTime))
                        ? 'نشط حالياً'
                        : (exam.startTime && new Date() < new Date(exam.startTime))
                          ? 'لم يبدأ بعد'
                          : 'منتهي'}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-text-primary mb-2 group-hover:text-accent-blue transition-colors leading-tight line-clamp-2 min-h-[3.5rem]">{exam.title}</h3>
                  <div className="flex items-center gap-2 text-xs font-black text-text-muted uppercase tracking-widest bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/5">
                    <BookOpen size={12} className="text-accent-blue" /> {exam.subject?.name || 'مادة عامة'}
                  </div>
                </div>
                
                {/* Exam Stats */}
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-bg-secondary/50 p-4 rounded-2xl border border-border/50 text-center group-hover:bg-accent-blue/5 group-hover:border-accent-blue/10 transition-all">
                       <Clock size={18} className="text-accent-blue mx-auto mb-2" />
                       <div className="text-xs font-black text-text-muted uppercase tracking-widest mb-1">المدة</div>
                       <div className="text-base font-black text-text-primary">{exam.duration} دقيقة</div>
                    </div>
                    <div className="bg-bg-secondary/50 p-4 rounded-2xl border border-border/50 text-center group-hover:bg-accent-green/5 group-hover:border-accent-green/10 transition-all">
                       <CheckCircle size={18} className="text-accent-green mx-auto mb-2" />
                       <div className="text-xs font-black text-text-muted uppercase tracking-widest mb-1">الدرجة</div>
                       <div className="text-base font-black text-text-primary">{exam.totalMarks} درجة</div>
                    </div>
                  </div>

                  {exam.startTime && (
                    <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/5 text-right">
                       <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">
                          <Calendar size={12} className="text-accent-blue" /> موعد الامتحان
                       </div>
                       <div className="text-sm font-black text-text-primary">
                          {new Date(exam.startTime).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric' })}
                       </div>
                    </div>
                  )}

                  <button 
                    onClick={() => navigate(`/student/exam/${exam._id}`)}
                    className="w-full bg-accent-blue hover:bg-accent-blue-light text-white font-black py-4 rounded-2xl shadow-xl shadow-accent-blue/20 transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    دخول الامتحان 
                    <ChevronLeft size={20} className="transition-transform group-hover/btn:-translate-x-1" />
                  </button>
                </div>

                {/* Footer Warning */}
                <div className="px-8 py-4 bg-accent-red/5 border-t border-accent-red/10 flex items-center justify-center gap-2">
                   <AlertCircle size={14} className="text-accent-red" />
                   <span className="text-[10px] font-black text-accent-red uppercase tracking-widest">تحذير: لا تغلق المتصفح أثناء الحل</span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentExamsPage;
