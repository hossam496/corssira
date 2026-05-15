import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, Send, FileText, Calendar, CheckCircle, Image as ImageIcon, Trash2, BookOpen, ChevronLeft, ArrowRight, AlertCircle, MessageCircle, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const StudentAssignmentsPage = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const fileInputRef = useRef(null);
  
  const [form, setForm] = useState({
    files: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/assignments');
        setAssignments(data.data || []);
      } catch (err) {
        toast.error('خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.files && !form.notes) return toast.error('يرجى إرفاق رابط الملف أو كتابة ملاحظات للحل');

    setSubmitting(true);
    try {
      await api.post(`/assignments/${selectedAssignment._id}/submit`, {
        files: form.files ? [form.files] : [],
        notes: form.notes
      });
      toast.success('تم تسليم الواجب بنجاح!');
      setShowModal(false);
      setForm({ files: '', notes: '' });
      setAssignments(assignments.map(a => a._id === selectedAssignment._id ? { ...a, submitted: true } : a));
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ في التسليم');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت');
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, files: reader.result });
    };
    reader.readAsDataURL(file);
  };

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
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent-purple/5 blur-[80px] rounded-full -z-10" />
        <h1 className="text-4xl font-black text-text-primary mb-3">الواجبات المطلوبة</h1>
        <p className="text-text-secondary max-w-2xl text-lg font-medium">قم برفع حلولك بانتظام وتابع ملاحظات المعلمين للحصول على أفضل التقييمات.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {assignments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-full py-32 text-center bg-bg-card/50 rounded-[3rem] border border-dashed border-border"
            >
              <div className="text-9xl mb-8 opacity-10">📂</div>
              <h3 className="text-2xl font-black text-text-primary mb-2">لا توجد واجبات حالياً</h3>
              <p className="text-text-secondary max-w-md mx-auto">أنت ملتزم تماماً! لا توجد مهام معلقة حالياً.</p>
            </motion.div>
          ) : (
            assignments.map((assignment, idx) => (
              <motion.div 
                key={assignment._id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.1 }}
                className="bg-bg-card border border-border rounded-[2.5rem] overflow-hidden group hover:border-accent-purple/40 transition-all duration-300 shadow-2xl flex flex-col h-full"
              >
                <div className="p-8 border-b border-white/5 relative">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-accent-purple/10 flex items-center justify-center text-accent-purple group-hover:scale-110 transition-transform">
                       <BookOpen size={24} />
                    </div>
                    {assignment.submitted ? (
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        assignment.submission?.status === 'صحيح' 
                        ? 'bg-accent-green/10 text-accent-green border-accent-green/20' 
                        : 'bg-accent-purple/10 text-accent-purple border-accent-purple/20'
                      }`}>
                        {assignment.submission?.status || 'مُسلم'}
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-full bg-accent-red/10 text-accent-red text-[10px] font-black uppercase tracking-widest border border-accent-red/20">
                        مطلوب
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-text-primary mb-2 group-hover:text-accent-purple transition-colors leading-tight line-clamp-2 min-h-[3.5rem]">{assignment.title}</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-text-muted bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/5">
                    <Calendar size={12} className="text-accent-red" /> 
                    استحقاق: {new Date(assignment.deadline).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary mb-8 line-clamp-3 leading-relaxed">
                      {assignment.description || 'لا يوجد وصف متاح لهذا الواجب.'}
                    </p>

                    {assignment.submitted && (
                      <div className="mb-8 p-5 bg-accent-blue/5 rounded-2xl border border-accent-blue/10 flex flex-col gap-3">
                         <div className="flex items-center gap-2">
                           <Award size={16} className="text-accent-yellow" />
                           <span className="text-sm font-black text-text-primary">النتيجة: {assignment.submission?.score || 0} / {assignment.totalMarks}</span>
                         </div>
                         {assignment.submission?.feedback && (
                           <div className="flex gap-4 pt-3 border-t border-accent-blue/10">
                              <MessageCircle size={18} className="text-accent-blue shrink-0" />
                              <p className="text-xs font-bold text-text-secondary">{assignment.submission.feedback}</p>
                           </div>
                         )}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => openSubmitModal(assignment)}
                    className={`w-full font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 group/btn ${
                      assignment.submitted 
                      ? 'bg-white/5 text-text-secondary border border-border hover:bg-white/10 hover:text-text-primary' 
                      : 'bg-accent-purple hover:bg-accent-purple-light text-white shadow-accent-purple/20'
                    }`}
                  >
                    <span>{assignment.submitted ? 'تحديث التسليم' : 'تسليم الواجب الآن'}</span>
                    <Upload size={20} className="transition-transform group-hover/btn:-translate-y-1" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative w-full max-w-2xl bg-bg-card border border-border rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-10 py-8 border-b border-border bg-gradient-to-r from-accent-purple/10 to-transparent flex justify-between items-center relative">
                <div className="absolute top-0 right-0 w-32 h-full bg-accent-purple/5 blur-3xl rounded-full -z-10" />
                <div>
                  <h2 className="text-2xl font-black text-text-primary">تسليم الواجب</h2>
                  <p className="text-sm text-text-secondary font-bold mt-1 max-w-[250px] truncate">{selectedAssignment?.title}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-12 h-12 rounded-2xl bg-white/5 border border-border text-text-muted hover:text-white transition-all flex items-center justify-center">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[70vh]">
                {/* Upload Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black text-accent-purple uppercase tracking-widest mb-2">
                    <ImageIcon size={16} /> رابط الملف أو صورة الحل
                  </div>
                  
                  {form.files && form.files.startsWith('data:image') ? (
                    <div className="relative w-full aspect-video bg-bg-secondary/50 rounded-[2.5rem] overflow-hidden border-2 border-dashed border-accent-purple/30 group p-4 transition-all hover:border-accent-purple/50">
                      <img src={form.files} alt="Preview" className="w-full h-full object-contain rounded-2xl" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          type="button"
                          onClick={() => setForm({ ...form, files: '' })}
                          className="bg-accent-red text-white px-6 py-3 rounded-2xl font-black shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                        >
                          <Trash2 size={18} /> حذف الصورة
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                          <FileText size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-purple transition-colors" />
                          <input 
                            type="text" 
                            placeholder="ضع رابط Google Drive هنا..." 
                            className="input bg-bg-secondary h-16 pr-12 text-sm border-border focus:border-accent-purple/50"
                            value={form.files} 
                            onChange={e => setForm({...form, files: e.target.value})} 
                          />
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current.click()}
                          className="h-16 px-8 rounded-2xl bg-accent-purple/5 border-2 border-dashed border-accent-purple/30 text-accent-purple font-black flex items-center justify-center gap-3 hover:bg-accent-purple/10 transition-all active:scale-95"
                        >
                          <Upload size={20} />
                          <span>رفع صورة</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-3 bg-white/5 rounded-xl border border-white/5">
                        <AlertCircle size={14} className="text-accent-yellow" />
                        <p className="text-[10px] font-bold text-text-muted uppercase">يمكنك إرفاق رابط مباشر للملف أو رفع صورة واضحة للحل يدوياً.</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Notes Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black text-accent-blue uppercase tracking-widest mb-2">
                    <MessageCircle size={16} /> ملاحظاتك للمعلم (اختياري)
                  </div>
                  <textarea 
                    className="input bg-bg-secondary h-40 resize-none py-5 px-6 text-sm border-border focus:border-accent-blue/50 placeholder:text-text-muted/50"
                    value={form.notes} 
                    onChange={e => setForm({...form, notes: e.target.value})} 
                    placeholder="اكتب أي استفسار أو توضيح للمعلم حول هذا الواجب..."
                  ></textarea>
                </div>

                {/* Submit Actions */}
                <div className="flex flex-col md:flex-row gap-4 pt-6">
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="flex-[2] bg-accent-purple hover:bg-accent-purple-light disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-xl shadow-accent-purple/30 transition-all flex items-center justify-center gap-3 text-lg active:scale-[0.98]"
                  >
                    {submitting ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                    <span>{submitting ? 'جاري الإرسال...' : 'اعتماد وتسليم الواجب'}</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)} 
                    className="flex-1 bg-white/5 hover:bg-white/10 text-text-muted hover:text-white font-black py-5 rounded-2xl border border-border transition-all"
                  >
                    إلغاء
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

export default StudentAssignmentsPage;
