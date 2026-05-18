import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, FileText, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const MaterialUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    group: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchFormData();
    }
  }, [isOpen]);

  const fetchFormData = async () => {
    try {
      const [subsRes, groupsRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/groups/teacher')
      ]);
      setSubjects(subsRes.data.data);
      setGroups(groupsRes.data.data);
      
      if (subsRes.data.data.length > 0) {
        setFormData(prev => ({ ...prev, subject: subsRes.data.data[0]._id }));
      }
    } catch (err) {
      toast.error('فشل في تحميل البيانات');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate type
      if (!selectedFile.type.match('application/pdf|image/.*')) {
        return toast.error('يرجى اختيار ملف PDF أو صورة فقط');
      }
      // Validate size (20MB)
      if (selectedFile.size > 20 * 1024 * 1024) {
        return toast.error('حجم الملف يجب أن لا يتجاوز 20 ميجابايت');
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('يرجى اختيار ملف للرفع');
    if (!formData.title || !formData.subject) return toast.error('يرجى إدخال البيانات المطلوبة');

    setLoading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('subject', formData.subject);
    if (formData.group) data.append('group', formData.group);

    try {
      await api.post('/materials/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('تم رفع الملف بنجاح');
      onUploadSuccess();
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في رفع الملف');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setFormData({ title: '', description: '', subject: subjects[0]?._id || '', group: '' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-bg-card border border-white/10 rounded-[3rem] p-10 shadow-3xl max-w-[600px] w-full overflow-hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-indigo flex items-center justify-center shadow-lg shadow-accent-blue/20">
                  <UploadCloud size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-text-primary leading-none mb-1">رفع ملف جديد</h3>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest">إضافة ملخصات أو مذكرات للطلاب</p>
                </div>
              </div>
              <button onClick={handleClose} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-text-muted hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Area */}
              <div className="relative">
                <input 
                  type="file" 
                  accept=".pdf,image/*" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all ${file ? 'border-accent-green bg-accent-green/5' : 'border-white/10 bg-white/5 hover:border-accent-blue/30'}`}>
                  {file ? (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-accent-green/10 flex items-center justify-center text-accent-green mb-4">
                        <CheckCircle size={32} />
                      </div>
                      <p className="text-sm font-black text-text-primary mb-1">{file.name}</p>
                      <p className="text-xs text-text-muted">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue mb-4">
                        <UploadCloud size={32} />
                      </div>
                      <p className="text-sm font-black text-text-primary mb-1">اضغط هنا أو اسحب الملف</p>
                      <p className="text-xs text-text-muted">يدعم PDF والصور (الحد الأقصى 20MB)</p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-text-secondary mr-1 flex items-center gap-2 uppercase tracking-widest">عنوان الملف</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input bg-bg-secondary h-14 rounded-2xl border-white/5 focus:border-accent-blue/30 text-sm font-bold"
                  placeholder="مثال: مذكرة الفصل الأول"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-secondary mr-1 flex items-center gap-2 uppercase tracking-widest">المادة الدراسية</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input bg-bg-secondary h-14 rounded-2xl border-white/5 focus:border-accent-blue/30 text-sm font-bold appearance-none cursor-pointer"
                    required
                  >
                    {subjects.map(sub => (
                      <option key={sub._id} value={sub._id}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-text-secondary mr-1 flex items-center gap-2 uppercase tracking-widest">المجموعة (اختياري)</label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    className="input bg-bg-secondary h-14 rounded-2xl border-white/5 focus:border-accent-blue/30 text-sm font-bold appearance-none cursor-pointer"
                  >
                    <option value="">الكل</option>
                    {groups.map(grp => (
                      <option key={grp._id} value={grp._id}>{grp.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent-blue hover:bg-accent-blue-light text-white font-black py-4 rounded-2xl shadow-xl shadow-accent-blue/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <UploadCloud size={20} />}
                  <span>{loading ? 'جاري الرفع...' : 'رفع الملف'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MaterialUploadModal;
