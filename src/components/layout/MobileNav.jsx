import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, BookOpen, FileText, Bell, 
  Settings, Calendar, Award, GraduationCap, UsersRound, BookMarked
} from 'lucide-react';

const studentItems = [
  { icon: LayoutDashboard, label: 'الرئيسية', to: '/student' },
  { icon: Award, label: 'الدرجات', to: '/student/grades' },
  { icon: FileText, label: 'الامتحانات', to: '/student/exams' },
  { icon: BookOpen, label: 'الواجبات', to: '/student/assignments' },
  { icon: Bell, label: 'الإشعارات', to: '#' }, // Using a placeholder for now
];

const teacherItems = [
  { icon: LayoutDashboard, label: 'الرئيسية', to: '/teacher' },
  { icon: Award, label: 'الدرجات', to: '/teacher/grades' },
  { icon: FileText, label: 'الامتحانات', to: '/teacher/exams' },
  { icon: BookOpen, label: 'الواجبات', to: '/teacher/assignments' },
  { icon: UsersRound, label: 'المجموعات', to: '/teacher/groups' },
];

const adminItems = [
  { icon: LayoutDashboard, label: 'الرئيسية', to: '/admin' },
  { icon: GraduationCap, label: 'الطلاب', to: '/admin/students' },
  { icon: BookOpen, label: 'المواد', to: '/admin/subjects' },
  { icon: Settings, label: 'الإعدادات', to: '/admin/profile' },
  { icon: Bell, label: 'الإشعارات', to: '#' },
];

const MobileNav = ({ role }) => {
  const items = role === 'admin' ? adminItems : role === 'teacher' ? teacherItems : studentItems;

  return (
    <div className="mobile-nav">
      {items.map((item, idx) => (
        <NavLink 
          key={idx} 
          to={item.to} 
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          {({ isActive }) => (
            <>
              <item.icon />
              <span>{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="mobile-nav-indicator"
                  style={{ position: 'absolute', bottom: 8, width: 4, height: 4, borderRadius: '50%', background: 'var(--accent-blue)' }} 
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default MobileNav;
