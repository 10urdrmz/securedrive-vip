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
  User,
  Mail,
  Phone,
  FileText,
  Clock,
  Award,
  Fuel,
  Gauge,
  SlidersHorizontal,
  RotateCcw
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

  // In-place booking modal step: 'SEARCH' | 'VEHICLES' | 'AMENITIES' | 'PASSENGER' | 'CONFIRMATION'
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

  const filteredFleet = fleet.filter((v) => {
    if (vehicleFilter === 'ALL') return true;
    if (vehicleFilter === 'MINIVAN') return (v.class || '').toLowerCase().includes('vito') || (v.class || '').toLowerCase().includes('minivan');
    if (vehicleFilter === 'SEDAN') return (v.class || '').toLowerCase().includes('sedan') || (v.name || '').toLowerCase().includes('maybach') || (v.name || '').toLowerCase().includes('s-class');
    if (vehicleFilter === 'SPRINTER') return (v.class || '').toLowerCase().includes('sprinter') || (v.name || '').toLowerCase().includes('sprinter');
    return true;
  });

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

  const handleStartSearch = (e) => {
    if (e) e.preventDefault();
    if (!pickup) {
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
    setModalStep('VEHICLES');
    setBookingModalOpen(true);
  };

  const handleSelectVehicle = (vId) => {
    setSelectedVehicleId(vId);
    setModalStep('AMENITIES');
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

      setModalStep('CONFIRMATION');
    } catch (err) {
      console.error(err);
      alert('İşlem sırasında bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="car-theme-root">
      {/* Hero Section */}
      <section className="car-hero-section">
        {/* Background Image with Dark Overlay */}
        <div className="car-hero-bg">
          <div className="car-hero-overlay"></div>
        </div>

        <div className="car-container car-hero-container">
          <div className="car-hero-content">
            {/* Tagline Badge */}
            <div className="car-hero-badge">
              <Sparkles size={14} color="#ff7101" />
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
                  <Plane size={16} color="#ff7101" />
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
                        <Plane size={14} color="#ff7101" />
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
              const baseFare = car.baseOpeningRate + (35 * car.baseRateKm);
              const fareFormatted = formatMoney(baseFare);

              return (
                <div key={car.id} className="car-card-box">
                  {/* Top Image & Badges */}
                  <div className="car-card-img-wrap">
                    <img src={car.image} alt={car.name} loading="lazy" />
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
                        <Users size={14} color="#ff7101" />
                        <span>{car.seats} Kişi</span>
                      </div>
                      <div className="car-spec-item">
                        <Briefcase size={14} color="#ff7101" />
                        <span>{car.luggage} Bagaj</span>
                      </div>
                      <div className="car-spec-item">
                        <Wifi size={14} color="#ff7101" />
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
          SIMPLIFIED & STREAMLINED IN-PLACE BOOKING MODAL
         ========================================================================= */}
      {bookingModalOpen && (
        <div className="car-modal-backdrop" onClick={() => setBookingModalOpen(false)}>
          <div className="car-modal-box" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="car-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {modalStep !== 'VEHICLES' && modalStep !== 'CONFIRMATION' && (
                  <button
                    type="button"
                    className="car-modal-back-btn"
                    onClick={() => {
                      if (modalStep === 'AMENITIES') setModalStep('VEHICLES');
                      else if (modalStep === 'PASSENGER') setModalStep('AMENITIES');
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <h3 className="car-modal-title">
                  {modalStep === 'VEHICLES' && 'Araç Seçimi (1/3)'}
                  {modalStep === 'AMENITIES' && 'Donanım & Ekstralar (2/3)'}
                  {modalStep === 'PASSENGER' && 'Yolcu Bilgileri & Ödeme (3/3)'}
                  {modalStep === 'CONFIRMATION' && 'Rezervasyon Onaylandı'}
                </h3>
              </div>

              <button
                type="button"
                className="car-modal-close"
                onClick={() => setBookingModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* STEP 1: VEHICLE SELECTION */}
            {modalStep === 'VEHICLES' && (
              <div className="car-modal-body">
                <div className="car-modal-route-pill">
                  <span>{pickup?.name?.split('(')[0]?.trim()} ➔ {destination?.name?.split('(')[0]?.trim()}</span>
                  <small>Sabit Fiyat Garantisi</small>
                </div>

                <div className="car-modal-vehicle-list">
                  {fleet.map((v) => {
                    const isSelected = v.id === selectedVehicleId;
                    const fare = v.baseOpeningRate + (35 * v.baseRateKm);

                    return (
                      <div
                        key={v.id}
                        className={`car-modal-vehicle-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectVehicle(v.id)}
                      >
                        <div className="car-modal-vehicle-img">
                          <img src={v.image} alt={v.name} />
                        </div>
                        <div className="car-modal-vehicle-info">
                          <h4>{v.name}</h4>
                          <span className="car-class-badge">{v.class}</span>
                          <div className="car-modal-specs">
                            <span><Users size={12} /> {v.seats} Kişi</span>
                            <span><Briefcase size={12} /> {v.luggage} Bagaj</span>
                          </div>
                        </div>
                        <div className="car-modal-vehicle-price">
                          <strong>{formatMoney(fare)}</strong>
                          <button type="button" className="car-select-sm-btn">Seç</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: AMENITIES & EXTRAS */}
            {modalStep === 'AMENITIES' && (
              <div className="car-modal-body">
                <div className="car-modal-route-pill">
                  <span>Seçilen Araç: <strong>{selectedVehicleObj.name}</strong></span>
                </div>

                <div className="car-amenities-list">
                  {amenitiesList.map((am) => {
                    const current = selectedAmenities[am.id] || { selected: false, count: 0 };
                    const isChecked = current.selected || am.checkedByDefault;

                    return (
                      <div
                        key={am.id}
                        className={`car-amenity-row ${isChecked ? 'active' : ''}`}
                        onClick={() => toggleAmenity(am.id)}
                      >
                        <div className="car-amenity-checkbox">
                          {isChecked && <Check size={14} strokeWidth={3} />}
                        </div>
                        <div className="car-amenity-info">
                          <div className="car-amenity-head">
                            <strong>{am.title}</strong>
                            {am.isFree ? (
                              <span className="car-tag-free">Dahil</span>
                            ) : (
                              <span className="car-tag-price">+{formatMoney(am.priceTRY)}</span>
                            )}
                          </div>
                          <p>{am.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="car-modal-footer-bar">
                  <div>
                    <span className="car-footer-sub">Toplam Tutar:</span>
                    <strong className="car-footer-price">{formatMoney(prices.grandTotalTRY || prices.total)}</strong>
                  </div>
                  <button
                    type="button"
                    className="car-primary-action-btn"
                    onClick={() => setModalStep('PASSENGER')}
                  >
                    <span>Yolcu Bilgilerine Geç</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PASSENGER & CHECKOUT */}
            {modalStep === 'PASSENGER' && (
              <div className="car-modal-body">
                <form onSubmit={handleConfirmReservation} className="car-passenger-form">
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
                    <label>UÇUŞ KODU (OPSİYONEL - CANLI RADAR TAKİBİ)</label>
                    <input
                      type="text"
                      value={passenger.flightNumber || ''}
                      onChange={(e) => setPassenger({ ...passenger, flightNumber: e.target.value })}
                      placeholder="Örn: TK 1980"
                    />
                  </div>

                  <div className="car-field">
                    <label>ÖDEME TÜRÜ</label>
                    <div className="car-payment-options">
                      <label className={`car-payment-opt ${passenger.paymentMethod === 'cash' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="paym"
                          value="cash"
                          checked={passenger.paymentMethod === 'cash'}
                          onChange={(e) => setPassenger({ ...passenger, paymentMethod: e.target.value })}
                        />
                        <Banknote size={16} color="#198754" />
                        <span>Araçta Nakit / Kredi Kartı</span>
                      </label>

                      <label className={`car-payment-opt ${passenger.paymentMethod === 'online' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="paym"
                          value="online"
                          checked={passenger.paymentMethod === 'online'}
                          onChange={(e) => setPassenger({ ...passenger, paymentMethod: e.target.value })}
                        />
                        <CreditCard size={16} color="#ff7101" />
                        <span>Online Güvenli Ödeme</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="car-submit-btn"
                    disabled={submitting}
                  >
                    <Lock size={16} />
                    <span>{submitting ? 'Oluşturuluyor...' : `VIP Rezervasyonu Onayla (${formatMoney(prices.grandTotalTRY || prices.total)})`}</span>
                  </button>
                </form>
              </div>
            )}

            {/* STEP 4: CONFIRMATION */}
            {modalStep === 'CONFIRMATION' && (
              <div className="car-modal-body" style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ecfdf5', color: '#198754', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Check size={32} strokeWidth={3} />
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#24272c', margin: '0 0 6px' }}>
                  Rezervasyonunuz Başarıyla Onaylandı!
                </h3>
                <p style={{ fontSize: '13.5px', color: '#696665', margin: '0 0 20px' }}>
                  VIP aracınız adınıza tahsis edildi. Kupon detayları SMS ve WhatsApp ile iletilmiştir.
                </p>

                <div style={{ background: '#f8f9fa', border: '1.5px dashed #ededed', borderRadius: '16px', padding: '16px', textAlign: 'left', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#696665' }}>REZERVASYON KODU</span>
                    <strong style={{ fontSize: '16px', color: '#ff7101', fontFamily: 'monospace' }}>
                      {confirmedBooking?.code || 'SDRV-VIP'}
                    </strong>
                  </div>
                  <div style={{ fontSize: '13px', color: '#24272c', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>🛫 <b>Kalkış:</b> {pickup?.name}</div>
                    <div>🏨 <b>Varış:</b> {destination?.name}</div>
                    <div>🚘 <b>Araç:</b> {selectedVehicleObj.name}</div>
                    <div>💰 <b>Tutar:</b> {formatMoney(prices.grandTotalTRY || prices.total)}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    className="car-submit-btn"
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
                    style={{ padding: '10px', color: '#696665' }}
                  >
                    Kapat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
