import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Sun, Moon, Menu, ChevronDown, User, Settings, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';
import { subscribeToWebPush } from '../../services/pushService';

const Navbar = ({ onMenuToggle, sidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [search, setSearch] = useState('');
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const { data } = await api.get('/notifications');
        setNotifications(data.data?.slice(0, 5) || []);
        setUnread(data.data?.filter(n => !n.read).length || 0); // Count unread from data if API unread is missing
        if (data.unread !== undefined) setUnread(data.unread);
      } catch { /* silent */ }
    };
    fetchNotifs();
    
    // Fallback polling for UI updates since we use WebPush now for actual alerts
    const interval = setInterval(fetchNotifs, 15000);

    if (user?._id) {
      // Ask for push notification permission and subscribe
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            subscribeToWebPush();
          }
        });
      }
    }
    
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markRead = async (id) => {
    try { await api.put(`/notifications/${id}/read`); setUnread(u => Math.max(0, u - 1)); } catch { /* silent */ }
  };

  const rolePrefix = user?.role === 'admin' ? '/admin' : user?.role === 'teacher' ? '/teacher' : '/student';

  return (
    <header className="relative">
      <div 
        className={`fixed top-0 left-0 right-0 h-[var(--navbar-height)] z-[1000] bg-bg-glass backdrop-blur-xl border-b border-border flex items-center px-5 gap-4 transition-[margin-right] duration-300 ${
          sidebarCollapsed ? 'lg:mr-[var(--sidebar-collapsed)]' : 'lg:mr-[var(--sidebar-width)]'
        }`}
      >
        {/* Menu toggle - Desktop */}
        <button 
          className="btn btn-ghost hidden lg:flex p-2 rounded-xl" 
          onClick={onMenuToggle}
        >
          <Menu size={20} />
        </button>

        {/* Mobile Logo */}
        <div className="flex lg:hidden items-center gap-2 text-xl font-black text-accent-blue">
           <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-indigo rounded-lg flex items-center justify-center text-white text-base">🎓</div>
           <span className="font-cairo">كورسيرا</span>
        </div>

        {/* Search - Responsive */}
        <div className={`flex-1 max-w-[400px] relative lg:block ${showMobileSearch ? 'fixed inset-0 h-[var(--navbar-height)] bg-bg-primary z-[2000] p-3 flex items-center' : 'hidden lg:relative lg:bg-transparent lg:inset-auto lg:h-auto lg:p-0'}`}>
          <Search size={16} className="absolute right-7 lg:right-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث..."
            className="input pr-12 lg:pr-10 bg-accent-blue/5 h-10 text-sm border-none"
          />
          <button className="lg:hidden absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" onClick={() => setShowMobileSearch(false)}>
             <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 mr-auto">
          {/* Mobile Search Toggle */}
          <button className="btn btn-ghost lg:hidden w-10 h-10 p-0" onClick={() => setShowMobileSearch(true)}>
             <Search size={20} />
          </button>

          {/* Theme Toggle */}
          <button className="btn btn-ghost hidden lg:flex w-10 h-10 p-0" onClick={toggleTheme}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button 
              className="btn btn-ghost w-10 h-10 p-0 relative" 
              onClick={() => setShowNotifs(p => !p)}
            >
              <Bell size={20} />
              {unread > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-accent-red rounded-full border-2 border-bg-card" />}
            </button>
            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-[50px] left-0 w-[calc(100vw-32px)] sm:w-[340px] bg-bg-card border border-border rounded-2xl shadow-lg z-[1100] overflow-hidden"
                >
                  <div className="p-4 border-b border-border flex justify-between items-center bg-bg-card">
                    <span className="font-black text-sm text-text-primary">الإشعارات</span>
                    {unread > 0 && <span className="badge badge-blue">{unread} جديد</span>}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center text-text-muted text-sm">لا توجد إشعارات حالياً</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => markRead(n.id)} 
                          className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${n.read ? 'bg-transparent' : 'bg-accent-blue/5'}`}
                        >
                          <div className="text-sm font-black mb-1 text-text-primary">{n.title}</div>
                          <div className="text-xs text-text-secondary leading-relaxed">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div ref={userRef} className="relative hidden lg:block">
            <button 
              onClick={() => setShowUserMenu(p => !p)} 
              className="flex items-center gap-2.5 px-3 py-1 bg-accent-blue/10 border border-border rounded-full cursor-pointer text-text-primary hover:border-accent-blue/30 transition-colors"
            >
              <img 
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} 
                alt="avatar" 
                className="w-8 h-8 rounded-full border-2 border-bg-card object-cover" 
              />
              <span className="text-sm font-bold max-w-[100px] truncate">{user?.name}</span>
              <ChevronDown size={14} className="text-accent-blue" />
            </button>
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-[50px] left-0 w-[200px] bg-bg-card border border-border rounded-xl shadow-lg z-[1100] overflow-hidden"
                >
                  {[
                    { icon: User, label: 'ملفي الشخصي', action: () => { navigate(`${rolePrefix}/profile`); setShowUserMenu(false); } },
                    { icon: Settings, label: 'الإعدادات', action: () => { navigate(`${rolePrefix}/profile`); setShowUserMenu(false); } },
                    { icon: LogOut, label: 'تسجيل الخروج', action: () => { logout(); navigate('/login'); }, danger: true },
                  ].map(({ icon: Icon, label, action, danger }) => (
                    <button 
                      key={label} 
                      onClick={action} 
                      className={`flex items-center gap-3 w-full px-4 py-3 bg-transparent border-none cursor-pointer text-sm font-bold text-right transition-colors ${danger ? 'text-accent-red hover:bg-accent-red/5' : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'}`}
                    >
                      <Icon size={16} />
                      <span>{label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
