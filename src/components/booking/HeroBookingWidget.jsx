import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { buildRouteDestinationOptions, buildRoutePickupOptions, formatRouteChipLabel } from '../../lib/routeLocation';
import { BOOKING_WIZARD_PATHS, clearSubmittedBooking, hasValidSearchDraft } from '../../lib/bookingWizard';
import { PlaneLanding, Hotel, ArrowRightLeft, Users, ArrowRight, ShieldCheck, Clock, Award, RotateCcw } from 'lucide-react';

export default function HeroBookingWidget() {
  const navigate = useNavigate();
  const {
    airports,
    destinations,
    popularRoutes,
    serviceType,
    setServiceType,
    tripType,
    setTripType,
    pickup,
    setPickup,
    destination,
    setDestination,
    datetime,
    setDatetime,
    pax,
    setPax,
    luggage,
    setLuggage,
    flightNo,
    setFlightNo,
    swapLocations,
    applyRoute
  } = useBooking();

  const [pickupOpen, setPickupOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const [paxOpen, setPaxOpen] = useState(false);

  const [pickupQuery, setPickupQuery] = useState(pickup?.name || '');
  const [destQuery, setDestQuery] = useState(destination?.name || '');

  const pickupRef = useRef(null);
  const destRef = useRef(null);
  const paxRef = useRef(null);

  useEffect(() => {
    setPickupQuery(pickup?.name || '');
  }, [pickup]);

  useEffect(() => {
    setDestQuery(destination?.name || '');
  }, [destination]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (pickupRef.current && !pickupRef.current.contains(e.target)) setPickupOpen(false);
      if (destRef.current && !destRef.current.contains(e.target)) setDestOpen(false);
      if (paxRef.current && !paxRef.current.contains(e.target)) setPaxOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableAirports = useMemo(
    () => buildRoutePickupOptions(popularRoutes, airports || []),
    [popularRoutes, airports]
  );
  const availableDestinations = useMemo(
    () => buildRouteDestinationOptions(popularRoutes, destinations || []),
    [popularRoutes, destinations]
  );

  const filteredAirports = availableAirports.filter(a =>
    a.name.toLowerCase().includes(pickupQuery.toLowerCase()) ||
    (a.city && a.city.toLowerCase().includes(pickupQuery.toLowerCase())) ||
    (a.code && a.code.toLowerCase().includes(pickupQuery.toLowerCase()))
  );

  const filteredDestinations = availableDestinations.filter(d =>
    d.name.toLowerCase().includes(destQuery.toLowerCase()) ||
    (d.city && d.city.toLowerCase().includes(destQuery.toLowerCase())) ||
    (d.district && d.district.toLowerCase().includes(destQuery.toLowerCase()))
  );

  const handleStartBooking = () => {
    if (!hasValidSearchDraft({ pickup, destination, datetime })) {
      alert('Lütfen kalkış, varış ve gelecekte bir tarih/saat seçiniz.');
      document.getElementById('booking-widget')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    clearSubmittedBooking();
    navigate(BOOKING_WIZARD_PATHS.vehicle);
  };

  return (
    <section className="hero-section" id="hero">
      <div className="container">
        
        {/* Badge */}
        <div className="hero-pill-badge">
          <div className="dot"></div>
          <span>TURSAB & D2 Lisanslı VIP Karşılama ve Transfer</span>
        </div>

        {/* Title */}
        <h1 className="hero-title">
          Havalimanından Otele Kişiselleştirilmiş VIP Araç Tahsisi
        </h1>
        <p className="hero-subtitle">
          Kalkış ve varış rotanızı, istediğiniz donanımları (bebek koltuğu, minibar, yıldız tavan) belirleyin; filomuzdan en uygun araç anında adınıza tahsis edilsin.
        </p>

        {/* Main Minimal Booking Card */}
        <div className="booking-widget-card" id="booking-widget">
          
          {/* Segmented Service Tabs */}
          <div className="booking-tabs-bar">
            <div className="service-chips">
              <button 
                type="button" 
                className={`chip-btn ${serviceType === 'transfer' ? 'active' : ''}`}
                onClick={() => setServiceType('transfer')}
              >
                Havalimanı & Otel Transferi
              </button>
              <button 
                type="button" 
                className={`chip-btn ${serviceType === 'hourly' ? 'active' : ''}`}
                onClick={() => setServiceType('hourly')}
              >
                Şoförlü Saatlik VIP Tahsis
              </button>
              <button 
                type="button" 
                className={`chip-btn ${serviceType === 'intercity' ? 'active' : ''}`}
                onClick={() => setServiceType('intercity')}
              >
                Şehirlerarası Özel VIP
              </button>
            </div>

            {serviceType !== 'hourly' && (
              <div className="trip-toggle-group">
                <button 
                  type="button" 
                  className={`trip-toggle-btn ${tripType === 'oneway' ? 'active' : ''}`}
                  onClick={() => setTripType('oneway')}
                >
                  Tek Yön
                </button>
                <button 
                  type="button" 
                  className={`trip-toggle-btn ${tripType === 'roundtrip' ? 'active' : ''}`}
                  onClick={() => setTripType('roundtrip')}
                >
                  Gidiş - Dönüş (%10 İndirim)
                </button>
              </div>
            )}
          </div>

          {/* Form Inputs Grid */}
          <div className="booking-form-grid">
            
            {/* Pickup */}
            <div className="input-block" ref={pickupRef}>
              <label className="input-label">Nereden</label>
              <div 
                className={`input-field-box ${pickupOpen ? 'active' : ''}`}
                onClick={() => setPickupOpen(true)}
              >
                <PlaneLanding size={14} color="var(--text-muted)" />
                <input 
                  type="text" 
                  value={pickupQuery}
                  onChange={(e) => {
                    setPickupQuery(e.target.value);
                    setPickupOpen(true);
                  }}
                  onFocus={() => setPickupOpen(true)}
                  placeholder="Havalimanı veya konum..."
                />
              </div>

              {/* Swap Button */}
              <button 
                type="button" 
                className="btn-swap" 
                onClick={swapLocations}
                title="Konumları Değiştir"
              >
                <ArrowRightLeft size={10} />
              </button>

              {/* Pickup Dropdown */}
              {pickupOpen && (
                <div className="autocomplete-dropdown open">
                  <div className="dropdown-header-tag">Havalimanları</div>
                  {filteredAirports.map(a => (
                    <div 
                      key={a.id} 
                      className="dropdown-option"
                      onClick={() => {
                        setPickup(a);
                        setPickupQuery(a.name);
                        setPickupOpen(false);
                      }}
                    >
                      <PlaneLanding size={13} color="var(--text-muted)" />
                      <div>
                        <div className="dropdown-option-name">{a.name}</div>
                        <div className="dropdown-option-sub">{a.city} · {a.terminal}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Destination */}
            <div className="input-block" ref={destRef}>
              <label className="input-label">Nereye</label>
              <div 
                className={`input-field-box ${destOpen ? 'active' : ''}`}
                onClick={() => setDestOpen(true)}
              >
                <Hotel size={14} color="var(--text-muted)" />
                <input 
                  type="text" 
                  value={destQuery}
                  onChange={(e) => {
                    setDestQuery(e.target.value);
                    setDestOpen(true);
                  }}
                  onFocus={() => setDestOpen(true)}
                  placeholder={serviceType === 'hourly' ? 'Tahsis Semti / Bölgesi' : 'Otel veya semt...'}
                />
              </div>

              {/* Dest Dropdown */}
              {destOpen && (
                <div className="autocomplete-dropdown open">
                  <div className="dropdown-header-tag">Lüks Oteller & Bölgeler</div>
                  {filteredDestinations.map(d => (
                    <div 
                      key={d.id} 
                      className="dropdown-option"
                      onClick={() => {
                        setDestination(d);
                        setDestQuery(d.name);
                        setDestOpen(false);
                      }}
                    >
                      <Hotel size={13} color="var(--text-muted)" />
                      <div>
                        <div className="dropdown-option-name">{d.name}</div>
                        <div className="dropdown-option-sub">{d.city} ({d.district})</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Datetime */}
            <div className="input-block">
              <label className="input-label">Tarih & Saat</label>
              <div className="input-field-box">
                <input 
                  type="datetime-local" 
                  value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                />
              </div>
            </div>

            {/* Pax & Luggage Popover */}
            <div className="input-block" ref={paxRef}>
              <label className="input-label">Yolcu / Bagaj</label>
              <div 
                className="input-field-box"
                onClick={() => setPaxOpen(!paxOpen)}
              >
                <Users size={14} color="var(--text-muted)" />
                <input 
                  type="text" 
                  readOnly 
                  value={`${pax} Yolcu, ${luggage} Bagaj`}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              {paxOpen && (
                <div className="autocomplete-dropdown open" style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>Yolcu Sayısı</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        type="button" 
                        className="chip-btn" 
                        style={{ padding: '2px 8px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPax(Math.max(1, pax - 1));
                        }}
                      >
                        -
                      </button>
                      <span className="mono" style={{ fontWeight: 600 }}>{pax}</span>
                      <button 
                        type="button" 
                        className="chip-btn" 
                        style={{ padding: '2px 8px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPax(Math.min(14, pax + 1));
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>Büyük Bagaj</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        type="button" 
                        className="chip-btn" 
                        style={{ padding: '2px 8px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLuggage(Math.max(0, luggage - 1));
                        }}
                      >
                        -
                      </button>
                      <span className="mono" style={{ fontWeight: 600 }}>{luggage}</span>
                      <button 
                        type="button" 
                        className="chip-btn" 
                        style={{ padding: '2px 8px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLuggage(Math.min(14, luggage + 1));
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Flight No */}
            <div className="input-block">
              <label className="input-label">Uçuş No (Radar)</label>
              <div className="input-field-box">
                <input 
                  type="text" 
                  value={flightNo} 
                  onChange={(e) => setFlightNo(e.target.value)}
                  placeholder="TK1984" 
                />
              </div>
            </div>

            {/* Submit Action */}
            <button 
              type="button" 
              className="btn-submit-search"
              onClick={handleStartBooking}
              id="btn-start-booking"
            >
              <span>Araçları Listele</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Quick Preset Pills */}
          <div className="quick-preset-bar">
            <span className="quick-label">Hızlı Seçim:</span>
            {popularRoutes.length > 0 ? (
              popularRoutes.map((route) => (
                <button
                  key={route.id}
                  type="button"
                  className="preset-chip"
                  onClick={() => applyRoute(route)}
                  title={route.badge ? `${route.badge} · ${route.distanceKm} km` : undefined}
                >
                  {formatRouteChipLabel(route)}
                </button>
              ))
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Henüz rota tanımlanmadı</span>
            )}
          </div>
        </div>

        {/* Minimal Trust Strip */}
        <div className="trust-strip">
          <div className="trust-cell">
            <div className="trust-cell-dot"></div>
            <div>
              <h4>%100 Sabit Fiyat Garantisi</h4>
              <p>Sürpriz otoyol veya köprü ücreti yok</p>
            </div>
          </div>
          <div className="trust-cell">
            <div className="trust-cell-dot"></div>
            <div>
              <h4>Canlı Radar Uçuş Takibi</h4>
              <p>Rötarlarda 60 dk ücretsiz bekleme</p>
            </div>
          </div>
          <div className="trust-cell">
            <div className="trust-cell-dot"></div>
            <div>
              <h4>Lisanslı VIP Şoförler</h4>
              <p>Protokol eğitimli, takım elbiseli</p>
            </div>
          </div>
          <div className="trust-cell">
            <div className="trust-cell-dot"></div>
            <div>
              <h4>Ücretsiz İptal & İade</h4>
              <p>24 saate kadar %100 kesintisiz iade</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
