import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  ChevronDown,
  Calendar, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  TrendingDown, 
  Check, 
  X,
  Search,
  Briefcase,
  Wifi,
  Lock,
  CreditCard,
  Banknote,
  User,
  Mail,
  Phone,
  FileText,
  Clock,
  Award,
  SlidersHorizontal,
  ArrowUpDown,
  Share2,
  Edit2,
  Info,
  Headphones,
  Tag,
  Monitor
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
    updateAmenityCount,
    passenger,
    setPassenger,
    completeReservation,
    confirmedBooking,
    calculatePrices,
    formatMoney,
    distanceKm,
    durationMin,
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
    setLuggage
  } = useBooking();

  // Turna App View Steps: 'SEARCH' | 'LOADING' | 'VEHICLES' | 'PASSENGER' | 'CONFIRMATION'
  const [currentStep, setCurrentStep] = useState('SEARCH');
  const [differentDropoff, setDifferentDropoff] = useState(false);
  const [pickupOpen, setPickupOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const [pickupQuery, setPickupQuery] = useState(pickup?.name || '');
  const [destQuery, setDestQuery] = useState(destination?.name || '');
  
  // Dates & Times
  const [pickupDate, setPickupDate] = useState('31 Ağu, Pzt');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [dropoffDate, setDropoffDate] = useState('3 Eyl, Per');
  const [dropoffTime, setDropoffTime] = useState('10:00');
  const [paxModalOpen, setPaxModalOpen] = useState(false);
  const [notTcCitizen, setNotTcCitizen] = useState(false);

  // Accordions in passenger step
  const [vehicleAccOpen, setVehicleAccOpen] = useState(true);
  const [deliveryAccOpen, setDeliveryAccOpen] = useState(false);
  const [amenitiesAccOpen, setAmenitiesAccOpen] = useState(false);

  // Vehicle filter & coupon
  const [vehicleSort, setVehicleSort] = useState('recommended');
  const [selectedCoupon, setSelectedCoupon] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const prices = calculatePrices();

  // Set default datetime if empty
  useEffect(() => {
    if (!datetime) {
      const now = new Date();
      now.setDate(now.getDate() + 1);
      now.setHours(10, 0, 0, 0);
      setDatetime(now.toISOString().slice(0, 16));
    }
  }, [datetime, setDatetime]);

  // Pre-fill user profile if logged in
  useEffect(() => {
    if (user && currentStep === 'PASSENGER') {
      const parts = (user.full_name || '').trim().split(/\s+/);
      setPassenger((prev) => ({
        ...prev,
        name: prev.name && prev.name.trim() !== '' ? prev.name : (parts[0] || ''),
        surname: prev.surname && prev.surname.trim() !== '' ? prev.surname : (parts.slice(1).join(' ') || ''),
        email: prev.email && prev.email.trim() !== '' ? prev.email : (user.email || ''),
        phone: prev.phone && prev.phone.trim() !== '' ? prev.phone : (user.phone || '')
      }));
    }
  }, [user, currentStep, setPassenger]);

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

  const selectedVehicleObj = fleet.find((v) => v.id === selectedVehicleId) || fleet[0] || {
    id: 'vito-vip',
    name: 'Mercedes-Benz Vito VIP Lounge',
    class: 'VIP Minivan',
    seats: 6,
    luggage: 6,
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=600&q=80',
    baseOpeningRate: 850,
    baseRateKm: 32
  };

  const handleStartSearch = () => {
    if (!pickup) {
      // Default to Istanbul Airport if not selected
      const defaultP = availableAirports[0] || { id: 'IST', name: 'İstanbul Havalimanı (IST)' };
      setPickup(defaultP);
      setPickupQuery(defaultP.name);
    }
    if (!destination) {
      const defaultD = availableDestinations[0] || { id: 'BESIKTAS', name: 'Beşiktaş / Boğaz Otelleri' };
      setDestination(defaultD);
      setDestQuery(defaultD.name);
    }

    clearSubmittedBooking();
    // Show Turna "Lütfen Bekleyin" loading screen for 600ms then show vehicles
    setCurrentStep('LOADING');
    setTimeout(() => {
      setCurrentStep('VEHICLES');
    }, 600);
  };

  const handleSelectVehicle = (vId) => {
    setSelectedVehicleId(vId);
    setCurrentStep('PASSENGER');
  };

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

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.5 }
        });
      } catch {}

      setCurrentStep('CONFIRMATION');
    } catch (err) {
      console.error(err);
      alert('İşlem sırasında bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="turna-app-wrapper">
      {/* =========================================================================
          SCREEN 1: TURNA APP MAIN SEARCH SCREEN (SCREENSHOT 1)
         ========================================================================= */}
      {currentStep === 'SEARCH' && (
        <div className="turna-search-screen">
          {/* Top Road Background Banner */}
          <div className="turna-road-banner">
            <div className="turna-road-topbar">
              <div className="turna-round-nav-btn">
                <ChevronLeft size={20} color="#1e293b" />
              </div>
              <div className="turna-vehicle-type-pill">
                <Car size={18} color="#000080" />
                <ChevronDown size={16} color="#64748b" />
              </div>
            </div>
            <h1 className="turna-main-heading">VIP Transfer & Araç</h1>
          </div>

          {/* Main White Card with Divider Lines */}
          <div className="turna-form-card">
            {/* Row 1: Alış ve Bırakış Yeri */}
            <div 
              className="turna-form-row turna-location-row"
              onClick={() => {
                setPickupOpen(true);
                setDestOpen(false);
              }}
            >
              <div className="turna-row-label">Alış ve Bırakış Yeri</div>
              <div className="turna-row-val">
                {pickup ? pickup.name : 'İstanbul Havalimanı (IST) ➔ Otel / Adres'}
              </div>
            </div>

            {/* Location Dropdown Modal/List if Open */}
            {pickupOpen && (
              <div className="turna-dropdown-overlay" onClick={() => setPickupOpen(false)}>
                <div className="turna-dropdown-box" onClick={(e) => e.stopPropagation()}>
                  <div className="turna-dropdown-header">
                    <h4>Kalkış / Alış Noktası Seçin</h4>
                    <button type="button" onClick={() => setPickupOpen(false)}><X size={18} /></button>
                  </div>
                  <input
                    type="text"
                    className="turna-dropdown-search-input"
                    value={pickupQuery}
                    onChange={(e) => setPickupQuery(e.target.value)}
                    placeholder="Havalimanı veya İlçe Ara..."
                    autoFocus
                  />
                  <div className="turna-dropdown-items-list">
                    {filteredAirports.map((a) => (
                      <div
                        key={a.id}
                        className="turna-dropdown-row"
                        onClick={() => {
                          setPickup(a);
                          setPickupQuery(a.name);
                          setPickupOpen(false);
                          setDestOpen(true);
                        }}
                      >
                        <Plane size={16} color="#000080" />
                        <div>
                          <strong>{a.name}</strong>
                          <small>{a.city} · VIP Terminal</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {destOpen && (
              <div className="turna-dropdown-overlay" onClick={() => setDestOpen(false)}>
                <div className="turna-dropdown-box" onClick={(e) => e.stopPropagation()}>
                  <div className="turna-dropdown-header">
                    <h4>Varış / Bırakış Noktası Seçin</h4>
                    <button type="button" onClick={() => setDestOpen(false)}><X size={18} /></button>
                  </div>
                  <input
                    type="text"
                    className="turna-dropdown-search-input"
                    value={destQuery}
                    onChange={(e) => setDestQuery(e.target.value)}
                    placeholder="Otel, Marina veya Semt Ara..."
                    autoFocus
                  />
                  <div className="turna-dropdown-items-list">
                    {filteredDestinations.map((d) => (
                      <div
                        key={d.id}
                        className="turna-dropdown-row"
                        onClick={() => {
                          setDestination(d);
                          setDestQuery(d.name);
                          setDestOpen(false);
                        }}
                      >
                        <Hotel size={16} color="#059669" />
                        <div>
                          <strong>{d.name}</strong>
                          <small>{d.district ? `${d.district}, ${d.city}` : d.city}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Row 2: Alış Tarihi & Alış Saati (Split 2 Columns) */}
            <div className="turna-form-split-row">
              <div className="turna-split-col">
                <span className="turna-field-sub">Alış tarihi</span>
                <div className="turna-field-main">{pickupDate}</div>
              </div>
              <div className="turna-split-col right-col">
                <span className="turna-field-sub">Alış saati</span>
                <div className="turna-field-main with-chevron">
                  <span>{pickupTime}</span>
                  <ChevronDown size={16} color="#475569" />
                </div>
              </div>
            </div>

            {/* Row 3: Bırakış Tarihi & Bırakış Saati (Split 2 Columns) */}
            <div className="turna-form-split-row">
              <div className="turna-split-col">
                <span className="turna-field-sub">Bırakış tarihi</span>
                <div className="turna-field-main">{dropoffDate}</div>
              </div>
              <div className="turna-split-col right-col">
                <span className="turna-field-sub">Bırakış saati</span>
                <div className="turna-field-main with-chevron">
                  <span>{dropoffTime}</span>
                  <ChevronDown size={16} color="#475569" />
                </div>
              </div>
            </div>

            {/* Row 4: Sürücü/Yolcu Yaşı ve Kapasite */}
            <div className="turna-form-row turna-age-row">
              <div className="turna-age-left">
                <span>Sürücü / Yolcu: <strong>{pax} Yolcu, {luggage} Bagaj</strong></span>
                <ChevronDown size={16} color="#475569" onClick={() => setPaxModalOpen(!paxModalOpen)} />
                <Info size={16} color="#64748b" style={{ marginLeft: '4px' }} />
              </div>
            </div>

            {paxModalOpen && (
              <div className="turna-pax-mini-box">
                <div className="turna-pax-counter-row">
                  <span>Yolcu:</span>
                  <div className="turna-counter-btns">
                    <button type="button" onClick={() => setPax(Math.max(1, pax - 1))}>-</button>
                    <b>{pax}</b>
                    <button type="button" onClick={() => setPax(Math.min(16, pax + 1))}>+</button>
                  </div>
                </div>
                <div className="turna-pax-counter-row">
                  <span>Bagaj:</span>
                  <div className="turna-counter-btns">
                    <button type="button" onClick={() => setLuggage(Math.max(0, luggage - 1))}>-</button>
                    <b>{luggage}</b>
                    <button type="button" onClick={() => setLuggage(Math.min(16, luggage + 1))}>+</button>
                  </div>
                </div>
              </div>
            )}

            {/* Primary Action Button: Deep Cobalt Navy Pill with >> */}
            <button
              type="button"
              className="turna-cobalt-btn"
              onClick={handleStartSearch}
            >
              <span>VIP Araç Bul</span>
              <span className="turna-btn-arrows">❯❯</span>
            </button>

            {/* Toggle: Aracı farklı bir yere bırakacağım */}
            <div className="turna-toggle-row">
              <label className="turna-switch">
                <input
                  type="checkbox"
                  checked={differentDropoff}
                  onChange={(e) => setDifferentDropoff(e.target.checked)}
                />
                <span className="turna-slider round"></span>
              </label>
              <span className="turna-toggle-label">Aracı farklı bir yere bırakacağım</span>
            </div>
          </div>

          {/* Second Card: Rezervasyon Sorgula */}
          <Link to="/takip" className="turna-secondary-card">
            <div className="turna-monitor-icon-box">
              <Monitor size={22} color="#7c3aed" />
            </div>
            <span className="turna-sec-card-title">Rezervasyon Sorgula & Canlı Takip</span>
          </Link>

          {/* Bottom Trust & Support Strip */}
          <div className="turna-bottom-trust-strip">
            <div className="turna-trust-item">
              <Headphones size={16} color="#7c3aed" />
              <span>7/24 Canlı Destek</span>
            </div>
            <div className="turna-trust-item">
              <Tag size={16} color="#7c3aed" />
              <span>Turna Puan Kazan</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 2: TURNA LOADING / TRANSIT SCREEN (SCREENSHOT 2)
         ========================================================================= */}
      {currentStep === 'LOADING' && (
        <div className="turna-loading-screen">
          <div className="turna-road-banner-mini"></div>
          
          <div className="turna-loading-center">
            {/* Big Brand Logo */}
            <div className="turna-brand-logo-large">
              <span className="turna-logo-chevrons">❯❯</span>
              <span className="turna-logo-word">turna</span>
              <span className="turna-logo-sub-tag">VIP</span>
            </div>

            {/* Location & Date Summary Card */}
            <div className="turna-loading-summary-card">
              <div className="turna-loading-loc-head">
                <strong>{pickup?.name || 'İstanbul Havalimanı'}</strong>
                <small>{pickup?.city || 'İstanbul, Türkiye'}</small>
              </div>
              <div className="turna-loading-date-row">
                <span>{pickupDate}</span>
                <Calendar size={18} color="#94a3b8" />
                <span>{dropoffDate}</span>
              </div>
            </div>

            {/* Circular Cobalt Pulsing Action Indicator */}
            <div className="turna-loading-pulse-circle">
              <span className="turna-circle-chevrons">❯❯</span>
            </div>
            <div className="turna-loading-text">Lütfen bekleyin</div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 3: TURNA VEHICLE RESULTS SCREEN (SCREENSHOT 3)
         ========================================================================= */}
      {currentStep === 'VEHICLES' && (
        <div className="turna-results-screen">
          {/* Top Route Header Bar */}
          <div className="turna-results-topbar">
            <button
              type="button"
              className="turna-top-back-btn"
              onClick={() => setCurrentStep('SEARCH')}
            >
              <ChevronLeft size={22} color="#0f172a" />
            </button>

            <div className="turna-top-route-box">
              <div className="turna-top-route-title">
                {pickup?.name?.split('(')[0]?.trim() || 'İstanbul Havalimanı'}
              </div>
              <div className="turna-top-route-sub">
                {pickupDate} - {dropoffDate}
              </div>
            </div>

            <div className="turna-top-action-icons">
              <button type="button" className="turna-icon-action-btn" onClick={() => setCurrentStep('SEARCH')}>
                <Edit2 size={16} />
              </button>
              <button type="button" className="turna-icon-action-btn">
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* Filter Chips Bar */}
          <div className="turna-filter-chips-strip">
            <button type="button" className="turna-chip-btn">
              <ArrowUpDown size={14} />
              <span>Sırala: Önerilen</span>
            </button>
            <button type="button" className="turna-chip-btn">
              <SlidersHorizontal size={14} />
              <span>Filtrele</span>
            </button>
            <button type="button" className="turna-chip-btn">
              <span>Vites Tipi</span>
              <ChevronDown size={14} />
            </button>
            <button type="button" className="turna-chip-btn">
              <span>Araç Sınıfı</span>
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Coupon / Discount Banner Card */}
          <div className="turna-coupon-banner-grid">
            <div className="turna-coupon-card">
              <div className="turna-coupon-left">
                <strong>1</strong>
                <span>Tümünü Uygula</span>
              </div>
              <input type="checkbox" checked={selectedCoupon} onChange={(e) => setSelectedCoupon(e.target.checked)} />
            </div>

            <div className="turna-coupon-card active">
              <div className="turna-coupon-left">
                <div className="turna-coupon-brand">
                  <span>❯❯ turna</span>
                </div>
                <div className="turna-coupon-text">
                  <Info size={12} color="#7c3aed" />
                  <span>%25 indirim</span>
                </div>
              </div>
              <input type="checkbox" checked={selectedCoupon} onChange={(e) => setSelectedCoupon(e.target.checked)} />
            </div>
          </div>

          {/* Vehicle List Cards */}
          <div className="turna-results-cards-list">
            {fleet.map((v) => {
              const baseDailyRate = v.baseOpeningRate + 1460;
              const totalDaysPrice = baseDailyRate * 3;
              const totalFormatted = formatMoney(totalDaysPrice);
              const isSelected = v.id === selectedVehicleId;

              return (
                <div
                  key={v.id}
                  className={`turna-car-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectVehicle(v.id)}
                >
                  <div className="turna-car-card-header">
                    <div className="turna-car-img-box">
                      <img src={v.image} alt={v.name} loading="lazy" />
                      <div className="turna-provider-logo">AVIS</div>
                    </div>

                    <div className="turna-car-info-box">
                      <h3 className="turna-car-name">{v.name}</h3>
                      <span className="turna-car-sub">veya benzeri bir araba</span>

                      <div className="turna-car-specs-grid">
                        <div className="turna-spec-item"><Users size={14} /> {v.seats} Koltuklu</div>
                        <div className="turna-spec-item">🕹️ Otomatik</div>
                        <div className="turna-spec-item">⛽ Dizel/Benzin</div>
                        <div className="turna-spec-item">⏱️ 1500 Km</div>
                      </div>

                      <div className="turna-car-deposit">
                        <span>💳 Depozito: 5.000 TL</span>
                      </div>

                      <div className="turna-car-cancellation">
                        <Check size={14} color="#059669" strokeWidth={3} />
                        <span>Ücretsiz İptal</span>
                      </div>
                    </div>
                  </div>

                  <div className="turna-car-card-footer">
                    <span className="turna-car-rate-calc">
                      {formatMoney(baseDailyRate)} x 3 Gün
                    </span>
                    <strong className="turna-car-total-bold">
                      {totalFormatted}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 4: TURNA CHECKOUT & PASSENGER FORM (SCREENSHOT 4)
         ========================================================================= */}
      {currentStep === 'PASSENGER' && (
        <div className="turna-passenger-screen">
          {/* Top Bar with Back Button and Title */}
          <div className="turna-passenger-topbar">
            <button
              type="button"
              className="turna-top-back-btn"
              onClick={() => setCurrentStep('VEHICLES')}
            >
              <ChevronLeft size={22} color="#0f172a" />
            </button>
            <h2 className="turna-passenger-top-title">İletişim Bilgileri</h2>
          </div>

          <div className="turna-passenger-scroll-body">
            {/* Collapsible Accordion 1: Selected Car */}
            <div className="turna-accordion-card">
              <div 
                className="turna-accordion-header"
                onClick={() => setVehicleAccOpen(!vehicleAccOpen)}
              >
                <div className="turna-acc-car-preview">
                  <img src={selectedVehicleObj.image} alt={selectedVehicleObj.name} />
                  <div>
                    <strong>{selectedVehicleObj.name}</strong>
                    <small>veya benzeri bir araba</small>
                  </div>
                </div>
                <ChevronDown size={18} color="#64748b" style={{ transform: vehicleAccOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>

              {vehicleAccOpen && (
                <div className="turna-accordion-content">
                  <div className="turna-acc-specs-row">
                    <span>🪑 {selectedVehicleObj.seats} Koltuk</span>
                    <span>🕹️ Otomatik Vites</span>
                    <span>⛽ Dizel / Hibrit</span>
                  </div>
                </div>
              )}
            </div>

            {/* Collapsible Accordion 2: Araç Teslim Bilgileri */}
            <div className="turna-accordion-card">
              <div 
                className="turna-accordion-header"
                onClick={() => setDeliveryAccOpen(!deliveryAccOpen)}
              >
                <strong>Araç Teslim Bilgileri</strong>
                <ChevronDown size={18} color="#64748b" style={{ transform: deliveryAccOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>

              {deliveryAccOpen && (
                <div className="turna-accordion-content">
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                    Alış: <b>{pickup?.name || 'İstanbul Havalimanı (IST)'}</b> ({pickupDate}, {pickupTime})<br />
                    İade: <b>{destination?.name || 'Aynı Nokta'}</b> ({dropoffDate}, {dropoffTime})
                  </p>
                </div>
              )}
            </div>

            {/* Collapsible Accordion 3: Ofis Bilgileri / Güzergah */}
            <div className="turna-accordion-card">
              <div 
                className="turna-accordion-header"
                onClick={() => setAmenitiesAccOpen(!amenitiesAccOpen)}
              >
                <strong>Ofis Bilgileri</strong>
                <ChevronDown size={18} color="#64748b" style={{ transform: amenitiesAccOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>

              {amenitiesAccOpen && (
                <div className="turna-accordion-content">
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                    Havalimanı Terminal İçi Gelen Yolcu Kapısı No: 9 VIP Karşılama Masası
                  </p>
                </div>
              )}
            </div>

            {/* Form Box 1: Kişisel Bilgiler */}
            <div className="turna-white-form-box">
              <h3 className="turna-box-heading">Kişisel Bilgiler</h3>

              <div className="turna-clean-input-group">
                <input
                  type="text"
                  required
                  value={passenger.name}
                  onChange={(e) => setPassenger({ ...passenger, name: e.target.value })}
                  placeholder="İsim"
                />
              </div>

              <div className="turna-clean-input-group">
                <input
                  type="text"
                  required
                  value={passenger.surname}
                  onChange={(e) => setPassenger({ ...passenger, surname: e.target.value })}
                  placeholder="Soyisim"
                />
              </div>

              <div className="turna-clean-input-group">
                <input
                  type="text"
                  placeholder="Doğum Tarihi (GG.AA.YYYY)"
                />
              </div>

              <div className="turna-tc-row">
                <div className="turna-clean-input-group" style={{ flex: 1, margin: 0 }}>
                  <input
                    type="text"
                    maxLength={11}
                    placeholder="T.C. Kimlik No"
                    disabled={notTcCitizen}
                  />
                </div>
                <label className="turna-checkbox-label">
                  <input
                    type="checkbox"
                    checked={notTcCitizen}
                    onChange={(e) => setNotTcCitizen(e.target.checked)}
                  />
                  <span>T.C. Vatandaşı Değil</span>
                </label>
              </div>
            </div>

            {/* Form Box 2: İletişim Bilgileri */}
            <div className="turna-white-form-box">
              <h3 className="turna-box-heading">İletişim Bilgileri</h3>

              <div className="turna-clean-input-group">
                <input
                  type="email"
                  required
                  value={passenger.email}
                  onChange={(e) => setPassenger({ ...passenger, email: e.target.value })}
                  placeholder="E-posta Adresi"
                />
              </div>

              <div className="turna-clean-input-group">
                <input
                  type="tel"
                  required
                  value={passenger.phone}
                  onChange={(e) => setPassenger({ ...passenger, phone: e.target.value })}
                  placeholder="Cep Telefonu (+90 532 ...)"
                />
              </div>
            </div>
          </div>

          {/* Sticky Bottom Bar with Total & Action Button (Screenshot 4) */}
          <div className="turna-sticky-checkout-bar">
            <div className="turna-sticky-price-wrap">
              <span className="turna-sticky-price-label">Toplam tutar</span>
              <div className="turna-sticky-price-val">
                <strong>{formatMoney(prices.grandTotalTRY || 6940.18)}</strong>
                <ChevronDown size={16} color="#0f172a" style={{ transform: 'rotate(180deg)' }} />
              </div>
            </div>

            <button
              type="button"
              className="turna-checkout-cobalt-btn"
              disabled={submitting}
              onClick={handleConfirmReservation}
            >
              <span>{submitting ? 'İşleniyor...' : 'Ödemeye İlerle'}</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 5: CONFIRMATION / BOARDING PASS SCREEN
         ========================================================================= */}
      {currentStep === 'CONFIRMATION' && (
        <div className="turna-confirmation-screen">
          <div className="turna-confirm-card">
            <div className="turna-confirm-icon-wrap">
              <Check size={36} color="#059669" strokeWidth={3} />
            </div>

            <h2 className="turna-confirm-title">Rezervasyonunuz Başarıyla Alındı!</h2>
            <p className="turna-confirm-desc">
              VIP transfer kuponunuz ve sürücü detaylarınız SMS & WhatsApp ile tarafınıza iletilmiştir.
            </p>

            <div className="turna-voucher-box">
              <div className="turna-voucher-row">
                <span className="turna-voucher-label">REZERVASYON KODU</span>
                <strong className="turna-voucher-code">{confirmedBooking?.code || 'SDRV-7492'}</strong>
              </div>
              <div className="turna-voucher-details">
                <div>🛫 <b>Kalkış:</b> {pickup?.name || 'İstanbul Havalimanı (IST)'}</div>
                <div>🏨 <b>Varış:</b> {destination?.name || 'Beşiktaş'}</div>
                <div>🚘 <b>Araç:</b> {selectedVehicleObj.name}</div>
                <div>💰 <b>Tutar:</b> {formatMoney(prices.grandTotalTRY || 6940.18)}</div>
              </div>
            </div>

            <button
              type="button"
              className="turna-cobalt-btn"
              onClick={() => navigate('/takip')}
            >
              <Radar size={18} />
              <span>Canlı Sürücü ve Radar Takibini Aç</span>
            </button>

            <button
              type="button"
              className="turna-return-home-btn"
              onClick={() => setCurrentStep('SEARCH')}
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
