import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', schoolGrade: 'أولى ثانوي' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(form);
      toast.success('تم إنشاء الحساب بنجاح! 🎉');
      const role = data.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ في إنشاء الحساب');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 70% 30%, #0a1628 0%, #050915 60%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', right: '20%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ background: 'rgba(10,22,40,0.9)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 24, padding: 40, backdropFilter: 'blur(20px)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <motion.div animate={{ y: [0,-6,0] }} transition={{ duration: 3, repeat: Infinity }} style={{ width: 70, height: 70, borderRadius: 18, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px', boxShadow: '0 0 40px rgba(59,130,246,0.3)' }}>🎓</motion.div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f0f4ff', fontFamily: 'Cairo, sans-serif', marginBottom: 6 }}>إنشاء حساب جديد</h2>
            <p style={{ color: '#64748b', fontSize: 14, fontFamily: 'Cairo, sans-serif' }}>انضم إلى منصة كورسيرا التعليمية</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 8, fontFamily: 'Cairo, sans-serif' }}>الاسم الكامل</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسمك الكامل" required className="input" style={{ paddingRight: 42 }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 8, fontFamily: 'Cairo, sans-serif' }}>البريد الإلكتروني</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="example@corssira.com" required className="input" style={{ paddingRight: 42 }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 8, fontFamily: 'Cairo, sans-serif' }}>نوع الحساب</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="input" style={{ cursor: 'pointer' }}>
                <option value="student">👨‍🎓 طالب</option>
                <option value="teacher">👨‍🏫 مدرس</option>
              </select>
            </div>
            
            {form.role === 'student' && (
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 8, fontFamily: 'Cairo, sans-serif' }}>المرحلة الدراسية</label>
                <select value={form.schoolGrade} onChange={e => setForm(f => ({ ...f, schoolGrade: e.target.value }))} className="input" style={{ cursor: 'pointer' }}>
                  <option value="أولى ثانوي">أولى ثانوي</option>
                  <option value="ثانية ثانوي">ثانية ثانوي</option>
                  <option value="ثالثة ثانوي">ثالثة ثانوي</option>
                </select>
              </div>
            )}
            
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 8, fontFamily: 'Cairo, sans-serif' }}>كلمة المرور</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" required minLength={6} className="input" style={{ paddingRight: 42, paddingLeft: 42 }} />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ width: '100%', padding: '14px', background: loading ? '#1e3a5f' : 'linear-gradient(135deg, #3b82f6, #6366f1)', border: 'none', borderRadius: 12, color: 'white', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 20px rgba(59,130,246,0.3)' }}
            >
              {loading ? 'جاري الإنشاء...' : <><UserPlus size={18} />إنشاء الحساب</>}
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: '#475569', fontSize: 13, fontFamily: 'Cairo, sans-serif' }}>
            لديك حساب بالفعل؟{' '}
            <Link to="/login" style={{ color: '#60a5fa', fontWeight: 700, textDecoration: 'none' }}>تسجيل الدخول</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
