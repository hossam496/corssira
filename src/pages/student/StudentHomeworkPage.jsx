import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Calendar, Clock, Download, Eye, X, Loader2, BookOpen, Search, Filter, AlertCircle,
  MessageCircle, Award, CheckCircle, Bell
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

const StudentHomeworkPage = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // all, active, expired
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // States
  const [previewFile, setPreviewFile] = useState(null);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [unviewedCount, setUnviewedCount] = useState(0);

  // Fetch homework list
  const fetchHomeworks = useCallback(async (isPolling = false) => {
    try {
      const { data } = await api.get(`/homeworks?page=${page}&limit=6&search=${searchTerm}${
        filterActive === 'active' ? '&active=true' : filterActive === 'expired' ? '&active=false' : ''
      }`);
      
      const list = data.data || [];
      setHomeworks(list);
      setTotalPages(data.pagination?.pages || 1);

      // Check current user viewed count
      // Find current user's profile to get their ID if needed, or get it from context.
      // But we can check viewedBy list.
      api.get('/students/me')
        .then(profileRes => {
          const userId = profileRes.data.data?._id;
          if (userId) {
            const unviewed = list.filter(hw => !hw.viewedBy?.includes(userId)).length;
            setUnviewedCount(unviewed);
          }
        })
        .catch(() => {});

    } catch (err) {
      if (!isPolling) toast.error('حدث خطأ في تحميل الواجبات');
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [page, searchTerm, filterActive]);

  useEffect(() => {
    fetchHomeworks();
  }, [fetchHomeworks]);

  // Polling notifications system (refetch every 45 seconds without socket.io)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHomeworks(true); // silent fetch in background
    }, 45000);
    return () => clearInterval(interval);
  }, [fetchHomeworks]);

  const handleOpenHomework = async (hw) => {
    setSelectedHomework(hw);
    
    // Mark as viewed in backend
    try {
      await api.post(`/homeworks/${hw._id}/view`);
      // Update local viewedBy status
      setHomeworks(prev => prev.map(item => {
        if (item._id === hw._id) {
          // If not already in viewedBy, add it
          const viewed = item.viewedBy || [];
          return { ...item, viewedBy: [...viewed, 'current_user'] };
        }
        return item;
      }));
      // Decrement unviewed badge
      setUnviewedCount(c => Math.max(c - 1, 0));
    } catch (err) {
      console.error('Error marking homework as viewed:', err);
    }
  };

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
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 relative"
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent-blue/5 blur-[80px] rounded-full -z-10" />
        <div>
          <h1 className="text-3xl font-black text-text-primary mb-2 flex items-center gap-3">
            <BookOpen className="text-accent-blue" size={32} />
            الواجبات والملفات المطلوبة
          </h1>
          <p className="text-text-secondary text-base font-bold">
            هنا تجد جميع الواجبات ومذكرات الـ PDF والصور المرسلة لمجموعتك الدراسية.
          </p>
        </div>

        {/* Dynamic Notification Badge */}
        {unviewedCount > 0 && (
          <div className="flex items-center gap-2 bg-accent-red/10 border border-accent-red/20 rounded-2xl px-4 py-2.5 text-accent-red font-black text-sm animate-pulse">
            <Bell size={16} />
            <span>لديك {unviewedCount} واجب جديد لم تشاهده بعد!</span>
          </div>
        )}
      </motion.div>

      {/* Controls Bar: Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card border border-border rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row gap-4 items-center justify-between mb-8"
      >
        {/* Search */}
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

      {/* Homework List Grid */}
      <AnimatePresence mode="popLayout">
        {homeworks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-bg-card border border-dashed border-border rounded-[2.5rem] py-24 text-center shadow-lg"
          >
            <div className="text-7xl mb-4 opacity-15">📚</div>
            <h3 className="text-xl font-black text-text-primary mb-2">لا توجد واجبات دراسية</h3>
            <p className="text-text-secondary text-sm">أنت مجتهد وملتزم! لا توجد واجبات مسجلة لمجموعتك حالياً.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {homeworks.map((hw, idx) => {
              const isExpired = new Date() > new Date(hw.deadline);
              // Simple check if user viewed this homework. Local 'current_user' is added when opened
              const isRead = hw.viewedBy?.includes('current_user') || hw.viewedBy?.length > 0;

              return (
                <motion.div
                  key={hw._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-bg-card border border-border rounded-[2rem] overflow-hidden hover:border-accent-blue/30 transition-all shadow-2xl flex flex-col h-full group relative"
                >
                  {/* Unread dot indicator */}
                  {!isRead && (
                    <span className="absolute top-4 right-4 w-3.5 h-3.5 bg-accent-red rounded-full ring-4 ring-bg-card z-10 animate-pulse" title="جديد" />
                  )}

                  {/* Card top */}
                  <div className="p-6 md:p-8 flex-1">
                    <div className="flex justify-between items-start mb-6">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                        isExpired
                          ? 'bg-accent-red/10 text-accent-red border-accent-red/20'
                          : 'bg-accent-green/10 text-accent-green border-accent-green/20'
                      }`}>
                        {isExpired ? 'انتهى الموعد' : 'متاح للحل'}
                      </span>

                      <div className="flex items-center gap-2 text-right">
                        <div className="text-right">
                          <p className="text-xs font-black text-text-primary leading-tight">{hw.teacher?.name}</p>
                          <p className="text-[9px] text-text-muted">معلم المادة</p>
                        </div>
                        <img
                          src={hw.teacher?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${hw.teacher?.name}`}
                          className="w-8 h-8 rounded-full border border-accent-blue/20 object-cover shrink-0"
                          alt=""
                        />
                      </div>
                    </div>

                    <h3 className="font-black text-lg md:text-xl text-text-primary leading-tight mb-3 group-hover:text-accent-blue transition-colors line-clamp-2 min-h-[3rem]">
                      {hw.title}
                    </h3>

                    <p className="text-text-secondary text-xs md:text-sm font-medium line-clamp-3 leading-relaxed mb-6">
                      {hw.description || 'لا يوجد وصف تفصيلي للواجب، افتح لمعرفة التفاصيل والملفات المرفقة.'}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-text-muted bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/5">
                      <Clock size={12} className="text-accent-red" />
                      <span>تاريخ النشر: {formatDate(hw.createdAt)}</span>
                    </div>
                  </div>

                  {/* Card bottom buttons */}
                  <div className="p-6 md:p-8 bg-white/[0.01] border-t border-white/5 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[10px] md:text-xs font-black text-text-muted mb-1">
                      <Calendar size={12} className="text-accent-blue" />
                      <span>آخر موعد للتسليم: {formatDate(hw.deadline)}</span>
                    </div>

                    <button
                      onClick={() => handleOpenHomework(hw)}
                      className="w-full bg-accent-blue hover:bg-accent-blue-light text-white font-black py-3.5 rounded-2xl shadow-xl shadow-accent-blue/15 transition-all flex items-center justify-center gap-2 group/btn text-xs md:text-sm active:scale-95"
                    >
                      <span>عرض تفاصيل الواجب والملفات</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12">
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

      {/* ── Detailed Homework Modal ── */}
      <AnimatePresence>
        {selectedHomework && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHomework(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative w-full max-w-2xl bg-bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-border bg-gradient-to-r from-accent-blue/10 to-transparent flex justify-between items-center relative">
                <div className="absolute top-0 right-0 w-32 h-full bg-accent-blue/5 blur-3xl rounded-full -z-10" />
                <div className="flex items-center gap-3">
                  <img
                    src={selectedHomework.teacher?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedHomework.teacher?.name}`}
                    className="w-10 h-10 rounded-full border border-accent-blue/20"
                    alt=""
                  />
                  <div>
                    <h2 className="text-lg font-black text-text-primary leading-tight">{selectedHomework.title}</h2>
                    <p className="text-[10px] text-text-secondary font-bold mt-0.5">بواسطة الأستاذ: {selectedHomework.teacher?.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedHomework(null)}
                  className="w-10 h-10 rounded-2xl bg-white/5 border border-border text-text-muted hover:text-white transition-all flex items-center justify-center"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh]">
                {/* Description */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block">وصف وتوجيهات الواجب:</span>
                  <div className="bg-bg-secondary p-5 rounded-2xl border border-border text-sm text-text-primary leading-relaxed whitespace-pre-line font-medium">
                    {selectedHomework.description || 'لا يوجد وصف تفصيلي متاح لهذا الواجب.'}
                  </div>
                </div>

                {/* Deadlines details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                    <span className="text-[9px] font-black text-text-muted uppercase block mb-1">تاريخ النشر</span>
                    <span className="text-xs font-black text-text-primary">{formatDate(selectedHomework.createdAt)}</span>
                  </div>
                  <div className="bg-accent-red/5 p-4 rounded-xl border border-accent-red/10 text-center">
                    <span className="text-[9px] font-black text-accent-red uppercase block mb-1">آخر موعد للتسليم</span>
                    <span className="text-xs font-black text-accent-red">{formatDate(selectedHomework.deadline)}</span>
                  </div>
                </div>

                {/* Attachments Section */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block">الملفات المرفقة بالواجب:</span>
                  
                  {!selectedHomework.attachments || selectedHomework.attachments.length === 0 ? (
                    <div className="p-4 bg-white/5 border border-border rounded-xl text-center text-xs font-bold text-text-secondary">
                      لا توجد ملفات مرفقة لهذا الواجب.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedHomework.attachments.map(file => (
                        <div
                          key={file._id}
                          className="flex items-center justify-between bg-bg-secondary hover:bg-white/5 p-4 rounded-2xl border border-border transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center shrink-0">
                              {file.fileType === 'pdf' ? (
                                <FileText size={18} className="text-accent-blue" />
                              ) : (
                                <Clock size={18} className="text-accent-green" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-text-primary truncate max-w-[200px]" title={file.name}>{file.name}</p>
                              <p className="text-[9px] text-text-muted">{formatBytes(file.size)}</p>
                            </div>
                          </div>

                          <div className="flex gap-2.5">
                            {/* Preview */}
                            <button
                              onClick={() => setPreviewFile(file)}
                              className="px-4 py-2 bg-white/5 border border-border text-text-secondary hover:text-white hover:bg-accent-blue hover:border-accent-blue rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
                            >
                              <Eye size={14} />
                              <span>معاينة</span>
                            </button>

                            {/* Download through secure auth middleware */}
                            <a
                              href={`http://127.0.0.1:5000/api/files/secure/${file._id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 bg-accent-blue/10 border border-accent-blue/20 text-accent-blue hover:text-white hover:bg-accent-blue rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
                            >
                              <Download size={14} />
                              <span>تحميل</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 border-t border-border bg-white/[0.01] flex justify-end">
                <button
                  onClick={() => setSelectedHomework(null)}
                  className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white font-black text-xs rounded-xl border border-border transition-all"
                >
                  إغلاق النافذة
                </button>
              </div>
            </motion.div>
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
                    : <AlertCircle size={20} className="text-accent-green" />}
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

export default StudentHomeworkPage;
