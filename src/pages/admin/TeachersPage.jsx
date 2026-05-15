import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Star, Mail, Phone, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const defaultForm = { name: '', email: '', password: '', phone: '', specialization: '', yearsOfExperience: 0, salary: 0, bio: '', status: 'نشط' };

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/teachers', { params: { search } });
      setTeachers(data.data || []);
    } catch { toast.error('خطأ في تحميل المدرسين'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTeachers(); }, [search]);

  const openCreate = () => { setEditTeacher(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (t) => {
    setEditTeacher(t);
    setForm({ name: t.user?.name || '', email: t.user?.email || '', password: '', phone: t.user?.phone || '', specialization: t.specialization, yearsOfExperience: t.yearsOfExperience, salary: t.salary, bio: t.bio || '', status: t.status });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editTeacher) { await api.put(`/teachers/${editTeacher._id}`, form); toast.success('تم تحديث بيانات المدرس ✅'); }
      else { await api.post('/teachers', form); toast.success('تم إضافة المدرس بنجاح 🎉'); }
      setShowModal(false); fetchTeachers();
    } catch (err) { toast.error(err.response?.data?.message || 'حدث خطأ'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/teachers/${id}`); toast.success('تم حذف المدرس'); setDeleteId(null); fetchTeachers(); }
    catch { toast.error('خطأ في الحذف'); }
  };

  return (
    <div style={{ padding: 28 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">إدارة المدرسين</h1>
          <p className="page-subtitle">{teachers.length} مدرس في المنصة</p>
        </div>
        <motion.button onClick={openCreate} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="btn btn-primary">
          <Plus size={18} />إضافة مدرس جديد
        </motion.button>
      </motion.div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, maxWidth: 300, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم..." className="input" style={{ paddingRight: 42 }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {loading ? Array(6).fill(null).map((_, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <div className="skeleton" style={{ width: 64, height: 64, borderRadius: '50%', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 12, width: '80%' }} />
          </div>
        )) : teachers.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}><div className="empty-state-icon">👨‍🏫</div><div className="empty-state-title">لا يوجد مدرسون</div></div>
        ) : teachers.map((t, i) => (
          <motion.div key={t._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #10b981, #3b82f6)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <img src={t.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.user?.name}`} alt="" style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid rgba(16,185,129,0.4)' }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#f0f4ff', fontFamily: 'Cairo, sans-serif' }}>{t.user?.name}</div>
                <div style={{ fontSize: 12, color: '#10b981', fontFamily: 'Cairo, sans-serif', fontWeight: 600 }}>{t.specialization}</div>
                <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={11} fill={s <= Math.round(t.rating||0)?'#f59e0b':'none'} color={s <= Math.round(t.rating||0)?'#f59e0b':'#475569'} />)}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, fontSize: 12, color: '#64748b', fontFamily: 'Cairo, sans-serif' }}>
              <span>✉️ {t.user?.email}</span>
              <span>📱 {t.user?.phone || '—'}</span>
              <span>💼 {t.yearsOfExperience} سنة خبرة</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => openEdit(t)} style={{ flex: 1, padding: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, color: '#60a5fa', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: 12, fontWeight: 700 }}>✏️ تعديل</button>
              <button onClick={() => setDeleteId(t._id)} style={{ flex: 1, padding: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: 12, fontWeight: 700 }}>🗑️ حذف</button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="modal">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f0f4ff', fontFamily: 'Cairo, sans-serif' }}>{editTeacher ? 'تعديل المدرس' : 'إضافة مدرس جديد'}</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#f87171' }}><X size={16} /></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="grid-2">
                  {[['الاسم','name','text'],['البريد الإلكتروني','email','email'],['الهاتف','phone','text'],['التخصص','specialization','text'],['سنوات الخبرة','yearsOfExperience','number'],['الراتب','salary','number']].map(([label, key, type]) => (
                    <div key={key} style={{ marginBottom: 14 }}>
                      <label className="label">{label}</label>
                      <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="input" required={['name','email','specialization'].includes(key)} />
                    </div>
                  ))}
                  {!editTeacher && (
                    <div style={{ marginBottom: 14 }}>
                      <label className="label">كلمة المرور</label>
                      <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input" placeholder="123456" />
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="label">نبذة</label>
                  <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} className="input" style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <motion.button type="submit" disabled={saving} whileHover={{ scale: 1.02 }} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    {saving ? 'جاري الحفظ...' : editTeacher ? '💾 حفظ' : '✅ إضافة'}
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
              <p style={{ color: '#64748b', fontSize: 14, fontFamily: 'Cairo, sans-serif', marginBottom: 20 }}>هل أنت متأكد من حذف هذا المدرس؟</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => handleDelete(deleteId)} className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }}>احذف</button>
                <button onClick={() => setDeleteId(null)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>إلغاء</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeachersPage;
