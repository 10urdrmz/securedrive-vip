import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Tag, Car, User, Radar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { normalizeRole } from '../../lib/auth';

export default function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  const getProfileLink = () => {
    if (!user) return '/login';
    const role = normalizeRole(user.role);
    if (role === 'admin') return '/admin';
    if (role === 'driver') return '/driver';
    return '/account';
  };

  // Do not show on admin or driver dashboard pages if they have their own navigation
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/driver')) {
    return null;
  }

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav__pill">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <Home size={18} />
          <span>Ana sayfa</span>
        </NavLink>

        <a
          href="/#drops-section"
          className={`mobile-nav-item ${location.hash === '#drops-section' ? 'active' : ''}`}
          onClick={(e) => {
            if (location.pathname === '/') {
              e.preventDefault();
              document.getElementById('drops-section')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <Tag size={18} />
          <span>Drops</span>
        </a>

        <NavLink
          to="/filo"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <Car size={18} />
          <span>VIP Filo</span>
        </NavLink>

        <NavLink
          to="/takip"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <Radar size={18} />
          <span>Radar</span>
        </NavLink>

        <NavLink
          to={getProfileLink()}
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          {user ? (
            <div className="mobile-nav-avatar">
              {user.full_name?.charAt(0) || 'U'}
            </div>
          ) : (
            <User size={18} />
          )}
          <span>{user ? user.full_name?.split(' ')[0] : 'Profil'}</span>
        </NavLink>
      </div>
    </nav>
  );
}
