import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { buildRouteDestinationOptions, buildRoutePickupOptions } from '../../lib/routeLocation';
import { BOOKING_WIZARD_PATHS, clearSubmittedBooking, hasValidSearchDraft } from '../../lib/bookingWizard';
import { 
  Plane, 
  Hotel, 
  Car, 
  Radar, 
  ArrowRight, 
  ChevronRight, 
  Calendar, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  TrendingDown, 
  Check, 
  ArrowRightLeft,
  X,
  Search
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
    swapLocations,
    applyRoute
  } = useBooking();

  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('flights'); // 'flights', 'hotels', 'cars', 'radar'
  const [whyModalOpen, setWhyModalOpen] = useState(false);

  const [pickupOpen, setPickupOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const [pickupQuery, setPickupQuery] = useState(pickup?.name || '');
  const [destQuery, setDestQuery] = useState(destination?.name || '');

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
    setSearchDrawerOpen(false);
    navigate(BOOKING_WIZARD_PATHS.vehicle);
  };

  const handleSelectDrop = (drop) => {
    const p = airports.find((a) => a.id === drop.pickupId) || { id: drop.pickupId, name: drop.pickupName };
    const d = destinations.find((dest) => dest.id === drop.destId) || { id: drop.destId, name: drop.destName };
    
    setPickup(p);
    setDestination(d);
    setPickupQuery(p.name);
    setDestQuery(d.name);
    
    // Auto set a valid datetime if not set
    if (!datetime) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);
      setDatetime(tomorrow.toISOString().slice(0, 16));
    }

    setSearchDrawerOpen(true);
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
          <Link to="/filo" className="sky-promo-card">
            <h3>Tüm VIP filoyu keşfedin</h3>
            <p>Mercedes Maybach, S-Class, Vito Lounge</p>
          </Link>

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
          onClick={() => setSearchDrawerOpen(true)}
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

        {/* Search / Booking Modal & Expandable Drawer */}
        {searchDrawerOpen && (
          <div className="sky-search-drawer-backdrop" onClick={() => setSearchDrawerOpen(false)}>
            <div className="sky-search-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="sky-drawer-header">
                <h3>VIP Transfer Rezervasyonu</h3>
                <button
                  type="button"
                  className="sky-drawer-close"
                  onClick={() => setSearchDrawerOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Service Type Switcher */}
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

              {/* Form Fields */}
              <div className="sky-drawer-form">
                {/* Pickup Field */}
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
                      placeholder="Havalimanı veya Adres Seçin..."
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

                {/* Destination Field */}
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
                      placeholder="Otel, Marina veya Semt Seçin..."
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

                {/* Date & Time Field */}
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

                {/* Pax Count */}
                <div className="sky-form-group">
                  <label>YOLCU VE BAGAJ KAPASİTESİ</label>
                  <div className="sky-pax-row">
                    <div className="sky-pax-box">
                      <span>Yolcu Sayısı:</span>
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
                      <span>Bagaj Sayısı:</span>
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

                {/* Action Submit Button */}
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
                  <X size={20} />
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

      {/* DROPS SECTION (%20 İndirimli VIP Fiyatlar) */}
      <section className="sky-drops-section" id="drops-section">
        <div className="sky-hero-container">
          <div className="sky-drops-head">
            <div>
              <div className="sky-drops-badge-row">
                <h2 className="sky-drops-title">DROPS</h2>
                <button
                  type="button"
                  className="sky-drops-arrow-btn"
                  onClick={() => navigate('/rotalar')}
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

          {/* Horizontal Scrollable Deals Carousel */}
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
