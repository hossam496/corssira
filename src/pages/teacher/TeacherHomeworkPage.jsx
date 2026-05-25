import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Calendar, Users, FileText, Image as ImageIcon, Trash2,
  Loader2, Download, Eye, X, CheckCircle, AlertCircle, Upload, Search, Filter, BookOpen, Clock
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
  new Date(date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' });

const TeacherHomeworkPage = () => {
  const [groups, setGroups] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Search, Filter & Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // all, active, expired
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [attachments, setAttachments] = useState([]); // Array of uploaded File objects
  const [pendingFiles, setPendingFiles] = useState([]); // Array of raw File objects to upload
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // Fetch groups and published homeworks
  const fetchData = useCallback(async () => {
    try {
      const [groupsRes, homeworksRes] = await Promise.all([
        api.get('/groups/teacher'),
        api.get(`/homeworks?page=${page}&limit=6&search=${searchTerm}${
          filterActive === 'active' ? '&active=true' : filterActive === 'expired' ? '&active=false' : ''
        }`)
      ]);
      setGroups(groupsRes.data.data || []);
      setHomeworks(homeworksRes.data.data || []);
      setTotalPages(homeworksRes.data.pagination?.pages || 1);
    } catch (err) {
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, filterActive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Drag and Drop
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

  const handleFilePick = (e) => {
    const picked = Array.from(e.target.files);
    addPendingFiles(picked);
    e.target.value = '';
  };

  const addPendingFiles = (picked) => {
    const valid = picked.filter(f => {
      const ok = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'].includes(f.type);
      if (!ok) toast.error(`الملف "${f.name}" غير مدعوم (يُسمح فقط بـ PDF والصور)`);
      if (f.size > 20 * 1024 * 1024) toast.error(`الملف "${f.name}" حجمه أكبر من 20 ميجابايت`);
      return ok && f.size <= 20 * 1024 * 1024;
    });

    setPendingFiles(prev => [...prev, ...valid.map(f => ({ file: f, id: Math.random().toString(36) }))]);
  };

  const removePending = (id) => setPendingFiles(prev => prev.filter(p => p.id !== id));

  // Perform upload to server
  const uploadPendingFiles = async () => {
    if (pendingFiles.length === 0) return [];
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    pendingFiles.forEach(({ file }) => formData.append('files', file));
    // Pass selectedGroups to authorize access scope
    formData.append('assignedGroups', JSON.stringify(selectedGroups));

    try {
      const { data } = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      toast.success('تم رفع الملفات بنجاح!');
      setPendingFiles([]);
      return data.data || [];
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء رفع الملفات');
      return [];
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleGroupToggle = (groupId) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleCreateHomework = async (e) => {
    e.preventDefault();
    if (!title || !deadline || selectedGroups.length === 0) {
      return toast.error('يرجى كتابة العنوان، الموعد النهائي واختيار مجموعة واحدة على الأقل');
    }

    setSubmitting(true);
    try {
      // 1. Upload files first if any pending
      let uploadedAttachments = [];
      if (pendingFiles.length > 0) {
        uploadedAttachments = await uploadPendingFiles();
        if (uploadedAttachments.length === 0 && pendingFiles.length > 0) {
          // Upload failed, abort homework creation
          setSubmitting(false);
          return;
        }
      }

      const allAttachments = [...attachments.map(a => a._id), ...uploadedAttachments.map(a => a._id)];

      // 2. Create homework
      const { data } = await api.post('/homeworks', {
        title,
        description,
        deadline,
        assignedGroups: selectedGroups,
        attachments: allAttachments
      });

      toast.success('تم نشر الواجب وإخطار الطلاب بنجاح! 🚀');
      
      // Reset form
      setTitle('');
      setDescription('');
      setDeadline('');
      setSelectedGroups([]);
      setAttachments([]);
      setPendingFiles([]);
      
      // Refresh list
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء نشر الواجب');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHomework = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الواجب نهائياً؟')) return;
    try {
      await api.delete(`/homeworks/${id}`);
      toast.success('تم حذف الواجب بنجاح');
      fetchData();
    } catch (err) {
      toast.error('فشل حذف الواجب');
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
          <BookOpen className="text-accent-blue" size={32} />
          إدارة الواجبات والملفات المدرسية
        </h1>
        <p className="text-text-secondary text-base max-w-2xl font-bold">
          أنشئ واجبات مخصصة لمجموعات معينة، وارفع ملفات الـ PDF والصور بأمان تام لطلابك.
        </p>
      </motion.div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* RIGHT COLUMN: Create Homework Form (5 Cols) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 bg-bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-full bg-accent-blue/5 blur-3xl rounded-full -z-10" />
          <h2 className="text-xl font-black text-text-primary mb-6 flex items-center gap-2 pb-3 border-b border-border">
            <Plus className="text-accent-blue" size={24} />
            نشر واجب منزلي جديد
          </h2>

          <form onSubmit={handleCreateHomework} className="space-y-6">
            
            {/* Homework Title */}
            <div className="space-y-2">
              <label className="text-xs font-black text-text-secondary uppercase tracking-widest block">عنوان الواجب *</label>
              <input
                type="text"
                className="input bg-bg-secondary h-14 px-4 text-sm border-border focus:border-accent-blue/50"
                placeholder="مثال: واجب الدرس الأول في النحو..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-black text-text-secondary uppercase tracking-widest block">الوصف / ملاحظات الحل</label>
              <textarea
                className="input bg-bg-secondary h-28 resize-none py-4 px-4 text-sm border-border focus:border-accent-blue/50 placeholder:text-text-muted/40"
                placeholder="اكتب التوجيهات أو أرقام الأسئلة هنا..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <label className="text-xs font-black text-text-secondary uppercase tracking-widest block">تاريخ ووقت الاستحقاق *</label>
              <div className="relative">
                <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                <input
                  type="datetime-local"
                  className="input bg-bg-secondary h-14 pr-12 pl-4 text-sm border-border focus:border-accent-blue/50"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  required
                />
              </div>
            </div>

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

            {/* Drag & Drop File Upload */}
            <div className="space-y-3">
              <label className="text-xs font-black text-text-secondary uppercase tracking-widest block">ملفات مرفقة (PDF، صور)</label>
              
              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('homeworkFileInput').click()}
                className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-accent-blue bg-accent-blue/10 scale-[1.01]'
                    : 'border-border bg-bg-secondary hover:border-accent-blue/30 hover:bg-accent-blue/5'
                }`}
              >
                <input
                  id="homeworkFileInput"
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFilePick}
                />
                <Upload size={24} className="mx-auto mb-2 text-accent-blue opacity-80" />
                <p className="text-xs font-black text-text-primary">اسحب الملفات هنا أو اضغط للرفع</p>
                <p className="text-[10px] text-text-muted mt-1">PDF والصور حتى 20 ميجابايت</p>
              </div>

              {/* Pending upload list */}
              {pendingFiles.length > 0 && (
                <div className="space-y-2 max-h-36 overflow-y-auto p-2 bg-white/5 rounded-2xl border border-white/5">
                  {pendingFiles.map(({ file, id }) => (
                    <div key={id} className="flex items-center justify-between bg-bg-secondary p-2 rounded-xl border border-border">
                      <div className="flex items-center gap-2 min-w-0">
                        {file.type === 'application/pdf'
                          ? <FileText size={14} className="text-accent-blue shrink-0" />
                          : <ImageIcon size={14} className="text-accent-green shrink-0" />}
                        <span className="text-xs font-bold text-text-primary truncate max-w-[120px]">{file.name}</span>
                        <span className="text-[9px] text-text-muted">({formatBytes(file.size)})</span>
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
                <div className="p-3 bg-accent-blue/5 rounded-2xl border border-accent-blue/10">
                  <div className="flex justify-between items-center text-[10px] text-accent-blue font-black mb-1">
                    <span>جاري رفع المرفقات...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-blue rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || uploading}
              className="w-full bg-accent-blue hover:bg-accent-blue-light disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl shadow-accent-blue/20 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
              <span>{submitting ? 'جاري النشر وإرسال الإشعارات...' : 'نشر الواجب وإرسال للطلاب'}</span>
            </button>

          </form>
        </motion.div>

        {/* LEFT COLUMN: Published Homeworks List (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Controls Bar: Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-card border border-border rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row gap-4 items-center justify-between"
          >
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs group">
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-blue transition-colors" />
              <input
                type="text"
                className="input bg-bg-secondary h-12 pr-12 pl-4 text-xs border-border focus:border-accent-blue/30"
                placeholder="ابحث عن واجب باسمه..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              />
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2 w-full sm:w-auto">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'active', label: 'نشط حالياً' },
                { id: 'expired', label: 'منتهي' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => { setFilterActive(f.id); setPage(1); }}
                  className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${
                    filterActive === f.id
                      ? 'bg-accent-blue border-accent-blue text-white shadow-lg shadow-accent-blue/15'
                      : 'border-border bg-bg-secondary hover:bg-white/5 text-text-secondary'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Homeworks List Grid */}
          <AnimatePresence mode="popLayout">
            {homeworks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-bg-card border border-dashed border-border rounded-[2.5rem] py-24 text-center shadow-lg"
              >
                <div className="text-7xl mb-4 opacity-15">📝</div>
                <h3 className="text-xl font-black text-text-primary mb-2">لا توجد واجبات منشورة</h3>
                <p className="text-text-secondary text-sm">لم تقم بنشر أي واجبات تتطابق مع الفلتر والبحث الحالي.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {homeworks.map((hw, idx) => {
                  const isExpired = new Date() > new Date(hw.deadline);
                  return (
                    <motion.div
                      key={hw._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-bg-card border border-border rounded-[2rem] overflow-hidden hover:border-accent-blue/30 transition-all shadow-xl flex flex-col h-full group"
                    >
                      {/* Card Top */}
                      <div className="p-6 border-b border-white/5 flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                            isExpired
                              ? 'bg-accent-red/10 text-accent-red border-accent-red/20'
                              : 'bg-accent-green/10 text-accent-green border-accent-green/20'
                          }`}>
                            {isExpired ? 'منتهي الموعد' : 'نشط ومستمر'}
                          </span>

                          <button
                            onClick={() => handleDeleteHomework(hw._id)}
                            className="w-8 h-8 rounded-xl bg-white/5 border border-border text-text-muted hover:text-accent-red hover:bg-accent-red/15 transition-all flex items-center justify-center"
                            title="حذف الواجب"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <h3 className="font-black text-base text-text-primary leading-tight mb-2 group-hover:text-accent-blue transition-colors truncate">
                          {hw.title}
                        </h3>

                        <p className="text-text-secondary text-xs font-medium line-clamp-3 leading-relaxed mb-4 min-h-[3rem]">
                          {hw.description || 'لا يوجد وصف متاح لهذا الواجب.'}
                        </p>

                        {/* Target Groups Badges */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block">المجموعات:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {hw.assignedGroups?.map(g => (
                              <span key={g._id} className="px-2 py-0.5 bg-accent-blue/5 border border-accent-blue/10 rounded-md text-[9px] font-black text-accent-blue">
                                {g.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom Stats & Attachments */}
                      <div className="p-6 bg-white/[0.01] border-t border-white/5 space-y-4">
                        {/* Attachments Section */}
                        {hw.attachments && hw.attachments.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block">الملفات المرفقة:</span>
                            <div className="space-y-1.5">
                              {hw.attachments.map(file => (
                                <div key={file._id} className="flex items-center justify-between bg-bg-secondary/40 px-3 py-1.5 rounded-xl border border-border/50 text-[11px] font-bold">
                                  <span className="text-text-primary truncate max-w-[150px]">{file.name}</span>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setPreviewFile(file)}
                                      className="text-accent-blue hover:text-accent-blue-light transition-colors"
                                      title="معاينة"
                                    >
                                      <Eye size={13} />
                                    </button>
                                    <a
                                      href={`http://127.0.0.1:5000/api/files/secure/${file._id}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-accent-green hover:text-accent-green-light transition-colors"
                                      title="تنزيل الملف"
                                    >
                                      <Download size={13} />
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* View statistics */}
                        <div className="flex items-center justify-between pt-1 text-[10px] text-text-muted font-black border-t border-white/5">
                          <div className="flex items-center gap-1">
                            <Clock size={11} className="text-accent-red" />
                            <span>استحقاق: {new Date(hw.deadline).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                            <Users size={11} className="text-accent-blue" />
                            <span>شاهده: {hw.viewedBy?.length || 0} طالب</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-border rounded-xl text-xs font-black bg-bg-card disabled:opacity-40 hover:bg-white/5 active:scale-95 transition-all"
              >
                السابق
              </button>
              <span className="text-xs font-black text-text-secondary">صفحة {page} من {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-border rounded-xl text-xs font-black bg-bg-card disabled:opacity-40 hover:bg-white/5 active:scale-95 transition-all"
              >
                التالي
              </button>
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
                    href={`http://127.0.0.1:5000/api/files/secure/${previewFile._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-black text-white bg-accent-blue hover:bg-accent-blue-light px-4 py-2 rounded-xl transition-all"
                  >
                    <Download size={14} /> تحميل المرفق
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

export default TeacherHomeworkPage;
