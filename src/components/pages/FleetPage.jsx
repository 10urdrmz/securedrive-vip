import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { Users, Briefcase, ShieldCheck, Star, ArrowRight, Zap, Check } from 'lucide-react';

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
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span className="section-badge">
          PREMIUM VIP FİLO KATALOĞU
        </span>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '12px' }}>
          Konfor ve Güvenliğin Zirvesi
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '600px', margin: '8px auto 0 auto' }}>
          En son model Mercedes-Benz VIP araç filomuz, özel tasarım deri koltuklar ve üstün konfor donanımlarıyla hizmetinizde.
        </p>

        {/* Filter Chips */}
        <div className="service-chips" style={{ justifyContent: 'center', marginTop: '24px' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
        {filtered.map(v => (
          <div key={v.id} className="fleet-item-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
              <img 
                src={v.image} 
                alt={v.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span className="preset-chip" style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(255,255,255,0.92)', fontWeight: 700 }}>
                {v.class}
              </span>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>{v.name}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                {v.description}
              </p>

              {/* Specs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                  <Users size={14} color="var(--text-muted)" />
                  <span><strong>{v.seats}</strong> Yolcu Kapasitesi</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                  <Briefcase size={14} color="var(--text-muted)" />
                  <span><strong>{v.luggage}</strong> Valiz Alanı</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                  <Zap size={14} color="var(--text-muted)" />
                  <span>{v.transmission}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                  <ShieldCheck size={14} color="#10b981" />
                  <span>D2 / TÜRSAB Yetkili</span>
                </div>
              </div>

              {/* Action */}
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Açılış Tarifesi:</span>
                  <div className="mono" style={{ fontSize: '18px', fontWeight: 800 }}>
                    {formatMoney ? formatMoney(v.baseOpeningRate) : `${v.baseOpeningRate} ₺`}
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-action-primary"
                  onClick={() => handleSelect(v)}
                  style={{ height: '38px', padding: '0 16px' }}
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
