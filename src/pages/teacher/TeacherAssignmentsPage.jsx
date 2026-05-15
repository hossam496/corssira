import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Loader2, Save, FileText, Calendar, Settings, Info, ExternalLink, Award, GraduationCap, BookOpen, User, Activity, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const TeacherAssignmentsPage = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingSubmission, setReviewingSubmission] = useState(null);
  const [reviewForm, setReviewForm] = useState({ grade: '', feedback: '', status: 'صحيح' });
  const [savingReview, setSavingReview] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    group: '',
    schoolGrade: '',
    deadline: '',
    totalMarks: 0,
    status: 'منشور'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, grpRes, assignRes] = await Promise.all([
          api.get(`/subjects?teacher=${user._id}`),
          api.get('/groups/teacher'),
          api.get('/assignments')
        ]);
        setSubjects(subRes.data.data || []);
        setGroups(grpRes.data.data || []);
        setAssignments(assignRes.data.data || []);
      } catch (err) {
        toast.error('خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user._id]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('يرجى إدخال اسم الواجب');
    if (!form.subject) return toast.error('يرجى اختيار المادة');
    if (!form.deadline) return toast.error('يرجى تحديد تاريخ التسليم');

    setSaving(true);
    try {
      const payload = {
        ...form,
        totalMarks: Number(form.totalMarks),
        group: form.group || null,
        schoolGrade: form.schoolGrade || null,
        questions: []
      };
      const { data } = await api.post('/assignments', payload);
      toast.success('تم إضافة الواجب بنجاح!');
      setAssignments([data.data, ...assignments]);
      setShowModal(false);
      setForm({ title: '', description: '', subject: '', group: '', schoolGrade: '', deadline: '', totalMarks: 0, status: 'منشور' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleViewSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionsModal(true);
    setLoadingSubmissions(true);
    try {
      const { data } = await api.get(`/assignments/${assignment._id}/submissions`);
      setSubmissions(data.data || []);
    } catch (err) {
      toast.error('خطأ في جلب التسليمات');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const openReviewModal = (sub) => {
    setReviewingSubmission(sub);
    setReviewForm({
      grade: sub.grade || '',
      feedback: sub.feedback || '',
      status: ['صحيح', 'خطأ', 'يحتاج تعديل'].includes(sub.status) ? sub.status : 'صحيح'
    });
    setReviewModalOpen(true);
  };

  const handleSaveReview = async () => {
    if (!reviewForm.grade) return toast.error('يرجى إدخال الدرجة');
    setSavingReview(true);
    try {
      await api.put(`/assignments/submissions/${reviewingSubmission._id}/grade`, reviewForm);
      toast.success('تم رصد الدرجة بنجاح');
      setSubmissions(prev => prev.map(s => s._id === reviewingSubmission._id ? { ...s, ...reviewForm } : s));
      setReviewModalOpen(false);
    } catch (err) {
      toast.error('حدث خطأ أثناء حفظ التقييم');
    } finally {
      setSavingReview(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="animate-spin text-accent-blue" size={40} />
      <span className="text-text-secondary font-bold">جاري تحميل الواجبات...</span>
    </div>
  );

  return (
    <div className="page-container max-w-[1400px]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-black text-text-primary mb-2 flex items-center gap-3">
            <BookOpen className="text-accent-blue" size={32} />
            إدارة الواجبات
          </h1>
          <p className="text-text-secondary font-medium">قم بإنشاء وتصحيح الواجبات الدراسية لطلابك</p>
        </motion.div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
          className="btn btn-primary px-8 py-4 rounded-2xl shadow-blue flex items-center gap-2 text-lg"
        >
          <Plus size={24} strokeWidth={3} />
          <span>إضافة واجب جديد</span>
        </motion.button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'إجمالي الواجبات', value: assignments.length, icon: FileText, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
          { label: 'بانتظار التصحيح', value: assignments.length > 0 ? '12' : '0', icon: Calendar, color: 'text-accent-yellow', bg: 'bg-accent-yellow/10' },
          { label: 'تم تسليمه اليوم', value: assignments.length > 0 ? '5' : '0', icon: GraduationCap, color: 'text-accent-green', bg: 'bg-accent-green/10' },
          { label: 'متوسط الدرجات', value: '85%', icon: Award, color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-accent-blue/30 transition-colors"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-2xl font-black text-text-primary">{stat.value}</div>
              <div className="text-xs text-text-secondary font-bold uppercase tracking-wider">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      {assignments.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-bg-card border border-dashed border-border rounded-3xl py-20 text-center"
        >
          <div className="w-20 h-20 bg-accent-blue/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="text-accent-blue/40" size={40} />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">لا توجد واجبات حالياً</h3>
          <p className="text-text-secondary mb-8">ابدأ بإضافة أول واجب لطلابك الآن</p>
          <button onClick={() => setShowModal(true)} className="btn btn-ghost border border-border px-6 py-2 rounded-xl text-accent-blue">
             أضف واجبك الأول
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {assignments.map((assignment, index) => (
            <motion.div 
              key={assignment._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-bg-card border border-border rounded-3xl overflow-hidden hover:border-accent-blue/50 transition-all duration-300 group shadow-lg flex flex-col h-full"
            >
              {/* Card Header */}
              <div className="p-6 pb-4 flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue text-[10px] font-black rounded-full uppercase tracking-widest border border-accent-blue/20">
                      {assignment.subject?.name || 'مادة غير محددة'}
                    </span>
                    {new Date(assignment.deadline) < new Date() && (
                      <span className="px-3 py-1 bg-accent-red/10 text-accent-red text-[10px] font-black rounded-full uppercase tracking-widest border border-accent-red/20">
                        منتهي
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-text-primary line-clamp-1 group-hover:text-accent-blue transition-colors">
                    {assignment.title}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                   <FileText className="text-accent-blue" size={24} />
                </div>
              </div>

              {/* Card Body */}
              <div className="px-6 flex-1">
                <p className="text-text-secondary text-sm leading-relaxed mb-6 line-clamp-2 min-h-[40px]">
                  {assignment.description || 'لا يوجد وصف مضاف لهذا الواجب.'}
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-text-secondary bg-white/5 p-3 rounded-xl border border-white/5">
                    <Calendar size={16} className="text-accent-blue" />
                    <span className="font-bold">الموعد: {new Date(assignment.deadline).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text-secondary bg-white/5 p-3 rounded-xl border border-white/5">
                    <Award size={16} className="text-accent-green" />
                    <span className="font-bold">الدرجة النهائية: {assignment.totalMarks} درجة</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 mt-4 border-t border-border/10 flex gap-3">
                <button 
                  onClick={() => handleViewSubmissions(assignment)}
                  className="flex-1 bg-accent-blue text-white font-bold py-3 rounded-2xl hover:bg-accent-blue-light transition-all shadow-md shadow-accent-blue/20 flex items-center justify-center gap-2"
                >
                  <GraduationCap size={18} />
                  <span>عرض التسليمات</span>
                </button>
                <button className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-border hover:bg-white/10 hover:border-accent-blue/30 transition-all text-text-secondary hover:text-accent-blue">
                   <Settings size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Assignment Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-bg-card border border-border rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
              dir="rtl"
            >
              <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-border flex justify-between items-center bg-bg-card sticky top-0 z-10">
                 <div>
                    <h2 className="text-xl sm:text-2xl font-black text-text-primary">إضافة واجب جديد</h2>
                    <p className="text-[10px] sm:text-sm text-text-secondary font-bold mt-1 uppercase tracking-widest">قم بتعبئة بيانات الواجب الأساسية لطلابك</p>
                 </div>
                 <button onClick={() => setShowModal(false)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/5 border border-border text-text-muted hover:text-white transition-all flex items-center justify-center">
                    <X size={24} />
                 </button>
              </div>

              <form onSubmit={handleSave} className="p-4 sm:p-10 space-y-6 sm:space-y-8 overflow-y-auto">
                <div className="bg-accent-blue/5 border border-accent-blue/10 rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 space-y-6">
                  <div className="flex items-center gap-2 text-[10px] sm:text-sm font-black text-accent-blue mb-2 uppercase tracking-widest">
                    <Settings size={18} /> إعدادات الواجب العامة
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] sm:text-xs font-black text-text-secondary mr-1 uppercase tracking-widest">اسم الواجب</label>
                      <input 
                        className="input bg-bg-secondary h-12 sm:h-14 text-sm font-bold" 
                        placeholder="مثال: واجب الدرس الأول"
                        value={form.title} 
                        onChange={e => setForm({...form, title: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-xs font-black text-text-secondary mr-1 uppercase tracking-widest">المادة</label>
                      <select 
                        className="input bg-bg-secondary h-12 sm:h-14 text-sm font-bold"
                        value={form.subject} 
                        onChange={e => setForm({...form, subject: e.target.value})}
                      >
                        <option value="">اختر المادة</option>
                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-xs font-black text-text-secondary mr-1 uppercase tracking-widest">السنة الدراسية</label>
                      <select className="input bg-bg-secondary h-12 sm:h-14 text-xs sm:text-sm font-bold" value={form.schoolGrade} onChange={e => setForm({...form, schoolGrade: e.target.value})}>
                        <option value="">عام (للجميع)</option>
                        <option value="أولى ثانوي">أولى ثانوي</option>
                        <option value="ثانية ثانوي">ثانية ثانوي</option>
                        <option value="ثالثة ثانوي">ثالثة ثانوي</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-xs font-black text-text-secondary mr-1 uppercase tracking-widest">المجموعة</label>
                      <select className="input bg-bg-secondary h-12 sm:h-14 text-xs sm:text-sm font-bold" value={form.group} onChange={e => setForm({...form, group: e.target.value})}>
                        <option value="">كل المجموعات</option>
                        {groups.filter(g => !form.schoolGrade || g.schoolGrade === form.schoolGrade).map(g => (
                          <option key={g._id} value={g._id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-xs font-black text-text-secondary mr-1 uppercase tracking-widest">تاريخ التسليم</label>
                      <input type="date" className="input bg-bg-secondary h-12 sm:h-14 text-xs sm:text-sm font-bold" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-xs font-black text-text-secondary mr-1 uppercase tracking-widest">الدرجة</label>
                      <input 
                        type="number" 
                        className="input bg-bg-secondary h-12 sm:h-14 text-sm font-bold" 
                        placeholder="20"
                        value={form.totalMarks} 
                        onChange={e => setForm({...form, totalMarks: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] sm:text-xs font-black text-text-secondary mr-1 uppercase tracking-widest">الوصف والتعليمات</label>
                    <textarea 
                      className="input bg-bg-secondary h-24 sm:h-32 resize-none py-3 sm:py-4 text-sm font-medium" 
                      placeholder="اشرح لطلابك ما المطلوب..."
                      value={form.description} 
                      onChange={e => setForm({...form, description: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sticky bottom-0 bg-bg-card md:relative">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-accent-blue hover:bg-accent-blue-light disabled:opacity-50 text-white font-black py-4 sm:py-5 rounded-2xl shadow-xl shadow-accent-blue/20 transition-all flex items-center justify-center gap-3 text-base sm:text-lg order-1 sm:order-none"
                  >
                    {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                    <span>نشر الواجب الآن</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 sm:px-10 bg-white/5 hover:bg-white/10 text-text-muted hover:text-white font-black py-4 sm:py-5 rounded-2xl border border-border transition-all text-sm sm:text-base"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submissions Modal */}
      <AnimatePresence>
        {showSubmissionsModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSubmissionsModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="relative w-full max-w-4xl bg-bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]"
            >
              <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-border flex justify-between items-center bg-bg-card sticky top-0 z-10">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-text-primary">تسليمات الطلاب</h2>
                  <p className="text-[10px] sm:text-xs text-text-secondary font-bold mt-1 uppercase tracking-widest line-clamp-1">{selectedAssignment?.title}</p>
                </div>
                <button onClick={() => setShowSubmissionsModal(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-accent-red/20 hover:text-accent-red transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 bg-bg-secondary/30">
                {loadingSubmissions ? (
                  <div className="py-20 flex flex-col items-center gap-4 text-text-secondary">
                    <Loader2 className="animate-spin" size={40} />
                    <span className="font-bold text-sm">جاري تحميل التسليمات...</span>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="py-20 text-center bg-bg-card border border-dashed border-border rounded-3xl">
                     <div className="text-5xl mb-4 opacity-30">📤</div>
                     <p className="text-text-secondary font-bold">لا توجد تسليمات بعد لهذا الواجب</p>
                  </div>
                ) : (
                  submissions.map((sub, i) => (
                    <motion.div 
                      key={sub._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 hover:border-accent-blue/30 transition-all group"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-accent-blue/10 border-2 border-accent-blue/20 flex items-center justify-center text-accent-blue font-black text-lg shrink-0 overflow-hidden">
                          {sub.student?.avatar ? <img src={sub.student.avatar} className="w-full h-full object-cover" /> : sub.student?.name?.charAt(0) || 'S'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-sm sm:text-base text-text-primary group-hover:text-accent-blue transition-colors">
                            {sub.student?.name || 'طالب مجهول'}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[9px] sm:text-[10px] font-black text-text-secondary uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(sub.submittedAt).toLocaleDateString('ar-EG')}</span>
                            <span className={`flex items-center gap-1 ${sub.status === 'صحيح' ? 'text-accent-green' : sub.status === 'خطأ' ? 'text-accent-red' : 'text-accent-yellow'}`}>
                               {sub.status || 'قيد المراجعة'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border/10">
                         <div className="text-right sm:text-left">
                            <div className="text-base sm:text-lg font-black text-accent-blue leading-none">{sub.grade || 0}</div>
                            <div className="text-[9px] sm:text-[10px] font-black text-text-muted mt-1 uppercase tracking-tighter">من {selectedAssignment?.totalMarks}</div>
                         </div>
                         <div className="hidden sm:block h-10 w-[1px] bg-border mx-2" />
                         <button 
                            onClick={() => openReviewModal(sub)}
                            className="flex-1 sm:flex-none bg-accent-blue/10 text-accent-blue px-5 sm:px-6 py-2.5 rounded-xl font-bold hover:bg-accent-blue hover:text-white transition-all text-xs border border-accent-blue/20 flex items-center justify-center gap-2"
                         >
                           <Activity size={14} /> تصحيح الواجب
                         </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Review Modal */}
      <AnimatePresence>
        {reviewModalOpen && (
          <div className="fixed inset-0 z-[2100] flex items-center justify-center p-2 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setReviewModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-5xl bg-bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[95vh] md:h-auto md:max-h-[90vh]"
            >
              {/* Attachment Viewer */}
              <div className="w-full md:w-3/5 bg-black/30 p-4 sm:p-6 flex flex-col border-b md:border-b-0 md:border-l border-border max-h-[40vh] md:max-h-none overflow-y-auto">
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                       <FileText size={14} className="text-accent-blue" /> مرفقات الطالب
                    </span>
                    {reviewingSubmission?.files?.[0] && (
                      <a href={reviewingSubmission.files[0]} target="_blank" className="text-accent-blue hover:underline text-[10px] flex items-center gap-1 font-black uppercase tracking-widest">
                         <ExternalLink size={12} /> فتح في نافذة جديدة
                      </a>
                    )}
                 </div>
                 <div className="flex-1 bg-bg-secondary rounded-2xl border border-border overflow-hidden relative group min-h-[250px] md:min-h-[500px]">
                    {reviewingSubmission?.files && reviewingSubmission.files[0] ? (
                      reviewingSubmission.files[0].endsWith('.pdf') ? (
                        <iframe src={reviewingSubmission.files[0]} className="w-full h-full border-none" title="Student Submission" />
                      ) : (
                        <img src={reviewingSubmission.files[0]} className="w-full h-full object-contain" alt="Student Submission" />
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-text-muted gap-3">
                         <X size={40} className="opacity-20" />
                         <span className="text-[10px] font-black uppercase tracking-widest">لا يوجد مرفق متاح</span>
                      </div>
                    )}
                 </div>
              </div>

              {/* Grading Form */}
              <div className="w-full md:w-2/5 p-5 sm:p-8 flex flex-col overflow-y-auto bg-bg-card">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-lg sm:text-xl font-black text-text-primary">تصحيح الواجب</h3>
                   <button onClick={() => setReviewModalOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-text-muted hover:text-accent-red transition-all"><X size={20} /></button>
                </div>

                <div className="space-y-5 sm:space-y-6 flex-1">
                   <div className="flex items-center gap-3 bg-accent-blue/5 p-4 rounded-2xl border border-accent-blue/10">
                      <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue font-black shrink-0">
                         {reviewingSubmission?.student?.name?.charAt(0) || 'S'}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="text-sm font-black text-text-primary truncate">{reviewingSubmission?.student?.name}</div>
                         <div className="text-[9px] text-text-muted font-bold uppercase tracking-tighter">تاريخ التسليم: {new Date(reviewingSubmission?.submittedAt).toLocaleDateString('ar-EG')}</div>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-secondary mr-1 uppercase tracking-widest">الدرجة المستحقة</label>
                      <div className="flex items-center gap-4">
                         <input 
                           type="number" 
                           className="input bg-bg-secondary text-2xl font-black text-accent-blue h-14 text-center border-2 border-transparent focus:border-accent-blue/30" 
                           placeholder="0"
                           value={reviewForm.grade}
                           onChange={e => setReviewForm({...reviewForm, grade: e.target.value})}
                         />
                         <div className="text-lg font-black text-text-muted shrink-0 uppercase tracking-tighter">/ {selectedAssignment?.totalMarks}</div>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-secondary mr-1 uppercase tracking-widest">التقييم</label>
                      <div className="grid grid-cols-3 gap-2">
                         {[
                           { val: 'صحيح', color: 'accent-green' },
                           { val: 'يحتاج تعديل', color: 'accent-yellow' },
                           { val: 'خطأ', color: 'accent-red' }
                         ].map(item => (
                           <button 
                             key={item.val}
                             onClick={() => setReviewForm({...reviewForm, status: item.val})}
                             className={`py-3 rounded-xl text-[10px] font-black border transition-all ${
                                 reviewForm.status === item.val 
                                ? `bg-accent-blue text-white border-accent-blue shadow-lg` 
                                : `bg-white/5 text-text-secondary border-border hover:border-white/20`
                             }`}
                           >
                             {item.val}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-secondary mr-1 uppercase tracking-widest">ملاحظات المعلم</label>
                      <textarea 
                        className="input bg-bg-secondary h-24 resize-none py-3 text-sm font-medium" 
                        placeholder="اكتب ملاحظاتك للطالب هنا..."
                        value={reviewForm.feedback}
                        onChange={e => setReviewForm({...reviewForm, feedback: e.target.value})}
                      />
                   </div>
                </div>

                <div className="mt-6 sm:mt-8 pt-4 border-t border-border/10">
                  <button 
                    onClick={handleSaveReview}
                    disabled={savingReview}
                    className="w-full bg-accent-blue hover:bg-accent-blue-light disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl shadow-accent-blue/20 flex items-center justify-center gap-3 transition-all active:scale-95"
                  >
                     {savingReview ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                     <span className="text-sm uppercase tracking-widest">اعتماد النتيجة</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherAssignmentsPage;
