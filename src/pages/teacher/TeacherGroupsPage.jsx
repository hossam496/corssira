import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { UsersRound, Plus, MapPin, Clock, CalendarDays, Edit2, Trash2, X, AlertCircle, BookOpen, GraduationCap, Users, MoreVertical, ChevronLeft, Loader2 } from 'lucide-react';
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

const TeacherGroupsPage = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', subject: '', schoolGrade: 'أولى ثانوي', 
    days: [], startTime: '', endTime: '', maxStudents: 20, location: 'Online'
  });

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups/teacher');
      setGroups(res.data.data);
    } catch (err) {
      toast.error('حدث خطأ أثناء جلب المجموعات');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchGroups();
    fetchSubjects();
  }, []);

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.days.length === 0) return toast.error('يرجى اختيار يوم واحد على الأقل');
    try {
      await api.post('/groups', formData);
      toast.success('تم إنشاء المجموعة بنجاح');
      fetchGroups();
      setIsModalOpen(false);
      setFormData({ name: '', subject: '', schoolGrade: 'أولى ثانوي', days: [], startTime: '', endTime: '', maxStudents: 20, location: 'Online' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('هل أنت متأكد من حذف هذه المجموعة؟')) return;
    try {
      await api.delete(`/groups/${id}`);
      toast.success('تم حذف المجموعة');
      setGroups(groups.filter(g => g._id !== id));
    } catch (err) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const daysOfWeek = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

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
            إدارة المجموعات
          </h1>
          <p className="text-text-secondary font-medium">نظّم طلابك في مجموعات دراسية وجداول زمنية احترافية</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }} 
          className="btn btn-primary px-8 py-4 rounded-2xl shadow-blue flex items-center gap-2 text-lg font-black" 
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={24} strokeWidth={3} />
          إنشاء مجموعة جديدة
        </motion.button>
      </motion.div>

      {groups.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
          className="bg-bg-card border border-dashed border-border rounded-[2.5rem] py-24 text-center"
        >
          <div className="text-8xl mb-6 opacity-20">👥</div>
          <h3 className="text-2xl font-black text-text-primary mb-2">لا توجد مجموعات بعد</h3>
          <p className="text-text-secondary max-w-md mx-auto mb-10">ابدأ بإنشاء مجموعتك الأولى لطلابك وسوف تظهر هنا لتتمكن من إدارتها</p>
          <button className="btn btn-ghost border border-border px-8 py-3 rounded-xl text-accent-blue font-bold" onClick={() => setIsModalOpen(true)}>أضف مجموعتك الأولى</button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {groups.map((group, index) => (
            <motion.div 
              key={group._id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.1 }}
              className="bg-bg-card border border-border rounded-[2rem] overflow-hidden group hover:border-accent-blue/50 transition-all duration-300 shadow-xl flex flex-col h-full"
            >
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">📚</div>
                    <div>
                      <h3 className="text-xl font-black text-text-primary mb-1 group-hover:text-accent-blue transition-colors line-clamp-1">{group.name}</h3>
                      <div className="flex items-center gap-2">
                         <span className="px-3 py-1 rounded-full bg-accent-indigo/10 text-accent-indigo text-[10px] font-black uppercase tracking-wider border border-accent-indigo/20">{group.schoolGrade}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(group._id)} className="w-10 h-10 rounded-xl bg-accent-red/5 text-accent-red hover:bg-accent-red hover:text-white transition-all flex items-center justify-center border border-accent-red/10">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-text-secondary bg-white/5 p-3 rounded-xl border border-white/5">
                    <CalendarDays size={18} className="text-accent-blue shrink-0" />
                    <span className="font-black truncate">{group.days.join(' • ')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text-secondary bg-white/5 p-3 rounded-xl border border-white/5">
                    <Clock size={18} className="text-accent-yellow shrink-0" />
                    <span className="font-black">{formatTime12h(group.startTime)} - {formatTime12h(group.endTime)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text-secondary bg-white/5 p-3 rounded-xl border border-white/5">
                    <MapPin size={18} className="text-accent-green shrink-0" />
                    <span className="font-black">{group.location}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/10 space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                       <Users size={14} className="text-accent-blue" /> السعة الطلابية
                    </span>
                    <span className={`text-sm font-black ${group.enrolledStudents.length >= group.maxStudents ? 'text-accent-red' : 'text-accent-green'}`}>
                      {group.enrolledStudents.length} <span className="text-text-muted text-[10px] uppercase">/ {group.maxStudents} طالب</span>
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full transition-all duration-700 ${group.enrolledStudents.length >= group.maxStudents ? 'bg-accent-red' : 'bg-accent-blue'}`} 
                      style={{ width: `${Math.min((group.enrolledStudents.length / group.maxStudents) * 100, 100)}%` }} 
                    />
                  </div>
                </div>
              </div>

              <div className="px-8 py-5 bg-white/[0.02] border-t border-border/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${group.status === 'متاحة' ? 'bg-accent-green shadow-[0_0_8px_var(--accent-green)]' : 'bg-accent-red shadow-[0_0_8px_var(--accent-red)]'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{group.status}</span>
                </div>
                <div className="text-[10px] font-black text-text-muted/50 tracking-tighter">ID: {group._id.slice(-8).toUpperCase()}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative w-full max-w-2xl bg-bg-card border border-accent-blue/20 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-10 bg-gradient-to-br from-accent-blue/10 to-transparent border-b border-border flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-text-primary mb-1">إنشاء مجموعة جديدة</h2>
                  <p className="text-sm text-text-secondary font-medium">أدخل بيانات المجموعة لجدولة الحصص بكفاءة</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl bg-white/5 border border-border text-text-muted hover:text-white transition-all flex items-center justify-center">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-secondary mr-1 flex items-center gap-2">
                       <UsersRound size={14} className="text-accent-blue" /> اسم المجموعة
                    </label>
                    <input type="text" className="input bg-bg-secondary h-14" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="مثال: مجموعة التفوق - أولى ثانوي" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-secondary mr-1 flex items-center gap-2">
                       <BookOpen size={14} className="text-accent-indigo" /> المادة الدراسية
                    </label>
                    <select className="input bg-bg-secondary h-14" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                      <option value="">اختر المادة</option>
                      {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-secondary mr-1 flex items-center gap-2">
                       <GraduationCap size={14} className="text-accent-purple" /> المرحلة الدراسية
                    </label>
                    <select className="input bg-bg-secondary h-14" value={formData.schoolGrade} onChange={e => setFormData({...formData, schoolGrade: e.target.value})}>
                      <option value="أولى ثانوي">أولى ثانوي</option>
                      <option value="ثانية ثانوي">ثانية ثانوي</option>
                      <option value="ثالثة ثانوي">ثالثة ثانوي</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-secondary mr-1 flex items-center gap-2">
                       <Users size={14} className="text-accent-green" /> العدد الأقصى للطلاب
                    </label>
                    <input type="number" className="input bg-bg-secondary h-14" required value={formData.maxStudents} onChange={e => setFormData({...formData, maxStudents: Number(e.target.value)})} min="1" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-text-secondary mr-1 flex items-center gap-2">
                     <CalendarDays size={14} className="text-accent-blue" /> أيام الحضور (اختر يوماً أو أكثر)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => {
                      const isActive = formData.days.includes(day);
                      return (
                        <motion.button 
                          key={day} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDayToggle(day)}
                          className={`px-5 py-3 rounded-2xl text-xs font-black transition-all border ${
                            isActive 
                            ? 'bg-accent-blue text-white border-accent-blue shadow-lg shadow-accent-blue/20' 
                            : 'bg-white/5 text-text-secondary border-border hover:border-white/20'
                          }`}
                        >
                          {day}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-secondary mr-1">وقت البداية</label>
                    <input type="time" className="input bg-bg-secondary h-14" required value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-secondary mr-1">وقت النهاية</label>
                    <input type="time" className="input bg-bg-secondary h-14" required value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-secondary mr-1">المكان</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input type="text" className="input bg-bg-secondary h-14 pr-11" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="مثال: Online / القاعة 1" />
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-border flex justify-end gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 rounded-2xl font-black text-text-muted hover:text-white transition-all">إلغاء</button>
                  <button type="submit" className="bg-accent-blue hover:bg-accent-blue-light text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-accent-blue/20 transition-all flex items-center gap-2">
                    <Plus size={20} strokeWidth={3} />
                    <span>حفظ ونشر المجموعة</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherGroupsPage;
