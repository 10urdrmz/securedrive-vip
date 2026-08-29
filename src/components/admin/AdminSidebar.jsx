import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Car,
  MapPin,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Building2,
  MessageSquareWarning,
  Radio,
  List
} from 'lucide-react';

const navSections = [
  {
    title: 'GENEL',
    items: [
      { to: '/admin', label: 'Genel Bakış', icon: LayoutDashboard, end: true },
      { to: '/admin/reservations', label: 'Tüm Rezervasyonlar', icon: CalendarDays },
      { to: '/admin/livemap', label: 'Canlı Lojistik Haritası', icon: Radio }
    ]
  },
  {
    title: 'VIP ŞOFÖR KADROSU',
    items: [
      { to: '/admin/drivers', label: 'Şoför Listesi', icon: List },
      { to: '/admin/driver-reviews', label: 'Şoför Değerlendirmeleri', icon: MessageSquareWarning, sub: true }
    ]
  },
  {
    title: 'OPERASYON',
    items: [
      { to: '/admin/fleet', label: 'VIP Filo Yönetimi', icon: Car },
      { to: '/admin/routes', label: 'Rotalar & Fiyatlar', icon: MapPin },
      { to: '/admin/amenities', label: 'Konfor Donanımları', icon: Sparkles }
    ]
  },
  {
    title: 'İÇERİK',
    items: [
      { to: '/admin/faqs', label: 'S.S.S. Yönetimi', icon: HelpCircle },
      { to: '/admin/corporate', label: 'Kurumsal Başvurular', icon: Building2 }
    ]
  }
];

function matchPath(pathname, to, end = false) {
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function AdminSidebar({ isCollapsed, adminUser }) {
  const { pathname } = useLocation();
  const initials = adminUser?.full_name
    ? adminUser.full_name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'OM';

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="admin-sidebar-inner">
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-brand-link">
            <div className="admin-brand-dot" />
            {!isCollapsed && (
              <div>
                <div className="admin-brand-title">SecureDrive</div>
                <div className="admin-brand-sub">Operasyon Paneli</div>
              </div>
            )}
          </Link>
        </div>

        <div className="admin-nav-group">
          {navSections.map((section) => (
            <div key={section.title} className="admin-nav-section">
              {!isCollapsed && (
                <div className="admin-nav-section-title">{section.title}</div>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const active = item.end
                  ? matchPath(pathname, item.to, true)
                  : matchPath(pathname, item.to);

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={`admin-nav-item ${item.sub ? 'is-sub' : ''} ${active ? 'active' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={16} strokeWidth={1.75} />
                    {!isCollapsed && <span className="admin-nav-label">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        <div className="admin-sidebar-footer">
          <Link
            to="/"
            className="admin-sidebar-footer-link"
            title={isCollapsed ? 'Müşteri Sitesine Dön' : undefined}
          >
            <ExternalLink size={14} />
            {!isCollapsed && <span>Müşteri Sitesine Dön</span>}
          </Link>

          {!isCollapsed && (
            <div className="admin-sidebar-user">
              <div className="admin-sidebar-user-avatar">{initials}</div>
              <div className="admin-sidebar-user-meta">
                <strong>{adminUser?.full_name || 'Operasyon Müdürü'}</strong>
                <span>{adminUser?.email || 'admin@securedrive.com'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
