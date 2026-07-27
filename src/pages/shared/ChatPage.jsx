import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, Image as ImageIcon, Search, ArrowRight, 
  Check, CheckCheck, Loader2, Users, Bell, BellOff, X, Eye, 
  Sparkles, RefreshCw, Paperclip
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToWebPush } from '../../services/pushService';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const formatTime12h = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'م' : 'ص';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
};

const ChatPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' | 'groups'
  const [conversations, setConversations] = useState({ direct: [], groups: [] });
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [showMobileList, setShowMobileList] = useState(true);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-subscribe to Web Push for background/locked phone notifications
  useEffect(() => {
    const initPush = async () => {
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          setPushEnabled(true);
          await subscribeToWebPush();
        }
      } catch (e) {}
    };
    initPush();
  }, []);

  const enablePushNotifications = async () => {
    try {
      const res = await Notification.requestPermission();
      if (res === 'granted') {
        await subscribeToWebPush();
        setPushEnabled(true);
        toast.success('تم تفعيل إشعارات الهاتف والشات بنجاح 🔔');
      } else {
        toast.error('تم رفض إذن التنبيهات من متصفحك');
      }
    } catch (e) {
      toast.error('تعذر تفعيل التنبيهات');
    }
  };

  // Fetch Conversations Overview
  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await api.get('/chat/conversations');
      setConversations(data.data || { direct: [], groups: [] });
    } catch (err) {
      console.error('Fetch conversations error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch Messages for active selected contact
  const fetchMessages = useCallback(async (isSilent = false) => {
    if (!selectedContact) return;
    try {
      const isGroup = selectedContact.type === 'group';
      const { data } = await api.get('/chat/messages', {
        params: { targetId: selectedContact._id, isGroup }
      });
      setMessages(data.data || []);
      if (!isSilent) {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    }
  }, [selectedContact]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages();
      // Short-poll every 3 seconds for real-time messages
      const interval = setInterval(() => fetchMessages(true), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedContact, fetchMessages]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast.error('حجم الصورة كبير جداً (الأقصى 10MB)');
    
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !imagePreview) || sending || !selectedContact) return;

    setSending(true);
    let uploadedUrl = '';

    // Convert image preview or upload to Cloudinary if needed
    if (imagePreview) {
      uploadedUrl = imagePreview;
    }

    try {
      const isGroup = selectedContact.type === 'group';
      const payload = {
        receiverId: !isGroup ? selectedContact._id : undefined,
        groupId: isGroup ? selectedContact._id : undefined,
        content: text.trim(),
        fileUrl: uploadedUrl,
        fileType: uploadedUrl ? 'image' : 'text'
      };

      const { data } = await api.post('/chat/messages', payload);
      setMessages(prev => [...prev, data.data]);
      setText('');
      setImageFile(null);
      setImagePreview('');
      fetchConversations();
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  const currentList = activeTab === 'direct' ? conversations.direct : conversations.groups;
  const filteredList = currentList.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-accent-blue" size={48} />
    </div>
  );

  return (
    <div className="page-container chat-page-container max-w-[1400px] h-[calc(100vh-100px)] p-2 sm:p-4 flex flex-col min-h-0 flex-1 dir-rtl" dir="rtl">
      
      {/* Push Notification Bar */}
      {!pushEnabled && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-gradient-to-r from-accent-blue/15 via-accent-indigo/10 to-transparent border border-accent-blue/30 p-3 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-black text-text-primary shrink-0"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-blue/20 flex items-center justify-center text-accent-blue shrink-0">
              <Bell size={20} />
            </div>
            <div>
              <span>فعّل التنبيهات لتصلك الرسائل فوراً حتى لو كان الموبايل مغلقاً! 🔔</span>
            </div>
          </div>
          <button 
            onClick={enablePushNotifications}
            className="btn btn-primary px-4 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-2"
          >
            <Sparkles size={14} /> تفعيل الإشعارات
          </button>
        </motion.div>
      )}

      {/* Main Chat Container */}
      <div className="flex-1 min-h-0 bg-bg-card border border-border/80 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full">
        
        {/* Sidebar: Conversations List */}
        <div className={`w-full md:w-80 lg:w-96 min-h-0 border-b md:border-b-0 md:border-l border-border/60 flex flex-col bg-bg-secondary/30 ${
          selectedContact && !showMobileList ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Header & Tabs */}
          <div className="p-4 sm:p-5 border-b border-border/60 space-y-4 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-text-primary flex items-center gap-2">
                <MessageSquare className="text-accent-blue" size={24} />
                المحادثات
              </h2>
              <button 
                onClick={() => fetchConversations()} 
                title="تحديث المحادثات"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white flex items-center justify-center transition-all"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="ابحث عن شخص أو مجموعة..."
                className="w-full bg-bg-secondary border border-border/60 rounded-xl py-2.5 pr-10 pl-3 text-xs text-text-primary focus:border-accent-blue focus:outline-none transition-all"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setActiveTab('direct')}
                className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'direct'
                    ? 'bg-accent-blue text-white shadow-md'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                <span>مباشر</span>
                {conversations.direct.reduce((acc, c) => acc + (c.unreadCount || 0), 0) > 0 && (
                  <span className="w-5 h-5 rounded-full bg-accent-red text-white text-[10px] flex items-center justify-center font-black">
                    {conversations.direct.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'groups'
                    ? 'bg-accent-blue text-white shadow-md'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                <Users size={14} />
                <span>المجموعات ({conversations.groups.length})</span>
              </button>
            </div>
          </div>

          {/* List Items */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 custom-scrollbar touch-scroll">
            {filteredList.length === 0 ? (
              <div className="py-12 text-center text-text-muted space-y-2">
                <MessageSquare size={32} className="mx-auto opacity-30" />
                <p className="text-xs font-bold">لا توجد محادثات متاحة حالياً</p>
              </div>
            ) : (
              filteredList.map((item) => {
                const isSelected = selectedContact?._id === item._id;
                const initial = item.name ? item.name.trim()[0] : '؟';
                return (
                  <motion.div
                    key={item._id}
                    whileHover={{ x: -2 }}
                    onClick={() => {
                      setSelectedContact(item);
                      setShowMobileList(false);
                    }}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 border ${
                      isSelected
                        ? 'bg-accent-blue/15 border-accent-blue/40 shadow-lg'
                        : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {item.type === 'group' ? (
                          <div className="w-11 h-11 rounded-2xl bg-accent-indigo/20 border border-accent-indigo/30 flex items-center justify-center text-accent-indigo text-lg font-black">
                            👥
                          </div>
                        ) : item.avatar ? (
                          <img src={item.avatar} alt="" className="w-11 h-11 rounded-2xl object-cover border border-accent-blue/30" />
                        ) : (
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent-blue/30 to-accent-indigo/30 border border-accent-blue/30 flex items-center justify-center text-base font-black text-white">
                            {initial}
                          </div>
                        )}
                        {item.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-red text-white text-[10px] font-black flex items-center justify-center border-2 border-bg-card shadow-sm animate-bounce">
                            {item.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <h4 className="text-sm font-black text-text-primary truncate">{item.name}</h4>
                          {item.lastMessageTime && (
                            <span className="text-[10px] font-bold text-text-muted shrink-0">
                              {formatTime12h(item.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted truncate font-medium">
                          {item.lastMessage || (item.schoolGrade ? item.schoolGrade : 'ابدأ المحادثة الآن...')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Main Thread Window */}
        <div className={`flex-1 min-h-0 flex flex-col bg-bg-card ${
          !selectedContact && !showMobileList ? 'hidden md:flex' : showMobileList ? 'hidden md:flex' : 'flex'
        }`}>
          
          {selectedContact ? (
            <>
              {/* Thread Header */}
              <div className="p-4 sm:p-5 border-b border-border/60 bg-gradient-to-r from-accent-blue/10 via-transparent to-transparent flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileList(true)}
                    className="md:hidden w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted"
                  >
                    <ArrowRight size={18} />
                  </button>

                  <div className="w-11 h-11 rounded-2xl bg-accent-blue/15 border border-accent-blue/30 flex items-center justify-center text-accent-blue font-black text-lg shrink-0">
                    {selectedContact.type === 'group' ? '👥' : (selectedContact.name?.[0] || '؟')}
                  </div>

                  <div>
                    <h3 className="text-base font-black text-text-primary flex items-center gap-2">
                      {selectedContact.name}
                      {selectedContact.role && (
                        <span className="px-2 py-0.5 rounded-full bg-accent-blue/10 text-accent-blue text-[10px] font-black border border-accent-blue/20">
                          {selectedContact.role === 'teacher' ? 'مدرس' : 'طالب'}
                        </span>
                      )}
                      {selectedContact.schoolGrade && (
                        <span className="px-2 py-0.5 rounded-full bg-accent-indigo/10 text-accent-indigo text-[10px] font-black border border-accent-indigo/20">
                          {selectedContact.schoolGrade}
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-text-muted font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" /> متصل ومتاح للمراسلة
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => fetchMessages()}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-text-secondary transition-all flex items-center gap-1.5"
                >
                  <RefreshCw size={13} />
                  <span className="hidden sm:inline">تحديث</span>
                </button>
              </div>

              {/* Thread Messages */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar touch-scroll bg-black/10">
                {messages.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-accent-blue/10 text-accent-blue mx-auto flex items-center justify-center text-2xl border border-accent-blue/20">
                      💬
                    </div>
                    <p className="text-sm font-black text-text-secondary">لا توجد رسائل سابقة هنا بعد</p>
                    <p className="text-xs text-text-muted max-w-xs mx-auto">ابدأ بكتابة رسالتك الأولى وسيقوم النظام بتنبيه الطرف الآخر فوراً</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender?._id === user._id || msg.sender === user._id;
                    const senderName = msg.sender?.name || 'مستخدم';
                    return (
                      <motion.div
                        key={msg._id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        {/* Sender Label for Group messages */}
                        {selectedContact.type === 'group' && !isMe && (
                          <span className="text-[10px] font-black text-accent-blue mr-2 mb-1">
                            {senderName}
                          </span>
                        )}

                        <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-md text-sm space-y-2 border ${
                          isMe
                            ? 'bg-gradient-to-br from-accent-blue to-accent-indigo text-white rounded-br-none border-accent-blue/40'
                            : 'bg-bg-secondary border-border text-text-primary rounded-bl-none'
                        }`}>
                          
                          {/* Image Attachment */}
                          {msg.fileUrl && (
                            <div className="relative overflow-hidden rounded-xl group/img cursor-pointer max-w-sm">
                              <img
                                src={msg.fileUrl}
                                alt="مرفق"
                                className="max-h-64 w-full object-cover rounded-xl transition-transform duration-300 group-hover/img:scale-105"
                                onClick={() => setPreviewMedia(msg.fileUrl)}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                <Eye size={24} className="text-white" />
                              </div>
                            </div>
                          )}

                          {/* Content */}
                          {msg.content && (
                            <p className="leading-relaxed font-medium whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                          )}

                          {/* Meta */}
                          <div className={`flex items-center gap-1.5 text-[10px] font-bold ${
                            isMe ? 'text-white/70 justify-end' : 'text-text-muted justify-start'
                          }`}>
                            <span>{formatTime12h(msg.createdAt)}</span>
                            {isMe && (
                              msg.read ? <CheckCheck size={14} className="text-cyan-300" /> : <Check size={14} />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Image Preview Box */}
              {imagePreview && (
                <div className="p-3 bg-bg-secondary border-t border-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={imagePreview} alt="معاينة" className="w-12 h-12 rounded-xl object-cover border border-accent-blue/30" />
                    <span className="text-xs font-black text-text-primary">صورة مرفقة جاهزة للإرسال</span>
                  </div>
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(''); }}
                    className="w-8 h-8 rounded-xl bg-accent-red/10 text-accent-red hover:bg-accent-red hover:text-white flex items-center justify-center transition-all text-xs"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-bg-card border-t border-border flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-accent-blue/15 text-text-muted hover:text-accent-blue border border-white/10 transition-all flex items-center justify-center shrink-0"
                  title="إرفاق صورة"
                >
                  <ImageIcon size={20} />
                </button>

                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  className="flex-1 bg-bg-secondary border border-border rounded-2xl py-3 px-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none transition-all"
                />

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={sending || (!text.trim() && !imagePreview)}
                  className="w-12 h-12 rounded-2xl bg-accent-blue hover:bg-accent-blue-light disabled:opacity-50 text-white flex items-center justify-center transition-all shadow-lg shadow-accent-blue/20 shrink-0"
                >
                  {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="rotate-180" />}
                </motion.button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-accent-blue/10 text-accent-blue flex items-center justify-center text-4xl border border-accent-blue/20">
                💬
              </div>
              <div>
                <h3 className="text-xl font-black text-text-primary">مرحباً بك في نظام المحادثات</h3>
                <p className="text-xs text-text-muted mt-1 max-w-sm">اختر شخصاً أو مجموعة من القائمة على اليمين للبدء في المراسلة الفورية.</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Media Fullscreen Preview Modal */}
      <AnimatePresence>
        {previewMedia && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPreviewMedia(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl z-10 border border-white/20 shadow-2xl"
            >
              <button
                onClick={() => setPreviewMedia(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-accent-red transition-all"
              >
                <X size={20} />
              </button>
              <img src={previewMedia} alt="معاينة" className="max-w-full max-h-[85vh] object-contain rounded-3xl" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ChatPage;
