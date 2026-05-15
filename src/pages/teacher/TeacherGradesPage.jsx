import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, X, Loader2, Award, ClipboardList, CheckCircle, Star, Users, Activity, User, BookOpen, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const TeacherGradesPage = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const initialForm = { 
    student: '', 
    subject: '', 
    group: '',
    examTitle: '', 
    score: '', 
    totalScore: 100,
    comments: ''
  };
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      try {
        const [subRes, stuRes, gradeRes, groupRes] = await Promise.all([
          api.get(`/subjects?teacher=${user._id}`),
          api.get('/students'),
          api.get('/grades'),
          api.get('/groups/teacher')
        ]);
        setSubjects(subRes.data?.data || []);
        setStudents(stuRes.data?.data || []);
        setGrades(gradeRes.data?.data || []);
        setGroups(groupRes.data?.data || []);
      } catch (error) { 
        console.error("Fetch Error:", error);
        toast.error('خطأ في تحميل البيانات الأساسية'); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.student)                    return toast.error('يرجى اختيار الطالب');
    if (!form.subject)                    return toast.error('يرجى اختيار المادة');
    if (!form.examTitle?.trim())          return toast.error('يرجى إدخال عنوان الاختبار');
    if (form.score === '')                return toast.error('يرجى إدخال الدرجة');
    if (Number(form.score) > Number(form.totalScore))
      return toast.error('الدرجة لا يمكن أن تتجاوز الدرجة الكلية');

    const payload = {
      student:    form.student,
      subject:    form.subject,
      examTitle:  form.examTitle.trim(),
      score:      Number(form.score),
      totalScore: Number(form.totalScore),
      comments:   form.comments?.trim() || '',
    };
    if (form.group) payload.group = form.group;

    setSaving(true);
    try {
      const { data } = await api.post('/grades', payload);
      toast.success('✅ تم رصد الدرجة بنجاح!');
      setShowModal(false);
      setForm(initialForm);
      setGrades((prev) => [data.data, ...prev]);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'خطأ في الخادم';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container max-w-[1400px]">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10"
      >
        <div>
          <h1 className="text-3xl font-black text-text-primary mb-2">إدارة الدرجات</h1>
          <p className="text-text-secondary font-medium">رصد ومتابعة نتائج اختبارات الطلاب بشكل احترافي ودقيق</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="btn btn-primary w-full md:w-auto px-8 py-4 rounded-2xl shadow-blue flex items-center justify-center gap-2 text-lg font-black"
        >
          <Plus size={24} strokeWidth={3} /> رصد درجة جديدة
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
         {[
           { label: 'متوسط الدرجات', value: '88.5%', icon: <Award />, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
           { label: 'إجمالي الاختبارات', value: grades.length, icon: <ClipboardList />, color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
           { label: 'نسبة النجاح', value: '94%', icon: <CheckCircle />, color: 'text-accent-green', bg: 'bg-accent-green/10' },
           { label: 'أعلى درجة', value: '100/100', icon: <Star />, color: 'text-accent-yellow', bg: 'bg-accent-yellow/10' },
         ].map((stat, i) => (
           <motion.div 
             key={i} 
             initial={{ opacity: 0, scale: 0.95 }} 
             animate={{ opacity: 1, scale: 1 }} 
             transition={{ delay: i * 0.1 }}
             className="bg-bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 shadow-lg hover:border-accent-blue/30 transition-all duration-300 group"
           >
             <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
               {stat.icon}
             </div>
             <div>
               <div className="text-xl sm:text-2xl font-black text-text-primary mb-1">{stat.value}</div>
               <div className="text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest">{stat.label}</div>
             </div>
           </motion.div>
         ))}
      </div>

      {/* Grades List */}
      <div className="bg-bg-card border border-border rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 md:p-8 border-b border-border bg-bg-card/50 flex flex-col md:flex-row justify-between items-center gap-6">
           <h3 className="text-xl font-black text-text-primary flex items-center gap-3 w-full md:w-auto">
              <ClipboardList className="text-accent-blue" size={24} />
              سجل الدرجات المرصودة
           </h3>
           <div className="flex items-center gap-4 text-xs font-black text-text-muted uppercase tracking-widest w-full md:w-auto justify-between md:justify-end">
              إجمالي السجلات: <span className="text-accent-blue">{grades.length}</span>
           </div>
        </div>

        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-white/[0.02] border-b border-border/50">
                <th className="px-8 py-5 text-xs font-black text-text-muted uppercase tracking-widest">الطالب</th>
                <th className="px-8 py-5 text-xs font-black text-text-muted uppercase tracking-widest">المادة والاختبار</th>
                <th className="px-8 py-5 text-xs font-black text-text-muted uppercase tracking-widest text-center">المجموعة</th>
                <th className="px-8 py-5 text-xs font-black text-text-muted uppercase tracking-widest text-center">الدرجة</th>
                <th className="px-8 py-5 text-xs font-black text-text-muted uppercase tracking-widest text-center">الحالة</th>
                <th className="px-8 py-5 text-xs font-black text-text-muted uppercase tracking-widest text-left">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array(5).fill(null).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-8 py-6"><div className="h-16 bg-white/5 rounded-2xl animate-pulse" /></td></tr>
                ))
              ) : grades.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-24 text-center">
                  <div className="text-6xl mb-6 opacity-20">📊</div>
                  <p className="text-text-secondary font-black text-lg">لا يوجد درجات مرصودة بعد</p>
                </td></tr>
              ) : grades.map((g, i) => (
                <motion.tr
                  key={g._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent-blue/20 to-accent-indigo/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue font-black text-base shrink-0 group-hover:scale-110 transition-transform">
                        {g.student?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                         <div className="font-black text-text-primary text-base group-hover:text-accent-blue transition-colors leading-tight">{g.student?.name || 'طالب مجهول'}</div>
                         <div className="text-[10px] font-bold text-text-muted uppercase tracking-tighter mt-0.5">{g.student?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-black text-text-primary text-sm">{g.subject?.name}</div>
                    <div className="text-[10px] font-black text-accent-blue uppercase tracking-widest mt-1 flex items-center gap-1.5">
                       <Activity size={10} /> {g.examTitle}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center text-xs font-bold text-text-secondary">
                    {g.group?.name ? (
                       <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5">{g.group.name}</span>
                    ) : '-'}
                  </td>
                  <td className="px-8 py-5 text-center">
                     <div className="inline-flex flex-col items-center">
                        <div className="flex items-baseline gap-1">
                           <span className="text-lg font-black text-text-primary leading-none">{g.score}</span>
                           <span className="text-[10px] font-black text-text-muted uppercase">/ {g.totalScore}</span>
                        </div>
                        <div className="w-16 h-1 bg-white/5 rounded-full mt-2 overflow-hidden border border-white/5">
                           <div 
                             className={`h-full transition-all duration-500 ${g.score/g.totalScore >= 0.5 ? 'bg-accent-green' : 'bg-accent-red'}`}
                             style={{ width: `${Math.min((g.score/g.totalScore)*100, 100)}%` }}
                           />
                        </div>
                     </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      ['ممتاز', 'جيد جداً', 'جيد', 'ناجح'].includes(g.status) 
                      ? 'bg-accent-green/10 text-accent-green border-accent-green/20' 
                      : 'bg-accent-red/10 text-accent-red border-accent-red/20'
                    }`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-tighter">
                    {new Date(g.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Card List */}
        <div className="md:hidden flex flex-col divide-y divide-white/5">
          {loading ? (
             Array(3).fill(null).map((_, i) => (
                <div key={i} className="p-6 animate-pulse space-y-4">
                  <div className="h-4 bg-white/10 rounded w-1/3" />
                  <div className="h-8 bg-white/10 rounded w-full" />
                </div>
             ))
          ) : grades.length === 0 ? (
             <div className="p-12 text-center text-text-muted">لا يوجد درجات مرصودة</div>
          ) : grades.map((g, i) => (
             <div key={g._id} className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue font-black">{g.student?.name?.charAt(0)}</div>
                      <div>
                         <div className="font-black text-text-primary text-sm">{g.student?.name}</div>
                         <div className="text-[10px] text-text-muted font-bold tracking-widest uppercase">{g.examTitle}</div>
                      </div>
                   </div>
                   <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${
                      ['ممتاز', 'جيد جداً', 'جيد', 'ناجح'].includes(g.status) 
                      ? 'bg-accent-green/10 text-accent-green border-accent-green/20' 
                      : 'bg-accent-red/10 text-accent-red border-accent-red/20'
                    }`}>
                      {g.status}
                    </span>
                </div>
                <div className="flex justify-between items-end bg-white/5 p-4 rounded-2xl border border-white/5">
                   <div className="space-y-1">
                      <div className="text-[10px] font-black text-text-muted uppercase">الدرجة المكتسبة</div>
                      <div className="flex items-baseline gap-1">
                         <span className="text-xl font-black text-accent-blue">{g.score}</span>
                         <span className="text-[10px] font-bold text-text-muted">/ {g.totalScore}</span>
                      </div>
                   </div>
                   <div className="text-left">
                      <div className="text-[10px] font-black text-text-muted uppercase mb-1">المادة</div>
                      <div className="text-xs font-black text-text-primary">{g.subject?.name}</div>
                   </div>
                </div>
             </div>
          ))}
        </div>
      </div>

      {/* Add Grade Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 50 }} 
              className="relative w-full max-w-2xl bg-bg-card border border-border rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-10 border-b border-border bg-gradient-to-br from-bg-card to-bg-secondary flex justify-between items-center sticky top-0 z-10">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-text-primary mb-1">رصد درجة اختبار جديد</h3>
                  <p className="text-[10px] md:text-sm text-text-secondary font-medium uppercase tracking-widest">أدخل تفاصيل الاختبار ودرجة الطالب بدقة</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-border text-text-muted hover:text-accent-red hover:bg-accent-red/10 transition-all flex items-center justify-center">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="p-6 md:p-10 space-y-6 md:space-y-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary mr-1 flex items-center gap-2 uppercase tracking-widest">
                      <User size={12} className="text-accent-blue" /> اختيار الطالب
                    </label>
                    <select value={form.student} onChange={e => setForm({ ...form, student: e.target.value })} className="input bg-bg-secondary h-12 md:h-14 text-sm" required>
                      <option value="">-- اختر طالب --</option>
                      {students.map(s => <option key={s._id} value={s.user?._id}>{s.user?.name} ({s.studentId})</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary mr-1 flex items-center gap-2 uppercase tracking-widest">
                      <BookOpen size={12} className="text-accent-indigo" /> المادة الدراسية
                    </label>
                    <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="input bg-bg-secondary h-12 md:h-14 text-sm" required>
                      <option value="">-- اختر مادة --</option>
                      {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.level || 'عام'})</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary mr-1 flex items-center gap-2 uppercase tracking-widest">
                      <ClipboardList size={12} className="text-accent-purple" /> عنوان الاختبار
                    </label>
                    <input type="text" placeholder="مثال: اختبار شهر أكتوبر" value={form.examTitle} onChange={e => setForm({ ...form, examTitle: e.target.value })} className="input bg-bg-secondary h-12 md:h-14 text-sm font-bold" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary mr-1 flex items-center gap-2 uppercase tracking-widest">
                      <Users size={12} className="text-accent-green" /> المجموعة (اختياري)
                    </label>
                    <select value={form.group} onChange={e => setForm({ ...form, group: e.target.value })} className="input bg-bg-secondary h-12 md:h-14 text-sm font-bold">
                      <option value="">-- اختر مجموعة --</option>
                      {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary mr-1 flex items-center gap-2 uppercase tracking-widest">
                      <Star size={12} className="text-accent-yellow" /> الدرجة المكتسبة
                    </label>
                    <input type="number" value={form.score} onChange={e => setForm({ ...form, score: e.target.value })} className="input bg-bg-secondary text-xl md:text-2xl font-black text-accent-blue text-center h-12 md:h-16" required min="0" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary mr-1 flex items-center gap-2 uppercase tracking-widest">
                      <Award size={12} className="text-accent-red" /> الدرجة الكلية
                    </label>
                    <input type="number" value={form.totalScore} onChange={e => setForm({ ...form, totalScore: e.target.value })} className="input bg-bg-secondary text-xl md:text-2xl font-black text-text-muted text-center h-12 md:h-16" required min="1" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondary mr-1 flex items-center gap-2 uppercase tracking-widest">
                    <Activity size={12} className="text-text-muted" /> ملاحظات إضافية
                  </label>
                  <textarea value={form.comments} onChange={e => setForm({ ...form, comments: e.target.value })} className="input bg-bg-secondary h-20 md:h-28 resize-none py-3 md:py-4 text-sm" placeholder="أضف أي ملاحظات حول أداء الطالب هنا..." />
                </div>

                <button 
                  type="submit" 
                  disabled={saving} 
                  className="w-full bg-accent-blue hover:bg-accent-blue-light disabled:opacity-50 text-white font-black py-4 md:py-5 rounded-2xl shadow-xl shadow-accent-blue/20 transition-all flex items-center justify-center gap-3 text-base md:text-lg sticky bottom-0"
                >
                  {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                  <span>{saving ? 'جاري حفظ النتائج...' : 'اعتماد وحفظ الدرجة'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherGradesPage;
