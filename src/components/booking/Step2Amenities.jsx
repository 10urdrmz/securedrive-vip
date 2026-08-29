import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { BOOKING_WIZARD_PATHS } from '../../lib/bookingWizard';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

export default function Step2Amenities() {
  const navigate = useNavigate();
  const {
    amenitiesList,
    selectedAmenities,
    toggleAmenity,
    updateAmenityCount,
    formatMoney
  } = useBooking();

  return (
    <div>
      <div style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Araç ve Donanım Özellik Seçimleri</h2>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          İstediğiniz ek özellikleri ekleyin; aracınız bu konfigürasyonda adınıza tahsis edilir.
        </p>
      </div>

      {/* Grid of Amenities */}
      <div className="amenities-container-grid">
        {amenitiesList.map(am => {
          const current = selectedAmenities[am.id] || { selected: false, count: 0 };
          const isChecked = current.selected || am.checkedByDefault;

          return (
            <div 
              key={am.id}
              className={`amenity-minimal-row ${isChecked ? 'checked' : ''}`}
              onClick={() => toggleAmenity(am.id)}
            >
              <div className="amenity-checkbox-dot">
                {isChecked && <Check size={11} strokeWidth={3} />}
              </div>

              <div className="amenity-body">
                <div className="amenity-head">
                  <strong>{am.title}</strong>
                  {am.isFree ? (
                    <span className="amenity-badge free">Dahil</span>
                  ) : (
                    <span className="amenity-badge mono">+{formatMoney(am.priceTRY)}</span>
                  )}
                </div>

                <p>{am.subtitle}</p>

                {am.hasCount && (
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      type="button" 
                      className="chip-btn" 
                      style={{ padding: '1px 6px' }}
                      onClick={() => updateAmenityCount(am.id, (current.count || 0) - 1)}
                    >
                      -
                    </button>
                    <span className="mono" style={{ fontSize: '11px', fontWeight: 700, padding: '0 4px' }}>
                      {current.count || 1} Adet
                    </span>
                    <button 
                      type="button" 
                      className="chip-btn" 
                      style={{ padding: '1px 6px' }}
                      onClick={() => updateAmenityCount(am.id, (current.count || 0) + 1)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Bar */}
      <div className="step-nav-bar">
        <button 
          type="button" 
          className="btn-ghost"
          onClick={() => navigate(BOOKING_WIZARD_PATHS.vehicle)}
        >
          <ArrowLeft size={12} />
          <span>Araç Seçimine Dön</span>
        </button>

        <button 
          type="button" 
          className="btn-action-primary"
          id="btn-proceed-to-passenger"
          onClick={() => navigate(BOOKING_WIZARD_PATHS.passenger)}
        >
          <span>Yolcu & Ödeme Bilgileri</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
