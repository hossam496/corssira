import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Sparkles, TrendingUp, Loader2, BookOpen, Layers } from 'lucide-react';
import SubjectCard from '../../components/SubjectCard';
import { SUBJECT_CATEGORIES } from '../../data/mockData';
import api from '../../api/axios';

const StudentSubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('الكل');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/subjects');
        setSubjects(data.data);
      } catch (error) {
        console.error('Failed to fetch subjects');
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) && 
    (category === 'الكل' || s.category === category)
  );

  return (
    <div className="page-container max-w-[1400px]">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mb-12 relative"
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent-blue/5 blur-[80px] rounded-full -z-10" />
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center">
            <Sparkles size={28} className="text-accent-blue" />
          </div>
          <h1 className="text-4xl font-black text-text-primary">المواد الدراسية</h1>
        </div>
        <p className="text-text-secondary max-w-2xl font-medium text-lg leading-relaxed">استكشف المواد الدراسية المتاحة وتابع المحتوى التعليمي مع نخبة من أفضل المدرسين في مجالاتهم.</p>
      </motion.div>

      {/* Filters Bar */}
      <div className="bg-bg-card/50 backdrop-blur-md border border-border p-6 rounded-[2.5rem] shadow-xl mb-12 flex flex-col xl:flex-row gap-8 items-center">
        <div className="relative flex-1 w-full">
          <Search size={22} className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="ابحث عن مادة محددة، مدرس، أو موضوع..." 
            className="input pr-14 bg-bg-secondary/40 border-border/50 h-16 rounded-[1.5rem] text-base font-medium placeholder:text-text-muted focus:bg-bg-secondary/60 transition-all" 
          />
        </div>
        
        <div className="flex flex-wrap gap-2.5 items-center justify-center">
          <span className="text-xs font-black text-text-muted uppercase tracking-[0.2em] ml-4 flex items-center gap-2">
            <Layers size={14} /> التخصص:
          </span>
          {['الكل', ...SUBJECT_CATEGORIES.filter(c => c !== 'الكل')].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-3 rounded-2xl text-xs font-black transition-all duration-300 border ${
                category === cat 
                ? 'bg-accent-blue text-white border-accent-blue shadow-lg shadow-accent-blue/20' 
                : 'bg-white/5 text-text-secondary border-border hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array(6).fill(null).map((_, i) => (
              <div key={i} className="h-80 bg-bg-card border border-border rounded-[2.5rem] animate-pulse" />
            ))
          ) : filteredSubjects.length > 0 ? (
            filteredSubjects.map(s => (
              <SubjectCard key={s._id} subject={s} teacher={s.teacher} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="col-span-full py-32 text-center bg-bg-card/50 rounded-[3rem] border border-dashed border-border"
            >
              <div className="text-9xl mb-8 opacity-10">📚</div>
              <h3 className="text-2xl font-black text-text-primary mb-2">لا توجد مواد متاحة حالياً</h3>
              <p className="text-text-secondary max-w-md mx-auto">جرب تغيير معايير البحث أو اختيار تخصص آخر لعرض النتائج المتاحة.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentSubjectsPage;
