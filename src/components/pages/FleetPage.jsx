import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { Users, Briefcase, ShieldCheck, Star, ArrowRight, Zap, Check } from 'lucide-react';
import './FleetPage.css';

export default function FleetPage({ onBookVehicle }) {
  const { fleet, setSelectedVehicle, setIsWizardExpanded, formatMoney } = useBooking();
  const [filterClass, setFilterClass] = useState('all');

  const categories = [
    { id: 'all', label: 'Tüm VIP Araçlar' },
    { id: 'minivan', label: 'VIP Minivan (Vito & V-Class)' },
    { id: 'sedan', label: 'Executive Sedan (S-Class)' },
    { id: 'sprinter', label: 'VIP Minibüs (Sprinter)' }
  ];

  const filtered = (fleet || []).filter(v => {
    if (filterClass === 'all') return true;
    if (filterClass === 'minivan') return v.id.includes('vito') || v.id.includes('v-class');
    if (filterClass === 'sedan') return v.id.includes('s-class');
    if (filterClass === 'sprinter') return v.id.includes('sprinter');
    return true;
  });

  const handleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsWizardExpanded(true);
    window.location.hash = '#wizard-section';
  };

  return (
    <div className="fleet-page-container">
      {/* Header */}
      <div className="fleet-page-header">
        <span className="section-badge">
          PREMIUM VIP FİLO KATALOĞU
        </span>
        <h1 className="fleet-page-title">
          Konfor ve Güvenliğin Zirvesi
        </h1>
        <p className="fleet-page-subtitle">
          En son model Mercedes-Benz VIP araç filomuz, özel tasarım deri koltuklar ve üstün konfor donanımlarıyla hizmetinizde.
        </p>

        {/* Filter Chips */}
        <div className="service-chips fleet-filters">
          {categories.map(c => (
            <button
              key={c.id}
              type="button"
              className={`chip-btn ${filterClass === c.id ? 'active' : ''}`}
              onClick={() => setFilterClass(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="fleet-grid">
        {filtered.map(v => (
          <div key={v.id} className="fleet-card">
            <div className="fleet-card-image-wrap">
              <img 
                src={v.image} 
                alt={v.name} 
                className="fleet-card-image"
              />
              <span className="preset-chip fleet-card-badge">
                {v.class}
              </span>
            </div>

            <div className="fleet-card-content">
              <h3 className="fleet-card-title">{v.name}</h3>
              <p className="fleet-card-desc">
                {v.description}
              </p>

              {/* Specs */}
              <div className="fleet-card-specs">
                <div className="spec-item">
                  <Users size={14} className="spec-icon" />
                  <span><strong>{v.seats}</strong> Yolcu Kapasitesi</span>
                </div>
                <div className="spec-item">
                  <Briefcase size={14} className="spec-icon" />
                  <span><strong>{v.luggage}</strong> Valiz Alanı</span>
                </div>
                <div className="spec-item">
                  <Zap size={14} className="spec-icon" />
                  <span>{v.transmission}</span>
                </div>
                <div className="spec-item">
                  <ShieldCheck size={14} className="spec-icon-accent" />
                  <span>D2 / TÜRSAB Yetkili</span>
                </div>
              </div>

              {/* Action */}
              <div className="fleet-card-footer">
                <div className="fleet-card-price-wrap">
                  <span className="fleet-card-price-label">Açılış Tarifesi:</span>
                  <div className="mono fleet-card-price">
                    {formatMoney ? formatMoney(v.baseOpeningRate) : `${v.baseOpeningRate} ₺`}
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-action-primary fleet-card-btn"
                  onClick={() => handleSelect(v)}
                >
                  <span>Tahsis Planla</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
