import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { UsersRound, MapPin, Clock, CalendarDays, CheckCircle2, AlertCircle, ArrowRight, BookOpen, GraduationCap, Users, Loader2, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

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

const StudentGroupsPage = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const profileRes = await api.get('/students/me');
      const profile = profileRes.data.data;
      setStudentProfile(profile);

      const grade = profile.schoolGrade || 'أولى ثانوي';
      const groupsRes = await api.get(`/groups/grade/${grade}`);
      setGroups(groupsRes.data.data);
    } catch (err) {
      toast.error('حدث خطأ أثناء جلب المجموعات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async (groupId) => {
    try {
      await api.post(`/groups/${groupId}/enroll`);
      toast.success('تم الانضمام للمجموعة بنجاح 🎉');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء الانضمام');
    }
  };

  const handleCancelEnroll = async (groupId) => {
    if(!window.confirm('هل أنت متأكد من إلغاء اشتراكك في هذه المجموعة؟')) return;
    try {
      await api.post(`/groups/${groupId}/cancel`);
      toast.success('تم إلغاء الاشتراك بنجاح');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-accent-blue" size={48} />
    </div>
  );

  return (
    <div className="page-container max-w-[1400px]">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12"
      >
        <div>
          <h1 className="text-3xl font-black text-text-primary mb-3 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center">
              <UsersRound className="text-accent-blue" size={28} />
            </div>
            المجموعات الدراسية
          </h1>
          <p className="text-text-secondary font-medium">تصفح المجموعات المتاحة للمرحلة: <span className="text-accent-blue font-black">{studentProfile?.schoolGrade || 'أولى ثانوي'}</span></p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-5 py-3 rounded-2xl border border-white/5">
           <Star className="text-accent-yellow" size={18} />
           <span className="text-sm font-black text-text-primary uppercase tracking-widest">{groups.length} مجموعة متاحة لك</span>
        </div>
      </motion.div>

      {groups.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
          className="bg-bg-card border border-dashed border-border rounded-[3rem] py-32 text-center"
        >
          <div className="text-9xl mb-8 opacity-10">📭</div>
          <h3 className="text-2xl font-black text-text-primary mb-2">لا توجد مجموعات متاحة حالياً</h3>
          <p className="text-text-secondary max-w-md mx-auto leading-relaxed">لم يتم إضافة مجموعات لمرحلتك الدراسية بعد. تواصل مع مدرسي المواد للمزيد من المعلومات حول المواعيد القادمة.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {groups.map((group, index) => {
            const isEnrolled = studentProfile?.enrolledGroups?.includes(group._id);
            const isFull = group.enrolledStudents.length >= group.maxStudents;

            return (
              <motion.div 
                key={group._id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.1 }}
                className={`bg-bg-card border rounded-[2.5rem] overflow-hidden group hover:border-accent-blue/40 transition-all duration-300 shadow-2xl flex flex-col h-full ${
                  isEnrolled ? 'border-accent-green/50 ring-4 ring-accent-green/5' : 'border-border'
                }`}
              >
                <div className="p-8 flex-1">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-indigo flex items-center justify-center text-2xl shadow-lg shadow-accent-blue/20 group-hover:scale-110 transition-transform">
                        📚
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-text-primary mb-1 line-clamp-1 group-hover:text-accent-blue transition-colors">{group.name}</h3>
                        <div className="flex items-center gap-2">
                           <span className="px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue text-[10px] font-black uppercase tracking-wider border border-accent-blue/20">{group.subject?.name}</span>
                           {isEnrolled && (
                             <span className="px-3 py-1 rounded-full bg-accent-green/10 text-accent-green text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-accent-green/20">
                               <CheckCircle2 size={10} /> مشترك
                             </span>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] rounded-3xl p-6 mb-8 border border-white/5 space-y-4">
                    <div className="flex items-center gap-3 text-sm font-bold text-text-secondary">
                      <CalendarDays size={18} className="text-accent-blue shrink-0" />
                      <span className="truncate">الأيام: <span className="text-text-primary font-black">{group.days.join(' • ')}</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-text-secondary">
                      <Clock size={18} className="text-accent-yellow shrink-0" />
                      <span>المواعيد: <span className="text-text-primary font-black">{formatTime12h(group.startTime)} - {formatTime12h(group.endTime)}</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-text-secondary">
                      <MapPin size={18} className="text-accent-green shrink-0" />
                      <span>المكان: <span className="text-text-primary font-black">{group.location}</span></span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-black text-text-muted uppercase tracking-widest">المقاعد المتبقية</span>
                      <span className={`text-sm font-black ${isFull ? 'text-accent-red' : 'text-accent-blue-light'}`}>
                        {Math.max(group.maxStudents - group.enrolledStudents.length, 0)} <span className="text-text-muted font-bold text-[10px] uppercase">مقعد</span>
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full transition-all duration-700 ${isFull ? 'bg-accent-red' : 'bg-accent-blue'}`} 
                        style={{ width: `${Math.min((group.enrolledStudents.length / group.maxStudents) * 100, 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="p-8 pt-0 mt-auto">
                  {isEnrolled ? (
                    <button 
                      onClick={() => handleCancelEnroll(group._id)} 
                      className="w-full bg-accent-red/5 hover:bg-accent-red text-accent-red hover:text-white border border-accent-red/10 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group/cancel"
                    >
                      <span>إلغاء الاشتراك</span>
                      <X size={20} className="transition-transform group-hover/cancel:rotate-90" />
                    </button>
                  ) : isFull ? (
                    <button 
                      disabled 
                      className="w-full bg-white/5 text-text-muted border border-border/50 font-black py-4 rounded-2xl cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <AlertCircle size={20} />
                      <span>المجموعة مكتملة</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleEnroll(group._id)} 
                      className="w-full bg-accent-blue hover:bg-accent-blue-light text-white font-black py-4 rounded-2xl shadow-xl shadow-accent-blue/20 transition-all flex items-center justify-center gap-2 group/enroll"
                    >
                      <span>انضمام للمجموعة الآن</span>
                      <ArrowRight size={20} className="rotate-180 transition-transform group-hover/enroll:-translate-x-1" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentGroupsPage;
