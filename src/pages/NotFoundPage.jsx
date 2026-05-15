import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

const NotFoundPage = () => (
  <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', padding: 20 }}>
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity }} style={{ fontSize: 120, marginBottom: 24 }}>🔍</motion.div>
      <h1 style={{ fontSize: 80, fontWeight: 900, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8, fontFamily: 'Cairo, sans-serif' }}>404</h1>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#f0f4ff', fontFamily: 'Cairo, sans-serif', marginBottom: 12 }}>الصفحة غير موجودة</h2>
      <p style={{ color: '#64748b', fontFamily: 'Cairo, sans-serif', fontSize: 15, marginBottom: 32 }}>عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها</p>
      <Link to="/login" className="btn btn-primary" style={{ fontSize: 15, padding: '14px 28px' }}><Home size={18} />العودة للرئيسية</Link>
    </motion.div>
  </div>
);

export default NotFoundPage;
