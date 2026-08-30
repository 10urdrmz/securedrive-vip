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
  Clock,
  Award
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

  const [drawerStep, setDrawerStep] = useState('SEARCH'); // 'SEARCH' | 'VEHICLES' | 'AMENITIES' | 'PASSENGER' | 'CONFIRMATION'
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
    <section className="turna-hero-root" id="hero">
      <div className="turna-hero-container">
        
        {/* Main Headline & Value Props */}
        <div className="turna-hero-header">
          <div className="turna-trust-badge">
            <ShieldCheck size={14} color="#0b4de0" />
            <span>T.C. Ulaştırma Bakanlığı D2 Lisanslı VIP Taşımacılık</span>
          </div>
          <h1 className="turna-hero-title">
            Türkiye'nin Lider <span>VIP Transfer</span> Platformu
          </h1>
          <p className="turna-hero-subtitle">
            Havalimanı VIP karşılama, sabit fiyat garantisi ve 7/24 tahsisli protokol şoförü hizmeti.
          </p>
        </div>

        {/* Turna Service Category Tabs */}
        <div className="turna-service-tabs">
          <button
            type="button"
            className={`turna-tab-btn ${activeTab === 'flights' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('flights');
              setServiceType('transfer');
              setDrawerStep('SEARCH');
              setSearchDrawerOpen(true);
            }}
          >
            <Plane size={18} />
            <span>Havalimanı VIP Transfer</span>
          </button>

          <button
            type="button"
            className={`turna-tab-btn ${activeTab === 'hotels' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('hotels');
              setServiceType('transfer');
              setDrawerStep('SEARCH');
              setSearchDrawerOpen(true);
            }}
          >
            <Hotel size={18} />
            <span>Otel & Şehir İçi</span>
          </button>

          <button
            type="button"
            className={`turna-tab-btn ${activeTab === 'cars' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('cars');
              setServiceType('chauffeur');
              setDrawerStep('VEHICLES');
              setSearchDrawerOpen(true);
            }}
          >
            <Car size={18} />
            <span>Özel Şoför & Tahsis</span>
          </button>

          <Link to="/takip" className="turna-tab-btn">
            <Radar size={18} />
            <span>Canlı Radar Takibi</span>
          </Link>
        </div>

        {/* Turna Clean White Quick-Search Card */}
        <div
          className="turna-search-card"
          onClick={() => {
            setDrawerStep('SEARCH');
            setSearchDrawerOpen(true);
          }}
        >
          <div className="turna-search-card__left">
            <div className="turna-search-icon-box">
              <Plane size={22} color="#0b4de0" />
            </div>
            <div>
              <div className="turna-search-label">
                {pickup ? pickup.name : 'Nereden transfer istiyorsunuz?'}
              </div>
              <div className="turna-search-value">
                {destination ? `➔ ${destination.name}` : 'İstanbul (IST, SAW) ➔ Otel, Marina veya Adres Seçin'}
              </div>
            </div>
          </div>

          <button type="button" className="turna-search-action-btn">
            <span>Fiyatları Gör</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* 2 Feature Promo Cards */}
        <div className="turna-promo-grid">
          <div 
            className="turna-promo-card"
            onClick={() => {
              setDrawerStep('VEHICLES');
              setSearchDrawerOpen(true);
            }}
          >
            <div className="turna-promo-icon-wrap" style={{ background: '#eef2ff', color: '#0b4de0' }}>
              <Car size={22} />
            </div>
            <div>
              <h3>Tüm VIP Filoyu Keşfedin</h3>
              <p>Mercedes-Benz Maybach, S-Class ve Vito VIP Lounge filosu</p>
            </div>
          </div>

          <div
            className="turna-promo-card"
            onClick={() => setWhyModalOpen(true)}
          >
            <div className="turna-promo-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3>Neden SecureDrive?</h3>
              <p>D2 Yetki Belgesi, Protokol Şoförleri, %100 Sabit Fiyat Güvencesi</p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            IN-PLACE MULTI-STEP TURNA BOOKING DRAWER (NO PAGE NAVIGATION)
           ========================================================================= */}
        {searchDrawerOpen && (
          <div className="turna-drawer-backdrop" onClick={() => setSearchDrawerOpen(false)}>
            <div className="turna-drawer" onClick={(e) => e.stopPropagation()}>
              
              {/* Drawer Header */}
              <div className="turna-drawer-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {drawerStep !== 'SEARCH' && drawerStep !== 'CONFIRMATION' && (
                    <button
                      type="button"
                      className="turna-drawer-back-btn"
                      onClick={handleDrawerBack}
                      title="Geri"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                    {drawerStep === 'SEARCH' && 'VIP Transfer Rezervasyonu'}
                    {drawerStep === 'VEHICLES' && 'Araç Seçimi (1/4)'}
                    {drawerStep === 'AMENITIES' && 'Donanım & Ekstralar (2/4)'}
                    {drawerStep === 'PASSENGER' && 'Yolcu & Ödeme (3/4)'}
                    {drawerStep === 'CONFIRMATION' && 'Rezervasyon Onaylandı (4/4)'}
                  </h3>
                </div>

                <button
                  type="button"
                  className="turna-drawer-close"
                  onClick={() => setSearchDrawerOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              {/* STEP 0: SEARCH & ROUTE */}
              {drawerStep === 'SEARCH' && (
                <div className="turna-drawer-body">
                  <div className="turna-trip-type-row">
                    <button
                      type="button"
                      className={`turna-type-btn ${tripType === 'oneway' ? 'active' : ''}`}
                      onClick={() => setTripType('oneway')}
                    >
                      Tek Yön
                    </button>
                    <button
                      type="button"
                      className={`turna-type-btn ${tripType === 'roundtrip' ? 'active' : ''}`}
                      onClick={() => setTripType('roundtrip')}
                    >
                      Gidiş - Dönüş (%15 İndirimli)
                    </button>
                  </div>

                  <div className="turna-drawer-form">
                    <div className="turna-form-group">
                      <label>KALKIŞ NOKTASI / HAVALİMANI</label>
                      <div
                        className="turna-input-box"
                        onClick={() => {
                          setPickupOpen(true);
                          setDestOpen(false);
                        }}
                      >
                        <Plane size={18} color="#0b4de0" />
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
                        <div className="turna-dropdown-menu">
                          {filteredAirports.map((a) => (
                            <div
                              key={a.id}
                              className="turna-dropdown-item"
                              onClick={() => {
                                setPickup(a);
                                setPickupQuery(a.name);
                                setPickupOpen(false);
                                setDestOpen(true);
                              }}
                            >
                              <Plane size={16} color="#0b4de0" />
                              <div>
                                <strong>{a.name}</strong>
                                <small>{a.city} · VIP Terminal</small>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="turna-form-group">
                      <label>VARIŞ NOKTASI / OTEL / ADRES</label>
                      <div
                        className="turna-input-box"
                        onClick={() => {
                          setDestOpen(true);
                          setPickupOpen(false);
                        }}
                      >
                        <Hotel size={18} color="#059669" />
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
                        <div className="turna-dropdown-menu">
                          {filteredDestinations.map((d) => (
                            <div
                              key={d.id}
                              className="turna-dropdown-item"
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
                      )}
                    </div>

                    <div className="turna-form-group">
                      <label>TRANSFER TARİHİ VE SAATİ</label>
                      <div className="turna-input-box">
                        <Calendar size={18} color="#f59e0b" />
                        <input
                          type="datetime-local"
                          value={datetime}
                          onChange={(e) => setDatetime(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="turna-form-group">
                      <label>YOLCU VE BAGAJ SAYISI</label>
                      <div className="turna-pax-grid">
                        <div className="turna-counter-box">
                          <span>Yolcu Sayısı:</span>
                          <div className="turna-counter">
                            <button type="button" onClick={() => setPax(Math.max(1, pax - 1))}>-</button>
                            <b>{pax}</b>
                            <button type="button" onClick={() => setPax(Math.min(16, pax + 1))}>+</button>
                          </div>
                        </div>
                        <div className="turna-counter-box">
                          <span>Bagaj Sayısı:</span>
                          <div className="turna-counter">
                            <button type="button" onClick={() => setLuggage(Math.max(0, luggage - 1))}>-</button>
                            <b>{luggage}</b>
                            <button type="button" onClick={() => setLuggage(Math.min(16, luggage + 1))}>+</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="turna-primary-btn"
                      onClick={handleStartBooking}
                    >
                      <span>VIP Araçları ve Fiyatları Gör</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 1: VEHICLE SELECTION */}
              {drawerStep === 'VEHICLES' && (
                <div className="turna-drawer-body">
                  <div className="turna-route-pill-summary">
                    <span>{pickup?.name?.split('(')[0]?.trim()} ➔ {destination?.name?.split('(')[0]?.trim()}</span>
                    <small>~{durationMin} dk · {distanceKm} km</small>
                  </div>

                  <div className="turna-filter-chips">
                    {[
                      { id: 'ALL', label: 'Tümü' },
                      { id: 'MINIVAN', label: 'VIP Minivan' },
                      { id: 'SEDAN', label: 'Lüks Sedan' },
                      { id: 'SPRINTER', label: 'VIP Sprinter' }
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={`turna-chip ${vehicleFilter === c.id ? 'active' : ''}`}
                        onClick={() => setVehicleFilter(c.id)}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  <div className="turna-vehicle-list">
                    {filteredFleet.map((v) => {
                      const isSelected = v.id === selectedVehicleId;
                      const baseFare = v.baseOpeningRate + (distanceKm * v.baseRateKm);
                      const fareFormatted = formatMoney(tripType === 'roundtrip' ? baseFare * 1.85 : baseFare);

                      return (
                        <div
                          key={v.id}
                          className={`turna-vehicle-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectVehicle(v.id)}
                        >
                          <div className="turna-vehicle-card__top">
                            <div>
                              <h4 className="turna-vehicle-name">{v.name}</h4>
                              <span className="turna-vehicle-class">{v.class}</span>
                            </div>
                            <span className="turna-vehicle-price">{fareFormatted}</span>
                          </div>

                          <div className="turna-vehicle-card__body">
                            <div className="turna-vehicle-img-wrap">
                              <img src={v.image} alt={v.name} loading="lazy" />
                            </div>
                            <div className="turna-vehicle-meta">
                              <div className="turna-specs-wrap">
                                <span><Users size={13} /> {v.seats} Kişi</span>
                                <span><Briefcase size={13} /> {v.luggage} Valiz</span>
                                <span><Wifi size={13} /> Wi-Fi</span>
                              </div>
                              <button type="button" className="turna-select-btn">
                                <span>Bu Aracı Seç</span>
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: AMENITIES */}
              {drawerStep === 'AMENITIES' && (
                <div className="turna-drawer-body">
                  <div className="turna-route-pill-summary">
                    <span>Tahsis Aracı: <strong>{selectedVehicleObj.name}</strong></span>
                  </div>

                  <div className="turna-amenities-list">
                    {amenitiesList.map((am) => {
                      const current = selectedAmenities[am.id] || { selected: false, count: 0 };
                      const isChecked = current.selected || am.checkedByDefault;

                      return (
                        <div
                          key={am.id}
                          className={`turna-amenity-card ${isChecked ? 'active' : ''}`}
                          onClick={() => toggleAmenity(am.id)}
                        >
                          <div className="turna-amenity-checkbox">
                            {isChecked && <Check size={14} strokeWidth={3} />}
                          </div>

                          <div className="turna-amenity-info">
                            <div className="turna-amenity-head">
                              <strong>{am.title}</strong>
                              {am.isFree ? (
                                <span className="turna-tag free">Dahil</span>
                              ) : (
                                <span className="turna-tag price">+{formatMoney(am.priceTRY)}</span>
                              )}
                            </div>
                            <p>{am.subtitle}</p>

                            {am.hasCount && (
                              <div className="turna-counter-inline" onClick={(e) => e.stopPropagation()}>
                                <button type="button" onClick={() => updateAmenityCount(am.id, (current.count || 0) - 1)}>-</button>
                                <b>{current.count || 1} Adet</b>
                                <button type="button" onClick={() => updateAmenityCount(am.id, (current.count || 0) + 1)}>+</button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="turna-footer-action-row">
                    <div>
                      <span className="turna-price-sub">Toplam Tutar:</span>
                      <strong className="turna-price-main">{formatMoney(prices.grandTotalTRY || prices.total)}</strong>
                    </div>
                    <button
                      type="button"
                      className="turna-primary-btn"
                      style={{ width: 'auto', padding: '12px 24px' }}
                      onClick={() => setDrawerStep('PASSENGER')}
                    >
                      <span>Yolcu Bilgilerine Geç</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PASSENGER */}
              {drawerStep === 'PASSENGER' && (
                <div className="turna-drawer-body">
                  <form onSubmit={handleConfirmReservation} className="turna-passenger-form">
                    <div className="turna-form-row-2">
                      <div className="turna-form-group">
                        <label>ADINIZ *</label>
                        <div className="turna-input-box">
                          <User size={16} color="#64748b" />
                          <input
                            type="text"
                            required
                            value={passenger.name}
                            onChange={(e) => setPassenger({ ...passenger, name: e.target.value })}
                            placeholder="Adınız"
                          />
                        </div>
                      </div>
                      <div className="turna-form-group">
                        <label>SOYADINIZ *</label>
                        <div className="turna-input-box">
                          <User size={16} color="#64748b" />
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

                    <div className="turna-form-row-2">
                      <div className="turna-form-group">
                        <label>E-POSTA ADRESİ *</label>
                        <div className="turna-input-box">
                          <Mail size={16} color="#64748b" />
                          <input
                            type="email"
                            required
                            value={passenger.email}
                            onChange={(e) => setPassenger({ ...passenger, email: e.target.value })}
                            placeholder="ornek@email.com"
                          />
                        </div>
                      </div>
                      <div className="turna-form-group">
                        <label>TELEFON / WHATSAPP *</label>
                        <div className="turna-input-box">
                          <Phone size={16} color="#64748b" />
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

                    <div className="turna-form-group">
                      <label>UÇUŞ NUMARASI (CANLI RADAR İÇİN / OPSİYONEL)</label>
                      <div className="turna-input-box">
                        <FileText size={16} color="#64748b" />
                        <input
                          type="text"
                          value={passenger.flightNumber || ''}
                          onChange={(e) => setPassenger({ ...passenger, flightNumber: e.target.value })}
                          placeholder="Örn: TK 1980 veya PC 2210"
                        />
                      </div>
                    </div>

                    <div className="turna-form-group">
                      <label>ÖDEME TÜRÜ</label>
                      <div className="turna-payment-row">
                        <label className={`turna-payment-card ${passenger.paymentMethod === 'cash' ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="pm"
                            value="cash"
                            checked={passenger.paymentMethod === 'cash'}
                            onChange={(e) => setPassenger({ ...passenger, paymentMethod: e.target.value })}
                          />
                          <Banknote size={18} color="#059669" />
                          <div>
                            <strong>Araçta Nakit / Kredi Kartı</strong>
                            <small>Şoföre seyahat sonunda ödeme</small>
                          </div>
                        </label>

                        <label className={`turna-payment-card ${passenger.paymentMethod === 'online' ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="pm"
                            value="online"
                            checked={passenger.paymentMethod === 'online'}
                            onChange={(e) => setPassenger({ ...passenger, paymentMethod: e.target.value })}
                          />
                          <CreditCard size={18} color="#0b4de0" />
                          <div>
                            <strong>Online Güvenli Ödeme</strong>
                            <small>3D Secure / Masterpass</small>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="turna-primary-btn"
                      disabled={submitting}
                    >
                      <Lock size={16} />
                      <span>{submitting ? 'Oluşturuluyor...' : `VIP Transferi Onayla (${formatMoney(prices.grandTotalTRY || prices.total)})`}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 4: CONFIRMATION */}
              {drawerStep === 'CONFIRMATION' && (
                <div className="turna-drawer-body" style={{ textAlign: 'center', padding: '16px 8px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Check size={32} strokeWidth={3} />
                  </div>

                  <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px', color: '#0f172a' }}>
                    Rezervasyonunuz Başarıyla Alındı!
                  </h3>
                  <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 18px' }}>
                    VIP aracınız adınıza tahsis edildi. Kupon detayları SMS ve WhatsApp ile iletilmiştir.
                  </p>

                  <div style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '16px', padding: '16px', marginBottom: '18px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>REZERVASYON KODU</span>
                      <strong style={{ fontSize: '17px', color: '#0b4de0', fontFamily: 'monospace' }}>
                        {confirmedBooking?.code || 'SDRV-VIP'}
                      </strong>
                    </div>

                    <div style={{ fontSize: '13.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div>🛫 <b>Kalkış:</b> {pickup?.name}</div>
                      <div>🏨 <b>Varış:</b> {destination?.name}</div>
                      <div>🚘 <b>Araç:</b> {selectedVehicleObj.name}</div>
                      <div>💰 <b>Tutar:</b> {formatMoney(prices.grandTotalTRY || prices.total)}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      type="button"
                      className="turna-primary-btn"
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
          <div className="turna-drawer-backdrop" onClick={() => setWhyModalOpen(false)}>
            <div className="turna-drawer" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <div className="turna-drawer-header">
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>Neden SecureDrive VIP?</h3>
                <button
                  type="button"
                  className="turna-drawer-close"
                  onClick={() => setWhyModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px 0' }}>
                <div style={{ display: 'flex', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                  <ShieldCheck size={24} color="#0b4de0" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a', marginBottom: '2px' }}>T.C. Ulaştırma Bakanlığı D2 Belgesi</strong>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', lineHeight: 1.4 }}>Tüm araçlarımız ve şoförlerimiz resmi lisanslı, ticari ve protokol taşımacılığına tam yetkilidir.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                  <Sparkles size={24} color="#f59e0b" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a', marginBottom: '2px' }}>Sıfır Sürpriz Sabit Fiyat Garantisi</strong>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', lineHeight: 1.4 }}>Köprü, otoyol, tünel, yakıt ve KDV dahil net fiyat. Ekstra hiçbir gizli ücret ödemezsiniz.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                  <Clock size={24} color="#059669" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a', marginBottom: '2px' }}>60 Dk Ücretsiz Uçuş Rötar Bekleme</strong>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', lineHeight: 1.4 }}>Uçağınız erken inse veya rötar yapsa da şoförünüz canlı radarla takip eder ve sizi kapıda bekler.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* POPÜLER VIP ROTALAR (DROPS) */}
      <section className="turna-deals-section" id="drops-section">
        <div className="turna-hero-container">
          <div className="turna-deals-head">
            <div>
              <div className="turna-badge-row">
                <span className="turna-section-badge">GÜNÜN FIRSATLARI</span>
              </div>
              <h2 className="turna-deals-title">En Popüler Avantajlı VIP Rotalar</h2>
              <p className="turna-deals-sub">%20'ye varan indirimli sabit fiyatlı VIP havalimanı ve şehirlerarası transferler.</p>
            </div>
          </div>

          <div className="turna-deals-grid">
            {DROPS_ROUTES.map((drop) => (
              <div
                key={drop.id}
                className="turna-deal-card"
                onClick={() => handleSelectDrop(drop)}
              >
                <div className="turna-deal-img-wrap">
                  <img src={drop.image} alt={drop.title} loading="lazy" />
                  <div className="turna-deal-drop-pill">
                    <TrendingDown size={13} />
                    <span>{drop.dropAmount} TL indirim</span>
                  </div>
                </div>

                <div className="turna-deal-body">
                  <h4 className="turna-deal-title">{drop.title}</h4>
                  <p className="turna-deal-sub">{drop.subtitle}</p>

                  <div className="turna-deal-price-row">
                    <div>
                      <span className="turna-deal-old">{drop.originalPrice} ₺</span>
                      <strong className="turna-deal-new">{drop.dropPrice} ₺</strong>
                    </div>
                    <button type="button" className="turna-deal-btn">
                      <span>Seç</span>
                      <ChevronRight size={15} />
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
