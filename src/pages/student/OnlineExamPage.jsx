import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Send, ChevronRight, ChevronLeft, 
  CheckCircle2, ShieldCheck, List, 
  GraduationCap, Timer, Award, AlertCircle, Maximize2, 
  User, Activity, Fingerprint, X, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const OnlineExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [statusError, setStatusError] = useState(null); // { message, startTime }

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const { data } = await api.get(`/exams/${examId}`);
        setExam(data.data);
        setTimeLeft(data.data.duration * 60);
      } catch (err) {
        if (err.response?.status === 403) {
          setStatusError({
            message: err.response.data.message,
            startTime: err.response.data.startTime
          });
        } else {
          toast.error('خطأ في تحميل بيانات الامتحان');
          navigate(-1);
        }
      } finally {
        setLoading(false);
      }
    };
    if (examId) fetchExam();
  }, [examId, navigate]);

  // Timer Logic
  useEffect(() => {
    let timer;
    if (started && timeLeft > 0 && !submitting) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [started, timeLeft, submitting]);

  const handleAutoSubmit = () => {
    toast.error('انتهى الوقت! جاري تسليم الامتحان تلقائياً...');
    submitExam();
  };

  const handleStartExam = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      }
      setStarted(true);
      setIsFullscreen(true);
    } catch (err) {
      toast.error('يجب السماح بوضع ملء الشاشة لبدء الامتحان');
    }
  };

  const submitExam = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(err => console.log(err));
      }

      const formattedAnswers = Object.keys(answers).map(qId => ({
        questionId: qId,
        answer: answers[qId]
      }));

      await api.post(`/exams/${examId}/submit`, {
        answers: formattedAnswers,
        violationsCount: violations
      });

      toast.success('تم تسليم الامتحان بنجاح!');
      navigate('/student/exams');
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء تسليم الامتحان');
      if (error.response?.status === 400 || error.response?.status === 403) {
        navigate('/student/exams');
      } else {
        setSubmitting(false);
      }
    }
  }, [answers, examId, violations, navigate, submitting]);

  useEffect(() => {
    if (!started) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !submitting) {
        setViolations(v => v + 1);
        setShowWarning(true);
        setIsFullscreen(false);
      } else {
        setIsFullscreen(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !submitting) {
        setViolations(v => v + 1);
        setShowWarning(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [started, submitting]);

  useEffect(() => {
    if (violations >= 3 && started && !submitting) {
      setStarted(false);
      toast.error('تم إلغاء الامتحان بسبب تكرار مخالفة القواعد!');
      submitExam();
    }
  }, [violations, started, submitExam, submitting]);

  const returnToExam = async () => {
    setShowWarning(false);
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) await elem.requestFullscreen();
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10" style={{ backgroundImage: 'url("/noise.svg")' }} />
        <Loader2 className="animate-spin text-accent-blue mb-8" size={64} />
        <div className="text-accent-blue font-black tracking-[0.3em] animate-pulse uppercase">System Initializing...</div>
    </div>
  );

  if (statusError) {
    return (
      <div className="min-h-screen bg-bg-primary relative overflow-hidden flex flex-col items-center justify-center p-8 font-cairo">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10" style={{ backgroundImage: 'url("/noise.svg")' }} />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 text-center max-w-lg w-full shadow-2xl relative z-20"
        >
          <div className="w-20 h-20 bg-accent-blue/10 rounded-3xl flex items-center justify-center text-accent-blue mx-auto mb-8">
            <Timer size={40} />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">{statusError.message}</h2>
          {statusError.startTime && (
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 mb-8">
              <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">موعد بدء الامتحان</div>
              <div className="text-xl font-black text-accent-blue">
                {new Date(statusError.startTime).toLocaleString('ar-EG', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long', 
                  hour: 'numeric', 
                  minute: 'numeric' 
                })}
              </div>
            </div>
          )}
          <button 
            onClick={() => navigate('/student/exams')}
            className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl border border-white/10 transition-all"
          >
            العودة للامتحانات
          </button>
        </motion.div>
      </div>
    );
  }

  if (!exam) return null;

  const totalSeconds = exam.duration * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');

  // Start Screen
  if (!started) {
    return (
      <div className="min-h-screen bg-bg-primary relative overflow-hidden flex flex-col font-cairo">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10" style={{ backgroundImage: 'url("/noise.svg")' }} />
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-accent-blue/10 blur-[180px] rounded-full z-0" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-accent-purple/5 blur-[150px] rounded-full z-0" />

        <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            className="flex-1 flex items-center justify-center p-4 md:p-8 z-20 w-full"
        >
            <div className="bg-slate-900/40 backdrop-blur-[40px] border border-white/10 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl max-w-[1100px] w-full grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 md:gap-16">
                <div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="px-4 py-2 bg-accent-blue/10 border border-accent-blue/20 rounded-full text-accent-blue text-xs font-black uppercase tracking-widest">
                            {exam.subject?.name}
                        </div>
                        <div className="flex items-center gap-2 text-text-muted text-[10px] font-black uppercase tracking-widest">
                            <Activity size={16} className="text-accent-green" />
                            <span>نظام الاختبارات الآمن</span>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 md:mb-6">
                        {exam.title}
                    </h1>
                    <p className="text-text-secondary text-base md:text-lg leading-relaxed mb-8 md:mb-12 max-w-2xl">
                        أهلاً بك في بيئة الاختبار الاحترافية. يرجى التأكد من استقرار اتصال الإنترنت والالتزام بقواعد النظام الصارمة لضمان صحة نتائجك.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: <Timer/>, label: 'الزمن', val: `${exam.duration} دقيقة`, color: 'text-accent-blue' },
                            { icon: <Award/>, label: 'الدرجات', val: `${exam.totalMarks} درجة`, color: 'text-accent-yellow' },
                            { icon: <List/>, label: 'الأسئلة', val: `${exam.questions?.length}`, color: 'text-accent-purple' },
                            { icon: <User/>, label: 'المعلم', val: `${exam.teacher?.name || 'محمد علي'}`, color: 'text-accent-green' }
                        ].map((stat, i) => (
                            <div key={i} className="group hover:-translate-y-1 transition-transform">
                                <div className={`mb-3 ${stat.color}`}>{stat.icon}</div>
                                <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{stat.label}</div>
                                <div className="text-xl font-black text-white">{stat.val}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative group mt-8 lg:mt-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-accent-blue/20 to-transparent blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] md:rounded-[2.5rem]" />
                    <div className="relative bg-white/[0.03] border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 backdrop-blur-md text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-accent-blue/10 border border-accent-blue/20 rounded-3xl flex items-center justify-center text-accent-blue mb-8 shadow-xl shadow-accent-blue/10">
                            <ShieldCheck size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-4">جاهز للانطلاق؟</h3>
                        <p className="text-text-muted text-sm leading-relaxed mb-8">
                            بمجرد الضغط على البدء، سيتم تفعيل وضع ملء الشاشة وبدء المؤقت التنازلي فوراً.
                        </p>

                        <div className="w-full flex flex-col gap-4 mb-10">
                            <div className="flex items-center gap-3 text-xs font-black text-text-secondary bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                                <Maximize2 size={16} className="text-accent-blue" />
                                <span>تفعيل وضع ملء الشاشة تلقائياً</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-black text-text-secondary bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                                <AlertCircle size={16} className="text-accent-red" />
                                <span>نظام مكافحة الغش مفعل</span>
                            </div>
                        </div>

                        <button 
                          onClick={handleStartExam} 
                          className="w-full bg-accent-blue hover:bg-accent-blue-light text-white font-black py-5 rounded-2xl shadow-2xl shadow-accent-blue/30 transition-all hover:scale-[1.02] active:scale-95 text-lg"
                        >
                            دخول الاختبار الآمن
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
        
        <div className="absolute bottom-6 w-full flex justify-between px-12 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] z-10">
            <div className="flex items-center gap-2"><Fingerprint size={14}/> SECURE SESSION: {examId.slice(-8)}</div>
            <div className="flex items-center gap-2"><GraduationCap size={14}/> CORSSIRA PRO SYSTEM</div>
        </div>
      </div>
    );
  }

  // Main Interface
  const currentQ = exam.questions[currentQuestionIdx];

  return (
    <div className="min-h-screen bg-bg-primary relative overflow-hidden flex flex-col font-cairo text-right" dir="rtl">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10" style={{ backgroundImage: 'url("/noise.svg")' }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(59,130,246,0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* Warning Overlay */}
      <AnimatePresence>
        {showWarning && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }} 
              className="bg-slate-900 border border-accent-red/20 rounded-[3rem] p-12 max-w-xl w-full text-center shadow-3xl shadow-accent-red/10"
            >
              <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                <AlertTriangle className="text-accent-red z-10 animate-pulse" size={64} />
                <div className="absolute inset-0 bg-accent-red/20 blur-[30px] rounded-full" />
              </div>
              <h2 className="text-3xl font-black text-white mb-4">نظام الحماية مفعل!</h2>
              <p className="text-text-secondary text-lg leading-relaxed mb-10">
                يُمنع الخروج من نافذة الامتحان أو إغلاق وضع ملء الشاشة. تكرار المخالفة سيؤدي لإنهاء الامتحان فوراً وتسليم نتيجتك الحالية.
              </p>
              
              <div className="flex justify-center gap-3 mb-10">
                  {[1, 2, 3].map(num => (
                      <div 
                        key={num} 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black transition-all ${
                          violations >= num ? 'bg-accent-red text-white shadow-lg shadow-accent-red/30 scale-110' : 'bg-white/5 text-white/20 border border-white/5'
                        }`}
                      >
                          {num}
                      </div>
                  ))}
              </div>

              <button 
                onClick={returnToExam} 
                className="w-full bg-accent-red hover:bg-accent-red-light text-white font-black py-5 rounded-2xl shadow-xl shadow-accent-red/20 transition-all text-lg"
              >
                العودة وإصلاح الوضع الآن
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exam Header */}
      <div className="h-20 md:h-24 border-b border-white/5 bg-slate-900/40 backdrop-blur-[30px] flex items-center justify-between px-4 md:px-12 relative z-50">
        <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden md:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center text-accent-blue shadow-inner">
                <ShieldCheck size={28} />
            </div>
            <div>
                <div className="text-lg md:text-xl font-black text-white line-clamp-1">{exam.title}</div>
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-accent-green shadow-[0_0_10px_var(--accent-green)] animate-pulse" />
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hidden md:inline">Live Secure Mode</span>
                </div>
            </div>
        </div>

        {/* Mobile Timer */}
        <div className="xl:hidden flex items-center gap-2 text-xl font-black text-white bg-white/5 px-4 py-2 rounded-xl border border-white/10">
           <Timer size={18} className={timeLeft < 300 ? 'text-accent-red animate-pulse' : 'text-accent-blue'} />
           <span className={timeLeft < 300 ? 'text-accent-red animate-pulse' : ''}>{m}:{s}</span>
        </div>

        <div className="hidden lg:flex flex-1 max-w-md mx-12 flex-col gap-2">
            <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest">
                <span>إجمالي التقدم</span>
                <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="h-full bg-gradient-to-l from-accent-blue to-accent-purple rounded-full"
                />
            </div>
        </div>

        <button 
          onClick={() => { if (window.confirm('هل تريد تسليم الامتحان نهائياً؟')) submitExam(); }} 
          className="bg-accent-green/10 hover:bg-accent-green border border-accent-green/20 text-accent-green hover:text-white px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-black transition-all flex items-center gap-2 md:gap-3 shadow-xl hover:shadow-accent-green/20 text-xs md:text-sm"
        >
            <Send size={16} className="rotate-180 md:w-[18px] md:h-[18px]" /> <span className="hidden md:inline">تسليم الامتحان</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 flex flex-col items-center">
            <motion.div 
                key={currentQuestionIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-[900px] w-full flex flex-col flex-1"
            >
                <div className="flex items-center justify-between mb-8 md:mb-10">
                    <div className="flex items-center gap-3 md:gap-4">
                        <span className="text-4xl md:text-6xl font-black text-white/10 italic leading-none">{(currentQuestionIdx + 1).toString().padStart(2, '0')}</span>
                        <div className="w-[1px] h-6 md:h-8 bg-white/10" />
                        <div className="px-3 md:px-4 py-1 md:py-1.5 bg-accent-blue/10 border border-accent-blue/20 rounded-lg text-accent-blue text-[10px] font-black uppercase tracking-widest">{currentQ.type}</div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/10 shadow-xl">
                        <Award className="text-accent-yellow" size={20} />
                        <span className="text-lg font-black text-white">{currentQ.marks} <span className="text-xs text-text-muted font-bold">درجة</span></span>
                    </div>
                </div>

                <div className="bg-slate-900/30 backdrop-blur-[30px] border border-white/10 rounded-[2rem] md:rounded-[3rem] p-6 md:p-16 shadow-2xl mb-8">
                    <h2 className="text-xl md:text-3xl font-black text-white leading-relaxed mb-8 md:mb-12">
                        {currentQ.question}
                    </h2>

                    <div className="flex flex-col gap-5">
                        {currentQ.type === 'اختيار من متعدد' && currentQ.options.map((opt, i) => (
                            <label 
                              key={i} 
                              className={`flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 group ${
                                answers[currentQ._id] === opt 
                                ? 'bg-accent-blue/10 border-accent-blue shadow-[0_0_40px_rgba(59,130,246,0.15)]' 
                                : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                              }`}
                            >
                                <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                  answers[currentQ._id] === opt ? 'border-accent-blue bg-accent-blue scale-110 shadow-lg shadow-accent-blue/40' : 'border-white/10'
                                }`}>
                                    {answers[currentQ._id] === opt && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                </div>
                                <input 
                                    type="radio" 
                                    name={currentQ._id} 
                                    value={opt} 
                                    checked={answers[currentQ._id] === opt}
                                    onChange={(e) => setAnswers({ ...answers, [currentQ._id]: e.target.value })}
                                    className="hidden"
                                />
                                <span className={`text-base md:text-xl font-bold transition-colors ${answers[currentQ._id] === opt ? 'text-white' : 'text-text-secondary'}`}>{opt}</span>
                            </label>
                        ))}

                        {currentQ.type === 'صح وخطأ' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                                {['صح', 'خطأ'].map(opt => (
                                    <label 
                                      key={opt} 
                                      className={`flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 p-6 md:p-16 rounded-2xl md:rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 ${
                                        answers[currentQ._id] === opt 
                                        ? 'bg-accent-blue/10 border-accent-blue shadow-[0_0_40px_rgba(59,130,246,0.15)]' 
                                        : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                                      }`}
                                    >
                                        <input 
                                            type="radio" 
                                            name={currentQ._id} 
                                            value={opt} 
                                            checked={answers[currentQ._id] === opt}
                                            onChange={(e) => setAnswers({ ...answers, [currentQ._id]: e.target.value })}
                                            className="hidden"
                                        />
                                        <div className={`w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-[1.5rem] border-2 flex items-center justify-center transition-all duration-500 shrink-0 ${
                                          answers[currentQ._id] === opt ? 'bg-accent-blue border-accent-blue text-white rotate-[360deg] shadow-3xl shadow-accent-blue/40' : 'border-white/10'
                                        }`}>
                                            {answers[currentQ._id] === opt ? <CheckCircle2 className="w-6 h-6 md:w-10 md:h-10" /> : <div className="text-xl md:text-3xl font-black">{opt[0]}</div>}
                                        </div>
                                        <span className={`text-2xl md:text-4xl font-black transition-colors ${answers[currentQ._id] === opt ? 'text-white' : 'text-text-muted'}`}>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {currentQ.type === 'سؤال مقالي' && (
                            <div className="relative">
                                <textarea
                                    value={answers[currentQ._id] || ''}
                                    onChange={(e) => setAnswers({ ...answers, [currentQ._id]: e.target.value })}
                                    className="w-full min-h-[200px] md:min-h-[400px] bg-white/[0.03] border-2 border-white/5 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 text-base md:text-xl leading-relaxed text-white focus:outline-none focus:bg-white/[0.06] focus:border-accent-blue/30 transition-all placeholder:text-white/10 font-medium"
                                    placeholder="ابدأ في كتابة إجابتك هنا بالتفصيل..."
                                />
                                <div className="absolute bottom-8 left-8 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-text-muted uppercase tracking-widest">
                                    {(answers[currentQ._id] || '').length} CHARACTERS
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between mt-auto px-2 md:px-4">
                    <button 
                        onClick={() => setCurrentQuestionIdx(i => Math.max(0, i - 1))}
                        disabled={currentQuestionIdx === 0}
                        className="flex items-center gap-2 md:gap-4 text-text-muted hover:text-white font-black text-sm md:text-xl transition-all disabled:opacity-0 disabled:pointer-events-none group"
                    >
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:bg-white group-hover:text-black shrink-0">
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <span className="hidden md:inline">السابق</span>
                    </button>
                    
                    <button 
                        onClick={() => {
                            if (currentQuestionIdx === exam.questions.length - 1) {
                                if (window.confirm('هل تريد تسليم الامتحان؟')) submitExam();
                            } else {
                                setCurrentQuestionIdx(i => i + 1);
                            }
                        }}
                        className={`py-3 md:py-4 px-6 md:px-12 rounded-full font-black text-sm md:text-xl flex items-center gap-4 md:gap-6 transition-all shadow-2xl active:scale-95 group ${
                          currentQuestionIdx === exam.questions.length - 1 
                          ? 'bg-accent-green text-white shadow-accent-green/20 hover:bg-accent-blue hover:shadow-accent-blue/30' 
                          : 'bg-white text-slate-950 shadow-white/10 hover:scale-105'
                        }`}
                    >
                        {currentQuestionIdx === exam.questions.length - 1 ? 'إنهاء وتسليم' : 'السؤال التالي'}
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-all shrink-0 ${
                          currentQuestionIdx === exam.questions.length - 1 ? 'bg-white/20' : 'bg-black/10'
                        }`}>
                            {currentQuestionIdx === exam.questions.length - 1 ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />}
                        </div>
                    </button>
                </div>
            </motion.div>
        </div>

        {/* Sidebar */}
        <div className="w-[400px] shrink-0 border-r border-white/5 bg-slate-900/20 backdrop-blur-[30px] p-10 flex flex-col hidden xl:flex">
            {/* Timer */}
            <div className="flex flex-col items-center mb-12">
                <div className="relative w-[220px] h-[220px]">
                    <svg className="w-full h-full -rotate-90">
                        <circle cx="110" cy="110" r="100" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                        <motion.circle 
                            cx="110" cy="110" r="100" 
                            stroke="currentColor" strokeWidth="8" fill="transparent" 
                            strokeDasharray={628}
                            strokeDashoffset={628 - (628 * (timeLeft / (exam.duration * 60)))}
                            className={`transition-all duration-1000 ${timeLeft < 300 ? 'text-accent-red' : 'text-accent-blue'}`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={`text-5xl font-black tracking-tighter ${timeLeft < 300 ? 'text-accent-red animate-pulse' : 'text-white'}`}>
                            {m}:{s}
                        </div>
                        <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-1">Time Remaining</div>
                    </div>
                </div>
            </div>

            {/* Navigator */}
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black text-text-primary flex items-center gap-2 uppercase tracking-widest">
                        <List size={16} className="text-accent-blue" /> خريطة الاختبار
                    </h3>
                    <div className="text-[10px] font-black text-accent-blue bg-accent-blue/10 px-3 py-1 rounded-lg border border-accent-blue/20">{Object.keys(answers).length} / {exam.questions.length} مُجاب</div>
                </div>

                <div className="grid grid-cols-5 gap-3">
                    {exam.questions.map((q, idx) => {
                        const isAnswered = !!answers[q._id];
                        const isCurrent = currentQuestionIdx === idx;
                        return (
                            <button
                                key={q._id}
                                onClick={() => setCurrentQuestionIdx(idx)}
                                className={`h-12 rounded-xl text-sm font-black transition-all flex items-center justify-center border ${
                                  isCurrent 
                                  ? 'bg-accent-blue text-white border-accent-blue shadow-lg shadow-accent-blue/20 scale-110' 
                                  : isAnswered 
                                    ? 'bg-accent-green/10 text-accent-green border-accent-green/20' 
                                    : 'bg-white/5 text-text-muted border-white/5 hover:border-white/20'
                                }`}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer Status */}
            <div className="mt-auto space-y-6">
                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">System Integrity</span>
                        <span className="text-[10px] font-black text-accent-green flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-green shadow-[0_0_5px_var(--accent-green)]" /> ACTIVE
                        </span>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                            <Maximize2 size={14} className={isFullscreen ? "text-accent-green" : "text-accent-red"}/>
                            <span>Fullscreen Mode</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                            <ShieldCheck size={14} className="text-accent-blue"/>
                            <span>Anti-Cheat Monitor</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-indigo flex items-center justify-center text-white font-black">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div>
                           <div className="text-sm font-black text-white leading-none mb-1">{user?.name || 'طالب كورسيرا'}</div>
                           <div className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">ID: {user?._id?.slice(-6).toUpperCase() || 'ABCDEF'}</div>
                        </div>
                    </div>
                    <Activity size={20} className="text-accent-green opacity-20" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineExamPage;
