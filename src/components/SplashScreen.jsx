import { motion } from 'framer-motion';

const SplashScreen = () => (
  <div style={{
    position: 'fixed', inset: 0,
    background: 'radial-gradient(ellipse at center, #0a1628 0%, #050915 70%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
  }}>
    {/* Glowing orbs */}
    <div style={{ position: 'absolute', top: '20%', left: '30%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
    <div style={{ position: 'absolute', bottom: '20%', right: '30%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(30px)' }} />

    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}
    >
      {/* Logo */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 90, height: 90, borderRadius: '24px',
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 42, boxShadow: '0 0 60px rgba(59,130,246,0.4)',
        }}
      >
        🎓
      </motion.div>

      <div style={{ textAlign: 'center' }}>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ fontSize: 36, fontWeight: 900, background: 'linear-gradient(135deg, #60a5fa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8, fontFamily: 'Cairo, sans-serif' }}
        >
          كورسيرا
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ color: '#94a3b8', fontSize: 15, fontFamily: 'Cairo, sans-serif' }}
        >
          نظام إدارة الطلاب والمدرسين
        </motion.p>
      </div>

      {/* Loader dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{ display: 'flex', gap: 8 }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }}
          />
        ))}
      </motion.div>
    </motion.div>
  </div>
);

export default SplashScreen;
