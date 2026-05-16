import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, BookOpen, FileText, Bell, 
  Settings, Calendar, Award, GraduationCap, UsersRound, 
  ClipboardList, BookMarked, Users
} from 'lucide-react';

const studentItems = [
  { icon: LayoutDashboard, label: 'لوحتي', to: '/student' },
  { icon: BookMarked, label: 'موادي', to: '/student/subjects' },
  { icon: UsersRound, label: 'المجموعات', to: '/student/groups' },
  { icon: Award, label: 'درجاتي', to: '/student/grades' },
  { icon: Calendar, label: 'حضوري', to: '/student/attendance' },
  { icon: FileText, label: 'الامتحانات', to: '/student/exams' },
  { icon: BookOpen, label: 'الواجبات', to: '/student/assignments' },
  { icon: Settings, label: 'ملفي', to: '/student/profile' },
];

const teacherItems = [
  { icon: LayoutDashboard, label: 'لوحتي', to: '/teacher' },
  { icon: GraduationCap, label: 'طلابي', to: '/teacher/students' },
  { icon: BookOpen, label: 'موادي', to: '/teacher/subjects' },
  { icon: UsersRound, label: 'المجموعات', to: '/teacher/groups' },
  { icon: ClipboardList, label: 'الحضور', to: '/teacher/attendance' },
  { icon: Award, label: 'الدرجات', to: '/teacher/grades' },
  { icon: FileText, label: 'الامتحانات', to: '/teacher/exams' },
  { icon: BookOpen, label: 'الواجبات', to: '/teacher/assignments' },
  { icon: Settings, label: 'ملفي', to: '/teacher/profile' },
];

const adminItems = [
  { icon: LayoutDashboard, label: 'الرئيسية', to: '/admin' },
  { icon: GraduationCap, label: 'الطلاب', to: '/admin/students' },
  { icon: Users, label: 'المدرسون', to: '/admin/teachers' },
  { icon: BookOpen, label: 'المواد', to: '/admin/subjects' },
  { icon: Settings, label: 'الملف الشخصي', to: '/admin/profile' },
];

const MobileNav = ({ role }) => {
  const items = role === 'admin' ? adminItems : role === 'teacher' ? teacherItems : studentItems;

  return (
    <div className="mobile-nav">
      <div className="mobile-nav-container">
        {items.map((item, idx) => (
          <NavLink 
            key={idx} 
            to={item.to} 
            end={item.to.split('/').length === 2}
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <item.icon />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="mobile-nav-indicator"
                    className="mobile-nav-indicator"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;
