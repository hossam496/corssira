import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, BookOpen, Search, Filter, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import SubjectCard from '../../components/SubjectCard';
import SubjectModal from '../../components/SubjectModal';
import toast from 'react-hot-toast';

const TeacherSubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teachers/me');
      setSubjects(res.data.data.subjects || []);
    } catch (err) {
      toast.error('فشل في تحميل المواد الدراسية');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAdd = () => {
    setSelectedSubject(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (subject) => {
    setSelectedSubject(subject);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المادة؟ سيؤدي ذلك لحذف كافة البيانات المرتبطة بها.')) return;
    try {
      await api.delete(`/subjects/${id}`);
      toast.success('تم حذف المادة بنجاح');
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في حذف المادة');
    }
  };

  const handleSave = async (formData) => {
    const data = Object.fromEntries(formData.entries());
    try {
      if (isEdit) {
        await api.put(`/subjects/${selectedSubject._id}`, data);
        toast.success('تم تحديث المادة بنجاح');
      } else {
        await api.post('/subjects', data);
        toast.success('تم إضافة المادة بنجاح');
      }
      setModalOpen(false);
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في حفظ المادة');
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && subjects.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin" />
        <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent-blue" size={24} />
      </div>
      <span className="text-sm font-black text-text-secondary uppercase tracking-widest animate-pulse">جاري تحميل موادك الدراسية...</span>
    </div>
  );

  return (
    <div className="page-container max-w-[1400px]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue">
               <BookOpen size={20} />
            </div>
            <h1 className="text-3xl font-black text-text-primary">موادي الدراسية</h1>
          </div>
          <p className="text-text-secondary font-medium text-sm md:text-base mr-1">إدارة وتعديل المناهج الدراسية الخاصة بك في المنصة</p>
        </motion.div>

        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          className="bg-accent-blue hover:bg-accent-blue-light text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-accent-blue/20 transition-all flex items-center justify-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
            <Plus size={20} />
          </div>
          <span className="text-sm uppercase tracking-widest">إضافة مادة جديدة</span>
        </motion.button>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1 group">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-blue transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="ابحث عن مادة دراسية بالاسم أو التصنيف..."
            className="input bg-bg-card/50 h-14 pr-14 border-white/5 focus:border-accent-blue/30 text-sm font-bold w-full rounded-2xl transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content Section */}
      {subjects.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          className="bg-bg-card/40 backdrop-blur-md border-2 border-dashed border-white/5 rounded-[3rem] py-24 text-center flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center text-6xl mb-8 grayscale opacity-50">📚</div>
          <h3 className="text-2xl font-black text-text-primary mb-4">لا توجد مواد دراسية حالياً</h3>
          <p className="text-text-secondary max-w-md mx-auto mb-10 font-medium">
            يبدو أنك لم تقم بإضافة أي مواد دراسية بعد. ابدأ الآن بإضافة أول مادة لك ليتمكن الطلاب من الالتحاق بها.
          </p>
          <button 
            onClick={handleAdd}
            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 text-text-primary font-black px-10 py-4 rounded-2xl border border-white/10 transition-all group"
          >
            <Plus size={20} className="text-accent-blue" />
            <span>أضف مادتك الأولى الآن</span>
          </button>
        </motion.div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredSubjects.map((s) => (
              <SubjectCard 
                key={s._id} 
                subject={s} 
                isTeacherView={true} 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Info Box */}
      {subjects.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mt-16 bg-accent-blue/5 border border-accent-blue/10 rounded-3xl p-6 flex items-start gap-4"
        >
          <AlertCircle className="text-accent-blue shrink-0" size={24} />
          <div>
            <h4 className="text-sm font-black text-text-primary mb-1 uppercase tracking-widest">ملاحظة تنظيمية</h4>
            <p className="text-xs text-text-secondary font-bold leading-relaxed">
              جميع المواد التي تضيفها ستظهر للطلاب في المتجر العام، ويمكنهم طلب الالتحاق بها. يمكنك التحكم في تفعيل أو تعطيل المواد من خلال إعدادات كل مادة.
            </p>
          </div>
        </motion.div>
      )}

      {/* Modal */}
      <SubjectModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        subject={selectedSubject}
        isEdit={isEdit}
      />
    </div>
  );
};

export default TeacherSubjectsPage;
