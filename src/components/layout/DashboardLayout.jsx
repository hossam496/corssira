import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import { subscribeToWebPush } from '../../services/pushService';

const DashboardLayout = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const initPush = async () => {
      try {
        if ('serviceWorker' in navigator && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            await subscribeToWebPush();
          }
        }
      } catch (e) {}
    };
    initPush();
  }, []);

  return (
    <div className="layout">
      <Sidebar role={role} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Navbar onMenuToggle={() => setCollapsed(c => !c)} sidebarCollapsed={collapsed} />
        <main>
          <Outlet />
        </main>
      </div>
      <MobileNav role={role} />
    </div>
  );
};

export default DashboardLayout;
