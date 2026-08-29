import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { ArrowUpRight } from 'lucide-react';

export default function FleetShowcase() {
  const { fleet, setSelectedVehicleModal, formatMoney } = useBooking();
  const [filter, setFilter] = useState('all');

  const filteredFleet = filter === 'all' 
    ? fleet 
    : fleet.filter(v => v.category === filter);

  return (
    <section className="section-pad" id="fleet">
      <div className="container">
        <div className="section-head-mini">
          <span className="tag">FİLO VE ARAÇLAR</span>
          <h2>Her İhtiyaca Özel VIP Araç Sınıfları</h2>
        </div>

        {/* Filter Chips */}
        <div className="fleet-filter-chips">
          <button 
            type="button" 
            className={`chip-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tümü
          </button>
          <button 
            type="button" 
            className={`chip-btn ${filter === 'vip-minivan' ? 'active' : ''}`}
            onClick={() => setFilter('vip-minivan')}
          >
            VIP Minivan
          </button>
          <button 
            type="button" 
            className={`chip-btn ${filter === 'ultra-vip' ? 'active' : ''}`}
            onClick={() => setFilter('ultra-vip')}
          >
            Maybach & S-Class
          </button>
          <button 
            type="button" 
            className={`chip-btn ${filter === 'group-vip' ? 'active' : ''}`}
            onClick={() => setFilter('group-vip')}
          >
            Sprinter Heyet
          </button>
        </div>

        {/* Fleet Grid */}
        <div className="fleet-grid-3">
          {filteredFleet.map(v => (
            <div key={v.id} className="fleet-item-card">
              <div className="img-box">
                <img src={v.image} alt={v.name} loading="lazy" />
              </div>

              <div className="card-body">
                <div className="card-top">
                  <h3>{v.name}</h3>
                  <span className="spec-chip">{v.class}</span>
                </div>

                <p>{v.description}</p>

                <div className="specs-strip">
                  <span className="spec-chip">{v.seats} Yolcu</span>
                  <span className="spec-chip">{v.luggage} Valiz</span>
                  <span className="spec-chip">{v.transmission}</span>
                </div>

                <div className="card-foot">
                  <div className="rate-box">
                    <span className="rate-label">Açılış Tarifesi:</span>
                    <div className="rate-val mono">{formatMoney(v.baseOpeningRate)}</div>
                  </div>

                  <button 
                    type="button" 
                    className="btn-link"
                    onClick={() => setSelectedVehicleModal(v)}
                  >
                    <span>İncele</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
