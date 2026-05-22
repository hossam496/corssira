import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Upload, FileText, Image, Trash2, Loader2,
  Download, Eye, X, CheckCircle, AlertCircle, FolderOpen, Users
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

const GroupFilesPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [groupName, setGroupName] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]);

  // Fetch existing files
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const { data } = await api.get(`/groups/${groupId}/files`);
        setFiles(data.data || []);
        setGroupName(data.groupName || '');
      } catch (err) {
        toast.error('حدث خطأ في تحميل الملفات');
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [groupId]);

  const handleFilePick = (e) => {
    const picked = Array.from(e.target.files);
    addPendingFiles(picked);
    e.target.value = '';
  };

  const addPendingFiles = (picked) => {
    const valid = picked.filter(f => {
      const ok = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'].includes(f.type);
      if (!ok) toast.error(`الملف "${f.name}" غير مدعوم`);
      return ok;
    });
    setPendingFiles(prev => [...prev, ...valid.map(f => ({ file: f, id: Math.random().toString(36) }))]);
  };

  const removePending = (id) => setPendingFiles(prev => prev.filter(p => p.id !== id));

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    addPendingFiles(dropped);
  }, []);

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return toast.error('اختر ملفاً واحداً على الأقل');
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    pendingFiles.forEach(({ file }) => formData.append('files', file));

    try {
      const { data } = await api.post(`/groups/${groupId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      setFiles(data.data || []);
      setPendingFiles([]);
      toast.success(data.message || 'تم الرفع بنجاح!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء الرفع');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الملف؟')) return;
    setDeletingId(fileId);
    try {
      await api.delete(`/groups/${groupId}/files/${fileId}`);
      setFiles(prev => prev.filter(f => f._id !== fileId));
      toast.success('تم حذف الملف بنجاح');
    } catch {
      toast.error('حدث خطأ أثناء الحذف');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-accent-blue" size={48} />
    </div>
  );

  return (
    <div className="page-container max-w-[1100px]" dir="rtl">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/teacher/groups')}
            className="w-11 h-11 rounded-2xl bg-white/5 border border-border flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowRight size={22} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-text-primary flex items-center gap-3">
              <FolderOpen className="text-accent-blue" size={28} />
              ملفات المجموعة
            </h1>
            <p className="text-text-secondary font-bold text-sm mt-1">
              {groupName} — أرسل PDF وصور لطلابك
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-accent-blue/10 border border-accent-blue/20 rounded-2xl px-4 py-2">
          <Users size={16} className="text-accent-blue" />
          <span className="text-accent-blue font-black text-sm">{files.length} ملف مرفوع</span>
        </div>
      </motion.div>

      {/* ── Upload Zone ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {/* Drop Area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 cursor-pointer ${
            dragOver
              ? 'border-accent-blue bg-accent-blue/10 scale-[1.01]'
              : 'border-border bg-bg-card hover:border-accent-blue/40 hover:bg-accent-blue/5'
          }`}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            id="fileInput"
            type="file"
            multiple
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFilePick}
          />
          <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all ${
            dragOver ? 'bg-accent-blue text-white scale-110' : 'bg-accent-blue/10 text-accent-blue'
          }`}>
            <Upload size={32} />
          </div>
          <h3 className="text-lg font-black text-text-primary mb-2">
            {dragOver ? 'أفلت الملفات هنا!' : 'اسحب وأفلت الملفات هنا'}
          </h3>
          <p className="text-text-secondary text-sm font-medium mb-4">
            أو اضغط لاختيار الملفات
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            {['PDF', 'JPG', 'PNG', 'WEBP', 'GIF'].map(ext => (
              <span key={ext} className="px-3 py-1 bg-white/5 border border-border rounded-full text-[10px] font-black text-text-secondary uppercase tracking-widest">
                {ext}
              </span>
            ))}
          </div>
          <p className="text-text-muted text-xs mt-3">الحد الأقصى لكل ملف: 20 MB • حتى 10 ملفات في المرة</p>
        </div>

        {/* Pending Files List */}
        <AnimatePresence>
          {pendingFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-bg-card border border-border rounded-2xl overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-border flex justify-between items-center">
                <span className="text-xs font-black text-text-secondary uppercase tracking-widest">
                  {pendingFiles.length} ملف جاهز للرفع
                </span>
                <button onClick={() => setPendingFiles([])} className="text-text-muted hover:text-accent-red text-xs font-bold transition-colors">
                  مسح الكل
                </button>
              </div>
              <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                {pendingFiles.map(({ file, id }) => (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center shrink-0">
                      {file.type === 'application/pdf'
                        ? <FileText size={16} className="text-accent-blue" />
                        : <Image size={16} className="text-accent-green" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text-primary truncate">{file.name}</p>
                      <p className="text-[10px] text-text-muted">{formatBytes(file.size)}</p>
                    </div>
                    <button onClick={() => removePending(id)} className="text-text-muted hover:text-accent-red transition-colors">
                      <X size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="px-5 pb-3">
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent-blue rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-[10px] text-accent-blue font-black mt-1 text-center">{uploadProgress}%</p>
                </div>
              )}

              <div className="px-5 py-4 border-t border-border">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full bg-accent-blue hover:bg-accent-blue-light disabled:opacity-50 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent-blue/20 active:scale-95"
                >
                  {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                  <span>{uploading ? `جاري الرفع... ${uploadProgress}%` : `رفع ${pendingFiles.length} ملف على Cloudinary`}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Uploaded Files Grid ── */}
      {files.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-bg-card border border-dashed border-border rounded-3xl py-20 text-center"
        >
          <div className="text-6xl mb-4 opacity-20">📂</div>
          <h3 className="text-xl font-black text-text-primary mb-2">لا توجد ملفات مرفوعة بعد</h3>
          <p className="text-text-secondary">ارفع أول ملف لطلاب مجموعتك</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {files.map((file, i) => (
            <motion.div
              key={file._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="bg-bg-card border border-border rounded-2xl overflow-hidden hover:border-accent-blue/40 transition-all group"
            >
              {/* Preview Thumbnail */}
              <div className="h-40 bg-bg-secondary flex items-center justify-center relative overflow-hidden">
                {file.fileType === 'image' ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-accent-blue">
                    <FileText size={48} className="opacity-60" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">PDF</span>
                  </div>
                )}
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPreviewFile(file)}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-accent-blue text-white flex items-center justify-center transition-all border border-white/20"
                    title="معاينة"
                  >
                    <Eye size={18} />
                  </button>
                  <a
                    href={file.url}
                    download={file.name}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-accent-green text-white flex items-center justify-center transition-all border border-white/20"
                    title="تحميل"
                  >
                    <Download size={18} />
                  </a>
                  <button
                    onClick={() => handleDelete(file._id)}
                    disabled={deletingId === file._id}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-accent-red text-white flex items-center justify-center transition-all border border-white/20 disabled:opacity-50"
                    title="حذف"
                  >
                    {deletingId === file._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </div>
              </div>

              {/* File Info */}
              <div className="p-4">
                <p className="font-black text-sm text-text-primary truncate mb-1" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center justify-between text-[10px] text-text-muted font-bold">
                  <span className={`flex items-center gap-1 ${file.fileType === 'pdf' ? 'text-accent-blue' : 'text-accent-green'}`}>
                    {file.fileType === 'pdf' ? <FileText size={10} /> : <Image size={10} />}
                    {file.fileType === 'pdf' ? 'PDF' : 'صورة'}
                  </span>
                  <span>{formatBytes(file.size)}</span>
                  <span>{formatDate(file.uploadedAt)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Preview Modal ── */}
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
                    : <Image size={20} className="text-accent-green" />}
                  <span className="font-black text-text-primary text-sm truncate max-w-xs">{previewFile.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={previewFile.url}
                    download={previewFile.name}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-black text-accent-blue hover:underline"
                  >
                    <Download size={14} /> تحميل
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

export default GroupFilesPage;
