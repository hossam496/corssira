import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, BookOpen, TrendingUp, Award, UserCheck, AlertCircle, BarChart2 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../api/axios';

const StatCard = ({ icon: Icon, label, value, sub, color, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="stat-card" style={{ cursor: 'default' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}30` }}>
        <Icon size={22} color={color} />
      </div>
      {sub && <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700 }}>{sub}</span>}
    </div>
    <div style={{ fontSize: 34, fontWeight: 900, color: '#f0f4ff', lineHeight: 1, marginBottom: 6 }}>{value ?? <span className="skeleton" style={{ display: 'inline-block', width: 60, height: 34 }} />}</div>
    <div style={{ fontSize: 13, color: '#64748b', fontFamily: 'Cairo, sans-serif', fontWeight: 600 }}>{label}</div>
  </motion.div>
);

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const GRADE_COLORS = { 'ممتاز': '#10b981', 'جيد جداً': '#3b82f6', 'جيد': '#f59e0b', 'مقبول': '#8b5cf6', 'راسب': '#ef4444' };

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const gradeData = stats ? Object.entries(stats.gradeDistribution || {}).map(([name, value]) => ({ name, value })) : [];
  const attendanceData = stats ? [
    { name: 'حاضر', value: stats.attendanceStats?.present || 0, color: '#10b981' },
    { name: 'غائب', value: stats.attendanceStats?.absent || 0, color: '#ef4444' },
    { name: 'متأخر', value: stats.attendanceStats?.late || 0, color: '#f59e0b' },
  ] : [];

  const monthlyData = stats?.monthlyStudents?.map(m => ({
    month: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][m._id - 1] || m._id,
    طلاب: m.count
  })) || [];

  return (
    <div className="page-container" style={{ padding: '28px' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 className="page-title">لوحة التحكم الرئيسية</h1>
        <p className="page-subtitle">مرحباً بك في منصة كورسيرا — نظرة شاملة على المنظومة التعليمية</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard icon={GraduationCap} label="إجمالي الطلاب" value={stats?.totalStudents} sub={`${stats?.activeStudents || 0} نشط`} color="#3b82f6" delay={0.05} />
        <StatCard icon={Users} label="إجمالي المدرسين" value={stats?.totalTeachers} sub={`${stats?.activeTeachers || 0} نشط`} color="#10b981" delay={0.1} />
        <StatCard icon={BookOpen} label="المواد الدراسية" value={stats?.totalSubjects} color="#8b5cf6" delay={0.15} />
        <StatCard icon={TrendingUp} label="متوسط الأداء" value={stats?.averageGrade ? `${stats.averageGrade}%` : '—'} color="#f59e0b" delay={0.2} />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Monthly Students */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <div className="card-header">
            <span className="card-title">تسجيل الطلاب الشهري</span>
            <span className="badge badge-blue">آخر 6 أشهر</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Cairo' }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#0a1628', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, fontFamily: 'Cairo, sans-serif', color: '#f0f4ff' }} />
              <Bar dataKey="طلاب" fill="url(#blueGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Attendance Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <div className="card-header">
            <span className="card-title">الحضور والغياب</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                {attendanceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0a1628', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, fontFamily: 'Cairo, sans-serif', color: '#f0f4ff' }} />
              <Legend formatter={(val) => <span style={{ fontFamily: 'Cairo', fontSize: 12, color: '#94a3b8' }}>{val}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Grade Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <div className="card-header"><span className="card-title">توزيع الدرجات</span></div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={gradeData} layout="vertical" margin={{ right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'Cairo' }} width={70} />
              <Tooltip contentStyle={{ background: '#0a1628', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, fontFamily: 'Cairo, sans-serif', color: '#f0f4ff' }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {gradeData.map((entry, i) => <Cell key={i} fill={GRADE_COLORS[entry.name] || COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Students */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <div className="card-header">
            <span className="card-title">أحدث الطلاب</span>
            <a href="/admin/students" style={{ fontSize: 12, color: '#60a5fa', textDecoration: 'none', fontFamily: 'Cairo, sans-serif', fontWeight: 600 }}>عرض الكل</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(stats?.recentStudents || Array(4).fill(null)).map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                {s ? (
                  <>
                    <img src={s.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.user?.name}`} alt="" style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(59,130,246,0.3)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f4ff', fontFamily: 'Cairo, sans-serif' }}>{s.user?.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'Cairo, sans-serif' }}>{s.user?.email}</div>
                    </div>
                    <span className="badge badge-blue">{s.grade}</span>
                  </>
                ) : (
                  <><div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} /><div style={{ flex: 1 }}><div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 6 }} /><div className="skeleton" style={{ height: 10, width: '40%' }} /></div></>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Teachers */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
        <div className="card-header">
          <span className="card-title">المدرسون النشطون</span>
          <a href="/admin/teachers" style={{ fontSize: 12, color: '#60a5fa', textDecoration: 'none', fontFamily: 'Cairo, sans-serif', fontWeight: 600 }}>إدارة المدرسين</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {(stats?.recentTeachers || Array(3).fill(null)).map((t, i) => (
            <div key={i} style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
              {t ? (
                <>
                  <img src={t.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.user?.name}`} alt="" style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid rgba(16,185,129,0.4)', marginBottom: 10 }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f4ff', fontFamily: 'Cairo, sans-serif', marginBottom: 4 }}>{t.user?.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'Cairo, sans-serif' }}>{t.specialization}</div>
                  <div style={{ marginTop: 8 }}><span className="badge badge-green">نشط</span></div>
                </>
              ) : (
                <><div className="skeleton" style={{ width: 52, height: 52, borderRadius: '50%', margin: '0 auto 10px' }} /><div className="skeleton" style={{ height: 14, width: '70%', margin: '0 auto 6px' }} /><div className="skeleton" style={{ height: 12, width: '50%', margin: '0 auto' }} /></>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
