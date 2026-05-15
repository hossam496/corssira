import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import AIChatbot from '../AIChatbot';

const DashboardLayout = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);

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
      <AIChatbot />
    </div>
  );
};

export default DashboardLayout;
