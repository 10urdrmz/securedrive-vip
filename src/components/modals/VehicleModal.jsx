import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { BOOKING_WIZARD_PATHS, hasValidSearchDraft } from '../../lib/bookingWizard';
import { X, Check } from 'lucide-react';

export default function VehicleModal() {
  const navigate = useNavigate();
  const {
    selectedVehicleModal,
    setSelectedVehicleModal,
    setSelectedVehicleId,
    pickup,
    destination,
    datetime,
    formatMoney
  } = useBooking();

  if (!selectedVehicleModal) return null;
  const v = selectedVehicleModal;

  const handleSelectCar = () => {
    setSelectedVehicleId(v.id);
    setSelectedVehicleModal(null);

    if (hasValidSearchDraft({ pickup, destination, datetime })) {
      navigate(BOOKING_WIZARD_PATHS.vehicle);
      return;
    }

    navigate('/?booking=search');
  };

  return (
    <div className="modal-backdrop" onClick={() => setSelectedVehicleModal(null)}>
      <div className="modal-sheet" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Close */}
        <button 
          type="button" 
          className="modal-close" 
          onClick={() => setSelectedVehicleModal(null)}
        >
          <X size={14} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              {v.class}
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{v.name}</h3>
          </div>
          <span className="preset-chip">{v.badge}</span>
        </div>

        {/* Main Image */}
        <div style={{ width: '100%', height: '240px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '12px' }}>
          <img src={v.image} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
          {v.description}
        </p>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
          <div className="stat-cell">
            <div className="stat-label">Yolcu</div>
            <div className="stat-val">{v.seats} Pax</div>
          </div>
          <div className="stat-cell">
            <div className="stat-label">Valiz</div>
            <div className="stat-val">{v.luggage} Bag</div>
          </div>
          <div className="stat-cell">
            <div className="stat-label">Motor & Güç</div>
            <div className="stat-val">{v.specs?.engine?.split(' ')[0]}</div>
          </div>
        </div>

        {/* Features list */}
        {v.features && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>VIP Donanımlar:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {v.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  <Check size={12} color="var(--accent-green)" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
          <span className="mono" style={{ fontSize: '16px', fontWeight: 700 }}>
            {formatMoney(v.baseOpeningRate)} + {formatMoney(v.baseRateKm)}/KM
          </span>
          <button 
            type="button" 
            className="btn-action-primary" 
            onClick={handleSelectCar}
          >
            Bu Aracı Tahsis Et
          </button>
        </div>

      </div>
    </div>
  );
}
