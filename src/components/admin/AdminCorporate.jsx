import React, { useState, useEffect } from 'react';
import {
  Building2,
  RefreshCw,
  Mail,
  Phone,
  User,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import {
  fetchCorporateApplications,
  updateCorporateApplicationStatus
} from '../../lib/corporateService';

const STATUS_LABELS = {
  pending: 'Beklemede',
  contacted: 'İletişime Geçildi',
  approved: 'Onaylandı',
  rejected: 'Reddedildi'
};

export default function AdminCorporate() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await fetchCorporateApplications();
      setApplications(data);
    } catch (e) {
      console.warn(e);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleStatusChange = async (application, newStatus) => {
    setUpdatingId(application.id);
    try {
      const result = await updateCorporateApplicationStatus(application.id, newStatus);
      if (result.success) {
        setApplications((prev) =>
          prev.map((item) =>
            item.id === application.id ? { ...item, status: newStatus } : item
          )
        );
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-page-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Kurumsal Başvurular</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            /kurumsal sayfasından gelen cari hesap ve B2B üyelik talepleri
          </p>
        </div>
        <button type="button" className="btn-ghost" onClick={loadApplications}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Yenile</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={22} className="spin" style={{ margin: '0 auto 10px auto', display: 'block' }} />
          Başvurular yükleniyor...
        </div>
      ) : applications.length === 0 ? (
        <div className="fleet-item-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Building2 size={28} style={{ margin: '0 auto 10px auto', display: 'block', opacity: 0.5 }} />
          Henüz kurumsal başvuru bulunmuyor.
        </div>
      ) : (
        applications.map((app) => (
          <div key={app.id} className="fleet-item-card" style={{ padding: '20px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Building2 size={16} color="#2563eb" />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{app.company_name}</h3>
                  <span className="preset-chip" style={{ fontSize: '11px' }}>
                    {STATUS_LABELS[app.status] || app.status}
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={12} /> {app.contact_person}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={12} /> {app.email}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={12} /> {app.phone}
                  </span>
                  {app.monthly_trips && (
                    <span>Tahmini aylık transfer: <strong>{app.monthly_trips}</strong></span>
                  )}
                  <span style={{ fontSize: '11px', marginTop: '4px' }}>
                    Kaynak: {app.source || 'kurumsal-page'} ·{' '}
                    {new Date(app.created_at || app._savedAt).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={updatingId === app.id || app.status === 'contacted'}
                  onClick={() => handleStatusChange(app, 'contacted')}
                  style={{ fontSize: '12px', height: '34px' }}
                >
                  <Clock size={12} />
                  <span>İletişimde</span>
                </button>
                <button
                  type="button"
                  className="btn-action-primary"
                  disabled={updatingId === app.id || app.status === 'approved'}
                  onClick={() => handleStatusChange(app, 'approved')}
                  style={{ fontSize: '12px', height: '34px', background: '#10b981' }}
                >
                  <CheckCircle2 size={12} />
                  <span>Onayla</span>
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={updatingId === app.id || app.status === 'rejected'}
                  onClick={() => handleStatusChange(app, 'rejected')}
                  style={{ fontSize: '12px', height: '34px', color: '#ef4444' }}
                >
                  <XCircle size={12} />
                  <span>Reddet</span>
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
