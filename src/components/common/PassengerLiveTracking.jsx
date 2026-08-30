import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Car, Navigation, Phone, MessageCircle, Clock, MapPin, Gauge, ShieldCheck, Compass, Maximize2, Minimize2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GPS_REALTIME_CHANNEL } from '../../lib/locationService';

const COORDS = {
  IST: { pickup: [41.2753, 28.7519], label: 'İstanbul Havalimanı (IST)' },
  SAW: { pickup: [40.8986, 29.3092], label: 'Sabiha Gökçen Havalimanı (SAW)' },
  DEFAULT_DEST: [41.0435, 29.0157]
};

function resolveBookingCoords(booking) {
  if (!booking) return { pickup: COORDS.IST.pickup, dest: COORDS.DEFAULT_DEST };
  const pickupText = (booking.pickup_location || '').toLowerCase();
  const destText = (booking.destination_location || '').toLowerCase();

  const pickup = pickupText.includes('sabiha') || pickupText.includes('saw')
    ? COORDS.SAW.pickup
    : COORDS.IST.pickup;

  let dest = COORDS.DEFAULT_DEST;
  if (destText.includes('swiss')) dest = [41.0416, 29.0006];
  if (destText.includes('kadıköy') || destText.includes('kadikoy')) dest = [40.9833, 29.0250];
  if (destText.includes('çırağan') || destText.includes('ciragan')) dest = [41.0435, 29.0157];
  if (destText.includes('beşiktaş') || destText.includes('besiktas')) dest = [41.0422, 29.0067];
  if (destText.includes('taksim')) dest = [41.0370, 28.9850];

  return { pickup, dest };
}

