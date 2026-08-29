import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { formatRouteChipLabel } from '../../lib/routeLocation';

export default function PopularRoutes() {
  const navigate = useNavigate();
  const {
    popularRoutes,
    formatMoney,
    handleSelectRoutePreset
  } = useBooking();

  return (
    <section className="section-pad" id="routes" style={{ background: 'var(--bg-stage)' }}>
      <div className="container">
        <div className="section-head-mini">
          <span className="tag">POPÜLER HATLAR</span>
          <h2>Sabit Fiyatlı Transfer Güzergahları</h2>
        </div>

        <div className="routes-grid-3">
          {popularRoutes.map((route, idx) => (
            <div key={route.id || idx} className="route-item-card">
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                {formatRouteChipLabel(route)}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                {route.distanceKm} KM · ~{route.durationMin} DK · {route.vehicle}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                <span className="mono" style={{ fontWeight: 700, fontSize: '16px' }}>
                  {formatMoney(route.priceTRY)}
                </span>
                <button
                  type="button"
                  className="btn-select-chip"
                  onClick={() => handleSelectRoutePreset(route, navigate)}
                >
                  Seç & Tahsis Et
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
