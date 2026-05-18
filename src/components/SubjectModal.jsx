import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, BookOpen, Layers, Type, FileText } from 'lucide-react';
import { SUBJECT_CATEGORIES } from '../data/mockData';

const SubjectModal = ({ isOpen, onClose, onSave, subject, isEdit }) => {
  const [form, setForm] = useState({
    name: '', category: 'علمي', lecturesCount: 20, icon: '📖', color: '#3b82f6', description: ''
  });

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: subject?.name || '',
        category: subject?.category || 'علمي',
        lecturesCount: subject?.lecturesCount || 20,
        icon: subject?.icon || '📖',
        color: subject?.color || '#3b82f6',
        description: subject?.description || '',
      });
    }
  }, [isOpen, subject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, lecturesCount: Number(form.lecturesCount) });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-bg-card border border-white/10 rounded-[3rem] p-10 shadow-3xl max-w-[600px] w-full overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-indigo flex items-center justify-center shadow-lg shadow-accent-blue/20">
                  <BookOpen size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-text-primary leading-none mb-1">
                    {isEdit ? 'تعديل مادة دراسية' : 'إضافة مادة جديدة'}
                  </h3>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest">إدارة المحتوى التعليمي والمناهج</p>
                </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-text-muted hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-xs font-black text-text-secondary mr-1 flex items-center gap-2 uppercase tracking-widest">
                  <Type size={14} className="text-accent-blue" /> اسم المادة الدراسية
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input bg-bg-secondary h-14 rounded-2xl border-white/5 focus:border-accent-blue/30 text-sm font-bold"
                  placeholder="مثلاً: الرياضيات المتقدمة، لغة عربية..."
                  required
                />
              </div>

              {/* Category + Lectures */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-secondary mr-1 flex items-center gap-2 uppercase tracking-widest">
                    <Layers size={14} className="text-accent-purple" /> التصنيف
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="input bg-bg-secondary h-14 rounded-2xl border-white/5 focus:border-accent-blue/30 text-sm font-bold appearance-none cursor-pointer"
                  >
                    {SUBJECT_CATEGORIES.filter(c => c !== 'الكل').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-secondary mr-1 flex items-center gap-2 uppercase tracking-widest">
                    <BookOpen size={14} className="text-accent-green" /> عدد المحاضرات
                  </label>
                  <input
                    name="lecturesCount"
                    type="number"
                    value={form.lecturesCount}
                    onChange={handleChange}
                    className="input bg-bg-secondary h-14 rounded-2xl border-white/5 focus:border-accent-blue/30 text-sm font-bold"
                    required
                  />
                </div>
              </div>



              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-black text-text-secondary mr-1 flex items-center gap-2 uppercase tracking-widest">
                  <FileText size={14} className="text-accent-yellow" /> وصف المادة وأهدافها
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="input bg-bg-secondary h-24 rounded-2xl border-white/5 focus:border-accent-blue/30 text-sm font-medium py-4 resize-none"
                  placeholder="اكتب وصفاً موجزاً للمادة وما سيتعلمه الطلاب في هذا المنهج..."
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-[2] bg-accent-blue hover:bg-accent-blue-light text-white font-black py-4 rounded-2xl shadow-xl shadow-accent-blue/20 transition-all flex items-center justify-center gap-3 text-lg"
                >
                  <Save size={20} />
                  <span>{isEdit ? 'حفظ التعديلات' : 'إضافة المادة الآن'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-text-muted hover:text-white font-black py-4 rounded-2xl border border-white/10 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SubjectModal;
