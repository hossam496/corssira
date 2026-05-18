import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderUp, FileText, Image as ImageIcon, Trash2, Search, Download } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import MaterialUploadModal from '../../components/MaterialUploadModal';

const TeacherMaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/materials/teacher');
      setMaterials(res.data.data);
    } catch (err) {
      toast.error('فشل في تحميل الملفات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الملف نهائياً؟')) return;
    try {
      await api.delete(`/materials/${id}`);
      toast.success('تم حذف الملف بنجاح');
      setMaterials(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      toast.error('فشل في حذف الملف');
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container max-w-[1400px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue">
               <FolderUp size={20} />
            </div>
            <h1 className="text-3xl font-black text-text-primary">مكتبة الملفات</h1>
          </div>
          <p className="text-text-secondary font-medium">قم بإدارة المذكرات والملفات والصور التعليمية وشاركها مع طلابك.</p>
        </motion.div>

        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} 
          className="btn btn-primary px-8 py-4 rounded-2xl shadow-blue flex items-center gap-2 text-lg font-black shrink-0" 
          onClick={() => setIsModalOpen(true)}
        >
          <FolderUp size={24} strokeWidth={3} />
          رفع ملف جديد
        </motion.button>
      </div>

      <div className="relative mb-10 max-w-xl">
        <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
        <input 
          type="text" 
          placeholder="ابحث في الملفات بالاسم أو المادة..."
          className="input bg-bg-card/50 h-14 pr-14 border-white/5 focus:border-accent-blue/30 text-sm font-bold w-full rounded-2xl transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
           <div className="animate-spin w-10 h-10 border-4 border-accent-blue/20 border-t-accent-blue rounded-full"></div>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-bg-card/40 border-2 border-dashed border-white/5 rounded-[3rem] py-24 text-center">
          <div className="w-24 h-24 mx-auto rounded-[2rem] bg-white/5 flex items-center justify-center text-accent-blue/50 mb-6">
            <FolderUp size={48} />
          </div>
          <h3 className="text-2xl font-black text-text-primary mb-2">لا توجد ملفات</h3>
          <p className="text-text-secondary">قم برفع أول ملف أو مذكرة لطلابك الآن.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredMaterials.map((material) => (
              <motion.div 
                key={material._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="bg-bg-card border border-white/5 rounded-[2rem] p-6 relative group hover:border-accent-blue/30 transition-all shadow-xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${material.fileType === 'pdf' ? 'bg-accent-red/10 text-accent-red' : 'bg-accent-blue/10 text-accent-blue'}`}>
                    {material.fileType === 'pdf' ? <FileText size={24} /> : <ImageIcon size={24} />}
                  </div>
                  <button onClick={() => handleDelete(material._id)} className="w-8 h-8 rounded-xl bg-accent-red/10 text-accent-red flex items-center justify-center hover:bg-accent-red hover:text-white transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="text-lg font-black text-text-primary mb-1 line-clamp-1">{material.title}</h3>
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-text-muted">
                  <span className="bg-white/5 px-2 py-1 rounded-lg border border-white/5">{material.subject?.name}</span>
                  {material.group && <span className="bg-white/5 px-2 py-1 rounded-lg border border-white/5">{material.group.name}</span>}
                </div>
                <a 
                  href={material.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-black transition-colors"
                >
                  <Download size={16} className="text-accent-blue" />
                  عرض وتحميل
                </a>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <MaterialUploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUploadSuccess={fetchMaterials}
      />
    </div>
  );
};

export default TeacherMaterialsPage;
