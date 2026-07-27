import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Image as ImageIcon, Download, Eye, X, Loader2,
  FolderOpen, Search, Filter, AlertCircle, Calendar, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });

const getSecureDownloadUrl = (fileId) => {
  const token = localStorage.getItem('token') || localStorage.getItem('corssira_token') || '';
  const base = api.defaults.baseURL || '/api';
  const absoluteBase = base.startsWith('http') ? base : `${window.location.origin}${base}`;
  return `${absoluteBase}/shared-files/secure/${fileId}?token=${token}`;
};

const StudentFilesPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all'); // all, pdf, image

  // Fetch shared files
  const fetchFiles = useCallback(async () => {
    try {
      const { data } = await api.get('/shared-files');
      setFiles(data.data || []);
    } catch (err) {
      toast.error('حدث خطأ في تحميل مكتبة الملفات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Filtered files list
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = fileTypeFilter === 'all' || file.fileType === fileTypeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-accent-blue" size={48} />
    </div>
  );

  return (
    <div className="page-container max-w-[1200px]" dir="rtl">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 relative"
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent-purple/5 blur-[80px] rounded-full -z-10" />
        <h1 className="text-3xl font-black text-text-primary mb-2 flex items-center gap-3">
          <FolderOpen className="text-accent-blue" size={32} />
          مكتبة الملفات التعليمية
        </h1>
        <p className="text-text-secondary text-base font-bold">
          تصفح وحمّل مذكرات الـ PDF والشروحات المصورة المخصصة لمجموعتك الدراسية.
        </p>
      </motion.div>

      {/* Controls Bar: Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card border border-border rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row gap-4 items-center justify-between mb-8"
      >
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs group">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-blue transition-colors" />
          <input
            type="text"
            className="input bg-bg-secondary h-12 pr-12 pl-4 text-xs border-border focus:border-accent-blue/30"
            placeholder="ابحث عن ملف باسمه..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'pdf', label: 'ملفات PDF' },
            { id: 'image', label: 'صور وشروحات' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFileTypeFilter(f.id)}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-black border transition-all ${
                fileTypeFilter === f.id
                  ? 'bg-accent-blue border-accent-blue text-white shadow-lg shadow-accent-blue/15'
                  : 'border-border bg-bg-secondary hover:bg-white/5 text-text-secondary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Files Grid */}
      <AnimatePresence mode="popLayout">
        {filteredFiles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-bg-card border border-dashed border-border rounded-[2.5rem] py-24 text-center shadow-lg animate-fade-in"
          >
            <div className="text-7xl mb-4 opacity-15">📂</div>
            <h3 className="text-xl font-black text-text-primary mb-2">لا توجد ملفات متوفرة</h3>
            <p className="text-text-secondary text-sm">لم يتم نشر أي ملفات تعليمية تتطابق مع البحث الحالي لمجموعتك.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredFiles.map((file, idx) => (
              <motion.div
                key={file._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-bg-card border border-border rounded-[2rem] overflow-hidden hover:border-accent-blue/30 transition-all shadow-2xl flex flex-col h-full group"
              >
                {/* Preview Top */}
                <div className="h-44 bg-bg-secondary flex items-center justify-center relative overflow-hidden shrink-0">
                  {file.fileType === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-accent-blue">
                      <FileText size={48} className="opacity-60" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">PDF Document</span>
                    </div>
                  )}

                  {/* Actions Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="w-12 h-12 rounded-xl bg-white/10 hover:bg-accent-blue text-white flex items-center justify-center transition-all border border-white/20"
                      title="معاينة المادة"
                    >
                      <Eye size={20} />
                    </button>
                    
                    {/* Secure Download Link via Auth Redirect or Direct URL */}
                    <a
                      href={file.url || getSecureDownloadUrl(file._id)}
                      download={file.name}
                      target="_blank"
                      rel="noreferrer"
                      className="w-12 h-12 rounded-xl bg-white/10 hover:bg-accent-green text-white flex items-center justify-center transition-all border border-white/20"
                      title="تنزيل الملف"
                    >
                      <Download size={20} />
                    </a>
                  </div>
                </div>

                {/* Details Bottom */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-base text-text-primary truncate mb-2" title={file.name}>
                      {file.name}
                    </h4>
                    
                    <div className="flex items-center justify-between text-[10px] text-text-muted font-black mb-4 pb-4 border-b border-white/5">
                      <span className={`px-2 py-0.5 rounded-md ${file.fileType === 'pdf' ? 'bg-accent-blue/10 text-accent-blue' : 'bg-accent-green/10 text-accent-green'}`}>
                        {file.fileType === 'pdf' ? 'PDF' : 'صورة'}
                      </span>
                      <span>الحجم: {formatBytes(file.size)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-text-secondary font-bold">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={file.uploadedBy?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${file.uploadedBy?.name}`}
                        className="w-6 h-6 rounded-full border border-accent-blue/20"
                        alt=""
                      />
                      <span>المعلم: {file.uploadedBy?.name || 'معلم المادة'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={11} className="text-text-muted" />
                      <span>{formatDate(file.createdAt)}</span>
                    </div>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ── Secure Preview Modal ── */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewFile(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-bg-card border border-border rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  {previewFile.fileType === 'pdf'
                    ? <FileText size={20} className="text-accent-blue" />
                    : <ImageIcon size={20} className="text-accent-green" />}
                  <span className="font-black text-text-primary text-sm truncate max-w-xs">{previewFile.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={previewFile.url || getSecureDownloadUrl(previewFile._id)}
                    download={previewFile.name}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-black text-white bg-accent-blue hover:bg-accent-blue-light px-4 py-2 rounded-xl transition-all"
                  >
                    <Download size={14} /> تنزيل الملف للجهاز
                  </a>
                  <button
                    onClick={() => setPreviewFile(null)}
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-accent-red/20 hover:text-accent-red text-text-muted flex items-center justify-center transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-black/30 min-h-[400px] flex items-center justify-center">
                {previewFile.fileType === 'pdf' ? (
                  <iframe src={previewFile.url} className="w-full h-[70vh] border-none" title={previewFile.name} />
                ) : (
                  <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-[70vh] object-contain" />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default StudentFilesPage;
