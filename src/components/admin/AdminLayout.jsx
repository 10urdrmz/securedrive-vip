import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout() {
  const { user: adminUser, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="admin-wrapper">
      {/* Collapsible Left Sidebar with NavLinks */}
      <AdminSidebar 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        adminUser={adminUser}
      />

      {/* Main Content Area with Outlet for Sub-pages */}
      <div className="admin-main">
        <AdminHeader 
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          adminUser={adminUser}
          onLogout={handleLogout}
        />

        {/* Dynamic sub-routes: /admin, /admin/reservations, /admin/drivers, /admin/fleet, /admin/livemap */}
        <Outlet />
      </div>
    </div>
  );
}
