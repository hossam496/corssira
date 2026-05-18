import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, GraduationCap, Phone, Mail, User, BookOpen, Filter, MoreVertical, Hash, MapPin, Calendar, CheckCircle, ArrowLeftRight, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import StudentDetailsModal from '../../components/StudentDetailsModal';

const TeacherStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('الكل');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/students', { params: { search } });
      setStudents(data.data || []);
    } catch { toast.error('خطأ في تحميل الطلاب'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, [search]);

  const filteredStudents = students.filter(s => 
    selectedGrade === 'الكل' || s.grade === selectedGrade
  );

  const grades = ['الكل', ...new Set(students.map(s => s.grade))];

  return (
    <div className="page-container max-w-[1200px]">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mb-12 relative"
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent-blue/5 blur-[80px] rounded-full -z-10" />
        <h1 className="text-4xl font-black text-text-primary mb-3">طلابي</h1>
        <p className="text-text-secondary max-w-2xl text-lg">إدارة ومتابعة الطلاب المسجلين في موادك الدراسية، يمكنك التواصل معهم أو متابعة بياناتهم الأكاديمية.</p>
      </motion.div>

      {/* Search & Filter Bar */}
      <div className="bg-bg-card/50 backdrop-blur-md border border-border p-6 rounded-[2rem] shadow-xl mb-10 flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <Search size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="بحث باسم الطالب أو الرقم التعريفي..." 
            className="input pr-14 bg-bg-secondary/40 border-border/50 h-14 rounded-2xl text-sm" 
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center justify-center lg:justify-end">
          <span className="text-sm font-black text-text-secondary ml-3 flex items-center gap-2">
            <Filter size={16} /> تصفية حسب الصف:
          </span>
          {grades.map(g => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 border ${
                selectedGrade === g 
                ? 'bg-accent-blue text-white border-accent-blue shadow-lg shadow-accent-blue/20' 
                : 'bg-white/5 text-text-secondary border-border hover:border-white/20'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Student List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array(5).fill(null).map((_, i) => (
              <div key={i} className="h-32 bg-bg-card border border-border rounded-3xl animate-pulse" />
            ))
          ) : filteredStudents.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-24 text-center bg-bg-card/50 rounded-[2.5rem] border border-dashed border-border"
            >
              <div className="text-6xl mb-6 opacity-30">🔍</div>
              <h3 className="text-xl font-black text-text-primary">لا يوجد طلاب مطابقين للبحث</h3>
              <p className="text-text-secondary mt-2">جرب كتابة اسم مختلف أو التحقق من التصفية</p>
            </motion.div>
          ) : (
            filteredStudents.map((student, index) => (
              <motion.div 
                key={student._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-bg-card border border-border rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-accent-blue/50 transition-all group group shadow-lg"
              >
                <div className="flex items-center gap-6 flex-1">
                  <div className="relative shrink-0 cursor-pointer" onClick={() => { setSelectedStudentId(student._id); setIsModalOpen(true); }}>
                    <div className="w-20 h-20 rounded-full border-4 border-white/5 overflow-hidden group-hover:border-accent-blue/20 transition-all">
                      <img 
                        src={student.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.user?.name}`} 
                        alt={student.user?.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent-green rounded-full border-4 border-bg-card flex items-center justify-center text-white">
                      <CheckCircle size={12} fill="currentColor" className="text-accent-green" />
                    </div>
                  </div>
                  
                  <div className="text-right md:text-right cursor-pointer" onClick={() => { setSelectedStudentId(student._id); setIsModalOpen(true); }}>
                    <h3 className="text-xl font-black text-text-primary mb-2 group-hover:text-accent-blue transition-colors">
                      {student.user?.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                       <span className="flex items-center gap-1.5 text-xs font-bold text-text-secondary bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                         <Hash size={12} className="text-accent-blue" /> {student._id.slice(-6).toUpperCase()}
                       </span>
                       <span className="flex items-center gap-1.5 text-xs font-bold text-text-secondary bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                         <GraduationCap size={12} className="text-accent-green" /> {student.grade || 'غير محدد'}
                       </span>
                       <span className="flex items-center gap-1.5 text-xs font-bold text-text-secondary bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                         <Phone size={12} className="text-accent-purple" /> {student.user?.phone || 'بدون هاتف'}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                   <button className="flex-1 md:flex-none h-12 px-6 rounded-2xl bg-accent-blue/10 text-accent-blue font-black text-sm border border-accent-blue/20 hover:bg-accent-blue hover:text-white transition-all flex items-center justify-center gap-2">
                      <MessageCircle size={18} /> تواصل الآن
                   </button>
                   <button className="h-12 w-12 rounded-2xl bg-white/5 border border-border flex items-center justify-center text-text-muted hover:text-accent-blue hover:bg-accent-blue/5 transition-all">
                      <MoreVertical size={20} />
                   </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <StudentDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        studentId={selectedStudentId} 
      />
    </div>
  );
};

export default TeacherStudentsPage;
