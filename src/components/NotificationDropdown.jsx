import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, Clock, UserPlus } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const NotificationDropdown = ({ isOpen, onClose, onNewNotification }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    if (user && isOpen) {
      fetchNotifications();
    }
    
    if (user) {
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user, isOpen]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ position: 'relative' }}>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              style={{ position: 'fixed', inset: 0, zIndex: 998 }}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 12, width: 380,
                background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24,
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)', zIndex: 999, overflow: 'hidden'
              }}
            >
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f0f4ff' }}>التنبيهات</h3>
                  <p style={{ fontSize: 11, color: '#64748b' }}>لديك {unreadCount} تنبيهات غير مقروءة</p>
                </div>
              </div>

              <div style={{ maxHeight: 400, overflowY: 'auto', padding: '12px' }}>
                <AnimatePresence initial={false}>
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        style={{
                          padding: 16, borderRadius: 16, marginBottom: 8,
                          background: n.read ? 'transparent' : 'rgba(59,130,246,0.05)',
                          border: `1px solid ${n.read ? 'transparent' : 'rgba(59,130,246,0.1)'}`,
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', gap: 14 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <UserPlus size={18} color="#3b82f6" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f4ff' }}>{n.title}</span>
                              <span style={{ fontSize: 10, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={10} /> {new Date(n.time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{n.message}</p>
                            
                            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                              {!n.read && (
                                <button onClick={() => markAsRead(n.id)} style={{ background: 'none', border: 'none', padding: 0, color: '#3b82f6', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Check size={12} /> تحديد كمقروء
                                </button>
                              )}
                              <button onClick={() => deleteNotification(n.id)} style={{ background: 'none', border: 'none', padding: 0, color: '#64748b', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Trash2 size={12} /> حذف
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
                      <p style={{ color: '#64748b', fontSize: 13 }}>لا توجد تنبيهات جديدة</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
