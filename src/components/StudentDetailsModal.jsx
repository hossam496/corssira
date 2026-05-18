import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Clock, Award, Loader2, Calendar, Activity, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axios';

const StudentDetailsModal = ({ isOpen, onClose, studentId }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!isOpen || !studentId) return;
    
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/students/${studentId}/details`);
        setData(res.data.data);
      } catch (err) {
        console.error('Error fetching student details', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [isOpen, studentId]);

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
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="relative w-full max-w-4xl bg-bg-card border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 bg-gradient-to-br from-accent-blue/10 to-transparent border-b border-border flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border-2 border-accent-blue/30 overflow-hidden bg-bg-secondary flex items-center justify-center">
                  {loading || !data ? (
                    <Loader2 className="animate-spin text-accent-blue" size={24} />
                  ) : (
                    <img 
                      src={data.student.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.student.user?.name}`}
                      alt="Student" className="w-full h-full object-cover" 
                    />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-text-primary mb-1">
                    {loading ? 'جاري التحميل...' : data?.student.user?.name}
                  </h2>
                  <p className="text-sm text-text-secondary font-medium">
                    {loading ? '' : `${data?.student.grade} - ${data?.student.user?.email}`}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 border border-border text-text-muted hover:text-white transition-all flex items-center justify-center">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto space-y-8">
              {loading || !data ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
                  <p className="text-text-secondary font-black">جاري جلب تفاصيل الطالب الشاملة...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Groups Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                      <BookOpen size={20} className="text-accent-blue" />
                      المجموعات المسجل بها
                    </h3>
                    <div className="space-y-3">
                      {data.enrollments.length === 0 ? (
                        <p className="text-sm text-text-muted bg-white/5 p-4 rounded-xl text-center">لا توجد مجموعات</p>
                      ) : (
                        data.enrollments.map((e) => (
                          <div key={e._id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                            <div>
                              <div className="font-black text-text-primary text-sm">{e.group?.name}</div>
                              <div className="text-[10px] text-text-muted mt-1 uppercase">{e.subject?.name}</div>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-accent-green/10 text-accent-green text-[10px] font-black uppercase border border-accent-green/20">نشط</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Grades Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                      <Award size={20} className="text-accent-yellow" />
                      سجل الدرجات
                    </h3>
                    <div className="space-y-3">
                      {data.grades.length === 0 ? (
                        <p className="text-sm text-text-muted bg-white/5 p-4 rounded-xl text-center">لا توجد درجات مرصودة</p>
                      ) : (
                        data.grades.map((g) => (
                          <div key={g._id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                            <div>
                              <div className="font-black text-text-primary text-sm">{g.examTitle}</div>
                              <div className="text-[10px] text-text-muted mt-1 uppercase">{g.subject?.name}</div>
                            </div>
                            <div className="flex items-baseline gap-1 bg-white/5 px-3 py-1 rounded-xl">
                              <span className="text-lg font-black text-accent-blue">{g.score}</span>
                              <span className="text-[10px] text-text-muted font-bold">/ {g.totalScore}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Attendance Section */}
                  <div className="space-y-4 lg:col-span-2">
                    <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                      <Calendar size={20} className="text-accent-purple" />
                      سجل الحضور والغياب الأخير
                    </h3>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                      {data.attendance.length === 0 ? (
                        <p className="text-sm text-text-muted text-center">لا توجد سجلات حضور مسجلة</p>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {data.attendance.map((a) => (
                            <div key={a._id} className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5 min-w-[80px]">
                              <span className="text-[10px] text-text-muted font-black">{new Date(a.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}</span>
                              {a.status === 'حاضر' ? (
                                <CheckCircle size={20} className="text-accent-green" />
                              ) : (
                                <XCircle size={20} className="text-accent-red" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StudentDetailsModal;
