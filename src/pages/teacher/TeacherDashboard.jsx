import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { Bell, Search, Filter, TrendingUp, Users, BookOpen, Star, Clock, ChevronLeft, FileText, Activity } from 'lucide-react';
import NotificationDropdown from '../../components/NotificationDropdown';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { NavLink } from 'react-router-dom';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [teacherStats, setTeacherStats] = useState(null);

  const fetchData = async () => {
    try {
      const [p, s, e, n, t] = await Promise.all([
        api.get('/teachers/me'),
        api.get('/subjects'),
        user?._id ? api.get(`/enrollments/teacher/${user._id}`) : Promise.resolve({ data: { data: [] } }),
        api.get('/notifications'),
        api.get('/dashboard/teacher/stats')
      ]);
      setProfile(p.data.data);
      setAssignedSubjects(s.data.data);
      setRecentEnrollments(e.data.data);
      setNotifCount(n.data.data.filter(notif => !notif.read).length);
      setTeacherStats(t.data.data);
    } catch (error) {
      console.error('Fetch error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const gradesData = teacherStats?.gradeDistribution || [
    { name: 'أ', grade: 0 },
    { name: 'ب', grade: 0 },
    { name: 'ج', grade: 0 },
    { name: 'د', grade: 0 },
    { name: 'هـ', grade: 0 },
  ];

  if (loading) return (
    <div className="page-container flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-10 h-10 border-4 border-border border-t-accent-blue rounded-full" />
    </div>
  );

  const totalStudents = new Set(recentEnrollments.map(e => e.student?._id || e.student)).size;

  return (
    <div className="page-container max-w-[1400px]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-text-primary mb-2">مرحباً د. {profile?.user?.name.split(' ')[0]} 👋</h1>
          <p className="text-text-secondary font-medium">إليك ملخص أداء طلابك ونشاطك اليوم</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="w-11 h-11 flex items-center justify-center bg-bg-card border border-border rounded-xl text-text-secondary hover:text-accent-blue transition-colors relative"
            >
              <Bell size={20} />
              {notifCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent-red rounded-full border-2 border-bg-card" />}
            </button>
            <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} onNewNotification={() => setNotifCount(prev => prev + 1)} />
          </div>
          <img 
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.user?.name}`} 
            alt="avatar" 
            className="w-11 h-11 rounded-xl border-2 border-accent-blue shadow-lg object-cover" 
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'إجمالي الطلاب', value: totalStudents, icon: <Users />, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
          { label: 'الامتحانات المرفوعة', value: teacherStats?.examCount || 0, icon: <FileText />, color: 'text-accent-green', bg: 'bg-accent-green/10' },
          { label: 'الواجبات المقررة', value: teacherStats?.assignmentCount || 0, icon: <BookOpen />, color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
          { label: 'نسبة النجاح', value: `${teacherStats?.successRate || 0}%`, icon: <Star />, color: 'text-accent-yellow', bg: 'bg-accent-yellow/10' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
            className="bg-bg-card border border-border rounded-3xl p-6 flex flex-col gap-4 hover:border-accent-blue/30 transition-all duration-300 shadow-lg group"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-3xl font-black text-text-primary mb-1">{stat.value}</div>
              <div className="text-xs font-black text-text-secondary uppercase tracking-widest">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Grades Distribution */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="bg-bg-card border border-border rounded-[2rem] p-8 shadow-xl"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-text-primary">توزيع الدرجات العام</h3>
            <div className="flex items-center gap-2 text-xs font-black text-accent-blue bg-accent-blue/5 px-3 py-1.5 rounded-full border border-accent-blue/10">
               <Activity size={14} className="animate-pulse" /> تحديث تلقائي
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.4)' }}
                />
                <Bar dataKey="grade" radius={[10, 10, 0, 0]} barSize={40}>
                  {gradesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['var(--accent-blue)', 'var(--accent-indigo)', 'var(--accent-purple)', 'var(--accent-green)', 'var(--accent-red)'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Enrollments */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="bg-bg-card border border-border rounded-[2rem] overflow-hidden shadow-xl flex flex-col"
        >
          <div className="p-8 border-b border-border flex justify-between items-center bg-bg-card/50">
            <h3 className="text-xl font-black text-text-primary">آخر طلبات الالتحاق</h3>
            <button className="text-accent-blue hover:text-accent-blue-light text-xs font-black uppercase tracking-wider flex items-center gap-1">
              عرض الكل <ChevronLeft size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
            {recentEnrollments.length > 0 ? (
              recentEnrollments.slice(0, 10).map((e, idx) => (
                <div 
                  key={e._id} 
                  className={`p-6 flex items-center gap-5 border-b border-white/5 hover:bg-white/5 transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'}`}
                >
                  <img 
                    src={e.student?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${e.student?.name}`} 
                    className="w-12 h-12 rounded-2xl object-cover border border-white/10" 
                    alt="" 
                  />
                  <div className="flex-1">
                    <div className="text-base font-black text-text-primary mb-1">{e.student?.name}</div>
                    <div className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                      <BookOpen size={12} className="text-accent-blue" /> {e.subject?.name}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      e.status === 'نشط' ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20'
                    }`}>
                      {e.status}
                    </span>
                    <span className="text-[10px] font-black text-text-muted flex items-center gap-1">
                      <Clock size={10} /> {new Date(e.enrolledAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <div className="text-5xl opacity-20">📥</div>
                <p className="text-text-secondary font-black">لا توجد طلبات حالية</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
