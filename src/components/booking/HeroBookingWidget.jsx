import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { buildRouteDestinationOptions, buildRoutePickupOptions } from '../../lib/routeLocation';
import { clearSubmittedBooking } from '../../lib/bookingWizard';
import confetti from 'canvas-confetti';
import { 
  Plane, 
  Hotel, 
  Car, 
  Radar, 
  ChevronRight, 
  ChevronLeft,
  Calendar, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  X,
  Search,
  Briefcase,
  Wifi,
  Lock,
  CreditCard,
  Banknote,
  Baby,
  Wine,
  Languages,
  Clock,
  CheckCircle2,
  Gauge
} from 'lucide-react';

export default function HeroBookingWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    airports,
    destinations,
    popularRoutes,
    fleet,
    selectedVehicleId,
    setSelectedVehicleId,
    amenitiesList,
    selectedAmenities,
    toggleAmenity,
    passenger,
    setPassenger,
    completeReservation,
    confirmedBooking,
    calculatePrices,
    formatMoney,
    serviceType,
    setServiceType,
    tripType,
    setTripType,
    pickup,
    setPickup,
    destination,
    setDestination,
    datetime,
    setDatetime
  } = useBooking();

  // In-place booking modal step: 'VEHICLES' | 'AMENITIES' | 'PASSENGER' | 'CONFIRMATION'
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState('VEHICLES');
  const [vehicleFilter, setVehicleFilter] = useState('ALL');
  const [pickupOpen, setPickupOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const [pickupQuery, setPickupQuery] = useState(pickup?.name || '');
  const [destQuery, setDestQuery] = useState(destination?.name || '');
  const [submitting, setSubmitting] = useState(false);

  const prices = calculatePrices();

  // Set default datetime if empty
  useEffect(() => {
    if (!datetime) {
      const now = new Date();
      now.setDate(now.getDate() + 1);
      now.setHours(12, 0, 0, 0);
      setDatetime(now.toISOString().slice(0, 16));
    }
  }, [datetime, setDatetime]);

  // Pre-fill user profile if logged in
  useEffect(() => {
    if (user && modalStep === 'PASSENGER') {
      const parts = (user.full_name || '').trim().split(/\s+/);
      setPassenger((prev) => ({
        ...prev,
        name: prev.name && prev.name.trim() !== '' ? prev.name : (parts[0] || ''),
        surname: prev.surname && prev.surname.trim() !== '' ? prev.surname : (parts.slice(1).join(' ') || ''),
        email: prev.email && prev.email.trim() !== '' ? prev.email : (user.email || ''),
        phone: prev.phone && prev.phone.trim() !== '' ? prev.phone : (user.phone || '')
      }));
    }
  }, [user, modalStep, setPassenger]);

  const availableAirports = useMemo(
    () => buildRoutePickupOptions(popularRoutes, airports || []),
    [popularRoutes, airports]
  );
  const availableDestinations = useMemo(
    () => buildRouteDestinationOptions(popularRoutes, destinations || []),
    [popularRoutes, destinations]
  );

  const filteredAirports = availableAirports.filter((a) =>
    a.name.toLowerCase().includes(pickupQuery.toLowerCase()) ||
    (a.city && a.city.toLowerCase().includes(pickupQuery.toLowerCase())) ||
    (a.code && a.code.toLowerCase().includes(pickupQuery.toLowerCase()))
  );

  const filteredDestinations = availableDestinations.filter((d) =>
    d.name.toLowerCase().includes(destQuery.toLowerCase()) ||
    (d.city && d.city.toLowerCase().includes(destQuery.toLowerCase())) ||
    (d.district && d.district.toLowerCase().includes(destQuery.toLowerCase()))
  );

  // Filter out any invalid / broken entries and apply category filter
  const validFleet = fleet.filter((v) => v && v.id && v.name);
  const filteredFleet = validFleet.filter((v) => {
    if (vehicleFilter === 'ALL') return true;
    if (vehicleFilter === 'MINIVAN') return (v.class || '').toLowerCase().includes('vito') || (v.class || '').toLowerCase().includes('minivan');
    if (vehicleFilter === 'SEDAN') return (v.class || '').toLowerCase().includes('sedan') || (v.name || '').toLowerCase().includes('maybach') || (v.name || '').toLowerCase().includes('s-class');
    if (vehicleFilter === 'SPRINTER') return (v.class || '').toLowerCase().includes('sprinter') || (v.name || '').toLowerCase().includes('heyet');
    return true;
  });

  const selectedVehicleObj = validFleet.find((v) => v.id === selectedVehicleId) || validFleet[0] || {
    id: 'vito-vip',
    name: 'Mercedes-Benz Vito VIP Lounge',
    class: 'VIP Minivan',
    seats: 6,
    luggage: 6,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    baseOpeningRate: 1200,
    baseRateKm: 32
  };

  const handleStartSearch = (e) => {
    if (e) e.preventDefault();
    if (!pickup) {
      const defaultP = availableAirports[0] || { id: 'IST', name: 'İstanbul Havalimanı (IST)' };
      setPickup(defaultP);
      setPickupQuery(defaultP.name);
    }
    if (!destination) {
      const defaultD = availableDestinations[0] || { id: 'CIRAGAN', name: 'Çırağan Palace Kempinski' };
      setDestination(defaultD);
      setDestQuery(defaultD.name);
    }

    clearSubmittedBooking();
    setModalStep('LOADING');
    setBookingModalOpen(true);

    // Smooth transition from Vito loading animation to vehicle selection
    setTimeout(() => {
      setModalStep('VEHICLES');
    }, 1400);
  };

  const handleSelectVehicle = (vId) => {
    setSelectedVehicleId(vId);
    // Smoothly progress to extras
    setModalStep('AMENITIES');
  };

  // Multi-Wave Grand Celebration Fireworks & Confetti Explosion
  const triggerCelebrationExplosion = () => {
    try {
      const count = 200;
      const defaults = {
        origin: { y: 0.6 },
        zIndex: 9999999,
        colors: ['#144c7f', '#2563eb', '#f59e0b', '#10b981', '#ffffff', '#ffd700', '#ec4899']
      };

      function fire(particleRatio, opts) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      }

      // Wave 1: Immediate massive center burst
      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });

      // Wave 2: Left & Right Stage Cannons
      setTimeout(() => {
        confetti({
          particleCount: 90,
          angle: 60,
          spread: 80,
          origin: { x: 0.1, y: 0.7 },
          zIndex: 9999999,
          colors: ['#144c7f', '#ffd700', '#10b981', '#3b82f6']
        });
        confetti({
          particleCount: 90,
          angle: 120,
          spread: 80,
          origin: { x: 0.9, y: 0.7 },
          zIndex: 9999999,
          colors: ['#144c7f', '#ffd700', '#10b981', '#3b82f6']
        });
      }, 250);

      // Wave 3: Luxury gold & diamond sparkles shower
      const end = Date.now() + 2.5 * 1000;
      const interval = setInterval(() => {
        if (Date.now() > end) {
          return clearInterval(interval);
        }
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
          zIndex: 9999999,
          colors: ['#144c7f', '#f59e0b', '#10b981', '#38bdf8', '#fbbf24']
        });
      }, 200);
    } catch (err) {
      console.warn('Confetti notice:', err);
    }
  };

  // Trigger celebration whenever confirmation step is mounted
  useEffect(() => {
    if (modalStep === 'CONFIRMATION') {
      triggerCelebrationExplosion();
    }
  }, [modalStep]);

  const handleConfirmReservation = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!passenger.name.trim() || !passenger.surname.trim() || !passenger.phone.trim()) {
      alert('Lütfen ad, soyad ve telefon numaranızı eksiksiz giriniz.');
      return;
    }

    setSubmitting(true);
    try {
      const booking = await completeReservation();
      if (!booking?.code) {
        alert('Rezervasyon oluşturulamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.');
        return;
      }

      setModalStep('CONFIRMATION');
      triggerCelebrationExplosion();
    } catch (err) {
      console.error(err);
      alert('İşlem sırasında bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  // Safe fallback vehicle images
  const getVehicleImg = (v) => {
    if (v.image && v.image.startsWith('http')) return v.image;
    if (v.image && v.image.startsWith('/')) return v.image;
    if ((v.name || '').toLowerCase().includes('vito')) return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
    if ((v.name || '').toLowerCase().includes('maybach') || (v.name || '').toLowerCase().includes('v-class')) return 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80';
    if ((v.name || '').toLowerCase().includes('s-class')) return 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80';
    if ((v.name || '').toLowerCase().includes('sprinter')) return 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80';
    return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
  };

  // Separate free included perks vs paid optional add-ons
  const freePerks = [
    { title: 'Canlı Radar Uçuş Takibi', desc: 'Erken iniş veya rötarda 60 dk ücretsiz bekleme' },
    { title: 'Sınırsız 5G Wi-Fi & Medya', desc: 'Apple TV, Netflix ve hızlı internet erişimi' },
    { title: 'İsimli Tabletle VIP Karşılama', desc: 'Gümrük kapısında karşılama ve bagaj asistanlığı' }
  ];

  const paidAmenities = amenitiesList.filter((a) => !a.isFree);

  return (
    <div className="car-theme-root">
      {/* Hero Section */}
      <section className="car-hero-section">
        <div className="car-hero-bg">
          <div className="car-hero-overlay"></div>
        </div>

        <div className="car-container car-hero-container">
          <div className="car-hero-content">
            {/* Tagline Badge */}
            <div className="car-hero-badge">
              <Sparkles size={14} color="#144c7f" />
              <span>D2 Lisanslı Protokol Şoförleri • %100 Sabit Fiyat Garantisi</span>
            </div>

            {/* Main Headline */}
            <h1 className="car-hero-title">
              Lüks VIP Transfer & <span>Şoförlü Araç</span>
            </h1>
            <p className="car-hero-desc">
              Havalimanı VIP karşılama, tahsisli protokol şoförü ve lüks şehirlerarası transfer hizmetlerinde Türkiye'nin lider platformu.
            </p>

            {/* Quick Specs Badges */}
            <div className="car-hero-specs-row">
              <div className="car-spec-pill">
                <div className="car-spec-icon-box">
                  <Car size={16} color="#ffffff" />
                </div>
                <span>Mercedes-Benz VIP Filo</span>
              </div>

              <div className="car-spec-pill">
                <div className="car-spec-icon-box">
                  <Gauge size={16} color="#ffffff" />
                </div>
                <span>60 Dk Ücretsiz Rötar Bekleme</span>
              </div>

              <div className="car-spec-pill">
                <div className="car-spec-icon-box">
                  <ShieldCheck size={16} color="#ffffff" />
                </div>
                <span>T.C. Ulaştırma Bakanlığı Belgeli</span>
              </div>
            </div>
          </div>

          {/* Clean Floating Search & Filter Bar */}
          <div className="car-filter-box">
            {/* Tabs */}
            <div className="car-tabs-row">
              <button
                type="button"
                className={`car-tab-btn ${serviceType === 'transfer' ? 'active' : ''}`}
                onClick={() => setServiceType('transfer')}
              >
                <Plane size={15} />
                <span>Havalimanı VIP Transfer</span>
              </button>
              <button
                type="button"
                className={`car-tab-btn ${serviceType === 'chauffeur' ? 'active' : ''}`}
                onClick={() => setServiceType('chauffeur')}
              >
                <Car size={15} />
                <span>Özel Şoförlü Tahsis</span>
              </button>
              <div className="car-trip-type-switch">
                <button
                  type="button"
                  className={`car-type-pill ${tripType === 'oneway' ? 'active' : ''}`}
                  onClick={() => setTripType('oneway')}
                >
                  Tek Yön
                </button>
                <button
                  type="button"
                  className={`car-type-pill ${tripType === 'roundtrip' ? 'active' : ''}`}
                  onClick={() => setTripType('roundtrip')}
                >
                  Gidiş-Dönüş
                </button>
              </div>
            </div>

            {/* Search Inputs Grid */}
            <form onSubmit={handleStartSearch} className="car-search-grid">
              {/* Pickup Location */}
              <div className="car-input-field" onClick={() => { setPickupOpen(true); setDestOpen(false); }}>
                <label>KALKIŞ NOKTASI</label>
                <div className="car-input-inner">
                  <Plane size={16} color="#144c7f" />
                  <input
                    type="text"
                    value={pickupQuery}
                    onChange={(e) => { setPickupQuery(e.target.value); setPickupOpen(true); }}
                    placeholder="Havalimanı veya Adres..."
                  />
                </div>

                {pickupOpen && (
                  <div className="car-autocomplete-dropdown" onClick={(e) => e.stopPropagation()}>
                    {filteredAirports.map((a) => (
                      <div
                        key={a.id}
                        className="car-dropdown-item"
                        onClick={() => {
                          setPickup(a);
                          setPickupQuery(a.name);
                          setPickupOpen(false);
                          setDestOpen(true);
                        }}
                      >
                        <Plane size={14} color="#144c7f" />
                        <div>
                          <strong>{a.name}</strong>
                          <small>{a.city} · VIP Terminal</small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Destination Location */}
              <div className="car-input-field" onClick={() => { setDestOpen(true); setPickupOpen(false); }}>
                <label>VARIŞ NOKTASI</label>
                <div className="car-input-inner">
                  <Hotel size={16} color="#198754" />
                  <input
                    type="text"
                    value={destQuery}
                    onChange={(e) => { setDestQuery(e.target.value); setDestOpen(true); }}
                    placeholder="Otel, Marina veya Semt..."
                  />
                </div>

                {destOpen && (
                  <div className="car-autocomplete-dropdown" onClick={(e) => e.stopPropagation()}>
                    {filteredDestinations.map((d) => (
                      <div
                        key={d.id}
                        className="car-dropdown-item"
                        onClick={() => {
                          setDestination(d);
                          setDestQuery(d.name);
                          setDestOpen(false);
                        }}
                      >
                        <Hotel size={14} color="#198754" />
                        <div>
                          <strong>{d.name}</strong>
                          <small>{d.district ? `${d.district}, ${d.city}` : d.city}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transfer Datetime */}
              <div className="car-input-field">
                <label>TARİH VE SAAT</label>
                <div className="car-input-inner">
                  <Calendar size={16} color="#696665" />
                  <input
                    type="datetime-local"
                    value={datetime}
                    onChange={(e) => setDatetime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="car-search-btn">
                <Search size={16} strokeWidth={2.5} />
                <span>VIP Araç Bul</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Recommended Vehicles Section (CarCard Grid) */}
      <section className="car-section-pad" id="inventory">
        <div className="car-container">
          <div className="car-section-header">
            <div>
              <span className="car-section-sub">LÜKS ARAÇ FİLOMUZ</span>
              <h2 className="car-section-title">En Çok Tercih Edilen VIP Araçlar</h2>
            </div>

            {/* Filter Pills */}
            <div className="car-filter-pills">
              {[
                { id: 'ALL', label: 'Tüm Filo' },
                { id: 'MINIVAN', label: 'VIP Minivan' },
                { id: 'SEDAN', label: 'Lüks Sedan' },
                { id: 'SPRINTER', label: 'VIP Sprinter' }
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`car-filter-pill ${vehicleFilter === c.id ? 'active' : ''}`}
                  onClick={() => setVehicleFilter(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cars Grid */}
          <div className="car-grid-3">
            {filteredFleet.map((car) => {
              const baseFare = (car.baseOpeningRate || 1200) + (35 * (car.baseRateKm || 32));
              const fareFormatted = formatMoney(baseFare);
              const carImg = getVehicleImg(car);

              return (
                <div key={car.id} className="car-card-box">
                  {/* Top Image & Badges */}
                  <div className="car-card-img-wrap">
                    <img src={carImg} alt={car.name} loading="lazy" />
                    <div className="car-badge-overlay">
                      <span className="flag-tag flag-tag-orange">VIP Tahsis</span>
                      <span className="flag-tag flag-tag-dark">{car.class}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="car-card-body">
                    <h3 className="car-card-title">{car.name}</h3>
                    <p className="car-card-desc">Özel şoförlü VIP transfer, deri koltuk ve ücretsiz ikramlar.</p>

                    {/* Specs Row */}
                    <div className="car-card-specs">
                      <div className="car-spec-item">
                        <Users size={14} color="#144c7f" />
                        <span>{car.seats} Kişi</span>
                      </div>
                      <div className="car-spec-item">
                        <Briefcase size={14} color="#144c7f" />
                        <span>{car.luggage} Bagaj</span>
                      </div>
                      <div className="car-spec-item">
                        <Wifi size={14} color="#144c7f" />
                        <span>5G Wi-Fi</span>
                      </div>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="car-card-footer">
                      <div>
                        <span className="car-price-sub">Sabit Fiyat:</span>
                        <strong className="car-price-val">{fareFormatted}</strong>
                      </div>
                      <button
                        type="button"
                        className="car-action-btn"
                        onClick={() => {
                          setSelectedVehicleId(car.id);
                          setModalStep('AMENITIES');
                          setBookingModalOpen(true);
                        }}
                      >
                        <span>Hemen Seç</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          NATIVE iOS & MOBILE-OPTIMIZED IN-PLACE BOOKING MODAL
         ========================================================================= */}
      {bookingModalOpen && (
        <div className="car-modal-backdrop" onClick={() => setBookingModalOpen(false)}>
          <div className="car-modal-box" onClick={(e) => e.stopPropagation()}>
            {/* iOS Mobile Drag Handle Indicator */}
            <div className="car-modal-drag-handle"></div>

            {/* Modal Header */}
            <div className="car-modal-header">
              <div className="car-modal-header-left">
                {modalStep !== 'LOADING' && modalStep !== 'VEHICLES' && modalStep !== 'CONFIRMATION' && (
                  <button
                    type="button"
                    className="car-modal-back-btn"
                    onClick={() => {
                      if (modalStep === 'AMENITIES') setModalStep('VEHICLES');
                      else if (modalStep === 'PASSENGER') setModalStep('AMENITIES');
                    }}
                    aria-label="Geri"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <div>
                  <h3 className="car-modal-title">
                    {modalStep === 'LOADING' && 'VIP Müsaitlik Taranıyor...'}
                    {modalStep === 'VEHICLES' && 'Araç Seçimi (1/3)'}
                    {modalStep === 'AMENITIES' && 'Donanım & Ekstralar (2/3)'}
                    {modalStep === 'PASSENGER' && 'Yolcu & Ödeme (3/3)'}
                    {modalStep === 'CONFIRMATION' && 'Rezervasyon Onayı'}
                  </h3>
                  {modalStep !== 'CONFIRMATION' && modalStep !== 'LOADING' && (
                    <div className="car-modal-step-dots">
                      <span className={`step-dot ${modalStep === 'VEHICLES' || modalStep === 'AMENITIES' || modalStep === 'PASSENGER' ? 'active' : ''}`} />
                      <span className={`step-dot ${modalStep === 'AMENITIES' || modalStep === 'PASSENGER' ? 'active' : ''}`} />
                      <span className={`step-dot ${modalStep === 'PASSENGER' ? 'active' : ''}`} />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="car-modal-close"
                onClick={() => setBookingModalOpen(false)}
                aria-label="Kapat"
              >
                <X size={18} />
              </button>
            </div>

            {/* STEP 0: VITO ANIMATED LOADING TRANSIT SCREEN */}
            {modalStep === 'LOADING' && (
              <div className="car-modal-loading-screen">
                <div className="car-loading-route-pill">
                  <span>{pickup?.name?.split('(')[0]?.trim()} ➔ {destination?.name?.split('(')[0]?.trim()}</span>
                  <small>VIP Rota Hesaplanıyor</small>
                </div>

                <div className="car-loading-stage">
                  <div className="car-loading-glow"></div>
                  <img 
                    src="/vito-loading.png" 
                    alt="Mercedes-Benz Vito VIP" 
                    className="car-loading-vito-img"
                  />
                  <div className="car-loading-road">
                    <div className="car-road-line"></div>
                  </div>
                </div>

                <div className="car-loading-text-group">
                  <h4>VIP Filo ve Müsaitlik Taranıyor</h4>
                  <p>Protokol şoförleri ve sabit fiyat garantisi hazırlanıyor...</p>
                  
                  <div className="car-loading-progress-bar">
                    <div className="car-loading-progress-fill"></div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: VEHICLE SELECTION (Streamlined iOS Cards) */}
            {modalStep === 'VEHICLES' && (
              <div className="car-modal-scrollable-content">
                <div className="car-modal-route-pill">
                  <div className="car-route-info-row">
                    <span className="route-endpoints">{pickup?.name?.split('(')[0]?.trim()} ➔ {destination?.name?.split('(')[0]?.trim()}</span>
                    <span className="route-guarantee-badge">Sabit Fiyat</span>
                  </div>
                </div>

                <div className="car-modal-vehicle-list">
                  {validFleet.map((v) => {
                    const isSelected = v.id === selectedVehicleId;
                    const fare = (v.baseOpeningRate || 1200) + (35 * (v.baseRateKm || 32));
                    const imgUrl = getVehicleImg(v);

                    return (
                      <div
                        key={v.id}
                        className={`car-ios-vehicle-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectVehicle(v.id)}
                      >
                        <div className="car-ios-vehicle-img">
                          <img src={imgUrl} alt={v.name} />
                          {isSelected && (
                            <div className="car-ios-selected-check">
                              <Check size={14} strokeWidth={3} />
                            </div>
                          )}
                        </div>

                        <div className="car-ios-vehicle-details">
                          <div className="car-ios-title-row">
                            <h4 className="car-ios-name">{v.name}</h4>
                          </div>

                          <div className="car-ios-specs-line">
                            <span className="car-ios-class-tag">{v.class}</span>
                            <span className="car-ios-spec-item"><Users size={12} /> {v.seats}</span>
                            <span className="car-ios-spec-item"><Briefcase size={12} /> {v.luggage}</span>
                          </div>

                          <div className="car-ios-bottom-row">
                            <span className="car-ios-price">{formatMoney(fare)}</span>
                            <button
                              type="button"
                              className={`car-ios-select-btn ${isSelected ? 'active' : ''}`}
                            >
                              {isSelected ? 'Seçildi' : 'Seç'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: AMENITIES & EXTRAS (Compact iOS Categorized Layout) */}
            {modalStep === 'AMENITIES' && (
              <div className="car-modal-scrollable-content">
                <div className="car-modal-route-pill">
                  <span className="route-endpoints">Seçilen: <strong>{selectedVehicleObj.name}</strong></span>
                  <span className="route-guarantee-badge">Ücretsiz Hizmetler Dahil</span>
                </div>

                {/* Section 1: Standard Free Included Perks (Neat Badges) */}
                <div className="car-amenities-section">
                  <h5 className="car-section-subhead">STANDART DAHİL OLANLAR</h5>
                  <div className="car-free-perks-grid">
                    {freePerks.map((p, idx) => (
                      <div key={idx} className="car-free-perk-item">
                        <CheckCircle2 size={16} color="#198754" />
                        <div>
                          <strong>{p.title}</strong>
                          <p>{p.desc}</p>
                        </div>
                        <span className="car-tag-free">Dahil</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2: Optional VIP Add-ons (Touch-Friendly Option Tiles) */}
                <div className="car-amenities-section" style={{ marginTop: '16px' }}>
                  <h5 className="car-section-subhead">ÖZEL İLAVE SEÇENEKLER (OPSİYONEL)</h5>
                  <div className="car-paid-amenities-grid">
                    {paidAmenities.map((am) => {
                      const current = selectedAmenities[am.id] || { selected: false, count: 0 };
                      const isChecked = current.selected || am.checkedByDefault;

                      return (
                        <div
                          key={am.id}
                          className={`car-paid-amenity-tile ${isChecked ? 'active' : ''}`}
                          onClick={() => toggleAmenity(am.id)}
                        >
                          <div className="car-amenity-tile-top">
                            <div className="car-amenity-checkbox">
                              {isChecked && <Check size={14} strokeWidth={3} />}
                            </div>
                            <span className="car-tag-price">+{formatMoney(am.priceTRY)}</span>
                          </div>

                          <strong className="car-amenity-tile-title">{am.title}</strong>
                          <p className="car-amenity-tile-sub">{am.subtitle}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PASSENGER & CHECKOUT (iOS Clean Form) */}
            {modalStep === 'PASSENGER' && (
              <div className="car-modal-scrollable-content">
                <form onSubmit={handleConfirmReservation} className="car-ios-form" id="passenger-form">
                  <div className="car-form-group-card">
                    <h5 className="car-form-group-title">Yolcu İletişim Bilgileri</h5>

                    <div className="car-form-row-2">
                      <div className="car-field">
                        <label>ADINIZ *</label>
                        <input
                          type="text"
                          required
                          value={passenger.name}
                          onChange={(e) => setPassenger({ ...passenger, name: e.target.value })}
                          placeholder="Adınız"
                        />
                      </div>
                      <div className="car-field">
                        <label>SOYADINIZ *</label>
                        <input
                          type="text"
                          required
                          value={passenger.surname}
                          onChange={(e) => setPassenger({ ...passenger, surname: e.target.value })}
                          placeholder="Soyadınız"
                        />
                      </div>
                    </div>

                    <div className="car-form-row-2">
                      <div className="car-field">
                        <label>E-POSTA ADRESİ *</label>
                        <input
                          type="email"
                          required
                          value={passenger.email}
                          onChange={(e) => setPassenger({ ...passenger, email: e.target.value })}
                          placeholder="ornek@email.com"
                        />
                      </div>
                      <div className="car-field">
                        <label>TELEFON (WHATSAPP) *</label>
                        <input
                          type="tel"
                          required
                          value={passenger.phone}
                          onChange={(e) => setPassenger({ ...passenger, phone: e.target.value })}
                          placeholder="+90 532 000 00 00"
                        />
                      </div>
                    </div>

                    <div className="car-field">
                      <label>UÇUŞ KODU (CANLI RADAR İÇİN)</label>
                      <input
                        type="text"
                        value={passenger.flightNumber || ''}
                        onChange={(e) => setPassenger({ ...passenger, flightNumber: e.target.value })}
                        placeholder="Örn: TK 1980 (Opsiyonel)"
                      />
                    </div>
                  </div>

                  <div className="car-form-group-card">
                    <h5 className="car-form-group-title">Ödeme Yöntemi</h5>
                    <div className="car-payment-grid">
                      <label className={`car-ios-pay-tile ${passenger.paymentMethod === 'cash' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="paym"
                          value="cash"
                          checked={passenger.paymentMethod === 'cash'}
                          onChange={(e) => setPassenger({ ...passenger, paymentMethod: e.target.value })}
                        />
                        <div className="car-pay-icon-box">
                          <Banknote size={20} color="#198754" />
                        </div>
                        <div>
                          <strong>Araçta Nakit / Kredi Kartı</strong>
                          <small>Yolculuk sonunda şoföre ödeme</small>
                        </div>
                      </label>

                      <label className={`car-ios-pay-tile ${passenger.paymentMethod === 'online' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="paym"
                          value="online"
                          checked={passenger.paymentMethod === 'online'}
                          onChange={(e) => setPassenger({ ...passenger, paymentMethod: e.target.value })}
                        />
                        <div className="car-pay-icon-box">
                          <CreditCard size={20} color="#144c7f" />
                        </div>
                        <div>
                          <strong>Online Güvenli Ödeme</strong>
                          <small>3D Secure Kredi Kartı</small>
                        </div>
                      </label>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 4: CONFIRMATION (Clean Success Screen) */}
            {modalStep === 'CONFIRMATION' && (
              <div className="car-modal-scrollable-content" style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#198754', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Check size={36} strokeWidth={3} />
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#24272c', margin: '0 0 6px' }}>
                  Rezervasyonunuz Başarıyla Onaylandı!
                </h3>
                <p style={{ fontSize: '13.5px', color: '#696665', margin: '0 0 20px' }}>
                  VIP aracınız adınıza tahsis edildi. Detaylar SMS ve WhatsApp ile iletilmiştir.
                </p>

                <div style={{ background: '#f8f9fa', border: '1.5px dashed #ededed', borderRadius: '16px', padding: '16px', textAlign: 'left', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#696665' }}>REZERVASYON KODU</span>
                    <strong style={{ fontSize: '17px', color: '#144c7f', fontFamily: 'monospace' }}>
                      {confirmedBooking?.code || 'SDRV-VIP'}
                    </strong>
                  </div>
                  <div style={{ fontSize: '13.5px', color: '#24272c', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>🛫 <b>Kalkış:</b> {pickup?.name}</div>
                    <div>🏨 <b>Varış:</b> {destination?.name}</div>
                    <div>🚘 <b>Araç:</b> {selectedVehicleObj.name}</div>
                    <div>💰 <b>Tutar:</b> {formatMoney(prices.grandTotalTRY || prices.total)}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    className="car-ios-sticky-submit-btn"
                    onClick={() => {
                      setBookingModalOpen(false);
                      navigate('/takip');
                    }}
                  >
                    <Radar size={16} />
                    <span>Canlı Radar ve Şoför Takibini Aç</span>
                  </button>

                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setBookingModalOpen(false)}
                    style={{ padding: '12px', color: '#696665', fontWeight: 600 }}
                  >
                    Kapat
                  </button>
                </div>
              </div>
            )}

            {/* FIXED STICKY BOTTOM BAR (Native iOS Feel) */}
            {modalStep !== 'CONFIRMATION' && modalStep !== 'LOADING' && (
              <div className="car-modal-ios-sticky-bar">
                <div className="car-sticky-price-group">
                  <span className="car-sticky-price-label">Toplam Tutar:</span>
                  <strong className="car-sticky-price-value">
                    {formatMoney(prices.grandTotalTRY || prices.total)}
                  </strong>
                </div>

                {modalStep === 'VEHICLES' && (
                  <button
                    type="button"
                    className="car-ios-sticky-action-btn"
                    onClick={() => setModalStep('AMENITIES')}
                  >
                    <span>Donanımlara Geç</span>
                    <ChevronRight size={16} />
                  </button>
                )}

                {modalStep === 'AMENITIES' && (
                  <button
                    type="button"
                    className="car-ios-sticky-action-btn"
                    onClick={() => setModalStep('PASSENGER')}
                  >
                    <span>Yolcu Bilgileri</span>
                    <ChevronRight size={16} />
                  </button>
                )}

                {modalStep === 'PASSENGER' && (
                  <button
                    type="submit"
                    form="passenger-form"
                    className="car-ios-sticky-action-btn"
                    disabled={submitting}
                  >
                    <Lock size={15} />
                    <span>{submitting ? 'Oluşturuluyor...' : 'Rezervasyonu Tamamla'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
