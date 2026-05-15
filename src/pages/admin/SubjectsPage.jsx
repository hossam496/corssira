import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Edit2, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4'];
const ICONS = ['📚','🔬','📐','⚡','🧪','🏛️','🎨','💻','🌍','📖'];
const GRADES = ['الأول','الثاني','الثالث','الرابع','الخامس','السادس'];

const defaultForm = { name: '', description: '', grade: 'الأول', credits: 3, color: '#3b82f6', icon: '📚' };

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await api.get('/subjects', { params: { search } }); setSubjects(data.data || []); }
    catch { toast.error('خطأ في التحميل'); } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [search]);

  const openCreate = () => { setEditSubject(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (s) => { setEditSubject(s); setForm({ name: s.name, description: s.description, grade: s.grade, credits: s.credits, color: s.color, icon: s.icon }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editSubject) { await api.put(`/subjects/${editSubject._id}`, form); toast.success('تم التحديث ✅'); }
      else { await api.post('/subjects', form); toast.success('تم إضافة المادة 🎉'); }
      setShowModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'خطأ'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/subjects/${id}`); toast.success('تم الحذف'); setDeleteId(null); fetch(); }
    catch { toast.error('خطأ في الحذف'); }
  };

  return (
    <div style={{ padding: 28 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">المواد الدراسية</h1>
          <p className="page-subtitle">{subjects.length} مادة دراسية</p>
        </div>
        <motion.button onClick={openCreate} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="btn btn-primary"><Plus size={18} />إضافة مادة</motion.button>
      </motion.div>

      <div style={{ position: 'relative', maxWidth: 300, marginBottom: 24 }}>
        <Search size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="input" style={{ paddingRight: 42 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
        {loading ? Array(6).fill(null).map((_, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, height: 180 }}>
            <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 12, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 12, width: '80%' }} />
          </div>
        )) : subjects.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}><div className="empty-state-icon">📚</div><div className="empty-state-title">لا توجد مواد</div></div>
        ) : subjects.map((s, i) => (
          <motion.div key={s._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            style={{ background: 'var(--bg-card)', border: `1px solid ${s.color}30`, borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden', transition: 'all 0.3s', cursor: 'default' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 30px ${s.color}20`; e.currentTarget.style.borderColor = `${s.color}60`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = `${s.color}30`; }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
            <div style={{ width: 52, height: 52, borderRadius: 12, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 14, border: `1px solid ${s.color}30` }}>{s.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#f0f4ff', fontFamily: 'Cairo, sans-serif', marginBottom: 4 }}>{s.name}</div>
            <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'Cairo, sans-serif', marginBottom: 4 }}>{s.code}</div>
            <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'Cairo, sans-serif', marginBottom: 12 }}>الصف: {s.grade} | الساعات: {s.credits}</div>
            {s.description && <div style={{ fontSize: 12, color: '#475569', fontFamily: 'Cairo, sans-serif', marginBottom: 14, lineHeight: 1.5 }}>{s.description}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => openEdit(s)} style={{ flex: 1, padding: '7px', background: `${s.color}15`, border: `1px solid ${s.color}30`, borderRadius: 8, color: s.color, cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo, sans-serif', fontWeight: 700 }}>✏️ تعديل</button>
              <button onClick={() => setDeleteId(s._id)} style={{ flex: 1, padding: '7px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo, sans-serif', fontWeight: 700 }}>🗑️ حذف</button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="modal">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f0f4ff', fontFamily: 'Cairo, sans-serif' }}>{editSubject ? 'تعديل المادة' : 'إضافة مادة جديدة'}</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#f87171' }}><X size={16} /></button>
              </div>
              <form onSubmit={handleSave}>
                <div style={{ marginBottom: 16 }}>
                  <label className="label">اسم المادة</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" required />
                </div>
                <div className="grid-2">
                  <div style={{ marginBottom: 16 }}>
                    <label className="label">الصف الدراسي</label>
                    <select value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} className="input">{GRADES.map(g => <option key={g} value={g}>{g}</option>)}</select>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label className="label">عدد الساعات</label>
                    <input type="number" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: e.target.value }))} className="input" min={1} max={6} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="label">الوصف</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="input" style={{ resize: 'vertical' }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="label">اللون</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                        style={{ width: 32, height: 32, borderRadius: 8, background: c, border: form.color === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer', boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none' }} />
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label className="label">الأيقونة</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {ICONS.map(ic => (
                      <button key={ic} type="button" onClick={() => setForm(f => ({ ...f, icon: ic }))}
                        style={{ width: 40, height: 40, borderRadius: 8, fontSize: 20, background: form.icon === ic ? 'rgba(59,130,246,0.2)' : 'var(--bg-secondary)', border: form.icon === ic ? '2px solid #3b82f6' : '1px solid var(--border)', cursor: 'pointer' }}>
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <motion.button type="submit" disabled={saving} whileHover={{ scale: 1.02 }} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    {saving ? 'جاري الحفظ...' : editSubject ? '💾 حفظ' : '✅ إضافة'}
                  </motion.button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">إلغاء</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="modal" style={{ maxWidth: 380, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f0f4ff', fontFamily: 'Cairo, sans-serif', marginBottom: 8 }}>تأكيد الحذف</h3>
              <p style={{ color: '#64748b', fontSize: 14, fontFamily: 'Cairo, sans-serif', marginBottom: 20 }}>هل أنت متأكد من حذف هذه المادة؟</p>
              <div style={{ display: 'flex', gap: 12 }}><button onClick={() => handleDelete(deleteId)} className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }}>احذف</button><button onClick={() => setDeleteId(null)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>إلغاء</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubjectsPage;
