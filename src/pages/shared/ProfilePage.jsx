import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Mail, Phone, MapPin, Camera, Save, 
  Plus, Search, Filter, BookOpen, Trash2, 
  ChevronRight, Award, TrendingUp, Clock 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SUBJECT_CATEGORIES } from '../../data/mockData';
import SubjectCard from '../../components/SubjectCard';
import SubjectModal from '../../components/SubjectModal';
import EnrollmentCard from '../../components/EnrollmentCard';
import EnrolledSubjectCard from '../../components/EnrolledSubjectCard';
import api from '../../api/axios';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal'); 
  const [profile, setProfile] = useState(null);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('الكل');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const profileImageRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        console.log("Fetching profile for user:", user._id, "role:", user.role);
        
        let profileData = null;
        let subjects = [];
        let enrollments = [];

        if (user.role === 'teacher') {
          const p = await api.get('/teachers/me');
          profileData = p.data.data;
          setAssignedSubjects(profileData.subjects || []);
        } else {
          const [p, e, s] = await Promise.all([
            api.get('/students/me'),
            api.get(`/enrollments/student/${user._id}`),
            api.get('/subjects')
          ]);
          profileData = p.data.data;
          enrollments = e.data.data || [];
          subjects = s.data.data || [];
          
          // Unique-ify enrolled subjects by ID
          const uniqueEnrolled = [];
          const seenIds = new Set();
          enrollments.forEach(item => {
            if (item.subject && !seenIds.has(item.subject._id)) {
              uniqueEnrolled.push(item.subject);
              seenIds.add(item.subject._id);
            }
          });
          
          setEnrolledSubjects(uniqueEnrolled);
          setAvailableSubjects(subjects);
        }

        if (profileData) {
          setProfile({
            ...profileData,
            name: profileData.user?.name || '',
            email: profileData.user?.email || '',
            phone: profileData.user?.phone || '',
            avatar: profileData.user?.avatar || '',
            specialization: profileData.specialization || profileData.grade || '',
            bio: profileData.bio || profileData.notes || '',
          });
        }
      } catch (error) {
        console.error("Profile Fetch Error:", error);
        toast.error('خطأ في جلب بيانات الحساب');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleEnroll = async (sub) => {
    if (enrolledSubjects.some(es => es._id === sub._id)) {
      return toast.error('أنت مسجل بالفعل في هذه المادة');
    }
    try {
      const { data } = await api.post('/enrollments', { subjectId: sub._id });
      setEnrolledSubjects(prev => [...prev, sub]);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل التسجيل');
    }
  };

  const handleUnenroll = async (id) => {
    setEnrolledSubjects(prev => prev.filter(s => s._id !== id));
    toast.success('تم إلغاء التسجيل');
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/${user.role}s/me`, profile);
      // Update global auth state so navbar/sidebar reflect changes
      if (data.data?.user) {
        updateUser(data.data.user);
      } else if (data.data) {
        // Fallback: if backend returns updated role object but not user nested
        updateUser({ ...user, ...data.data.user }); 
      }
      toast.success('تم تحديث الملف الشخصي بنجاح ✅');
    } catch (error) {
      toast.error('فشل التحديث');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('حجم الصورة كبير جداً (أقصى حد 2MB)');
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile({ ...profile, avatar: reader.result });
      toast.success('تم التقاط الصورة! اضغط "حفظ التغييرات" لتأكيد الرفع 📸', { duration: 4000 });
    };
    reader.readAsDataURL(file);
  };

  const handleAddSubject = async (formData) => {
    try {
      const newSub = {
        name: formData.get('name'),
        category: formData.get('category'),
        lecturesCount: parseInt(formData.get('lecturesCount')),
        description: formData.get('description'),
        icon: formData.get('icon'),
        color: formData.get('color'),
      };
      
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject._id}`, newSub);
        toast.success('تم تحديث المادة بنجاح');
      } else {
        await api.post('/subjects', newSub);
        toast.success('تم إضافة المادة');
      }
      setIsModalOpen(false);
      const { data } = await api.get('/teachers/me');
      setAssignedSubjects(data.data.subjects || []);
    } catch (error) {
      toast.error('فشل في حفظ المادة');
    }
  };

  const handleDeleteSubject = async (id) => {
    try {
      await api.delete(`/subjects/${id}`);
      setAssignedSubjects(prev => prev.filter(s => s._id !== id));
      toast.success('تم إزالة المادة بنجاح');
    } catch (error) {
      toast.error('فشل في الحذف');
    }
  };

  const filteredAvailable = availableSubjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) && 
    (category === 'الكل' || s.category === category)
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  const tabs = user?.role === 'teacher' ? [
    { id: 'personal', label: 'المعلومات الشخصية', icon: User },
    { id: 'subjects', label: 'المواد الدراسية الخاصة بي', icon: BookOpen },
  ] : [
    { id: 'personal', label: 'المعلومات الشخصية', icon: User },
    { id: 'enrolled', label: 'المواد المسجلة', icon: BookOpen },
    { id: 'enrollment', label: 'تسجيل مواد جديدة', icon: Plus },
  ];

  const roleColors = { admin: 'text-accent-blue', teacher: 'text-accent-green', student: 'text-accent-purple' };

  if (loading) return <div className="flex items-center justify-center h-screen text-text-primary">جاري التحميل...</div>;

  return (
    <div className="page-container max-w-[1200px]">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="page-title text-3xl font-black">إعدادات الملف الشخصي</h1>
        <p className="page-subtitle">إدارة معلوماتك الشخصية والمواد الدراسية الخاصة بك</p>
      </motion.div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-8 items-start">
        {/* Sidebar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:sticky lg:top-[100px]">
          <div className="bg-bg-card border border-border rounded-3xl p-6 overflow-hidden shadow-lg">
            <div className="text-center mb-6">
              <div className="relative w-24 h-24 mx-auto mb-4 group">
                <img 
                  src={profile?.avatar || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} 
                  alt="" 
                  className="w-full h-full rounded-full border-4 border-accent-blue/20 object-cover" 
                />
                <input type="file" ref={profileImageRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                <button 
                  onClick={() => profileImageRef.current.click()} 
                  className="absolute bottom-0 left-0 w-8 h-8 rounded-full bg-accent-blue border-2 border-bg-card flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform"
                >
                  <Camera size={14} />
                </button>
              </div>
              <h2 className="text-lg font-black text-text-primary mb-1">{profile?.name}</h2>
              <p className={`text-xs font-bold ${roleColors[user?.role]}`}>{profile?.specialization || user?.role}</p>
            </div>

            <div className="flex flex-col gap-2">
              {tabs.map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-right ${
                    activeTab === tab.id 
                    ? 'bg-accent-blue/10 text-accent-blue font-bold shadow-sm' 
                    : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                  }`}
                >
                  <tab.icon size={18} /> 
                  <span className="flex-1">{tab.label}</span>
                  {activeTab === tab.id && <motion.div layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-accent-blue" />}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Summary */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.3 }} 
            className="mt-6 bg-gradient-to-br from-accent-blue/10 to-accent-indigo/5 border border-accent-blue/10 rounded-3xl p-5 shadow-inner"
          >
            <div className="flex items-center gap-2 mb-4 text-text-primary font-bold text-sm">
              <TrendingUp size={18} className="text-accent-blue" /> 
              <span>{user?.role === 'teacher' ? 'إحصائيات التدريس' : 'إحصائيات التعلم'}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-xl font-black text-accent-blue">{user?.role === 'teacher' ? assignedSubjects.length : enrolledSubjects.length}</div>
                <div className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-wider">{user?.role === 'teacher' ? 'مواد مسجلة' : 'مواد منضمة'}</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-xl font-black text-accent-green">{user?.role === 'teacher' ? assignedSubjects.reduce((acc, s) => acc + (s.lecturesCount || 0), 0) : enrolledSubjects.reduce((acc, s) => acc + (s.lecturesCount || 0), 0)}</div>
                <div className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-wider">المحاضرات</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Content Area */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="min-h-[600px]">
          <AnimatePresence mode="wait">
            {activeTab === 'personal' && (
              <motion.div 
                key="personal" 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="bg-bg-card border border-border rounded-3xl p-8 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
                  <User className="text-accent-blue" size={24} />
                  <span className="text-xl font-black text-text-primary">المعلومات الشخصية</span>
                </div>
                <form onSubmit={handleProfileSave}>
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-text-secondary mr-1">الاسم الكامل</label>
                      <input value={profile?.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} className="input bg-bg-secondary" placeholder="ادخل اسمك الكامل..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-text-secondary mr-1">البريد الإلكتروني</label>
                      <input value={profile?.email || ''} onChange={e => setProfile({...profile, email: e.target.value})} className="input bg-bg-secondary opacity-60" disabled />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-text-secondary mr-1">رقم الهاتف</label>
                      <input value={profile?.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} className="input bg-bg-secondary" placeholder="01xxxxxxxxx" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-text-secondary mr-1">التخصص / الصف</label>
                      <input value={profile?.specialization || ''} onChange={e => setProfile({...profile, specialization: e.target.value})} className="input bg-bg-secondary" placeholder="أدخل تخصصك أو صفك الدراسي..." />
                    </div>
                  </div>
                  <div className="space-y-2 mb-8">
                    <label className="text-sm font-bold text-text-secondary mr-1">نبذة مهنية / اهتمامات</label>
                    <textarea value={profile?.bio || ''} onChange={e => setProfile({...profile, bio: e.target.value})} className="input bg-bg-secondary h-32 resize-none py-3" placeholder="تحدث عن نفسك قليلاً..." />
                  </div>
                  <button type="submit" className="btn btn-primary px-8 py-4 rounded-2xl shadow-blue">
                    <Save size={18} /> حفظ التغييرات
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'subjects' && user?.role === 'teacher' && (
              <motion.div key="teacher-subjects" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-bg-card border border-border rounded-2xl p-4 mb-6 flex gap-4 items-center flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input 
                      value={search} 
                      onChange={e => setSearch(e.target.value)} 
                      placeholder="بحث في موادك..." 
                      className="input pr-12 bg-bg-secondary border-none" 
                    />
                  </div>
                  <button 
                    onClick={() => { setEditingSubject(null); setIsModalOpen(true); }} 
                    className="btn btn-primary px-6 h-12 rounded-xl"
                  >
                    <Plus size={18} /> إضافة مادة
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                  {assignedSubjects.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(s => (
                    <SubjectCard 
                      key={s._id} 
                      subject={s} 
                      isTeacherView={true} 
                      onDelete={handleDeleteSubject} 
                      onEdit={(sub) => { setEditingSubject(sub); setIsModalOpen(true); }} 
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'enrolled' && user?.role === 'student' && (
              <motion.div key="enrolled-subjects" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {enrolledSubjects.length > 0 ? (
                      enrolledSubjects.map(s => <EnrolledSubjectCard key={s._id} subject={s} onUnenroll={handleUnenroll} />)
                    ) : (
                      <div className="col-span-full text-center py-24 bg-bg-card rounded-3xl border border-dashed border-border">
                        <div className="text-7xl mb-4 opacity-50">🎓</div>
                        <h3 className="text-2xl font-black text-text-primary">لم تسجل في أي مادة بعد</h3>
                        <p className="text-text-secondary mt-2">توجه إلى تبويب "تسجيل مواد جديدة" للبدء</p>
                      </div>
                    )}
                 </div>
              </motion.div>
            )}

            {activeTab === 'enrollment' && user?.role === 'student' && (
              <motion.div key="enrollment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-bg-card border border-border rounded-2xl p-4 mb-8 flex gap-4 items-center flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input 
                      value={search} 
                      onChange={e => setSearch(e.target.value)} 
                      placeholder="ابحث عن مادة لتسجيلها..." 
                      className="input pr-12 bg-bg-secondary border-none" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAvailable.map(s => (
                    <EnrollmentCard 
                      key={s._id} 
                      subject={s} 
                      onEnroll={handleEnroll} 
                      isEnrolled={enrolledSubjects.some(es => es._id === s._id)} 
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <SubjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddSubject} 
        subject={editingSubject} 
        isEdit={!!editingSubject} 
      />
    </div>
  );
};

export default ProfilePage;
