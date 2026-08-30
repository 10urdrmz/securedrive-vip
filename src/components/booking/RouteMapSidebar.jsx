import React, { useEffect, useRef } from 'react';
import { useBooking } from '../../context/BookingContext';
import L from 'leaflet';
import { Headset, Sparkles, MapPin, Gauge, ShieldCheck } from 'lucide-react';

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
        html: `<div style="background:#0284c7; color:#fff; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 5px rgba(0,0,0,0.3); font-size:9px;">🛫</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const dIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background:#10b981; color:#fff; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 5px rgba(0,0,0,0.3); font-size:9px;">🏨</div>`,
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
        color: '#38bdf8',
        weight: 3,
        opacity: 0.9,
        dashArray: '6, 6'
      }).addTo(map);

      map.fitBounds(L.latLngBounds([pCoords, dCoords]), { padding: [20, 20] });
    }
  }, [pickup, destination]);

  return (
    <div className="sky-sidebar-wrap">
      <div className="sky-sidebar-box">
        <div className="sky-sidebar-head">
          <span>Rota & Canlı Tahmin</span>
          <span className="sky-sidebar-badge">
            {tripType === 'roundtrip' ? 'Gidiş - Dönüş' : 'Tek Yön'}
          </span>
        </div>

        {/* Leaflet Map */}
        <div className="sky-map-container">
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }}></div>
        </div>

        {/* Distance & Duration */}
        <div className="sky-stats-grid">
          <div className="sky-stat-cell">
            <span className="sky-stat-label">Net Mesafe</span>
            <strong className="sky-stat-val">{distanceKm} KM</strong>
          </div>
          <div className="sky-stat-cell">
            <span className="sky-stat-label">Tahmini Süre</span>
            <strong className="sky-stat-val">~{durationMin} DK</strong>
          </div>
        </div>

        {/* Selected Vehicle Thumbnail Card */}
        <div className="sky-sidebar-vehicle-row">
          <img 
            src={vehicle.image} 
            alt={vehicle.name} 
          />
          <div>
            <span className="sky-sidebar-vehicle-tag">Seçilen VIP Araç</span>
            <strong className="sky-sidebar-vehicle-name">{vehicle.name}</strong>
          </div>
        </div>

        {/* Live Dynamic Price Breakdown */}
        <div className="sky-price-breakdown">
          <div className="sky-price-breakdown-row">
            <span>Transfer Baz Ücret:</span>
            <span>{formatMoney(prices.totalBaseTRY || prices.base)}</span>
          </div>

          <div className="sky-price-breakdown-row">
            <span>Ekstra Donanımlar:</span>
            <span>{formatMoney(prices.amenitiesPriceTRY || prices.amenities)}</span>
          </div>

          {tripType === 'roundtrip' && (
            <div className="sky-price-breakdown-row discount">
              <span>Gidiş-Dönüş İndirimi (%15):</span>
              <span>-{formatMoney(prices.discountTRY || 0)}</span>
            </div>
          )}

          <div className="sky-price-breakdown-row">
            <span>Köprü, Otoyol & KDV:</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>Dahil (Sabit)</span>
          </div>

          <div className="sky-price-breakdown-total">
            <span>Toplam Tutar:</span>
            <span className="sky-grand-price">{formatMoney(prices.grandTotalTRY || prices.total)}</span>
          </div>
        </div>
      </div>

      {/* Support Strip */}
      <div className="sky-sidebar-support">
        <Headset size={18} color="#38bdf8" />
        <div>
          <span className="sky-support-label">7/24 VIP Destek & Operasyon</span>
          <a href="tel:+908503080444" className="sky-support-phone">+90 850 308 04 44</a>
        </div>
      </div>
    </div>
  );
}
