import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { BOOKING_WIZARD_PATHS } from '../../lib/bookingWizard';
import { ArrowRight, ArrowLeft, Check, Sparkles, ShieldCheck } from 'lucide-react';

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
    <div className="sky-step-root">
      <div className="sky-step-header-box">
        <h2 className="sky-step-title">VIP Donanım & Ekstra Hizmetler</h2>
        <p className="sky-step-sub">
          İstediğiniz özellikleri seçin; aracınız bu özel donanımlarla adınıza hazırlanır.
        </p>
      </div>

      {/* Grid of Amenities Cards */}
      <div className="sky-amenities-grid">
        {amenitiesList.map((am) => {
          const current = selectedAmenities[am.id] || { selected: false, count: 0 };
          const isChecked = current.selected || am.checkedByDefault;

          return (
            <div
              key={am.id}
              className={`sky-amenity-card ${isChecked ? 'active' : ''}`}
              onClick={() => toggleAmenity(am.id)}
            >
              <div className="sky-amenity-checkbox">
                {isChecked && <Check size={13} strokeWidth={3} />}
              </div>

              <div className="sky-amenity-info">
                <div className="sky-amenity-title-row">
                  <strong className="sky-amenity-title">{am.title}</strong>
                  {am.isFree ? (
                    <span className="sky-amenity-tag free">Dahil</span>
                  ) : (
                    <span className="sky-amenity-tag price">+{formatMoney(am.priceTRY)}</span>
                  )}
                </div>

                <p className="sky-amenity-desc">{am.subtitle}</p>

                {am.hasCount && (
                  <div
                    className="sky-counter-wrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => updateAmenityCount(am.id, (current.count || 0) - 1)}
                    >
                      -
                    </button>
                    <b>{current.count || 1} Adet</b>
                    <button
                      type="button"
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

      {/* Navigation Footer */}
      <div className="sky-step-actions-bar">
        <button
          type="button"
          className="sky-btn-back"
          onClick={() => navigate(BOOKING_WIZARD_PATHS.vehicle)}
        >
          <ArrowLeft size={16} />
          <span>Araç Değiştir</span>
        </button>

        <button
          type="button"
          className="sky-btn-next"
          onClick={() => navigate(BOOKING_WIZARD_PATHS.passenger)}
        >
          <span>Yolcu Bilgilerine Geç</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
