import React, { useEffect, useRef } from 'react';
import { useBooking } from '../../context/BookingContext';
import L from 'leaflet';
import { Headset } from 'lucide-react';

export default function RouteMapSidebar() {
  const {
    fleet,
    pickup,
    destination,
    tripType,
    selectedVehicleId,
    distanceKm,
    durationMin,
    calculatePrices,
    formatMoney
  } = useBooking();

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  const vehicle = fleet?.find(v => v.id === selectedVehicleId) || fleet?.[0] || {
    name: 'Mercedes-Benz Vito VIP Lounge',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'
  };
  const prices = calculatePrices();

  // Initialize and update Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([41.15, 28.95], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear previous layers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    if (polylineRef.current) map.removeLayer(polylineRef.current);

    if (pickup?.coords && destination?.coords) {
      const pCoords = pickup.coords;
      const dCoords = destination.coords;

      const pIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background:#0d0d0d; color:#fff; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 5px rgba(0,0,0,0.3); font-size:9px;">🛫</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const dIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background:#0d0d0d; color:#fff; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 5px rgba(0,0,0,0.3); font-size:9px;">🏨</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const m1 = L.marker(pCoords, { icon: pIcon }).addTo(map);
      const m2 = L.marker(dCoords, { icon: dIcon }).addTo(map);
      markersRef.current = [m1, m2];

      const latDiff = dCoords[0] - pCoords[0];
      const lngDiff = dCoords[1] - pCoords[1];
      const midLat = pCoords[0] + latDiff * 0.5 + (lngDiff * 0.06);
      const midLng = pCoords[1] + lngDiff * 0.5 - (latDiff * 0.06);

      polylineRef.current = L.polyline([pCoords, [midLat, midLng], dCoords], {
        color: '#0d0d0d',
        weight: 3,
        opacity: 0.85,
        dashArray: '6, 6'
      }).addTo(map);

      map.fitBounds(L.latLngBounds([pCoords, dCoords]), { padding: [20, 20] });
    }
  }, [pickup, destination]);

  return (
    <aside className="sidebar-sticky">
      <div className="sidebar-box">
        <div className="sidebar-heading">
          <span>Rota & Tahmin</span>
          <span className="preset-chip">
            {tripType === 'roundtrip' ? 'Gidiş - Dönüş' : 'Tek Yön'}
          </span>
        </div>

        {/* Leaflet Map */}
        <div className="map-container">
          <div ref={mapContainerRef} id="route-map" style={{ width: '100%', height: '100%' }}></div>
        </div>

        {/* Distance & Duration */}
        <div className="route-stats-grid">
          <div className="stat-cell">
            <div className="stat-label">Mesafe</div>
            <div className="stat-val mono">{distanceKm} KM</div>
          </div>
          <div className="stat-cell">
            <div className="stat-label">Tahmini Süre</div>
            <div className="stat-val mono">{durationMin} DK</div>
          </div>
        </div>

        {/* Selected Vehicle Thumbnail Card */}
        <div style={{
          background: 'var(--bg-stage)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 10px',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <img 
            src={vehicle.image} 
            alt={vehicle.name} 
            style={{ width: '48px', height: '32px', objectFit: 'cover', borderRadius: '4px' }}
          />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
              Tahsis Aracı
            </span>
            <strong style={{ fontSize: '12px', display: 'block', color: 'var(--text)' }}>
              {vehicle.name}
            </strong>
          </div>
        </div>

        {/* Live Dynamic Price Breakdown */}
        <div className="price-list">
          <div className="price-row">
            <span>Transfer Baz Ücret:</span>
            <span className="mono">{formatMoney(prices.totalBaseTRY || prices.base)}</span>
          </div>

          <div className="price-row">
            <span>Ekstra Donanımlar:</span>
            <span className="mono">{formatMoney(prices.amenitiesPriceTRY || prices.amenities)}</span>
          </div>

          {tripType === 'roundtrip' && (
            <div className="price-row" style={{ color: 'var(--accent-green)' }}>
              <span>Gidiş-Dönüş İndirimi (%15):</span>
              <span className="mono">-{formatMoney(prices.discountTRY || 0)}</span>
            </div>
          )}

          <div className="price-row">
            <span>Köprü & Otoyol:</span>
            <span style={{ color: 'var(--accent-green)', fontWeight: 500 }}>Dahil (Sabit)</span>
          </div>

          <div className="price-row-total">
            <span>Toplam Tutar:</span>
            <span className="val mono">{formatMoney(prices.grandTotalTRY || prices.total)}</span>
          </div>
        </div>
      </div>

      {/* Support Strip */}
      <div className="sidebar-box" style={{ padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Headset size={18} color="var(--text-muted)" />
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
              7/24 VIP Operasyon Masası
            </span>
            <a href="tel:+908503080444" style={{ fontSize: '13px', fontWeight: 600 }}>
              +90 850 308 04 44
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
