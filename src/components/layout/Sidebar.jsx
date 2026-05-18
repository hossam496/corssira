import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ChevronRight,
  LogOut, Settings, Menu, X, BarChart3, ClipboardList, Bell,
  BookMarked, Award, Calendar, FileText, ChevronLeft, UsersRound, FolderUp
} from 'lucide-react';

const adminNavItems = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', to: '/admin' },
  { icon: GraduationCap, label: 'الطلاب', to: '/admin/students' },
  { icon: Users, label: 'المدرسون', to: '/admin/teachers' },
  { icon: BookOpen, label: 'المواد الدراسية', to: '/admin/subjects' },
  { icon: Settings, label: 'الإعدادات', to: '/admin/profile' },
];

const teacherNavItems = [
  { icon: LayoutDashboard, label: 'لوحتي', to: '/teacher' },
  { icon: GraduationCap, label: 'طلابي', to: '/teacher/students' },
  { icon: BookOpen, label: 'موادي', to: '/teacher/subjects' },
  { icon: UsersRound, label: 'إدارة المجموعات', to: '/teacher/groups' },
  { icon: ClipboardList, label: 'الحضور', to: '/teacher/attendance' },
  { icon: Award, label: 'الدرجات', to: '/teacher/grades' },
  { icon: FileText, label: 'الامتحانات', to: '/teacher/exams' },
  { icon: BookOpen, label: 'الواجبات', to: '/teacher/assignments' },
  { icon: FolderUp, label: 'الملفات', to: '/teacher/materials' },
  { icon: Settings, label: 'ملفي', to: '/teacher/profile' },
];

const studentNavItems = [
  { icon: LayoutDashboard, label: 'لوحتي', to: '/student' },
  { icon: BookMarked, label: 'موادي', to: '/student/subjects' },
  { icon: UsersRound, label: 'المجموعات', to: '/student/groups' },
  { icon: Award, label: 'درجاتي', to: '/student/grades' },
  { icon: Calendar, label: 'حضوري', to: '/student/attendance' },
  { icon: FileText, label: 'الامتحانات', to: '/student/exams' },
  { icon: BookOpen, label: 'الواجبات', to: '/student/assignments' },
  { icon: FolderUp, label: 'الملفات', to: '/student/materials' },
  { icon: Settings, label: 'ملفي', to: '/student/profile' },
];

const navMap = { admin: adminNavItems, teacher: teacherNavItems, student: studentNavItems };

const roleLabels = { admin: 'مدير النظام', teacher: 'مدرس', student: 'طالب' };
const roleColors = { admin: '#3b82f6', teacher: '#10b981', student: '#8b5cf6' };

const Sidebar = ({ role, collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = navMap[role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <motion.aside
      className={`fixed top-0 right-0 h-screen z-[100] hidden lg:flex flex-col bg-gradient-to-b from-bg-secondary to-bg-primary border-l border-border shadow-[-4px_0_30px_rgba(0,0,0,0.4)] overflow-hidden transition-[width] duration-300 ease-[0.4,0,0.2,1]`}
      animate={{ width: collapsed ? 72 : 280 }}
    >
      {/* Header */}
      <div className={`flex items-center justify-between min-h-[80px] border-b border-border/10 ${collapsed ? 'px-4 py-5' : 'px-5 py-6'}`}>
        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }} 
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0 bg-white">
                <img src="/Gemini_Generated_Image_qx8udjqx8udjqx8u.png" alt="Corssira Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="font-black text-lg text-text-primary font-cairo leading-tight">كورسيرا</div>
                <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">منصة تعليمية</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {collapsed && (
          <div className="w-9 h-9 rounded-lg overflow-hidden mx-auto shadow-md bg-white">
            <img src="/Gemini_Generated_Image_qx8udjqx8udjqx8u.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
        )}

        {!collapsed && (
          <button 
            onClick={onToggle} 
            className="w-8 h-8 rounded-lg bg-accent-blue/10 border border-accent-blue/20 text-accent-blue-light flex items-center justify-center cursor-pointer hover:bg-accent-blue/20 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split('/').length === 2}
            className={({ isActive }) => `
              flex items-center gap-3 mb-1 px-3.5 py-3 rounded-xl transition-all duration-200
              ${collapsed ? 'justify-center px-0' : 'justify-start'}
              ${isActive 
                ? 'bg-gradient-to-br from-accent-blue/20 to-accent-indigo/10 text-accent-blue-light border border-accent-blue/25 shadow-[0_4px_15px_rgba(59,130,246,0.1)] font-bold' 
                : 'text-text-secondary hover:bg-white/5 hover:text-text-primary border border-transparent'}
            `}
          >
            <item.icon size={20} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -10 }} 
                  className="text-sm font-cairo whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div className="px-2 py-4 border-t border-border/10">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-3 bg-white/5 border border-border rounded-xl mb-2">
            <img 
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} 
              alt="avatar" 
              className={`w-9 h-9 rounded-full border-2 border-accent-blue/30 object-cover`} 
              style={{ borderColor: roleColors[role] }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-text-primary truncate">{user?.name}</div>
              <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: roleColors[role] }}>{roleLabels[role]}</div>
            </div>
          </div>
        )}
        <button 
          onClick={handleLogout} 
          className={`flex items-center gap-3 w-full transition-all duration-200 bg-accent-red/10 border border-accent-red/20 rounded-xl text-accent-red-light font-bold hover:bg-accent-red/20 ${
            collapsed ? 'justify-center p-3' : 'px-4 py-3 text-sm'
          }`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span className="font-cairo">تسجيل الخروج</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
