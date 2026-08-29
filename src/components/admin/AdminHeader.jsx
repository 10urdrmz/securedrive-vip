import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Database, ExternalLink, LogOut } from 'lucide-react';
import NotificationBell from '../common/NotificationBell';

export default function AdminHeader({ isCollapsed, setIsCollapsed, adminUser, onLogout }) {
  const navigate = useNavigate();
  const initials = adminUser?.full_name 
    ? adminUser.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'OP';

  return (
    <header className="admin-top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button 
          type="button" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="btn-ghost"
          style={{ padding: '6px 10px' }}
          title="Menüyü Gizle / Göster"
        >
          <Menu size={16} />
        </button>

        <div className="input-field-box" style={{ width: '280px', height: '36px' }}>
          <Search size={14} color="var(--text-muted)" />
          <input type="text" placeholder="Rezervasyon, yolcu veya plaka ara..." style={{ fontSize: '12.5px' }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Supabase status badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--accent-green-bg)',
          border: '1px solid var(--accent-green-border)',
          color: 'var(--accent-green)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          fontSize: '11.5px',
          fontWeight: 600
        }}>
          <Database size={12} />
          <span>Supabase Canlı DB Bağlı</span>
        </div>

        <Link to="/" className="btn-ghost" style={{ fontSize: '12px', padding: '6px 12px', textDecoration: 'none' }}>
          <ExternalLink size={13} />
          <span>Siteyi Görüntüle</span>
        </Link>

        <NotificationBell variant="light" />

        {/* User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid var(--border)', paddingLeft: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0d0d0d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
            {initials}
          </div>
          <div>
            <strong style={{ fontSize: '12.5px', display: 'block', lineHeight: 1.1 }}>
              {adminUser?.full_name || 'Operasyon Müdürü'}
            </strong>
            <small style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
              {adminUser?.role || 'Süper Yönetici'}
            </small>
          </div>

          <button 
            type="button" 
            onClick={onLogout}
            className="btn-ghost"
            style={{ padding: '6px 8px', color: '#ef4444', marginLeft: '4px' }}
            title="Güvenli Çıkış Yap"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
