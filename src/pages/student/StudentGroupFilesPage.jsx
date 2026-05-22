import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, FileText, Image, Download, Eye, X, Loader2, FolderOpen, Users } from 'lucide-react';
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

const StudentGroupFilesPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [groupName, setGroupName] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const { data } = await api.get(`/groups/${groupId}/files`);
        setFiles(data.data || []);
        setGroupName(data.groupName || '');
      } catch (err) {
        toast.error('حدث خطأ في تحميل الملفات أو ليس لديك صلاحية');
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [groupId]);

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
            onClick={() => navigate('/student/groups')}
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
              {groupName} — تصفح وحمل الملفات المرسلة من المدرس
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-accent-blue/10 border border-accent-blue/20 rounded-2xl px-4 py-2">
          <Users size={16} className="text-accent-blue" />
          <span className="text-accent-blue font-black text-sm">{files.length} ملف متاح</span>
        </div>
      </motion.div>

      {/* ── Files Grid ── */}
      {files.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-bg-card border border-dashed border-border rounded-3xl py-20 text-center"
        >
          <div className="text-6xl mb-4 opacity-20">📂</div>
          <h3 className="text-xl font-black text-text-primary mb-2">لا توجد ملفات حالياً</h3>
          <p className="text-text-secondary">لم يقم المدرس بإرسال أي ملفات لهذه المجموعة حتى الآن</p>
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
              className="bg-bg-card border border-border rounded-2xl overflow-hidden hover:border-accent-blue/40 transition-all group shadow-lg"
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
                    className="w-12 h-12 rounded-xl bg-white/10 hover:bg-accent-blue text-white flex items-center justify-center transition-all border border-white/20"
                    title="معاينة"
                  >
                    <Eye size={20} />
                  </button>
                  <a
                    href={file.url}
                    download={file.name}
                    target="_blank"
                    rel="noreferrer"
                    className="w-12 h-12 rounded-xl bg-white/10 hover:bg-accent-green text-white flex items-center justify-center transition-all border border-white/20"
                    title="تحميل"
                  >
                    <Download size={20} />
                  </a>
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
                    className="flex items-center gap-1 text-xs font-black text-accent-blue hover:underline bg-accent-blue/10 px-4 py-2 rounded-xl transition-all"
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

export default StudentGroupFilesPage;
