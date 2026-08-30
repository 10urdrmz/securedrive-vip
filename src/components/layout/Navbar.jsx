import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { normalizeRole } from '../../lib/auth';
import { User, LogOut, Menu, X } from 'lucide-react';
import NotificationBell from '../common/NotificationBell';

export default function Navbar() {
  const navigate = useNavigate();
  const { currency, setCurrency } = useBooking();
  const { user, booting, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getPortalLink = () => {
    if (!user) return '/login';
    const role = normalizeRole(user.role);
    if (role === 'admin') return '/admin';
    if (role === 'driver') return '/driver';
    return '/account';
  };

  const getRoleLabel = () => {
    if (!user) return '';
    const role = normalizeRole(user.role);
    if (role === 'admin') return 'Yönetici';
    if (role === 'driver') return 'Şoför';
    return 'Yolcu';
  };

  return (
    <header className="site-header">
      <div className="site-header-container">
        
        {/* Left: Brand Logo */}
        <Link to="/" className="header-brand">
          <img 
            src="/logo.png" 
            alt="Secure drive" 
            className="header-logo-image" 
          />
          <span className="header-vip-tag">VIP</span>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="header-nav-desktop">
          <NavLink to="/" end className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>
            Rezervasyon
          </NavLink>
          <NavLink to="/filo" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>
            VIP Filo
          </NavLink>
          <NavLink to="/rotalar" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>
            Rotalar & Fiyatlar
          </NavLink>
          <NavLink to="/hizmetler" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>
            Hizmetlerimiz
          </NavLink>
          <NavLink to="/kurumsal" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>
            Kurumsal B2B
          </NavLink>
          <NavLink to="/sss" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>
            S.S.S.
          </NavLink>
        </nav>

        {/* Right: Actions */}
        <div className="header-actions-desktop">
          {/* Currency */}
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)} 
            className="header-currency-select"
            title="Para Birimi"
          >
            <option value="TRY">TRY ₺</option>
            <option value="EUR">EUR €</option>
            <option value="USD">USD $</option>
            <option value="GBP">GBP £</option>
          </select>

          {/* User Auth Portal Chip */}
          {!booting && user && <NotificationBell variant="light" />}

          {!booting && (user ? (
            <div className="header-user-badge-wrap">
              <Link to={getPortalLink()} className="header-user-chip">
                <span className="header-user-role">{getRoleLabel()}:</span>
                <span className="header-user-name">{user.full_name?.split(' ')[0]}</span>
              </Link>
              <button 
                type="button"
                className="header-logout-btn"
                onClick={handleLogout}
                title="Çıkış Yap"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="header-login-btn">
              <User size={13} />
              <span>Giriş Yap</span>
            </Link>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button 
          type="button" 
          className="header-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menüyü Aç"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="header-mobile-drawer">
          <NavLink to="/" end className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            Rezervasyon
          </NavLink>
          <NavLink to="/filo" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            VIP Filo Kataloğu
          </NavLink>
          <NavLink to="/rotalar" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            Rotalar & Sabit Fiyatlar
          </NavLink>
          <NavLink to="/hizmetler" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            Hizmetlerimiz
          </NavLink>
          <NavLink to="/kurumsal" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            Kurumsal B2B
          </NavLink>
          <NavLink to="/sss" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            Sıkça Sorulan Sorular
          </NavLink>

          <div style={{ padding: '14px 0', borderTop: '1px solid #edf2f7', display: 'flex', gap: '8px' }}>
            {!booting && (user ? (
              <Link to={getPortalLink()} className="btn-action-primary" style={{ flex: 1, textDecoration: 'none', height: '40px' }} onClick={() => setMobileMenuOpen(false)}>
                <span>{getRoleLabel()} Paneli ({user.full_name?.split(' ')[0]})</span>
              </Link>
            ) : (
              <Link to="/login" className="btn-action-primary" style={{ flex: 1, textDecoration: 'none', height: '40px' }} onClick={() => setMobileMenuOpen(false)}>
                <span>Giriş Yap / Kayıt Ol</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
