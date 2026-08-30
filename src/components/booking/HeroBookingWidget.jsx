import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  ArrowRight, 
  ChevronRight, 
  ChevronLeft,
  Calendar, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  TrendingDown, 
  Check, 
  ArrowRightLeft,
  X,
  Search,
  Briefcase,
  Wifi,
  Zap,
  Lock,
  CreditCard,
  Banknote,
  Building,
  User,
  Mail,
  Phone,
  FileText,
  QrCode
} from 'lucide-react';

const DROPS_ROUTES = [
  {
    id: 'ist-besiktas',
    title: 'İstanbul Havalimanı (IST) ➔ Beşiktaş / Boğaz Otelleri',
    subtitle: 'Çırağan Palace, Four Seasons, Swissôtel',
    originalPrice: 2150,
    dropPrice: 1200,
    dropAmount: 950,
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=700&q=80',
    pickupName: 'İstanbul Havalimanı (IST)',
    pickupId: 'IST',
    destName: 'Çırağan Palace Kempinski',
    destId: 'CIRAGAN'
  },
  {
    id: 'saw-kadikoy',
    title: 'Sabiha Gökçen (SAW) ➔ Kadıköy & Ataşehir',
    subtitle: 'Moda Sahil, Hilton Kozyatağı, Finans Merkezi',
    originalPrice: 1950,
    dropPrice: 1100,
    dropAmount: 850,
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=700&q=80',
    pickupName: 'Sabiha Gökçen Havalimanı (SAW)',
    pickupId: 'SAW',
    destName: 'Kadıköy Moda Sahili',
    destId: 'KADIKOY_MODA'
  },
  {
    id: 'bjv-yalikavak',
    title: 'Bodrum Milas (BJV) ➔ Yalıkavak Marina',
    subtitle: 'Yalıkavak Marina, Mandarin Oriental, Türkbükü',
    originalPrice: 3200,
    dropPrice: 1800,
    dropAmount: 1400,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=700&q=80',
    pickupName: 'Bodrum Milas Havalimanı (BJV)',
    pickupId: 'BJV',
    destName: 'Yalıkavak Marina Resort',
    destId: 'YALIKAVAK_MARINA'
  },
  {
    id: 'ayt-belek',
    title: 'Antalya Havalimanı (AYT) ➔ Belek VIP Golf Resort',
    subtitle: 'Maxx Royal, Regnum Carya, Gloria Golf',
    originalPrice: 2600,
    dropPrice: 1400,
    dropAmount: 1200,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=700&q=80',
    pickupName: 'Antalya Havalimanı (AYT)',
    pickupId: 'AYT',
    destName: 'Maxx Royal Belek Golf Resort',
    destId: 'MAXX_ROYAL_BELEK'
  }
];

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

  // In-place multi-step drawer state: 'SEARCH' | 'VEHICLES' | 'AMENITIES' | 'PASSENGER' | 'CONFIRMATION'
  const [drawerStep, setDrawerStep] = useState('SEARCH');
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('flights');
  const [whyModalOpen, setWhyModalOpen] = useState(false);
  const [vehicleFilter, setVehicleFilter] = useState('ALL');
  const [submitting, setSubmitting] = useState(false);

  const [pickupOpen, setPickupOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const [pickupQuery, setPickupQuery] = useState(pickup?.name || '');
  const [destQuery, setDestQuery] = useState(destination?.name || '');

  const prices = calculatePrices();

  // Pre-fill user profile if logged in
  useEffect(() => {
    if (user && drawerStep === 'PASSENGER') {
      const parts = (user.full_name || '').trim().split(/\s+/);
      setPassenger((prev) => ({
        ...prev,
        name: prev.name && prev.name.trim() !== '' ? prev.name : (parts[0] || ''),
        surname: prev.surname && prev.surname.trim() !== '' ? prev.surname : (parts.slice(1).join(' ') || ''),
        email: prev.email && prev.email.trim() !== '' ? prev.email : (user.email || ''),
        phone: prev.phone && prev.phone.trim() !== '' ? prev.phone : (user.phone || '')
      }));
    }
  }, [user, drawerStep, setPassenger]);

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
    if (vehicleFilter === 'MINIVAN') return (v.class || '').toLowerCase().includes('vito') || (v.class || '').toLowerCase().includes('minivan') || (v.name || '').toLowerCase().includes('vito');
    if (vehicleFilter === 'SEDAN') return (v.class || '').toLowerCase().includes('sedan') || (v.name || '').toLowerCase().includes('maybach') || (v.name || '').toLowerCase().includes('s-class') || (v.name || '').toLowerCase().includes('e-class');
    if (vehicleFilter === 'SPRINTER') return (v.class || '').toLowerCase().includes('sprinter') || (v.name || '').toLowerCase().includes('sprinter');
    return true;
  });

  const selectedVehicleObj = fleet.find((v) => v.id === selectedVehicleId) || fleet[0];

  const handleStartBooking = () => {
    if (!pickup) {
      alert('Lütfen kalkış noktasını seçiniz.');
      setPickupOpen(true);
      return;
    }
    if (!destination) {
      alert('Lütfen varış noktasını seçiniz.');
      setDestOpen(true);
      return;
    }
    if (!datetime) {
      alert('Lütfen transfer tarihi ve saatini seçiniz.');
      return;
    }

    clearSubmittedBooking();
    // Seamless in-place transition to VEHICLES step inside same drawer
    setDrawerStep('VEHICLES');
  };

  const handleSelectDrop = (drop) => {
    const p = airports.find((a) => a.id === drop.pickupId) || { id: drop.pickupId, name: drop.pickupName };
    const d = destinations.find((dest) => dest.id === drop.destId) || { id: drop.destId, name: drop.destName };
    
    setPickup(p);
    setDestination(d);
    setPickupQuery(p.name);
    setDestQuery(d.name);
    
    if (!datetime) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);
      setDatetime(tomorrow.toISOString().slice(0, 16));
    }

    setDrawerStep('VEHICLES');
    setSearchDrawerOpen(true);
  };

  const handleSelectVehicle = (vId) => {
    setSelectedVehicleId(vId);
    setDrawerStep('AMENITIES');
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

      setDrawerStep('CONFIRMATION');
    } catch (err) {
      console.error(err);
      alert('İşlem sırasında bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDrawerBack = () => {
    if (drawerStep === 'VEHICLES') setDrawerStep('SEARCH');
    else if (drawerStep === 'AMENITIES') setDrawerStep('VEHICLES');
    else if (drawerStep === 'PASSENGER') setDrawerStep('AMENITIES');
    else if (drawerStep === 'CONFIRMATION') setSearchDrawerOpen(false);
  };

  return (
    <section className="sky-hero-root" id="hero">
      {/* Top Header Logo */}
      <div className="sky-hero-container">
        <header className="sky-brand-bar">
          <Link to="/" className="sky-brand-logo">
            <div className="sky-sun-icon">
              <Sparkles size={22} color="#ffffff" />
            </div>
            <span className="sky-brand-name">
              Secure<span>Drive</span>
            </span>
          </Link>
        </header>

        {/* 3 Circular Service Action Circles (Skyscanner Style) */}
        <div className="sky-service-circles">
          <button
            type="button"
            className={`sky-circle-btn ${activeTab === 'flights' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('flights');
              setServiceType('transfer');
              setDrawerStep('SEARCH');
              setSearchDrawerOpen(true);
            }}
          >
            <div className="sky-circle-icon">
              <Plane size={24} />
            </div>
            <span>Uçuşlar</span>
          </button>

          <button
            type="button"
            className={`sky-circle-btn ${activeTab === 'hotels' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('hotels');
              setServiceType('transfer');
              setDrawerStep('SEARCH');
              setSearchDrawerOpen(true);
            }}
          >
            <div className="sky-circle-icon">
              <Hotel size={24} />
            </div>
            <span>Konaklama yerleri</span>
          </button>

          <button
            type="button"
            className={`sky-circle-btn ${activeTab === 'cars' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('cars');
              setServiceType('chauffeur');
              setDrawerStep('VEHICLES');
              setSearchDrawerOpen(true);
            }}
          >
            <div className="sky-circle-icon">
              <Car size={24} />
            </div>
            <span>Araçlar</span>
          </button>
        </div>

        {/* 2 Feature Promo Cards Grid */}
        <div className="sky-promo-grid">
          <div 
            className="sky-promo-card"
            onClick={() => {
              setDrawerStep('VEHICLES');
              setSearchDrawerOpen(true);
            }}
            style={{ cursor: 'pointer' }}
          >
            <h3>Tüm VIP filoyu keşfedin</h3>
            <p>Mercedes Maybach, S-Class, Vito Lounge</p>
          </div>

          <div
            className="sky-promo-card"
            onClick={() => setWhyModalOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            <h3>Neden SecureDrive?</h3>
            <p>D2 Belgeli, Protokol Şoförü, Sabit Fiyat</p>
          </div>
        </div>

        {/* Main Quick-Search Trigger Bar (Skyscanner Search Pill) */}
        <div
          className="sky-search-trigger"
          onClick={() => {
            setDrawerStep('SEARCH');
            setSearchDrawerOpen(true);
          }}
        >
          <div className="sky-search-trigger__left">
            <div className="sky-search-badge-icon">
              <Plane size={18} />
            </div>
            <div>
              <div className="sky-search-title">
                {pickup ? pickup.name : 'Nereden kalkış yapacağınızı seçin'}
              </div>
              <div className="sky-search-sub">
                {destination ? `➔ ${destination.name}` : 'İstanbul (Herhangi biri: IST, SAW ➔ Otel veya Adres)'}
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="sky-search-chevron" />
        </div>

        {/* =========================================================================
            IN-PLACE MULTI-STEP SKYSCANNER BOOKING DRAWER (NO PAGE NAVIGATION)
           ========================================================================= */}
        {searchDrawerOpen && (
          <div className="sky-search-drawer-backdrop" onClick={() => setSearchDrawerOpen(false)}>
            <div className="sky-search-drawer in-place-sheet" onClick={(e) => e.stopPropagation()}>
              
              {/* Drawer Top Navigation Bar with Back & Close */}
              <div className="sky-drawer-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {drawerStep !== 'SEARCH' && drawerStep !== 'CONFIRMATION' && (
                    <button
                      type="button"
                      className="sky-drawer-back-btn"
                      onClick={handleDrawerBack}
                      title="Geri"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                    {drawerStep === 'SEARCH' && 'VIP Transfer Rezervasyonu'}
                    {drawerStep === 'VEHICLES' && 'Araç Seçimi (1/4)'}
                    {drawerStep === 'AMENITIES' && 'Donanım & Ekstralar (2/4)'}
                    {drawerStep === 'PASSENGER' && 'Yolcu & Ödeme (3/4)'}
                    {drawerStep === 'CONFIRMATION' && 'Rezervasyon Onaylandı (4/4)'}
                  </h3>
                </div>

                <button
                  type="button"
                  className="sky-drawer-close"
                  onClick={() => setSearchDrawerOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              {/* -------------------------------------------------------------
                  STEP 0: SEARCH & ROUTE
                 ------------------------------------------------------------- */}
              {drawerStep === 'SEARCH' && (
                <div className="sky-drawer-body">
                  <div className="sky-drawer-trip-types">
                    <button
                      type="button"
                      className={`sky-trip-type-btn ${tripType === 'oneway' ? 'active' : ''}`}
                      onClick={() => setTripType('oneway')}
                    >
                      Tek Yön
                    </button>
                    <button
                      type="button"
                      className={`sky-trip-type-btn ${tripType === 'roundtrip' ? 'active' : ''}`}
                      onClick={() => setTripType('roundtrip')}
                    >
                      Gidiş - Dönüş
                    </button>
                  </div>

                  <div className="sky-drawer-form">
                    <div className="sky-form-group">
                      <label>KALKIŞ NOKTASI / HAVALİMANI</label>
                      <div
                        className="sky-input-box"
                        onClick={() => {
                          setPickupOpen(true);
                          setDestOpen(false);
                        }}
                      >
                        <Plane size={16} color="#0284c7" />
                        <input
                          type="text"
                          value={pickupQuery}
                          onChange={(e) => {
                            setPickupQuery(e.target.value);
                            setPickupOpen(true);
                          }}
                          placeholder="Havalimanı veya Adres..."
                        />
                      </div>

                      {pickupOpen && (
                        <div className="sky-dropdown-menu">
                          {filteredAirports.map((a) => (
                            <div
                              key={a.id}
                              className="sky-dropdown-item"
                              onClick={() => {
                                setPickup(a);
                                setPickupQuery(a.name);
                                setPickupOpen(false);
                                setDestOpen(true);
                              }}
                            >
                              <Plane size={14} color="#0284c7" />
                              <div>
                                <strong>{a.name}</strong>
                                <small>{a.city} · VIP Terminal</small>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="sky-form-group">
                      <label>VARIŞ NOKTASI / OTEL / ADRES</label>
                      <div
                        className="sky-input-box"
                        onClick={() => {
                          setDestOpen(true);
                          setPickupOpen(false);
                        }}
                      >
                        <Hotel size={16} color="#10b981" />
                        <input
                          type="text"
                          value={destQuery}
                          onChange={(e) => {
                            setDestQuery(e.target.value);
                            setDestOpen(true);
                          }}
                          placeholder="Otel, Marina veya Semt..."
                        />
                      </div>

                      {destOpen && (
                        <div className="sky-dropdown-menu">
                          {filteredDestinations.map((d) => (
                            <div
                              key={d.id}
                              className="sky-dropdown-item"
                              onClick={() => {
                                setDestination(d);
                                setDestQuery(d.name);
                                setDestOpen(false);
                              }}
                            >
                              <Hotel size={14} color="#10b981" />
                              <div>
                                <strong>{d.name}</strong>
                                <small>{d.district ? `${d.district}, ${d.city}` : d.city}</small>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="sky-form-group">
                      <label>TRANSFER TARİHİ VE SAATİ</label>
                      <div className="sky-input-box">
                        <Calendar size={16} color="#f59e0b" />
                        <input
                          type="datetime-local"
                          value={datetime}
                          onChange={(e) => setDatetime(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="sky-form-group">
                      <label>YOLCU VE BAGAJ KAPASİTESİ</label>
                      <div className="sky-pax-row">
                        <div className="sky-pax-box">
                          <span>Yolcu:</span>
                          <div className="sky-counter">
                            <button
                              type="button"
                              onClick={() => setPax(Math.max(1, pax - 1))}
                            >
                              -
                            </button>
                            <b>{pax}</b>
                            <button
                              type="button"
                              onClick={() => setPax(Math.min(16, pax + 1))}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="sky-pax-box">
                          <span>Bagaj:</span>
                          <div className="sky-counter">
                            <button
                              type="button"
                              onClick={() => setLuggage(Math.max(0, luggage - 1))}
                            >
                              -
                            </button>
                            <b>{luggage}</b>
                            <button
                              type="button"
                              onClick={() => setLuggage(Math.min(16, luggage + 1))}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="sky-submit-btn"
                      onClick={handleStartBooking}
                    >
                      <span>VIP Araçları ve Fiyatları Gör</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  STEP 1: VEHICLE SELECTION (IN-PLACE)
                 ------------------------------------------------------------- */}
              {drawerStep === 'VEHICLES' && (
                <div className="sky-drawer-body">
                  {/* Route Summary Tag */}
                  <div className="sky-in-sheet-route-tag">
                    <span>{pickup?.name?.split('(')[0]?.trim()} ➔ {destination?.name?.split('(')[0]?.trim()}</span>
                    <small>~{durationMin} dk · {distanceKm} km</small>
                  </div>

                  {/* Filter Pills */}
                  <div className="sky-filter-chips" style={{ marginBottom: '12px' }}>
                    {[
                      { id: 'ALL', label: 'Tümü' },
                      { id: 'MINIVAN', label: 'VIP Minivan' },
                      { id: 'SEDAN', label: 'Lüks Sedan' },
                      { id: 'SPRINTER', label: 'VIP Sprinter' }
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={`sky-filter-chip ${vehicleFilter === c.id ? 'active' : ''}`}
                        onClick={() => setVehicleFilter(c.id)}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  {/* Vehicles List */}
                  <div className="sky-vehicle-cards">
                    {filteredFleet.map((v) => {
                      const isSelected = v.id === selectedVehicleId;
                      const baseFare = v.baseOpeningRate + (distanceKm * v.baseRateKm);
                      const fareFormatted = formatMoney(tripType === 'roundtrip' ? baseFare * 1.85 : baseFare);

                      return (
                        <div
                          key={v.id}
                          className={`sky-vehicle-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectVehicle(v.id)}
                        >
                          <div className="sky-vehicle-card__top">
                            <div className="sky-vehicle-title-wrap">
                              <h4 className="sky-vehicle-name">{v.name}</h4>
                              <span className="sky-vehicle-class-tag">{v.class}</span>
                            </div>
                            <span className="sky-price-val">{fareFormatted}</span>
                          </div>

                          <div className="sky-vehicle-card__body">
                            <div className="sky-vehicle-image-wrap">
                              <img src={v.image} alt={v.name} loading="lazy" />
                            </div>
                            <div className="sky-vehicle-details">
                              <div className="sky-vehicle-specs-grid">
                                <span className="sky-spec-item"><Users size={12} /> {v.seats} Kişi</span>
                                <span className="sky-spec-item"><Briefcase size={12} /> {v.luggage} Valiz</span>
                                <span className="sky-spec-item"><Wifi size={12} /> Wi-Fi</span>
                              </div>
                              <button
                                type="button"
                                className="sky-select-btn"
                                style={{ width: '100%', marginTop: '8px', justifyContent: 'center' }}
                              >
                                <span>Bu Aracı Seç</span>
                                <ChevronRight size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  STEP 2: AMENITIES & EXTRAS (IN-PLACE)
                 ------------------------------------------------------------- */}
              {drawerStep === 'AMENITIES' && (
                <div className="sky-drawer-body">
                  <div className="sky-in-sheet-route-tag">
                    <span>Tahsis Aracı: <strong>{selectedVehicleObj.name}</strong></span>
                  </div>

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

                  {/* Bottom Price Summary & Next Button */}
                  <div className="sky-drawer-footer-actions">
                    <div>
                      <span className="sky-price-label">Her Şey Dahil Tutar</span>
                      <strong className="sky-grand-price">{formatMoney(prices.grandTotalTRY || prices.total)}</strong>
                    </div>
                    <button
                      type="button"
                      className="sky-submit-btn"
                      style={{ margin: 0, padding: '12px 20px' }}
                      onClick={() => setDrawerStep('PASSENGER')}
                    >
                      <span>Yolcu Bilgilerine Geç</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  STEP 3: PASSENGER & PAYMENT (IN-PLACE)
                 ------------------------------------------------------------- */}
              {drawerStep === 'PASSENGER' && (
                <div className="sky-drawer-body">
                  <form onSubmit={handleConfirmReservation} className="sky-passenger-form">
                    <div className="sky-form-row-2">
                      <div className="sky-form-group">
                        <label>ADINIZ *</label>
                        <div className="sky-input-box">
                          <User size={15} color="#64748b" />
                          <input
                            type="text"
                            required
                            value={passenger.name}
                            onChange={(e) => setPassenger({ ...passenger, name: e.target.value })}
                            placeholder="Adınız"
                          />
                        </div>
                      </div>
                      <div className="sky-form-group">
                        <label>SOYADINIZ *</label>
                        <div className="sky-input-box">
                          <User size={15} color="#64748b" />
                          <input
                            type="text"
                            required
                            value={passenger.surname}
                            onChange={(e) => setPassenger({ ...passenger, surname: e.target.value })}
                            placeholder="Soyadınız"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="sky-form-row-2">
                      <div className="sky-form-group">
                        <label>E-POSTA ADRESİ *</label>
                        <div className="sky-input-box">
                          <Mail size={15} color="#64748b" />
                          <input
                            type="email"
                            required
                            value={passenger.email}
                            onChange={(e) => setPassenger({ ...passenger, email: e.target.value })}
                            placeholder="ornek@email.com"
                          />
                        </div>
                      </div>
                      <div className="sky-form-group">
                        <label>TELEFON / WHATSAPP *</label>
                        <div className="sky-input-box">
                          <Phone size={15} color="#64748b" />
                          <input
                            type="tel"
                            required
                            value={passenger.phone}
                            onChange={(e) => setPassenger({ ...passenger, phone: e.target.value })}
                            placeholder="+90 532 000 00 00"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="sky-form-group">
                      <label>UÇUŞ KODU (CANLI RADAR İÇİN / OPSİYONEL)</label>
                      <div className="sky-input-box">
                        <FileText size={15} color="#64748b" />
                        <input
                          type="text"
                          value={passenger.flightNumber || ''}
                          onChange={(e) => setPassenger({ ...passenger, flightNumber: e.target.value })}
                          placeholder="Örn: TK 1980"
                        />
                      </div>
                    </div>

                    {/* Payment Types */}
                    <div className="sky-form-group">
                      <label>ÖDEME ŞEKLİ</label>
                      <div className="sky-payment-grid">
                        <label className={`sky-payment-option ${passenger.paymentMethod === 'cash' ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="paym"
                            value="cash"
                            checked={passenger.paymentMethod === 'cash'}
                            onChange={(e) => setPassenger({ ...passenger, paymentMethod: e.target.value })}
                          />
                          <Banknote size={16} />
                          <div>
                            <strong>Araçta Nakit / Kredi Kartı</strong>
                            <small>Şoföre seyahat sonunda ödeme</small>
                          </div>
                        </label>

                        <label className={`sky-payment-option ${passenger.paymentMethod === 'online' ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="paym"
                            value="online"
                            checked={passenger.paymentMethod === 'online'}
                            onChange={(e) => setPassenger({ ...passenger, paymentMethod: e.target.value })}
                          />
                          <CreditCard size={16} />
                          <div>
                            <strong>Online Güvenli Ödeme</strong>
                            <small>3D Secure / Masterpass</small>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="sky-submit-btn"
                      disabled={submitting}
                    >
                      <Lock size={16} />
                      <span>{submitting ? 'Oluşturuluyor...' : `VIP Transferi Onayla (${formatMoney(prices.grandTotalTRY || prices.total)})`}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* -------------------------------------------------------------
                  STEP 4: CONFIRMATION & DIGITAL BOARDING PASS (IN-PLACE)
                 ------------------------------------------------------------- */}
              {drawerStep === 'CONFIRMATION' && (
                <div className="sky-drawer-body" style={{ textAlign: 'center', padding: '16px 8px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Check size={32} strokeWidth={3} />
                  </div>

                  <h3 style={{ fontSize: '19px', fontWeight: 800, margin: '0 0 6px', color: '#0f172a' }}>
                    Rezervasyonunuz Başarıyla Alındı!
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 18px' }}>
                    VIP aracınız adınıza tahsis edildi. Detaylar SMS ve WhatsApp ile iletilmiştir.
                  </p>

                  <div style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '16px', padding: '16px', marginBottom: '18px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>REZERVASYON KODU</span>
                      <strong style={{ fontSize: '16px', color: '#0284c7', fontFamily: 'monospace' }}>
                        {confirmedBooking?.code || 'SDRV-VIP'}
                      </strong>
                    </div>

                    <div style={{ fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>🛫 <b>Kalkış:</b> {pickup?.name}</div>
                      <div>🏨 <b>Varış:</b> {destination?.name}</div>
                      <div>🚘 <b>Araç:</b> {selectedVehicleObj.name}</div>
                      <div>💰 <b>Tutar:</b> {formatMoney(prices.grandTotalTRY || prices.total)}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      type="button"
                      className="sky-submit-btn"
                      onClick={() => {
                        setSearchDrawerOpen(false);
                        navigate('/takip');
                      }}
                    >
                      <Radar size={16} />
                      <span>Canlı Şoför & Radar Takibini Aç</span>
                    </button>

                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setSearchDrawerOpen(false)}
                      style={{ padding: '10px' }}
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Why SecureDrive Modal */}
        {whyModalOpen && (
          <div className="sky-search-drawer-backdrop" onClick={() => setWhyModalOpen(false)}>
            <div className="sky-why-modal" onClick={(e) => e.stopPropagation()}>
              <div className="sky-drawer-header">
                <h3>Neden SecureDrive VIP?</h3>
                <button
                  type="button"
                  className="sky-drawer-close"
                  onClick={() => setWhyModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="sky-why-content">
                <div className="sky-why-item">
                  <ShieldCheck size={24} color="#0284c7" />
                  <div>
                    <strong>T.C. Ulaştırma Bakanlığı D2 Yetki Belgesi</strong>
                    <p>Tüm filomuz ve şoförlerimiz resmi lisanslı, ticari ve protokol taşımacılığına tam yetkilidir.</p>
                  </div>
                </div>
                <div className="sky-why-item">
                  <Sparkles size={24} color="#f59e0b" />
                  <div>
                    <strong>Sıfır Sürpriz Sabit Fiyat Garantisi</strong>
                    <p>Köprü, otoyol, tünel, yakıt ve KDV dahil net fiyat. Ekstra hiçbir gizli ücret ödemezsiniz.</p>
                  </div>
                </div>
                <div className="sky-why-item">
                  <Radar size={24} color="#10b981" />
                  <div>
                    <strong>Canlı Radar & 60 Dk Ücretsiz Bekleme</strong>
                    <p>Uçağınız erken inse veya rötar yapsa da şoförünüz canlı radarla takip eder ve sizi kapıda bekler.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DROPS SECTION */}
      <section className="sky-drops-section" id="drops-section">
        <div className="sky-hero-container">
          <div className="sky-drops-head">
            <div>
              <div className="sky-drops-badge-row">
                <h2 className="sky-drops-title">DROPS</h2>
                <button
                  type="button"
                  className="sky-drops-arrow-btn"
                  onClick={() => {
                    setDrawerStep('VEHICLES');
                    setSearchDrawerOpen(true);
                  }}
                  title="Tüm Rotaları Gör"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
              <h3 className="sky-drops-headline">
                En az %20 oranında avantajlı VIP transfer fiyatları
              </h3>
              <p className="sky-drops-sub">Bugünün tercihlerine göz atalım.</p>
            </div>
          </div>

          <div className="sky-drops-carousel">
            {DROPS_ROUTES.map((drop) => (
              <div
                key={drop.id}
                className="sky-drop-card"
                onClick={() => handleSelectDrop(drop)}
              >
                <div className="sky-drop-card__img-wrap">
                  <img src={drop.image} alt={drop.title} loading="lazy" />
                  <div className="sky-drop-pill">
                    <TrendingDown size={13} />
                    <span>{drop.dropAmount} TL indirim</span>
                  </div>
                </div>

                <div className="sky-drop-card__body">
                  <h4 className="sky-drop-card__title">{drop.title}</h4>
                  <p className="sky-drop-card__sub">{drop.subtitle}</p>

                  <div className="sky-drop-card__price-row">
                    <div>
                      <span className="sky-drop-old-price">{drop.originalPrice} ₺</span>
                      <strong className="sky-drop-new-price">{drop.dropPrice} ₺</strong>
                    </div>
                    <button type="button" className="sky-drop-select-btn">
                      <span>Seç</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
