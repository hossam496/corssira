import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Image as ImageIcon, Trash2, Loader2,
  Download, Eye, X, CheckCircle, AlertCircle, FolderOpen, Users, Plus
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

const TeacherFilesPage = () => {
  const [files, setFiles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);

  // Fetch groups and shared files
  const fetchData = useCallback(async () => {
    try {
      const [groupsRes, filesRes] = await Promise.all([
        api.get('/groups/teacher'),
        api.get('/shared-files')
      ]);
      setGroups(groupsRes.data.data || []);
      setFiles(filesRes.data.data || []);
    } catch (err) {
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilePick = (e) => {
    const picked = Array.from(e.target.files);
    addPendingFiles(picked);
    e.target.value = '';
  };

  const addPendingFiles = (picked) => {
    const valid = picked.filter(f => {
      const ok = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'].includes(f.type);
      if (!ok) toast.error(`الملف "${f.name}" غير مدعوم (فقط PDF والصور)`);
      if (f.size > 20 * 1024 * 1024) toast.error(`الملف "${f.name}" حجمه أكبر من 20MB`);
      return ok && f.size <= 20 * 1024 * 1024;
    });
    setPendingFiles(prev => [...prev, ...valid.map(f => ({ file: f, id: Math.random().toString(36) }))]);
  };

  const removePending = (id) => setPendingFiles(prev => prev.filter(p => p.id !== id));

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    addPendingFiles(dropped);
  }, []);

  const handleGroupToggle = (groupId) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return toast.error('اختر ملفاً واحداً على الأقل للرفع');
    if (selectedGroups.length === 0) return toast.error('يرجى اختيار مجموعة واحدة على الأقل لمشاركة الملفات معها');
    
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    pendingFiles.forEach(({ file }) => formData.append('files', file));
    formData.append('assignedGroups', JSON.stringify(selectedGroups));

    try {
      const { data } = await api.post('/shared-files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      setFiles(prev => [...data.data, ...prev]);
      setPendingFiles([]);
      setSelectedGroups([]);
      toast.success('تم رفع ومشاركة الملفات بنجاح وإخطار الطلاب! 🚀');
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء الرفع');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الملف نهائياً؟')) return;
    setDeletingId(fileId);
    try {
      await api.delete(`/shared-files/${fileId}`);
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
    <div className="page-container max-w-[1300px]" dir="rtl">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 relative"
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent-blue/5 blur-[80px] rounded-full -z-10" />
        <h1 className="text-3xl font-black text-text-primary mb-2 flex items-center gap-3">
          <FolderOpen className="text-accent-blue" size={32} />
          مركز مشاركة الملفات التعليمية
        </h1>
        <p className="text-text-secondary text-base font-bold">
          ارفع مذكراتك وملخصاتك (PDF وصور) ووزعها بضغطة زر للمجموعات المحددة بشكل آمن كلياً.
        </p>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Right side: Upload Zone (5 Cols) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 bg-bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-full bg-accent-blue/5 blur-3xl rounded-full -z-10" />
          <h2 className="text-xl font-black text-text-primary mb-6 flex items-center gap-2 pb-3 border-b border-border">
            <Plus className="text-accent-blue" size={24} />
            مشاركة ملفات جديدة
          </h2>

          <div className="space-y-6">
            {/* Select Target Groups */}
            <div className="space-y-3">
              <label className="text-xs font-black text-text-secondary uppercase tracking-widest block">المجموعات المستهدفة * (اختر مجموعة أو أكثر)</label>
              {groups.length === 0 ? (
                <div className="p-4 bg-accent-yellow/5 border border-accent-yellow/20 rounded-2xl flex items-center gap-2 text-accent-yellow text-xs font-bold">
                  <AlertCircle size={16} />
                  <span>لم تقم بإنشاء أي مجموعات بعد. يجب إنشاء مجموعة أولاً.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto p-1 bg-white/5 rounded-2xl border border-white/5">
                  {groups.map(g => (
                    <label
                      key={g._id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                        selectedGroups.includes(g._id)
                          ? 'border-accent-blue bg-accent-blue/10 text-text-primary'
                          : 'border-border bg-bg-secondary hover:bg-white/5 text-text-secondary'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(g._id)}
                        onChange={() => handleGroupToggle(g._id)}
                        className="rounded border-border text-accent-blue focus:ring-accent-blue h-4 w-4 bg-bg-secondary"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-black truncate">{g.name}</p>
                        <p className="text-[9px] text-text-muted truncate">{g.schoolGrade}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Drag & Drop Area */}
            <div className="space-y-3">
              <label className="text-xs font-black text-text-secondary uppercase tracking-widest block">اختر ملفات الـ PDF والصور</label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('sharedFileInput').click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-accent-blue bg-accent-blue/10 scale-[1.01]'
                    : 'border-border bg-bg-secondary hover:border-accent-blue/30 hover:bg-accent-blue/5'
                }`}
              >
                <input
                  id="sharedFileInput"
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFilePick}
                />
                <Upload size={28} className="mx-auto mb-2 text-accent-blue opacity-85" />
                <p className="text-sm font-black text-text-primary">اسحب وأفلت الملفات هنا أو اضغط لاختيارها</p>
                <p className="text-[10px] text-text-muted mt-1">PDF والصور حتى 20 ميجابايت للملف الواحد</p>
              </div>

              {/* Pending upload list */}
              {pendingFiles.length > 0 && (
                <div className="space-y-2 max-h-36 overflow-y-auto p-2 bg-white/5 rounded-2xl border border-white/5">
                  {pendingFiles.map(({ file, id }) => (
                    <div key={id} className="flex items-center justify-between bg-bg-secondary p-2.5 rounded-xl border border-border">
                      <div className="flex items-center gap-2 min-w-0">
                        {file.type === 'application/pdf'
                          ? <FileText size={14} className="text-accent-blue shrink-0" />
                          : <ImageIcon size={14} className="text-accent-green shrink-0" />}
                        <span className="text-xs font-bold text-text-primary truncate max-w-[130px]">{file.name}</span>
                        <span className="text-[9px] text-text-muted shrink-0">({formatBytes(file.size)})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePending(id)}
                        className="text-text-muted hover:text-accent-red p-1 rounded-lg transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Progress Animation */}
              {uploading && (
                <div className="p-4 bg-accent-blue/5 rounded-2xl border border-accent-blue/10">
                  <div className="flex justify-between items-center text-[10px] text-accent-blue font-black mb-1">
                    <span>جاري الرفع لـ Cloudinary...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-blue rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleUpload}
              disabled={uploading || pendingFiles.length === 0 || selectedGroups.length === 0}
              className="w-full bg-accent-blue hover:bg-accent-blue-light disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl shadow-accent-blue/20 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
              <span>{uploading ? `جاري الرفع والاعتماد... ${uploadProgress}%` : `رفع ومشاركة ${pendingFiles.length} ملف`}</span>
            </button>

          </div>
        </motion.div>

        {/* Left side: Uploaded Files (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-xl font-black text-text-primary mb-4 flex items-center gap-2">
            <Users className="text-accent-blue" size={22} />
            الملفات المشتركة حالياً ({files.length})
          </h2>

          {files.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-bg-card border border-dashed border-border rounded-[2.5rem] py-24 text-center shadow-lg"
            >
              <div className="text-7xl mb-4 opacity-15">📂</div>
              <h3 className="text-xl font-black text-text-primary mb-2">لا توجد ملفات مرفوعة</h3>
              <p className="text-text-secondary text-sm">ابدأ باختيار مجموعاتك ورفع الملفات لمشاركتها فوراً.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {files.map((file, idx) => (
                <motion.div
                  key={file._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-bg-card border border-border rounded-[2rem] overflow-hidden hover:border-accent-blue/30 transition-all shadow-xl flex flex-col h-full group"
                >
                  {/* File Preview Top */}
                  <div className="h-40 bg-bg-secondary flex items-center justify-center relative overflow-hidden shrink-0">
                    {file.fileType === 'image' ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 animate-fade-in"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-accent-blue">
                        <FileText size={48} className="opacity-60 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">PDF Document</span>
                      </div>
                    )}
                    {/* Hover controls overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
                      <button
                        onClick={() => setPreviewFile(file)}
                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-accent-blue text-white flex items-center justify-center transition-all border border-white/20"
                        title="معاينة"
                      >
                        <Eye size={18} />
                      </button>
                      <a
                        href={getSecureDownloadUrl(file._id)}
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

                  {/* File details bottom */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-sm text-text-primary truncate mb-1" title={file.name}>
                        {file.name}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-text-muted font-bold mb-4">
                        <span className={file.fileType === 'pdf' ? 'text-accent-blue' : 'text-accent-green'}>
                          {file.fileType === 'pdf' ? 'PDF' : 'صورة'}
                        </span>
                        <span>{formatBytes(file.size)}</span>
                        <span>{formatDate(file.createdAt)}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block">المجموعات المصرح لها:</span>
                      <div className="flex flex-wrap gap-1">
                        {file.assignedGroups?.map(g => (
                          <span key={g._id} className="px-2 py-0.5 bg-accent-blue/5 border border-accent-blue/10 rounded-md text-[9px] font-black text-accent-blue">
                            {g.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                </motion.div>
              ))}
            </div>
          )}

        </div>

      </div>

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
                    href={getSecureDownloadUrl(previewFile._id)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-black text-white bg-accent-blue hover:bg-accent-blue-light px-4 py-2 rounded-xl transition-all"
                  >
                    <Download size={14} /> تحميل الملف
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

export default TeacherFilesPage;
