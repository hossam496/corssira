import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import api from '../../api/axios';
import { BookOpen, Calendar, Award, Clock, FileText, CheckCircle, TrendingUp, ChevronLeft, Loader2, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState({ data: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, g, a, e, as] = await Promise.all([
          api.get('/students/me'), 
          api.get('/grades/my'), 
          api.get('/attendance/my'),
          api.get(`/enrollments/student/${user?._id}`),
          api.get('/assignments')
        ]);
        setProfile(p.data.data);
        setGrades(g.data.data || []);
        setAttendance({ data: a.data.data || [], stats: a.data.stats || {} });
        
        // Extract subjects from enrollments
        const enrollments = e.data.data || [];
        setEnrolledSubjects(enrollments.map(item => item.subject).filter(Boolean));
        
        // Filter pending assignments
        const assignments = as.data.data || [];
        const pending = assignments.filter(a => !a.submission).length;
        setPendingAssignments(pending);
      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const gradeChartData = grades.slice(0, 8).reverse().map((g, i) => ({
    name: g.examTitle?.split(' ')[1] || `ت ${i + 1}`,
    النسبة: Math.round((g.score / (g.totalScore || 1)) * 100),
  }));

  const calculateGPA = () => {
    if (grades.length === 0) return '0.0';
    const totalPercentage = grades.reduce((acc, g) => acc + (g.score / (g.totalScore || 100)), 0);
    const avg = totalPercentage / grades.length;
    return (avg * 4).toFixed(1);
  };

  const getGPAStatus = (gpa) => {
    const val = parseFloat(gpa);
    if (val >= 3.6) return { label: 'ممتاز', color: 'text-accent-green' };
    if (val >= 3.0) return { label: 'جيد جداً', color: 'text-accent-blue' };
    if (val >= 2.4) return { label: 'جيد', color: 'text-accent-yellow' };
    return { label: 'مقبول', color: 'text-accent-red' };
  };

  const gpaValue = calculateGPA();
  const gpaStatus = getGPAStatus(gpaValue);
  const attendancePercent = attendance.stats?.total > 0 
    ? Math.round((attendance.stats.present / attendance.stats.total) * 100) 
    : 0;

  if (loading) return (
    <div className="page-container flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-accent-blue" size={40} />
    </div>
  );

  return (
    <div className="page-container max-w-[1400px]">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col-reverse md:flex-row justify-between items-center gap-6 mb-8 md:mb-10"
      >
        <div className="text-center md:text-right w-full">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-black text-text-primary">مرحباً، {user?.name.split(' ')[0]}</h1>
            <span className="text-3xl md:text-4xl inline-block hover:animate-pulse origin-bottom-right">👋</span>
          </div>
          <p className="text-text-secondary font-medium text-sm md:text-base">إليك نظرة سريعة على أدائك التعليمي</p>
        </div>
        <div className="flex justify-center md:justify-end w-full md:w-auto">
            <img 
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} 
              className="w-20 h-20 md:w-16 md:h-16 rounded-full md:rounded-2xl border-4 border-white/5 shadow-[0_0_20px_rgba(0,0,0,0.5)] object-cover" 
              alt="profile"
            />
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'المواد الدراسية', value: enrolledSubjects.length, icon: <BookOpen />, color: 'text-accent-blue', bg: 'bg-accent-blue/10', trend: 'نشط الآن' },
          { label: 'نسبة الحضور', value: `${attendancePercent}%`, icon: <Calendar />, color: 'text-accent-green', bg: 'bg-accent-green/10', trend: attendancePercent > 80 ? 'ممتاز' : 'تحسن ملحوظ' },
          { label: 'المعدل التراكمي', value: gpaValue, icon: <Award />, color: 'text-accent-purple', bg: 'bg-accent-purple/10', trend: gpaStatus.label },
          { label: 'المهام القادمة', value: pendingAssignments, icon: <Clock />, color: 'text-accent-yellow', bg: 'bg-accent-yellow/10', trend: pendingAssignments > 0 ? 'بانتظار الحل' : 'مكتمل ✅' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: i * 0.1 }}
            className="bg-bg-card border border-border rounded-3xl p-6 flex flex-col gap-4 shadow-lg group hover:border-accent-blue/30 transition-all duration-300"
          >
            <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <div className="text-[10px] font-black text-accent-green flex items-center gap-1 bg-accent-green/5 px-2 py-1 rounded-full">
                   <TrendingUp size={10} /> {stat.trend}
                </div>
            </div>
            <div>
              <div className="text-3xl font-black text-text-primary mb-1">{stat.value}</div>
              <div className="text-xs font-black text-text-secondary uppercase tracking-widest">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
        {/* Performance Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="lg:col-span-2 bg-bg-card border border-border rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-xl flex flex-col"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg md:text-xl font-black text-text-primary">مخطط الأداء الدراسي</h3>
            <NavLink to="/student/grades" className="w-10 h-10 bg-white/5 border border-border rounded-xl flex items-center justify-center text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 transition-all">
              <ChevronLeft size={20} />
            </NavLink>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gradeChartData}>
                <defs>
                  <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} dy={10} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  cursor={{ stroke: 'var(--accent-blue)', strokeWidth: 1 }}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.4)' }}
                  itemStyle={{ color: 'var(--accent-blue)', fontWeight: 800 }}
                />
                <Area type="monotone" dataKey="النسبة" stroke="var(--accent-blue)" strokeWidth={4} fillOpacity={1} fill="url(#colorGrade)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Attendance Summary */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="bg-bg-card border border-border rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-xl flex flex-col"
        >
          <h3 className="text-lg md:text-xl font-black text-text-primary mb-8">سجل الحضور</h3>
          <div className="flex-1 flex flex-col justify-center gap-8">
            {[
              { label: 'حاضر', value: attendance.stats.present || 0, total: attendance.stats.total || 1, color: 'bg-accent-green', text: 'text-accent-green' },
              { label: 'غائب', value: attendance.stats.absent || 0, total: attendance.stats.total || 1, color: 'bg-accent-red', text: 'text-accent-red' },
              { label: 'متأخر', value: attendance.stats.late || 0, total: attendance.stats.total || 1, color: 'bg-accent-yellow', text: 'text-accent-yellow' },
            ].map(({ label, value, total, color, text }) => (
              <div key={label} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-black text-text-secondary uppercase tracking-widest">{label}</span>
                  <span className={`text-base font-black ${text}`}>{value} أيام</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full transition-all duration-700 ${color}`} 
                    style={{ width: `${Math.min((value / total) * 100, 100)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Evaluations */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-bg-card border border-border rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="p-6 md:p-8 border-b border-border bg-bg-card/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-lg md:text-xl font-black text-text-primary flex items-center gap-3">
             <Award className="text-accent-blue" size={24} />
             آخر الدرجات المرصودة
          </h3>
          <NavLink to="/student/grades" className="text-accent-blue hover:text-accent-blue-light text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-colors">
            عرض الكل <ArrowRight size={14} className="rotate-180" />
          </NavLink>
        </div>
        <div className="overflow-x-auto">
          {grades.length === 0 ? (
            <div className="py-24 text-center">
               <div className="text-7xl mb-6 opacity-20">📊</div>
               <p className="text-text-secondary font-black text-lg">لا توجد نتائج مسجلة حتى الآن</p>
            </div>
          ) : (
            <table className="w-full text-right">
              <thead>
                <tr className="bg-white/[0.02] border-b border-border/50">
                  <th className="px-8 py-5 text-xs font-black text-text-muted uppercase tracking-widest">المادة</th>
                  <th className="px-8 py-5 text-xs font-black text-text-muted uppercase tracking-widest">التقييم</th>
                  <th className="px-8 py-5 text-xs font-black text-text-muted uppercase tracking-widest text-center">الدرجة</th>
                  <th className="px-8 py-5 text-xs font-black text-text-muted uppercase tracking-widest text-left">التقدير</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {grades.slice(0, 5).map((g, idx) => (
                  <motion.tr 
                    key={g._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">📚</div>
                         <span className="font-black text-text-primary text-base group-hover:text-accent-blue transition-colors">{g.subject?.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-text-secondary bg-white/5 px-3 py-1 rounded-full border border-white/5">{g.examTitle}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-xl font-black text-text-primary leading-none">{g.score}</span>
                        <span className="text-[10px] font-black text-text-muted uppercase">/{g.totalScore}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-left">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                         ['امتياز', 'جيد جداً', 'جيد', 'مقبول'].includes(g.status) 
                         ? 'bg-accent-green/10 text-accent-green border-accent-green/20' 
                         : 'bg-accent-red/10 text-accent-red border-accent-red/20'
                       }`}>
                        {g.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;
