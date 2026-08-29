import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { formatRouteChipLabel } from '../../lib/routeLocation';
import { BOOKING_WIZARD_PATHS } from '../../lib/bookingWizard';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function Step1Vehicles() {
  const navigate = useNavigate();
  const {
    fleet,
    popularRoutes,
    activeRoute,
    selectedVehicleId,
    setSelectedVehicleId,
    distanceKm,
    durationMin,
    tripType,
    formatMoney,
    handleSelectRoutePreset
  } = useBooking();

  return (
    <div>
      <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Tahsis Edilecek VIP Aracınızı Belirleyin</h2>
        <span className="preset-chip" style={{ color: 'var(--accent-green)' }}>
          {activeRoute ? `${activeRoute.distanceKm} km · ~${activeRoute.durationMin} dk` : 'Canlı DB Filosu'}
        </span>
      </div>

      {popularRoutes.length > 0 && (
        <div className="quick-preset-bar" style={{ marginBottom: '14px' }}>
          <span className="quick-label">Popüler Rotalar:</span>
          {popularRoutes.map((route) => (
            <button
              key={route.id}
              type="button"
              className="preset-chip"
              onClick={() => handleSelectRoutePreset(route, navigate)}
              style={activeRoute?.id === route.id ? {
                borderColor: 'var(--accent-green)',
                color: 'var(--accent-green)',
                background: 'var(--accent-green-bg)'
              } : undefined}
            >
              {formatRouteChipLabel(route)}
            </button>
          ))}
        </div>
      )}

      {/* Vehicle Cards List */}
      <div className="vehicle-cards-list">
        {fleet.map(vehicle => {
          const isSelected = vehicle.id === selectedVehicleId;
          const baseFare = vehicle.baseOpeningRate + (distanceKm * vehicle.baseRateKm);
          const fareFormatted = formatMoney(tripType === 'roundtrip' ? baseFare * 1.85 : baseFare);

          return (
            <div 
              key={vehicle.id}
              className={`vehicle-minimal-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedVehicleId(vehicle.id)}
            >
              <div className="vehicle-thumb">
                <img src={vehicle.image} alt={vehicle.name} loading="lazy" />
              </div>

              <div className="vehicle-meta">
                <h3>
                  {vehicle.name} 
                  <span className="spec-chip" style={{ marginLeft: '6px' }}>{vehicle.class}</span>
                </h3>
                <p>{vehicle.description}</p>
                
                <div className="specs-strip">
                  <span className="spec-chip">{vehicle.seats} Yolcu</span>
                  <span className="spec-chip">{vehicle.luggage} Valiz</span>
                  <span className="spec-chip">{vehicle.transmission}</span>
                  <span className="spec-chip">Wi-Fi & Multimedya</span>
                </div>
              </div>

              <div className="vehicle-right-action">
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Sabit Fiyat
                </span>
                <div className="vehicle-rate mono">{fareFormatted}</div>
                <button type="button" className="btn-select-chip">
                  {isSelected ? 'Seçildi' : 'Tahsis Et'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="step-nav-bar">
        <Link to="/?booking=search" className="btn-ghost" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={12} />
          <span>Rotaları Düzenle</span>
        </Link>
        <button 
          type="button" 
          className="btn-action-primary"
          id="btn-proceed-to-amenities"
          onClick={() => navigate(BOOKING_WIZARD_PATHS.amenities)}
        >
          <span>Konfor Özelliklerini Seç</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
