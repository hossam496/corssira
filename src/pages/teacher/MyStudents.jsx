import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Mail, Phone, Calendar, Star, MoreVertical, Trash2, UserCheck, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const MyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('الكل');

  useEffect(() => {
    const loadStudents = () => {
      setLoading(true);
      // Load from dynamic enrollments
      const savedEnrollments = localStorage.getItem('teacher_enrollments');
      const enrollments = savedEnrollments ? JSON.parse(savedEnrollments) : [];
      
      // Combine with some initial mock data if needed, or just use enrollments
      setStudents(enrollments);
      setLoading(false);
    };

    loadStudents();
    window.addEventListener('storage', loadStudents);
    return () => window.removeEventListener('storage', loadStudents);
  }, []);

  const filteredStudents = students.filter(s => 
    s.studentName.toLowerCase().includes(search.toLowerCase()) && 
    (filterSubject === 'الكل' || s.subjectName === filterSubject)
  );

  const subjects = ['الكل', ...new Set(students.map(s => s.subjectName))];

  const handleDelete = (id) => {
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    localStorage.setItem('teacher_enrollments', JSON.stringify(updated));
    toast.success('تم إزالة الطالب من القائمة');
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 className="page-title">قائمة طلابي</h1>
        <p className="page-subtitle">إدارة ومتابعة الطلاب المسجلين في موادك الدراسية</p>
      </motion.div>

      {/* Filters Bar */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 20, marginBottom: 32, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 300 }}>
          <Search size={18} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث باسم الطالب أو البريد الإلكتروني..." className="input" style={{ paddingRight: 44 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Filter size={18} color="#64748b" />
          {subjects.map(sub => (
            <button
              key={sub}
              onClick={() => setFilterSubject(sub)}
              style={{
                padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)',
                background: filterSubject === sub ? 'rgba(59,130,246,0.1)' : 'transparent',
                color: filterSubject === sub ? '#60a5fa' : '#64748b', cursor: 'pointer',
                fontSize: 12, fontWeight: 700, transition: 'all 0.2s'
              }}
            >{sub}</button>
          ))}
        </div>
      </div>

      {/* Students Table/Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        <AnimatePresence>
          {loading ? (
             Array(6).fill(null).map((_, i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 24 }} />)
          ) : filteredStudents.length > 0 ? (
            filteredStudents.map((s) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24,
                  padding: 24, position: 'relative', overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <img src={s.studentAvatar} alt="" style={{ width: 64, height: 64, borderRadius: 18, border: '3px solid rgba(59,130,246,0.2)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid currentColor' }}>
                      {s.status}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 20, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid currentColor' }}>
                      المستوى: {s.level}
                    </span>
                  </div>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f0f4ff', marginBottom: 4, fontFamily: 'Cairo, sans-serif' }}>{s.studentName}</h3>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                   <Shield size={14} /> مسجل في: <span style={{ color: '#3b82f6', fontWeight: 700 }}>{s.subjectName}</span>
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#94a3b8' }}>
                      <Calendar size={14} /> {new Date(s.timestamp).toLocaleDateString('ar-SA')}
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#94a3b8' }}>
                      <Star size={14} color="#f59e0b" /> 95% حضور
                   </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost" style={{ flex: 1, fontSize: 12, padding: '10px' }}>
                    <Mail size={16} /> مراسلة
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="btn btn-ghost" style={{ width: 40, padding: 0, color: '#ef4444', background: 'rgba(239,68,68,0.05)' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 0', background: 'rgba(255,255,255,0.01)', borderRadius: 24, border: '2px dashed var(--border)' }}>
               <div style={{ fontSize: 72, marginBottom: 20 }}>👨‍🎓</div>
               <h3 style={{ fontSize: 22, fontWeight: 800, color: '#f0f4ff' }}>لا يوجد طلاب مسجلون حالياً</h3>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyStudents;