// İki koordinat arası kuş uçuşu mesafe (km)
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Dünya yarıçapı (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function PassengerLiveTracking({ booking }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const passengerMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);

  const [driverLocation, setDriverLocation] = useState(null);
  const [passengerGps, setPassengerGps] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const coords = resolveBookingCoords(booking);

  // Yolcunun kendi cihazının GPS konumunu al (izin verilirse)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (pos?.coords) {
            setPassengerGps([pos.coords.latitude, pos.coords.longitude]);
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Supabase Realtime: Atanmış şoförün canlı GPS sinyalini dinle
  useEffect(() => {
    const channel = supabase
      .channel(GPS_REALTIME_CHANNEL, {
        config: { broadcast: { self: true } }
      })
      .on('broadcast', { event: 'location-update' }, (event) => {
        const payload = event.payload;
        if (payload?.lat && payload?.lng) {
          // Eğer şoför ismi veya telefonu rezervasyondaki şoförle eşleşiyorsa veya şoför yayını varsa
          setDriverLocation(payload);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [booking?.chauffeur_phone, booking?.chauffeur_name]);

  // Leaflet Harita Başlatma
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = coords.pickup;

      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(initialCenter, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isExpanded, coords]);

  // Harita Üzerinde Yolcu ve Şoför Marker'larını Güncelle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const passengerTarget = passengerGps || coords.pickup;

    // 1. Yolcu / Biniş Noktası Marker'ı
    const passengerHtml = `
      <div class="passenger-pin-badge">
        <div class="passenger-pulse-ring"></div>
        <div class="passenger-icon">👤</div>
        <div class="passenger-tag">
          <strong>Siz</strong>
          <small>${booking?.passenger_name?.split(' ')[0] || 'Yolcu'}</small>
        </div>
      </div>
    `;

    const passengerIcon = L.divIcon({
      className: 'custom-passenger-map-pin',
      html: passengerHtml,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    if (passengerMarkerRef.current) {
      passengerMarkerRef.current.setLatLng(passengerTarget);
      passengerMarkerRef.current.setIcon(passengerIcon);
    } else {
      passengerMarkerRef.current = L.marker(passengerTarget, { icon: passengerIcon })
        .addTo(map)
        .bindPopup(`<b>Biniş Noktanız:</b><br>${booking?.pickup_location || 'Havalimanı'}`);
    }

    // 2. Canlı Şoför VIP Araç Marker'ı
    if (driverLocation?.lat && driverLocation?.lng) {
      const driverLatLng = [driverLocation.lat, driverLocation.lng];

      const carHtml = `
        <div class="live-driver-radar-marker selected">
          <div class="radar-ping-wave"></div>
          <div class="driver-car-icon" style="background:#059669;">🚘</div>
          <div class="driver-name-tag" style="background:#065f46;">
            <strong>${driverLocation.driver_name?.split(' ')[0] || 'VIP Şoför'}</strong>
            <small>${driverLocation.speed || 0} km/s</small>
          </div>
        </div>
      `;

      const carIcon = L.divIcon({
        className: 'custom-driver-car-pin',
        html: carHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng(driverLatLng);
        driverMarkerRef.current.setIcon(carIcon);
      } else {
        driverMarkerRef.current = L.marker(driverLatLng, { icon: carIcon, zIndexOffset: 1000 })
          .addTo(map)
          .bindPopup(`<b>VIP Şoförünüz:</b> ${driverLocation.driver_name}<br>Plaka: ${driverLocation.vehicle_plate || '34 VIP 770'}<br>Hız: ${driverLocation.speed || 0} km/s`);
      }

      // Rota Çizgisi: Şoför -> Yolcu Biniş Noktası -> Varış
      const routePoints = [driverLatLng, passengerTarget, coords.dest];
      if (routePolylineRef.current) {
        routePolylineRef.current.setLatLngs(routePoints);
      } else {
        routePolylineRef.current = L.polyline(routePoints, {
          color: '#059669',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 6'
        }).addTo(map);
      }
    }
  }, [driverLocation, passengerGps, coords, booking]);

  const distanceKm = driverLocation?.lat 
    ? calculateDistanceKm(driverLocation.lat, driverLocation.lng, (passengerGps || coords.pickup)[0], (passengerGps || coords.pickup)[1])
    : null;

  const estimatedMinutes = distanceKm !== null ? Math.max(1, Math.round((distanceKm / 35) * 60)) : null;

  const handleCenterMap = () => {
    if (!mapInstanceRef.current) return;
    if (driverLocation?.lat && driverLocation?.lng) {
      mapInstanceRef.current.flyTo([driverLocation.lat, driverLocation.lng], 15, { duration: 1.2 });
    } else {
      mapInstanceRef.current.flyTo(coords.pickup, 14, { duration: 1 });
    }
  };

  return (
    <div className={`passenger-radar-card ${isExpanded ? 'fullscreen-mode' : ''}`}>
      {/* Header Bar */}
      <div className="passenger-radar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation size={16} color="#059669" className="pulse-icon" />
          <strong style={{ fontSize: '14px', color: '#0f172a' }}>Canlı VIP Şoför Takip Radarı</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {driverLocation && (
            <span className="passenger-radar-status-badge">
              <span className="gps-live-dot" />
              <span>Şoför Canlı ({driverLocation.speed || 0} km/s)</span>
            </span>
          )}

          <button
            type="button"
            className="driver-map-btn"
            onClick={handleCenterMap}
            title="Şoföre Odaklan"
          >
            <Compass size={15} />
          </button>

          <button
            type="button"
            className={`driver-map-btn ${isExpanded ? 'active-close' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Küçült' : 'Tam Ekran'}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="passenger-radar-canvas" />

      {/* Driver Info & Quick Contact Footer */}
      <div className="passenger-radar-footer">
        <div className="passenger-radar-driver-info">
          <div className="driver-avatar-circle">
            👨‍✈️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>
                {driverLocation?.driver_name || booking?.chauffeur_name || 'VIP Protokol Şoförü'}
              </strong>
              <span className="driver-plate-tag">
                {driverLocation?.vehicle_plate || booking?.vehicle_plate || '34 VIP 770'}
              </span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {distanceKm !== null ? (
                <span>📍 Şoför size <b>{distanceKm} km</b> uzaklıkta (~<b>{estimatedMinutes} dk</b>)</span>
              ) : (
                <span>📍 Konum sinyali bekleniyor...</span>
              )}
            </div>
          </div>
        </div>

        <div className="passenger-radar-actions">
          {booking?.chauffeur_phone && (
            <>
              <a
                href={`tel:${booking.chauffeur_phone}`}
                className="passenger-contact-btn phone"
                title="Şoförü Ara"
              >
                <Phone size={13} />
                <span>Ara</span>
              </a>
              <a
                href={`https://wa.me/${booking.chauffeur_phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="passenger-contact-btn whatsapp"
                title="WhatsApp Mesajı Gönder"
              >
                <MessageCircle size={13} />
                <span>WhatsApp</span>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
