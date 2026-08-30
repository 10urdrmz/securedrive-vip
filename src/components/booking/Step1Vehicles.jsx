import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { BOOKING_WIZARD_PATHS } from '../../lib/bookingWizard';
import { 
  Users, 
  Briefcase, 
  ShieldCheck, 
  Wifi, 
  Tv, 
  Check, 
  ChevronRight, 
  Sparkles, 
  Zap 
} from 'lucide-react';

export default function Step1Vehicles() {
  const navigate = useNavigate();
  const {
    fleet,
    selectedVehicleId,
    setSelectedVehicleId,
    distanceKm,
    tripType,
    formatMoney
  } = useBooking();

  const [activeCategory, setActiveCategory] = useState('ALL');

  const categories = [
    { id: 'ALL', label: 'Tüm VIP Araçlar' },
    { id: 'MINIVAN', label: 'VIP Minivan (Vito)' },
    { id: 'SEDAN', label: 'Lüks Sedan (Maybach / S-Class)' },
    { id: 'SPRINTER', label: 'VIP Sprinter (Grup)' }
  ];

  const filteredFleet = fleet.filter((v) => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'MINIVAN') return (v.class || '').toLowerCase().includes('vito') || (v.class || '').toLowerCase().includes('minivan') || (v.name || '').toLowerCase().includes('vito');
    if (activeCategory === 'SEDAN') return (v.class || '').toLowerCase().includes('sedan') || (v.name || '').toLowerCase().includes('maybach') || (v.name || '').toLowerCase().includes('s-class') || (v.name || '').toLowerCase().includes('e-class');
    if (activeCategory === 'SPRINTER') return (v.class || '').toLowerCase().includes('sprinter') || (v.name || '').toLowerCase().includes('sprinter');
    return true;
  });

  const handleSelectVehicle = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    navigate(BOOKING_WIZARD_PATHS.amenities);
  };

  return (
    <div className="sky-step-root">
      {/* Category Filter Pills (Skyscanner Style) */}
      <div className="sky-filter-chips">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`sky-filter-chip ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Vehicle Result Cards List */}
      <div className="sky-vehicle-cards">
        {filteredFleet.map((vehicle) => {
          const isSelected = vehicle.id === selectedVehicleId;
          const baseFare = vehicle.baseOpeningRate + (distanceKm * vehicle.baseRateKm);
          const fareFormatted = formatMoney(tripType === 'roundtrip' ? baseFare * 1.85 : baseFare);

          return (
            <div
              key={vehicle.id}
              className={`sky-vehicle-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelectVehicle(vehicle.id)}
            >
              {/* Top Row: Class & Highlights */}
              <div className="sky-vehicle-card__top">
                <div className="sky-vehicle-title-wrap">
                  <h3 className="sky-vehicle-name">{vehicle.name}</h3>
                  <span className="sky-vehicle-class-tag">{vehicle.class || 'VIP Class'}</span>
                </div>
                {vehicle.name.includes('Maybach') && (
                  <span className="sky-badge-special">
                    <Sparkles size={11} />
                    <span>Özel Seri</span>
                  </span>
                )}
              </div>

              {/* Middle Grid: Photo & Specs */}
              <div className="sky-vehicle-card__body">
                <div className="sky-vehicle-image-wrap">
                  <img src={vehicle.image} alt={vehicle.name} loading="lazy" />
                </div>

                <div className="sky-vehicle-details">
                  <p className="sky-vehicle-desc">{vehicle.description}</p>

                  <div className="sky-vehicle-specs-grid">
                    <div className="sky-spec-item">
                      <Users size={13} />
                      <span>{vehicle.seats} Yolcu</span>
                    </div>
                    <div className="sky-spec-item">
                      <Briefcase size={13} />
                      <span>{vehicle.luggage} Valiz</span>
                    </div>
                    <div className="sky-spec-item">
                      <Wifi size={13} />
                      <span>5G Wi-Fi</span>
                    </div>
                    <div className="sky-spec-item">
                      <Zap size={13} />
                      <span>Deri Koltuk</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Fixed Price & CTA */}
              <div className="sky-vehicle-card__footer">
                <div>
                  <span className="sky-price-label">Sabit Her Şey Dahil Fiyat</span>
                  <div className="sky-price-val">{fareFormatted}</div>
                </div>

                <button
                  type="button"
                  className={`sky-select-btn ${isSelected ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectVehicle(vehicle.id);
                  }}
                >
                  <span>{isSelected ? 'Seçildi' : 'Aracı Seç'}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
