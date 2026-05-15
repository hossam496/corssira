import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, X, MessageSquare } from 'lucide-react';

const SUGGESTIONS = [
  'كيف أحسن درجاتي في الرياضيات؟',
  'ما هي أفضل طرق المذاكرة؟',
  'لخص لي مادة الفيزياء',
  'أنشئ لي خطة مذاكرة أسبوعية',
  'كيف أتغلب على القلق من الامتحانات؟',
];

const BOT_RESPONSES = {
  default: [
    'يمكنني مساعدتك في تنظيم وقتك الدراسي وفهم المواد. ما الذي تريد معرفته؟',
    'سؤال رائع! بناءً على أداء الطلاب المتميزين، أنصحك بتخصيص 45 دقيقة للمذاكرة ثم 15 دقيقة راحة.',
    'بالطبع! يمكنني مساعدتك. للتحسن الدراسي، ابدأ بتحديد نقاط ضعفك أولاً.',
    'هذا موضوع مهم جداً! دعني أوضح لك الخطوات المناسبة خطوة بخطوة.',
  ],
  'رياضيات': 'لتحسين درجاتك في الرياضيات: 1️⃣ حل 10 مسائل يومياً 2️⃣ راجع الأساسيات أولاً 3️⃣ استخدم تقنية الفهم لا الحفظ 4️⃣ اطرح الأسئلة على مدرسك فوراً عند الشك',
  'مذاكرة': 'أفضل تقنيات المذاكرة: ⏱️ تقنية البومودورو (25 دق مذاكرة + 5 راحة) 📝 اكتب ملخصاً بيدك 🔄 راجع المادة بعد 24 ساعة و7 أيام و30 يوماً',
  'فيزياء': 'ملخص الفيزياء الأساسي: ⚡ قوانين نيوتن للحركة 🔋 الطاقة الكهربائية والمغناطيسية 🌊 الموجات والصوت. أي وحدة تريد التفصيل فيها؟',
  'قلق': 'للتغلب على قلق الامتحانات: 🧘 تنفس بعمق قبل البدء 😴 نم 8 ساعات قبل الامتحان 🍎 تناول وجبة خفيفة صحية 💪 ذكّر نفسك باستعدادك الجيد',
  'خطة': `خطة مذاكرة أسبوعية مقترحة:\n\n📅 الأحد: رياضيات (2 ساعة)\n📅 الاثنين: علوم (2 ساعة)\n📅 الثلاثاء: عربي + إنجليزي (1.5 ساعة)\n📅 الأربعاء: مراجعة عامة (2 ساعة)\n📅 الخميس: حل اختبارات قديمة (2 ساعة)\n📅 الجمعة: راحة واسترخاء 😊\n📅 السبت: مراجعة سريعة`,
};

const getResponse = (msg) => {
  const lower = msg.toLowerCase();
  if (lower.includes('رياض')) return BOT_RESPONSES['رياضيات'];
  if (lower.includes('مذاكرة') || lower.includes('دراسة') || lower.includes('مذاكر')) return BOT_RESPONSES['مذاكرة'];
  if (lower.includes('فيزياء')) return BOT_RESPONSES['فيزياء'];
  if (lower.includes('قلق') || lower.includes('خوف') || lower.includes('امتحان')) return BOT_RESPONSES['قلق'];
  if (lower.includes('خطة') || lower.includes('أسبوع')) return BOT_RESPONSES['خطة'];
  return BOT_RESPONSES.default[Math.floor(Math.random() * BOT_RESPONSES.default.length)];
};

const AIChatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', text: 'مرحباً! أنا مساعدك الذكي في كورسيرا 🤖\nيمكنني مساعدتك في المذاكرة، شرح المواد، وتحليل أدائك. كيف يمكنني مساعدتك؟', ts: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', text: text.trim(), ts: new Date() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setTyping(true);
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const botResponse = getResponse(text);
    setTyping(false);
    setMessages(m => [...m, { id: Date.now() + 1, role: 'bot', text: botResponse, ts: new Date() }]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      style={{
        position: 'fixed', bottom: 90, left: 24, width: 380, height: 520,
        background: '#0a1628', border: '1px solid rgba(59,130,246,0.25)',
        borderRadius: 20, boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', zIndex: 500, overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px 18px', background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.1))', borderBottom: '1px solid rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={20} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, color: '#f0f4ff', fontFamily: 'Cairo, sans-serif', fontSize: 14 }}>المساعد الذكي</div>
          <div style={{ fontSize: 11, color: '#10b981', fontFamily: 'Cairo, sans-serif' }}>● متصل الآن</div>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#f87171' }}>
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map(msg => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: msg.role === 'bot' ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {msg.role === 'bot' ? <Bot size={14} color="white" /> : <User size={14} color="white" />}
            </div>
            <div style={{
              maxWidth: '75%', padding: '10px 14px', borderRadius: msg.role === 'bot' ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
              background: msg.role === 'bot' ? 'rgba(59,130,246,0.08)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
              border: msg.role === 'bot' ? '1px solid rgba(59,130,246,0.15)' : 'none',
              color: '#f0f4ff', fontSize: 13, fontFamily: 'Cairo, sans-serif', lineHeight: 1.6, whiteSpace: 'pre-line',
            }}>
              {msg.text}
            </div>
          </motion.div>
        ))}

        {typing && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={14} color="white" />
            </div>
            <div style={{ padding: '10px 16px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div style={{ padding: '6px 12px', display: 'flex', gap: 6, overflowX: 'auto', borderTop: '1px solid rgba(59,130,246,0.08)' }}>
        {SUGGESTIONS.slice(0, 3).map(s => (
          <button key={s} onClick={() => sendMessage(s)}
            style={{ padding: '5px 10px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 20, color: '#60a5fa', fontSize: 11, fontFamily: 'Cairo, sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.08)'}
          >{s}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(59,130,246,0.1)', display: 'flex', gap: 8 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="اكتب رسالتك..."
          style={{ flex: 1, padding: '9px 14px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 10, color: '#f0f4ff', fontFamily: 'Cairo, sans-serif', fontSize: 13, outline: 'none' }}
        />
        <motion.button onClick={() => sendMessage(input)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <Send size={16} color="white" />
        </motion.button>
      </div>
    </motion.div>
  );
};

const ChatbotButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AnimatePresence>{open && <AIChatbot onClose={() => setOpen(false)} />}</AnimatePresence>
      <motion.button
        onClick={() => setOpen(p => !p)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ boxShadow: open ? '0 0 0 rgba(59,130,246,0)' : ['0 0 20px rgba(59,130,246,0.4)', '0 0 40px rgba(59,130,246,0.6)', '0 0 20px rgba(59,130,246,0.4)'] }}
        transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
        style={{
          position: 'fixed', bottom: 28, left: 24,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 499,
          boxShadow: '0 8px 25px rgba(59,130,246,0.4)',
        }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={22} color="white" /></motion.div>
            : <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><Sparkles size={22} color="white" /></motion.div>
          }
        </AnimatePresence>
      </motion.button>
    </>
  );
};

export default ChatbotButton;
