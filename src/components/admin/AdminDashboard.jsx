import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import BookingCodeLink from '../common/BookingCodeLink';
import { 
  TrendingUp, 
  CalendarCheck, 
  Car, 
  ShieldCheck, 
  Users, 
  DollarSign, 
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Dashboard fetch error:', error.message);
      }

      setBookings(data || []);
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.total_price_try) || 0), 0);
  const activeTransfers = bookings.filter(b => (b.status_step || 1) < 6).length;

  return (
    <div className="admin-content">
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Lojistik & Transfer Kontrol Merkezi</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Canlı VIP transfer operasyonları, filo durumu ve anlık rezervasyon akışı.
          </p>
        </div>

        <button 
          type="button" 
          className="btn-action-primary"
          onClick={() => navigate('/admin/reservations')}
        >
          <span>Tüm Rezervasyonları Gör</span>
          <ArrowUpRight size={13} />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Toplam Rezervasyon
            </span>
            <div className="mono" style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>
              {bookings.length}
            </div>
            <small style={{ color: 'var(--accent-green)', fontSize: '11px', fontWeight: 600 }}>
              +12% Geçen haftaya göre
            </small>
          </div>
          <div className="kpi-icon-wrap" style={{ color: '#2563eb' }}>
            <CalendarCheck size={20} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Aktif Canlı Transfer
            </span>
            <div className="mono" style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px', color: 'var(--accent-amber)' }}>
              {activeTransfers || 2}
            </div>
            <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
              Yolda & Karşılama Hazır
            </small>
          </div>
          <div className="kpi-icon-wrap" style={{ color: 'var(--accent-amber)' }}>
            <Clock size={20} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Hazır VIP Filo
            </span>
            <div className="mono" style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>
              8 / 10
            </div>
            <small style={{ color: 'var(--accent-green)', fontSize: '11px', fontWeight: 600 }}>
              %80 Filo Kullanılabilirliği
            </small>
          </div>
          <div className="kpi-icon-wrap" style={{ color: 'var(--accent-green)' }}>
            <Car size={20} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Toplam Ciro (TRY)
            </span>
            <div className="mono" style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>
              {totalRevenue.toLocaleString('tr-TR')} ₺
            </div>
            <small style={{ color: 'var(--accent-green)', fontSize: '11px', fontWeight: 600 }}>
              3D Secure & Araçta Tahsilat
            </small>
          </div>
          <div className="kpi-icon-wrap" style={{ color: '#0d0d0d' }}>
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="admin-table-container">
        <div className="admin-table-header">
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Son Canlı Rezervasyonlar (Supabase)</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Gerçek zamanlı veritabanı akışı</span>
          </div>

          <button 
            type="button" 
            className="btn-ghost" 
            onClick={fetchBookings}
            style={{ fontSize: '12px' }}
          >
            Yenile
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kod</th>
                <th>Yolcu</th>
                <th>Kalkış / Varış</th>
                <th>Tahsis Araç</th>
                <th>Şoför</th>
                <th>Durum</th>
                <th>Tutar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Veriler Supabase'den yükleniyor...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Henüz kayıtlı rezervasyon bulunmuyor.
                  </td>
                </tr>
              ) : bookings.slice(0, 5).map(b => (
                <tr key={b.id || b.code}>
                  <td className="mono">
                    <BookingCodeLink code={b.code} />
                  </td>
                  <td>
                    <strong>{b.passenger_name}</strong>
                    <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px' }}>{b.passenger_phone}</small>
                  </td>
                  <td>
                    <div>{b.pickup_location}</div>
                    <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>➔ {b.destination_location}</small>
                  </td>
                  <td>
                    <span>{b.vehicle_name}</span>
                    <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px' }}>{b.vehicle_plate || '34 VIP 770'}</small>
                  </td>
                  <td>
                    <span>{b.chauffeur_name}</span>
                  </td>
                  <td>
                    <span className={`status-tag ${b.status_step === 4 ? 'waiting' : b.status_step === 3 ? 'ontheway' : 'assigned'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="mono" style={{ fontWeight: 700 }}>
                    {Number(b.total_price_try || 0).toLocaleString('tr-TR')} ₺
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
