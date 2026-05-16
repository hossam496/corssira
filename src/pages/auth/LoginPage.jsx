import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`مرحباً بك يا ${data.user.name}! 👋`);
      const role = data.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ في تسجيل الدخول');
    } finally { setLoading(false); }
  };

  const quickLogin = (email, password) => setForm({ email, password });

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 30% 30%, #0a1628 0%, #050915 60%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs */}
      {[
        { top: '10%', right: '15%', size: 400, color: 'rgba(59,130,246,0.08)' },
        { bottom: '15%', left: '10%', size: 300, color: 'rgba(99,102,241,0.06)' },
        { top: '50%', left: '50%', size: 200, color: 'rgba(139,92,246,0.05)' },
      ].map((orb, i) => (
        <div key={i} style={{ position: 'absolute', width: orb.size, height: orb.size, borderRadius: '50%', background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`, filter: 'blur(40px)', top: orb.top, bottom: orb.bottom, left: orb.left, right: orb.right, pointerEvents: 'none' }} />
      ))}

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ width: '100%', maxWidth: 460 }}>
          <div style={{ background: 'rgba(10, 22, 40, 0.9)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 24, padding: 40, backdropFilter: 'blur(20px)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ width: 80, height: 80, borderRadius: 20, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 40px rgba(59,130,246,0.3)', overflow: 'hidden', padding: 8 }}>
                <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </motion.div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f0f4ff', fontFamily: 'Cairo, sans-serif', marginBottom: 6 }}>تسجيل الدخول</h2>
              <p style={{ color: '#64748b', fontSize: 14, fontFamily: 'Cairo, sans-serif' }}>ادخل إلى حسابك في منصة كورسيرا</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 8, fontFamily: 'Cairo, sans-serif' }}>البريد الإلكتروني</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="example@corssira.com" required className="input" style={{ paddingRight: 42 }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 8, fontFamily: 'Cairo, sans-serif' }}>كلمة المرور</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" required className="input" style={{ paddingRight: 42, paddingLeft: 42 }} />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{ width: '100%', padding: '14px', background: loading ? '#1e3a5f' : 'linear-gradient(135deg, #3b82f6, #6366f1)', border: 'none', borderRadius: 12, color: 'white', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 20px rgba(59,130,246,0.3)', transition: 'all 0.2s' }}
              >
                {loading ? <><span className="animate-spin" style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />جاري الدخول...</> : <><LogIn size={18} />دخول</>}
              </motion.button>
            </form>

            {/* Quick login */}
            <div style={{ marginTop: 24, padding: '16px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 12 }}>
              <p style={{ fontSize: 11, color: '#475569', fontFamily: 'Cairo, sans-serif', marginBottom: 10, textAlign: 'center' }}>دخول سريع للتجربة</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: 'مدير', email: 'admin@corssira.com', pass: 'admin123', color: '#3b82f6' },
                  { label: 'مدرس', email: 'teacher1@corssira.com', pass: 'teacher123', color: '#10b981' },
                  { label: 'طالب', email: 'student1@corssira.com', pass: 'student123', color: '#8b5cf6' },
                ].map(q => (
                  <button key={q.label} onClick={() => quickLogin(q.email, q.pass)}
                    style={{ flex: 1, padding: '7px 10px', background: `${q.color}15`, border: `1px solid ${q.color}30`, borderRadius: 8, color: q.color, fontFamily: 'Cairo, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${q.color}25`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${q.color}15`; }}
                  >{q.label}</button>
                ))}
              </div>
            </div>

            <p style={{ textAlign: 'center', marginTop: 20, color: '#475569', fontSize: 13, fontFamily: 'Cairo, sans-serif' }}>
              ليس لديك حساب؟{' '}
              <Link to="/register" style={{ color: '#60a5fa', fontWeight: 700, textDecoration: 'none' }}>إنشاء حساب جديد</Link>
            </p>
          </div>
        </motion.div>
    </div>
  );
};

export default LoginPage;
