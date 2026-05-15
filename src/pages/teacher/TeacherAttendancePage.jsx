import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, CheckCircle, XCircle, Clock, Save, Search, User, Filter, ChevronDown, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const TeacherAttendancePage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({}); // { studentId: status }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch Teacher's Subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/subjects?teacher=${user?._id}`);
        setSubjects(data.data);
        if (data.data.length > 0) setSelectedSubject(data.data[0]._id);
      } catch (err) {
        toast.error('فشل في جلب المواد');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchSubjects();
  }, [user]);

  // Fetch Students for selected subject
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedSubject) return;
      try {
        setLoading(true);
        const { data } = await api.get(`/subjects/${selectedSubject}`);
        setStudents(data.data.students || []);
        
        // Fetch existing attendance for this date
        const attRes = await api.get(`/attendance?subject=${selectedSubject}&date=${date}`);
        const existingAtt = {};
        attRes.data.data.forEach(rec => {
          existingAtt[rec.student._id] = rec.status;
        });
        setAttendance(existingAtt);
      } catch (err) {
        toast.error('فشل في جلب الطلاب');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedSubject, date]);

  const handleStatusChange = (stuId, status) => {
    setAttendance(prev => ({ ...prev, [stuId]: status }));
  };

  const handleSave = async () => {
    if (!selectedSubject) return toast.error('يرجى اختيار المادة');
    setSaving(true);
    try {
      const records = students.map(s => ({
        student: s._id,
        status: attendance[s._id] || 'حاضر',
        note: ''
      }));
      
      await api.post('/attendance', { 
        records, 
        subject: selectedSubject, 
        date 
      });
      toast.success('تم حفظ سجل الحضور بنجاح ✅');
    } catch (err) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container max-w-[1200px]">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-3xl font-black text-text-primary mb-2">تسجيل الحضور</h1>
        <p className="text-text-secondary font-medium">قم بتسجيل حضور وغياب الطلاب للحصة الدراسية للمادة المختارة</p>
      </motion.div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 bg-bg-card border border-border p-6 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <label className="text-xs font-black text-text-secondary mr-1 flex items-center gap-2">
            <Filter size={14} className="text-accent-blue" /> المادة الدراسية
          </label>
          <div className="relative">
            <select 
              value={selectedSubject} 
              onChange={e => setSelectedSubject(e.target.value)} 
              className="input bg-bg-secondary h-12 pr-10"
            >
              {subjects.length > 0 ? subjects.map(s => (
                <option key={s._id} value={s._id}>{s.name} - {s.category}</option>
              )) : <option value="">لا يوجد مواد مسجلة</option>}
            </select>
            <ChevronDown size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-text-secondary mr-1 flex items-center gap-2">
            <CalendarIcon size={14} className="text-accent-blue" /> تاريخ الحصة
          </label>
          <div className="relative">
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="input bg-bg-secondary h-12 pr-12" 
            />
            <CalendarIcon size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
        </div>

        <div className="flex items-end">
          <button 
            onClick={handleSave} 
            disabled={saving || subjects.length === 0} 
            className="w-full h-12 btn btn-primary rounded-2xl flex items-center justify-center gap-2 text-sm font-black shadow-lg shadow-accent-blue/20"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>{saving ? 'جاري الحفظ...' : 'اعتماد سجل الحضور'}</span>
          </button>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-8 border-b border-border flex flex-col md:flex-row justify-between items-center gap-6 bg-bg-card/50">
          <h3 className="text-xl font-black text-text-primary flex items-center gap-3">
             <User className="text-accent-blue" size={24} />
             قائمة الطلاب 
             <span className="text-sm font-bold text-text-muted bg-white/5 px-3 py-1 rounded-full border border-white/5">{filteredStudents.length}</span>
          </h3>
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              placeholder="بحث باسم الطالب..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input bg-bg-secondary/50 border-border/50 h-11 pr-11 text-sm rounded-xl" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-white/[0.02] border-b border-border/50">
                <th className="px-8 py-5 text-xs font-black text-text-muted uppercase tracking-widest">الطالب</th>
                <th className="px-8 py-5 text-xs font-black text-text-muted uppercase tracking-widest text-center">الحالة الحالية</th>
                <th className="px-8 py-5 text-xs font-black text-text-muted uppercase tracking-widest text-left">تغيير الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array(5).fill(null).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={3} className="px-8 py-6"><div className="h-14 bg-white/5 rounded-2xl animate-pulse" /></td>
                  </tr>
                ))
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((s, idx) => (
                  <motion.tr 
                    key={s._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img 
                          src={s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`} 
                          alt="" 
                          className="w-12 h-12 rounded-2xl border-2 border-white/5 group-hover:border-accent-blue/30 transition-all object-cover" 
                        />
                        <div>
                          <div className="font-black text-text-primary text-base group-hover:text-accent-blue transition-colors">{s.name}</div>
                          <div className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                        (attendance[s._id] || 'حاضر') === 'حاضر' 
                        ? 'bg-accent-green/10 text-accent-green border-accent-green/20' 
                        : (attendance[s._id] === 'غائب' 
                          ? 'bg-accent-red/10 text-accent-red border-accent-red/20' 
                          : 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20')
                      }`}>
                        {attendance[s._id] || 'حاضر'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex gap-2 justify-end">
                        {[
                          { id: 'حاضر', icon: CheckCircle, color: 'text-accent-green', bg: 'bg-accent-green/10', hoverBg: 'hover:bg-accent-green hover:text-white' },
                          { id: 'غائب', icon: XCircle, color: 'text-accent-red', bg: 'bg-accent-red/10', hoverBg: 'hover:bg-accent-red hover:text-white' },
                          { id: 'متأخر', icon: Clock, color: 'text-accent-yellow', bg: 'bg-accent-yellow/10', hoverBg: 'hover:bg-accent-yellow hover:text-white' }
                        ].map(btn => (
                          <button
                            key={btn.id}
                            onClick={() => handleStatusChange(s._id, btn.id)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                              (attendance[s._id] || (btn.id === 'حاضر' && !attendance[s._id] ? 'حاضر' : '')) === btn.id 
                              ? `bg-current ${btn.color} text-white border-transparent shadow-lg` 
                              : `bg-white/5 border-border ${btn.color} ${btn.hoverBg}`
                            }`}
                            style={{ 
                                backgroundColor: (attendance[s._id] || (btn.id === 'حاضر' && !attendance[s._id] ? 'حاضر' : '')) === btn.id ? 'currentColor' : '' 
                            }}
                          >
                             {/* Small hack for color logic since Tailwind doesn't support dynamic bg-[var] easily in strings without full class */}
                             <btn.icon size={18} className={(attendance[s._id] || (btn.id === 'حاضر' && !attendance[s._id] ? 'حاضر' : '')) === btn.id ? 'text-white' : ''} />
                          </button>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-8 py-24 text-center">
                    <div className="text-6xl mb-6 opacity-20">👥</div>
                    <p className="text-text-secondary font-black text-lg">لا يوجد طلاب مسجلين في هذه المادة حالياً</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendancePage;
