import React, { useState, useEffect } from 'react';
import { fetchRoutesFromDb } from '../../lib/dbService';
import { useBooking } from '../../context/BookingContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function RoutesPage() {
  const navigate = useNavigate();
  const { handleSelectRoutePreset, formatMoney } = useBooking();
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await fetchRoutesFromDb();
      if (data && data.length > 0) setRoutes(data);
    }
    load();
  }, []);

  const handleBook = (route) => {
    handleSelectRoutePreset(route, navigate);
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span className="section-badge">
          ŞEFFAF SABİT FİYATLANDIRMA
        </span>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '12px' }}>
          Popüler Havalimanı & Otel VIP Transfer Rotaları
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '600px', margin: '8px auto 0 auto' }}>
          Trafik, köprü veya tünel geçiş ücreti eklenmeden sabit fiyat garantisiyle seyahat edin.
        </p>
      </div>

      <div className="routes-grid-3">
        {routes.map((r, i) => {
          const price = r.priceTRY || r.price || 1750;
          const distance = r.distanceKm ? `${r.distanceKm} km` : r.distance || '42 km';
          const duration = r.durationMin ? `${r.durationMin} dk` : r.duration || '45 dk';
          const badge = r.badge || r.tag || 'En Popüler';

          return (
            <div key={r.id || i} className="route-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="preset-chip" style={{ fontSize: '11.5px', background: '#eff6ff', color: '#2563eb', fontWeight: 700 }}>
                  {badge}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>{distance}</span>
                  <span>·</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {duration}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '14px' }}>{r.from}</strong>
                <ArrowRight size={14} color="var(--text-muted)" />
                <strong style={{ fontSize: '14px' }}>{r.to}</strong>
              </div>

              <div className="route-features-box">
                <div>✓ 60 Dakika Ücretsiz Uçuş Rötar Bekleme</div>
                <div>✓ Köprü, Avrasya Tüneli & Otoyol Ücretleri Dahil</div>
                <div>✓ İsimli CIP Kapı Karşılama & Bagaj Taşıma</div>
              </div>

              <div className="route-card-foot">
                <div>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Sabit Fiyat:</span>
                  <span className="mono" style={{ fontSize: '18px', fontWeight: 800 }}>
                    {formatMoney ? formatMoney(price) : `${price} ₺`}
                  </span>
                </div>

                <button 
                  type="button" 
                  className="btn-action-primary"
                  onClick={() => handleBook(r)}
                  style={{ height: '38px', padding: '0 16px' }}
                >
                  <span>Hemen Tahsis Et</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
