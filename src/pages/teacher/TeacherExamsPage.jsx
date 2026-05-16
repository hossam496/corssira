import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Loader2, Save, FileText, Clock, Settings, Trash2, HelpCircle, List, GraduationCap, Award, BookOpen, User, CheckCircle, Star, Users, Activity, AlertCircle, CalendarDays } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const TeacherExamsPage = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [examResults, setExamResults] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeResult, setActiveResult] = useState(null);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    group: '',
    schoolGrade: '',
    duration: 60,
    totalMarks: 0,
    startTime: '',
    endTime: '',
    allowMultipleAttempts: false,
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'اختيار من متعدد',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    correctAnswerIndex: -1,
    marks: 1
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      try {
        const [subRes, grpRes, examRes] = await Promise.all([
          api.get(`/subjects?teacher=${user._id}`),
          api.get('/groups/teacher'),
          api.get('/exams')
        ]);
        setSubjects(subRes.data.data || []);
        setGroups(grpRes.data.data || []);
        setExams(examRes.data.data || []);
      } catch (err) {
        toast.error('خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user._id]);

  const handleAddQuestion = () => {
    if (!currentQuestion.question) return toast.error('يرجى إدخال نص السؤال');
    if (currentQuestion.type === 'اختيار من متعدد') {
      if (currentQuestion.options.some(o => !o)) return toast.error('يرجى إكمال جميع الخيارات');
      if (currentQuestion.correctAnswerIndex === -1) return toast.error('يرجى تحديد الإجابة الصحيحة');
    }
    if (currentQuestion.type === 'صح وخطأ' && !currentQuestion.correctAnswer) {
        return toast.error('يرجى تحديد الإجابة الصحيحة (صح أو خطأ)');
    }

    let finalCorrectAnswer = currentQuestion.correctAnswer;
    if (currentQuestion.type === 'اختيار من متعدد') {
      finalCorrectAnswer = currentQuestion.options[currentQuestion.correctAnswerIndex];
    }
    
    setForm(f => {
      const newQuestions = [...f.questions, { ...currentQuestion, correctAnswer: finalCorrectAnswer }];
      const newTotalMarks = newQuestions.reduce((acc, q) => acc + Number(q.marks), 0);
      return { ...f, questions: newQuestions, totalMarks: newTotalMarks };
    });
    setCurrentQuestion({
      type: 'اختيار من متعدد',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      correctAnswerIndex: -1,
      marks: 1
    });
    toast.success('تم إضافة السؤال');
  };

  const removeQuestion = (index) => {
    setForm(f => {
      const newQuestions = f.questions.filter((_, i) => i !== index);
      const newTotalMarks = newQuestions.reduce((acc, q) => acc + Number(q.marks), 0);
      return { ...f, questions: newQuestions, totalMarks: newTotalMarks };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('يرجى إدخال عنوان الامتحان');
    if (!form.subject) return toast.error('يرجى اختيار المادة');
    if (form.questions.length === 0) return toast.error('يجب إضافة سؤال واحد على الأقل');

    setSaving(true);
    try {
      const payload = { ...form };
      if (form.startTime) payload.startTime = new Date(form.startTime).toISOString();
      if (form.endTime) payload.endTime = new Date(form.endTime).toISOString();
      
      const { data } = await api.post('/exams', payload);
      toast.success('تم إنشاء الامتحان بنجاح!');
      setExams([data.data, ...exams]);
      setShowModal(false);
      setForm({ 
        title: '', 
        description: '', 
        subject: '', 
        group: '', 
        schoolGrade: '',
        duration: 60, 
        totalMarks: 0, 
        startTime: '',
        endTime: '',
        allowMultipleAttempts: false, 
        questions: [] 
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const [gradingId, setGradingId] = useState(null);

  const handleManualGrade = async (questionId, isCorrect, marks) => {
    setGradingId(questionId);
    try {
      const { data } = await api.put(`/exams/results/${activeResult._id}/grade`, {
        questionId, isCorrect, marks
      });
      toast.success('تم تحديث الدرجة بنجاح');
      
      // Update local states
      const updatedResult = data.data;
      setActiveResult(updatedResult);
      setExamResults(prev => prev.map(r => r._id === updatedResult._id ? updatedResult : r));
    } catch (err) {
      toast.error('خطأ في تحديث الدرجة');
    } finally {
      setGradingId(null);
    }
  };

  const handleViewDetails = (result) => {
    setActiveResult(result);
    setShowDetailsModal(true);
  };

  const handleViewResults = async (exam) => {
    setSelectedExam(exam);
    setShowResultsModal(true);
    setLoadingResults(true);
    try {
      const { data } = await api.get(`/exams/${exam._id}/results`);
      setExamResults(data.data || []);
    } catch (err) {
      toast.error('خطأ في جلب النتائج');
    } finally {
      setLoadingResults(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="animate-spin text-accent-blue" size={40} />
      <span className="text-text-secondary font-bold">جاري تحميل الامتحانات...</span>
    </div>
  );

  return (
    <div className="page-container max-w-[1400px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-black text-text-primary mb-2 flex items-center gap-3">
            <FileText className="text-accent-blue" size={32} />
            إدارة الامتحانات
          </h1>
          <p className="text-text-secondary font-medium">أنشئ اختبارات تفاعلية وتابع نتائج طلابك فوراً</p>
        </motion.div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
          className="btn btn-primary px-8 py-4 rounded-2xl shadow-blue flex items-center gap-2 text-lg"
        >
          <Plus size={24} strokeWidth={3} />
          <span>إنشاء امتحان جديد</span>
        </motion.button>
      </div>

      {exams.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-bg-card border border-dashed border-border rounded-3xl py-24 text-center"
        >
          <div className="w-24 h-24 bg-accent-blue/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="text-accent-blue/30" size={48} />
          </div>
          <h3 className="text-2xl font-black text-text-primary mb-2">لا توجد امتحانات حالياً</h3>
          <p className="text-text-secondary mb-10 max-w-md mx-auto">ابدأ بإنشاء أول امتحان تفاعلي لطلابك لقياس مستواهم الدراسي</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary px-10 py-3 rounded-xl">أضف امتحانك الأول</button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {exams.map((exam, index) => (
            <motion.div 
              key={exam._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-bg-card border border-border rounded-3xl overflow-hidden group hover:border-accent-blue/50 transition-all duration-300 shadow-xl flex flex-col h-full"
            >
              <div className="p-7 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col gap-2">
                    <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue text-[10px] font-black rounded-full border border-accent-blue/20 uppercase tracking-widest w-fit">
                      {exam.subject?.name || 'مادة عامة'}
                    </span>
                    <h3 className="text-xl font-black text-text-primary group-hover:text-accent-blue transition-colors line-clamp-1">{exam.title}</h3>
                  </div>
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                    <Award className="text-accent-blue" size={24} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                   <div className="bg-bg-secondary/50 p-3 rounded-2xl border border-white/5 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-text-muted uppercase">الأسئلة</span>
                      <span className="text-sm font-black text-text-primary flex items-center gap-2">
                        <List size={14} className="text-accent-blue" /> {exam.questions?.length || 0} سؤال
                      </span>
                   </div>
                   <div className="bg-bg-secondary/50 p-3 rounded-2xl border border-white/5 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-text-muted uppercase">الوقت</span>
                      <span className="text-sm font-black text-text-primary flex items-center gap-2">
                        <Clock size={14} className="text-accent-yellow" /> {exam.duration} دقيقة
                      </span>
                   </div>
                </div>

                <p className="text-text-secondary text-sm leading-relaxed line-clamp-2 min-h-[40px]">
                  {exam.description || 'لا يوجد وصف مضاف لهذا الامتحان.'}
                </p>
              </div>

              <div className="p-6 pt-0 mt-2 flex gap-3">
                 <button 
                   onClick={() => handleViewResults(exam)}
                   className="flex-1 bg-accent-blue text-white font-black py-3.5 rounded-2xl hover:bg-accent-blue-light transition-all shadow-lg shadow-accent-blue/20 flex items-center justify-center gap-2"
                 >
                   <GraduationCap size={18} /> عرض النتائج
                 </button>
                 <button className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-border hover:bg-white/10 hover:border-accent-blue/30 transition-all text-text-muted hover:text-accent-blue">
                   <Settings size={20} />
                 </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-bg-card border border-border rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[95vh] md:h-[90vh]"
            >
              {/* Left Sidebar - Question List */}
              <div className="w-full md:w-80 lg:w-96 bg-bg-secondary/30 border-b md:border-b-0 md:border-l border-border p-5 sm:p-8 overflow-y-auto flex flex-col max-h-[300px] md:max-h-none">
                <div className="mb-6 md:mb-8 flex justify-between items-center md:block">
                  <div>
                    <h2 className="text-lg md:text-xl font-black text-text-primary">أسئلة الامتحان</h2>
                    <p className="text-[10px] md:text-xs text-text-secondary font-bold mt-1 uppercase tracking-widest">تم إضافة {form.questions.length} أسئلة</p>
                  </div>
                  <div className="md:hidden">
                    <span className="text-xs font-black text-accent-green">{form.questions.reduce((acc, q) => acc + Number(q.marks), 0)} درجة</span>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 flex-1">
                  {form.questions.length === 0 ? (
                    <div className="py-8 md:py-12 text-center opacity-30 flex flex-col items-center gap-3">
                      <HelpCircle size={32} className="md:size-10" />
                      <p className="text-[10px] font-black uppercase tracking-widest">لم يتم إضافة أسئلة بعد</p>
                    </div>
                  ) : (
                    form.questions.map((q, i) => (
                      <div key={i} className="bg-bg-card border border-border rounded-xl md:rounded-2xl p-3 sm:p-4 relative group">
                        <div className="text-[9px] font-black text-accent-blue mb-1 uppercase tracking-tighter">السؤال {i + 1} • {q.type}</div>
                        <div className="text-xs font-bold text-text-primary line-clamp-2">{q.question}</div>
                        <button 
                          onClick={() => removeQuestion(i)}
                          className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-accent-red text-white rounded-full flex items-center justify-center shadow-lg active:scale-90"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-6 sm:pt-8 border-t border-border/10 space-y-4 mt-auto">
                  <div className="hidden md:flex justify-between items-center text-xs font-black px-1 uppercase tracking-widest">
                    <span className="text-text-secondary">إجمالي الدرجات:</span>
                    <span className="text-accent-green">{form.questions.reduce((acc, q) => acc + Number(q.marks), 0)} درجة</span>
                  </div>
                  <button 
                    onClick={handleSave}
                    disabled={saving || form.questions.length === 0}
                    className="w-full bg-accent-green hover:bg-accent-green/80 disabled:opacity-50 text-white font-black py-4 rounded-xl md:rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    <span>نشر وحفظ الامتحان</span>
                  </button>
                </div>
              </div>

              {/* Main Content - Question Editor */}
              <div className="flex-1 p-6 sm:p-10 overflow-y-auto bg-bg-card">
                <div className="flex justify-between items-center mb-8 md:mb-10">
                   <h3 className="text-xl md:text-2xl font-black text-text-primary">إضافة سؤال جديد</h3>
                   <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-text-muted hover:text-white transition-colors"><X size={24} /></button>
                </div>

                {form.questions.length === 0 && (
                  <div className="bg-accent-blue/5 border border-accent-blue/10 rounded-2xl md:rounded-3xl p-5 md:p-6 mb-8 md:mb-10 space-y-6">
                    <div className="flex items-center gap-2 text-xs md:text-sm font-black text-accent-blue mb-2 uppercase tracking-widest">
                      <Settings size={18} /> إعدادات الامتحان العامة
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-text-secondary mr-1 uppercase tracking-widest">عنوان الامتحان</label>
                       <input className="input bg-bg-secondary h-12 text-sm font-bold" placeholder="مثال: اختبار الشهر الأول - الكيمياء" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-text-secondary mr-1 uppercase tracking-widest">المادة</label>
                          <select className="input bg-bg-secondary h-12 text-sm font-bold" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}>
                            <option value="">اختر المادة</option>
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-text-secondary mr-1 uppercase tracking-widest">السنة الدراسية</label>
                          <select className="input bg-bg-secondary h-12 text-sm font-bold" value={form.schoolGrade} onChange={e => setForm({...form, schoolGrade: e.target.value})}>
                            <option value="">عام (للجميع)</option>
                            <option value="أولى ثانوي">أولى ثانوي</option>
                            <option value="ثانية ثانوي">ثانية ثانوي</option>
                            <option value="ثالثة ثانوي">ثالثة ثانوي</option>
                          </select>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-text-secondary mr-1 uppercase tracking-widest">المجموعة (اختياري)</label>
                          <select className="input bg-bg-secondary h-12 text-sm font-bold" value={form.group} onChange={e => setForm({...form, group: e.target.value})}>
                            <option value="">جميع المجموعات</option>
                            {groups.filter(g => !form.schoolGrade || g.schoolGrade === form.schoolGrade).map(g => (
                              <option key={g._id} value={g._id}>{g.name}</option>
                            ))}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-text-secondary mr-1 uppercase tracking-widest">مدة الامتحان (دقيقة)</label>
                          <input type="number" className="input bg-bg-secondary h-12 text-sm font-black text-center" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} />
                       </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-text-secondary mr-1 flex items-center gap-2 uppercase tracking-widest">
                             <CalendarDays size={14} className="text-accent-blue" /> موعد البداية
                           </label>
                           <input type="datetime-local" className="input bg-bg-secondary h-12 text-[10px] sm:text-xs" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-text-secondary mr-1 flex items-center gap-2 uppercase tracking-widest">
                             <CalendarDays size={14} className="text-accent-red" /> موعد الإغلاق
                           </label>
                           <input type="datetime-local" className="input bg-bg-secondary h-12 text-[10px] sm:text-xs" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
                        </div>
                     </div>
                  </div>
                )}

                <div className="space-y-6">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary mr-1 uppercase tracking-widest">نوع السؤال</label>
                        <select className="input bg-bg-secondary h-12 text-sm font-bold" value={currentQuestion.type} onChange={e => setCurrentQuestion({...currentQuestion, type: e.target.value, correctAnswer: '', options: ['', '', '', '']})}>
                          <option value="اختيار من متعدد">اختيار من متعدد</option>
                          <option value="صح وخطأ">صح وخطأ</option>
                          <option value="سؤال مقالي">سؤال مقالي</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary mr-1 uppercase tracking-widest">درجة السؤال</label>
                        <input type="number" className="input bg-bg-secondary h-12 text-sm font-black text-center" value={currentQuestion.marks} onChange={e => setCurrentQuestion({...currentQuestion, marks: e.target.value})} />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-secondary mr-1 uppercase tracking-widest">نص السؤال</label>
                      <textarea className="input bg-bg-secondary h-20 md:h-24 resize-none py-3 text-sm font-bold" placeholder="اكتب السؤال هنا..." value={currentQuestion.question} onChange={e => setCurrentQuestion({...currentQuestion, question: e.target.value})} />
                   </div>

                   {currentQuestion.type === 'اختيار من متعدد' && (
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-text-secondary mr-1 uppercase tracking-widest">الخيارات (حدد الإجابة الصحيحة)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {currentQuestion.options.map((opt, i) => (
                             <div key={i} className="flex gap-2">
                                <input 
                                  className={`input bg-bg-secondary h-12 text-xs font-bold ${currentQuestion.correctAnswerIndex === i ? 'border-accent-green shadow-[0_0_15px_rgba(16,185,129,0.1)]' : ''}`} 
                                  placeholder={`خيار ${i + 1}`} 
                                  value={opt} 
                                  onChange={e => {
                                    const newOpts = [...currentQuestion.options];
                                    newOpts[i] = e.target.value;
                                    setCurrentQuestion({...currentQuestion, options: newOpts});
                                  }}
                                />
                                <button 
                                  type="button"
                                  onClick={() => setCurrentQuestion({...currentQuestion, correctAnswerIndex: i})}
                                  className={`w-12 shrink-0 rounded-xl flex items-center justify-center border transition-all ${currentQuestion.correctAnswerIndex === i ? 'bg-accent-green text-white border-accent-green' : 'bg-white/5 border-border text-text-muted hover:border-white/20'}`}
                                >
                                  {currentQuestion.correctAnswerIndex === i ? <CheckCircle size={18} /> : <div className="w-4 h-4 rounded-full border-2 border-current opacity-30" />}
                                </button>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}

                   {currentQuestion.type === 'صح وخطأ' && (
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-text-secondary mr-1 uppercase tracking-widest">حدد الإجابة الصحيحة</label>
                        <div className="grid grid-cols-2 gap-4">
                           {['صح', 'خطأ'].map(val => (
                             <button 
                               key={val}
                               type="button"
                               onClick={() => setCurrentQuestion({...currentQuestion, correctAnswer: val})}
                               className={`py-3 md:py-4 rounded-xl md:rounded-2xl font-black transition-all border text-sm ${currentQuestion.correctAnswer === val ? 'bg-accent-blue text-white border-accent-blue shadow-lg shadow-accent-blue/20' : 'bg-white/5 text-text-secondary border-border hover:border-white/20'}`}
                             >
                               {val}
                             </button>
                           ))}
                        </div>
                     </div>
                   )}

                   <button 
                    onClick={handleAddQuestion}
                    className="w-full mt-6 md:mt-10 btn btn-ghost border-2 border-dashed border-accent-blue/30 text-accent-blue hover:bg-accent-blue/5 py-4 rounded-xl md:rounded-2xl font-black flex items-center justify-center gap-2 text-sm transition-all active:scale-95"
                   >
                     <Plus size={20} /> إضافة السؤال للامتحان
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResultsModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowResultsModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              className="relative w-full max-w-5xl bg-bg-card border border-border rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]"
            >
              <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-border bg-gradient-to-r from-bg-card to-bg-secondary sticky top-0 z-10">
                <div className="flex justify-between items-start mb-6 sm:mb-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-text-primary">نتائج الامتحان</h2>
                    <p className="text-[10px] sm:text-sm text-accent-blue font-black mt-1 uppercase tracking-widest line-clamp-1">{selectedExam?.title}</p>
                  </div>
                  <button onClick={() => setShowResultsModal(false)} className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-accent-red/20 hover:text-accent-red transition-all">
                    <X size={20} sm:size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                   {[
                     { label: 'تم التسليم', value: examResults.length, icon: Users, color: 'text-accent-blue' },
                     { label: 'متوسط الدرجة', value: '78%', icon: Activity, color: 'text-accent-green' },
                     { label: 'أعلى درجة', value: '98%', icon: Star, color: 'text-accent-yellow' },
                     { label: 'حالات غش', value: '0', icon: AlertCircle, color: 'text-accent-red' },
                   ].map((stat, i) => (
                     <div key={i} className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5 flex items-center gap-3">
                        <div className={`${stat.color} bg-current/10 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0`}>
                           <stat.icon size={16} sm:size={20} />
                        </div>
                        <div className="min-w-0">
                           <div className="text-base sm:text-xl font-black text-text-primary">{stat.value}</div>
                           <div className="text-[8px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest truncate">{stat.label}</div>
                        </div>
                     </div>
                   ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-10 bg-bg-secondary/20">
                {loadingResults ? (
                  <div className="py-20 text-center flex flex-col items-center gap-4 text-text-secondary">
                    <Loader2 className="animate-spin" size={40} />
                    <span className="font-bold text-sm">جاري تحميل النتائج...</span>
                  </div>
                ) : examResults.length === 0 ? (
                  <div className="py-20 text-center bg-bg-card border border-dashed border-border rounded-3xl">
                     <div className="text-6xl mb-6 opacity-20">📊</div>
                     <p className="text-text-secondary font-black text-lg">لا توجد تسليمات لهذا الامتحان حتى الآن</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:gap-4">
                    {examResults.map((result, i) => (
                      <motion.div 
                        key={result._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-accent-blue/30 transition-all"
                      >
                        <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-accent-blue/10 border-2 border-accent-blue/20 flex items-center justify-center text-accent-blue font-black text-xl shrink-0 overflow-hidden">
                             {result.student?.avatar ? <img src={result.student.avatar} className="w-full h-full object-cover" /> : result.student?.name?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base sm:text-lg font-black text-text-primary group-hover:text-accent-blue transition-colors truncate">{result.student?.name}</h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                               <span className="text-[9px] font-black text-text-secondary bg-white/5 px-2 py-0.5 rounded uppercase tracking-widest">مجموعة: {result.student?.group || 'عام'}</span>
                               <span className="text-[9px] font-black text-text-secondary flex items-center gap-1 uppercase tracking-widest"><Clock size={10} /> {new Date(result.createdAt).toLocaleDateString('ar-EG')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border/10">
                           <div className="text-right sm:text-left">
                              <div className={`text-xl sm:text-2xl font-black ${result.score >= selectedExam.totalMarks * 0.5 ? 'text-accent-green' : 'text-accent-red'}`}>{result.score}</div>
                              <div className="text-[9px] sm:text-[10px] font-black text-text-muted mt-1 uppercase tracking-widest text-right">من {selectedExam?.totalMarks}</div>
                           </div>
                           <button 
                             onClick={() => handleViewDetails(result)}
                             className="flex-1 sm:flex-none bg-accent-blue/10 text-accent-blue px-5 sm:px-6 py-2.5 rounded-xl font-bold hover:bg-accent-blue hover:text-white transition-all text-xs border border-accent-blue/20 uppercase tracking-widest"
                           >
                             التفاصيل
                           </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && activeResult && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-2 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDetailsModal(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-4xl bg-bg-card border border-white/10 rounded-3xl md:rounded-[2.5rem] shadow-3xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[85vh]"
            >
               <div className="p-6 sm:p-8 border-b border-white/10 bg-slate-900/50 flex justify-between items-center text-right" dir="rtl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue shrink-0">
                       <User size={20} sm:size={24} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-black text-white truncate">{activeResult.student?.name}</h3>
                      <p className="text-[10px] sm:text-xs text-text-muted font-bold mt-1 line-clamp-1">إجابات: {selectedExam?.title}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowDetailsModal(false)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-accent-red transition-all">
                    <X size={20} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
                  {selectedExam?.questions.map((q, idx) => {
                    const studentAns = activeResult.answers.find(a => a.questionId.toString() === q._id.toString());
                    const isCorrect = studentAns?.isCorrect;
                    
                    return (
                      <div key={q._id} className="bg-white/[0.02] border border-white/10 rounded-2xl md:rounded-3xl p-5 sm:p-6 relative overflow-hidden text-right" dir="rtl">
                         <div className={`absolute right-0 top-0 bottom-0 w-1.5 ${isCorrect ? 'bg-accent-green' : studentAns ? 'bg-accent-red' : 'bg-text-muted/20'}`} />
                         
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                               <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">سؤال {idx + 1}</span>
                               <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black uppercase text-text-secondary border border-white/5">{q.type}</span>
                            </div>
                            <div className={`text-[10px] font-black uppercase tracking-widest ${isCorrect ? 'text-accent-green' : 'text-accent-red'}`}>
                               {studentAns?.marks || 0} / {q.marks} درجة
                            </div>
                         </div>

                         <h4 className="text-base sm:text-lg font-bold text-white mb-6 leading-relaxed">{q.question}</h4>

                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-bg-secondary/50 p-4 rounded-2xl border border-white/5">
                               <div className="text-[9px] font-black text-text-muted uppercase mb-2 tracking-widest">إجابة الطالب</div>
                               <div className={`text-xs sm:text-sm font-black flex items-center gap-2 ${isCorrect ? 'text-accent-green' : 'text-accent-red'}`}>
                                  {isCorrect ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                  {studentAns?.answer || 'لم يتم الإجابة'}
                               </div>
                            </div>
                            <div className="bg-bg-secondary/50 p-4 rounded-2xl border border-white/5">
                               <div className="text-[9px] font-black text-text-muted uppercase mb-2 tracking-widest">الإجابة الصحيحة</div>
                               <div className="text-xs sm:text-sm font-black text-accent-blue flex items-center gap-2">
                                  <CheckCircle size={14} />
                                  {q.correctAnswer || '---'}
                               </div>
                            </div>
                         </div>

                         {q.type === 'سؤال مقالي' && (
                           <div className="mt-6 flex flex-col gap-4">
                              <div className="pt-4 border-t border-white/5">
                                <div className="text-[9px] font-black text-text-muted uppercase mb-2 tracking-widest">الإجابة التفصيلية</div>
                                <p className="text-xs sm:text-sm text-text-secondary italic leading-relaxed bg-white/5 p-4 rounded-xl">
                                  {studentAns?.answer || 'لا توجد إجابة مكتوبة'}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-3 justify-end">
                                 <button 
                                   onClick={() => handleManualGrade(q._id, true, q.marks)}
                                   disabled={gradingId === q._id || isCorrect}
                                   className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${isCorrect ? 'bg-accent-green text-white cursor-default' : 'bg-accent-green/10 text-accent-green hover:bg-accent-green hover:text-white border border-accent-green/20'}`}
                                 >
                                    {gradingId === q._id ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                                    صحيح ({q.marks} درجة)
                                 </button>
                                 <button 
                                   onClick={() => handleManualGrade(q._id, false, 0)}
                                   disabled={gradingId === q._id || (!isCorrect && studentAns)}
                                   className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${!isCorrect && studentAns ? 'bg-accent-red text-white cursor-default' : 'bg-accent-red/10 text-accent-red hover:bg-accent-red hover:text-white border border-accent-red/20'}`}
                                 >
                                    {gradingId === q._id ? <Loader2 className="animate-spin" size={14} /> : <X size={14} />}
                                    خطأ (0 درجة)
                                 </button>
                              </div>
                           </div>
                         )}

                      </div>
                    );
                  })}
               </div>

               <div className="p-6 sm:p-8 border-t border-white/10 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-center gap-6 text-right" dir="rtl">
                  <div className="flex gap-8 w-full sm:w-auto justify-between sm:justify-start">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">إجمالي النقاط</span>
                        <span className="text-xl sm:text-2xl font-black text-white">{activeResult.score} / {selectedExam?.totalMarks}</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">حالات الخروج</span>
                        <span className={`text-xl sm:text-2xl font-black ${activeResult.violationsCount > 0 ? 'text-accent-red' : 'text-accent-green'}`}>
                           {activeResult.violationsCount}
                        </span>
                     </div>
                  </div>
                  <button onClick={() => setShowDetailsModal(false)} className="w-full sm:w-auto btn btn-primary px-10 py-3 rounded-xl uppercase font-black text-sm tracking-widest">إغلاق</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherExamsPage;
