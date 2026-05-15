import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, GraduationCap, Phone, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const GRADES = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
const SECTIONS = ['أ', 'ب', 'ج', 'د'];
const STATUS = ['نشط', 'موقوف', 'متخرج'];

const defaultForm = { name: '', email: '', password: '', phone: '', grade: 'الأول', section: 'أ', parentName: '', parentPhone: '', status: 'نشط' };

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/students', { params: { page, limit: 10, search, grade: gradeFilter } });
      setStudents(data.data || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch { toast.error('خطأ في تحميل الطلاب'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, [page, search, gradeFilter]);

  const openCreate = () => { setEditStudent(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (s) => {
    setEditStudent(s);
    setForm({ name: s.user?.name || '', email: s.user?.email || '', password: '', phone: s.user?.phone || '', grade: s.grade, section: s.section, parentName: s.parentName || '', parentPhone: s.parentPhone || '', status: s.status });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editStudent) {
        await api.put(`/students/${editStudent._id}`, form);
        toast.success('تم تحديث بيانات الطالب ✅');
      } else {
        await api.post('/students', form);
        toast.success('تم إضافة الطالب بنجاح 🎉');
      }
      setShowModal(false); fetchStudents();
    } catch (err) { toast.error(err.response?.data?.message || 'حدث خطأ'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/students/${id}`); toast.success('تم حذف الطالب'); setDeleteId(null); fetchStudents();
    } catch { toast.error('خطأ في الحذف'); }
  };

  const statusBadge = (status) => {
    const map = { 'نشط': 'badge-green', 'موقوف': 'badge-red', 'متخرج': 'badge-blue' };
    return <span className={`badge ${map[status] || 'badge-blue'}`}>{status}</span>;
  };

  return (
    <div style={{ padding: 28 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">إدارة الطلاب</h1>
          <p className="page-subtitle">{total} طالب مسجل في المنصة</p>
        </div>
        <motion.button onClick={openCreate} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="btn btn-primary">
          <Plus size={18} />إضافة طالب جديد
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="بحث بالاسم..." className="input" style={{ paddingRight: 42 }} />
        </div>
        <select value={gradeFilter} onChange={e => { setGradeFilter(e.target.value); setPage(1); }} className="input" style={{ width: 160 }}>
          <option value="">كل الصفوف</option>
          {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="table-container">
        <table>
          <thead>
            <tr>
              <th>الطالب</th><th>رقم الطالب</th><th>الصف</th><th>القسم</th><th>ولي الأمر</th><th>الحالة</th><th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? Array(6).fill(null).map((_, i) => (
              <tr key={i}>{Array(7).fill(null).map((__, j) => <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4, width: j === 0 ? 180 : 80 }} /></td>)}</tr>
            )) : students.length === 0 ? (
              <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-icon">👨‍🎓</div><div className="empty-state-title">لا يوجد طلاب</div><p className="empty-state-text">ابدأ بإضافة طلاب جدد للمنصة</p></div></td></tr>
            ) : students.map((s, i) => (
              <motion.tr key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={s.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.user?.name}`} alt="" style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(59,130,246,0.3)' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#f0f4ff', fontFamily: 'Cairo, sans-serif' }}>{s.user?.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'Cairo, sans-serif' }}>{s.user?.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-blue">{s.studentId}</span></td>
                <td style={{ fontFamily: 'Cairo, sans-serif', fontSize: 13, color: '#94a3b8' }}>{s.grade}</td>
                <td style={{ fontFamily: 'Cairo, sans-serif', fontSize: 13, color: '#94a3b8' }}>{s.section}</td>
                <td style={{ fontFamily: 'Cairo, sans-serif', fontSize: 13, color: '#94a3b8' }}>{s.parentName || '—'}</td>
                <td>{statusBadge(s.status)}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(s)} style={{ padding: '6px 10px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: 'Cairo, sans-serif' }}><Edit2 size={14} />تعديل</button>
                    <button onClick={() => setDeleteId(s._id)} style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: 'Cairo, sans-serif' }}><Trash2 size={14} />حذف</button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{ width: 36, height: 36, borderRadius: 8, background: p === page ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'var(--bg-card)', border: '1px solid var(--border)', color: p === page ? 'white' : '#94a3b8', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700 }}>{p}</button>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="modal" style={{ maxWidth: 560 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f0f4ff', fontFamily: 'Cairo, sans-serif' }}>{editStudent ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#f87171' }}><X size={16} /></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="grid-2">
                  {[
                    { label: 'الاسم الكامل', key: 'name', type: 'text', placeholder: 'اسم الطالب', icon: User },
                    { label: 'البريد الإلكتروني', key: 'email', type: 'email', placeholder: 'email@example.com', icon: Mail },
                    { label: 'رقم الهاتف', key: 'phone', type: 'text', placeholder: '05xxxxxxxx', icon: Phone },
                    { label: 'اسم ولي الأمر', key: 'parentName', type: 'text', placeholder: 'اسم ولي الأمر', icon: User },
                    { label: 'هاتف ولي الأمر', key: 'parentPhone', type: 'text', placeholder: '05xxxxxxxx', icon: Phone },
                  ].map(({ label, key, type, placeholder, icon: Icon }) => (
                    <div key={key} className="form-group" style={{ marginBottom: 16 }}>
                      <label className="label">{label}</label>
                      <div style={{ position: 'relative' }}>
                        <Icon size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                        <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} className="input" style={{ paddingRight: 38 }} required={['name', 'email'].includes(key)} />
                      </div>
                    </div>
                  ))}
                  {!editStudent && (
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="label">كلمة المرور</label>
                      <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="123456" className="input" />
                    </div>
                  )}
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="label">الصف الدراسي</label>
                    <select value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} className="input">
                      {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="label">القسم</label>
                    <select value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} className="input">
                      {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {editStudent && (
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="label">الحالة</label>
                      <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input">
                        {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <motion.button type="submit" disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    {saving ? 'جاري الحفظ...' : editStudent ? '💾 حفظ التعديلات' : '✅ إضافة الطالب'}
                  </motion.button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">إلغاء</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="modal" style={{ maxWidth: 400, textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f0f4ff', fontFamily: 'Cairo, sans-serif', marginBottom: 8 }}>تأكيد الحذف</h3>
              <p style={{ color: '#64748b', fontSize: 14, fontFamily: 'Cairo, sans-serif', marginBottom: 24 }}>هل أنت متأكد من حذف هذا الطالب؟ لا يمكن التراجع عن هذا الإجراء.</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => handleDelete(deleteId)} className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }}>نعم، احذف</button>
                <button onClick={() => setDeleteId(null)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>إلغاء</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentsPage;
