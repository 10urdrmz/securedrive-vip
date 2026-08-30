import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation, Compass, MapPin, Gauge, Maximize2, Minimize2, ExternalLink, User, Phone, MessageCircle, Radio } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { addLocationListener, removeLocationListener, getLastKnownLocation, GPS_REALTIME_CHANNEL } from '../../lib/locationService';

const COORDS = {
  IST: { pickup: [41.2753, 28.7519], label: 'İstanbul Havalimanı (IST)' },
  SAW: { pickup: [40.8986, 29.3092], label: 'Sabiha Gökçen Havalimanı (SAW)' },
  DEFAULT_DEST: [41.0435, 29.0157]
};

function resolveTaskLocations(task) {
  if (!task) return null;
  const pickupText = (task.pickup_location || '').toLowerCase();
  const destText = (task.destination_location || '').toLowerCase();

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

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function DriverLiveMap({ activeTask }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const taskLayersRef = useRef([]);

  const [location, setLocation] = useState(() => getLastKnownLocation());
  const [passengerLiveLocation, setPassengerLiveLocation] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // 1. Şoförün kendi canlı GPS konumunu dinle
  useEffect(() => {
    const handleUpdate = (loc) => {
      if (loc && loc.lat && loc.lng) {
        setLocation(loc);
      }
    };

    addLocationListener(handleUpdate);
    return () => {
      removeLocationListener(handleUpdate);
    };
  }, []);

  // 2. Supabase Realtime: Atanmış yolcunun gerçek zamanlı GPS konumunu dinle
  useEffect(() => {
    if (!activeTask) return;

    const channel = supabase
      .channel(GPS_REALTIME_CHANNEL, {
        config: { broadcast: { self: true } }
      })
      .on('broadcast', { event: 'passenger-location-update' }, (event) => {
        const payload = event.payload;
        if (payload?.lat && payload?.lng) {
          const isMatch = (activeTask.code && payload.booking_code === activeTask.code) ||
                          (activeTask.passenger_phone && payload.phone && payload.phone.replace(/[^0-9]/g, '') === activeTask.passenger_phone.replace(/[^0-9]/g, '')) ||
                          (activeTask.passenger_name && payload.passenger_name && payload.passenger_name.toLowerCase().includes(activeTask.passenger_name.toLowerCase().split(' ')[0]));

          if (isMatch) {
            setPassengerLiveLocation(payload);
          }
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Açılışta yolcunun GPS'ini iste
          channel.send({
            type: 'broadcast',
            event: 'request-passenger-location',
            payload: { booking_code: activeTask.code }
          }).catch(() => {});
        }
      });

    // Her 12 saniyede bir yolcu konumunu yokla
    const interval = setInterval(() => {
      channel.send({
        type: 'broadcast',
        event: 'request-passenger-location',
        payload: { booking_code: activeTask.code }
      }).catch(() => {});
    }, 12000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [activeTask?.code, activeTask?.passenger_phone, activeTask?.passenger_name]);

  // 3. Haritayı başlat
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = location?.lat && location?.lng 
        ? [location.lat, location.lng] 
        : [41.0425, 28.9950];

      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(initialCenter, 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [isExpanded]);

  // 4. Şoförün Canlı Araç Marker'ını Güncelle
  useEffect(() => {
    if (!mapInstanceRef.current || !location?.lat || !location?.lng) return;
    const map = mapInstanceRef.current;
    const latLng = [location.lat, location.lng];

    const carHtml = `
      <div class="driver-live-beacon-marker">
        <div class="driver-beacon-pulse"></div>
        <div class="driver-beacon-icon">🚘</div>
      </div>
    `;

    const carIcon = L.divIcon({
      className: 'custom-driver-self-pin',
      html: carHtml,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng(latLng);
      driverMarkerRef.current.setIcon(carIcon);
    } else {
      driverMarkerRef.current = L.marker(latLng, { icon: carIcon, zIndexOffset: 1000 }).addTo(map);
      map.setView(latLng, 14);
    }
  }, [location]);

  // 5. Aktif Görev, Canlı Yolcu GPS'i & Varış Rota Çizgisi
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    taskLayersRef.current.forEach((layer) => map.removeLayer(layer));
    taskLayersRef.current = [];

    if (!activeTask) return;

    const taskCoords = resolveTaskLocations(activeTask);
    if (!taskCoords) return;

    // Yolcunun GERÇEK Canlı GPS Koordinatları veya Biniş Noktası
    const isLiveGps = !!(passengerLiveLocation?.lat && passengerLiveLocation?.lng);
    const passengerCoord = isLiveGps
      ? [passengerLiveLocation.lat, passengerLiveLocation.lng]
      : taskCoords.pickup;

    const passengerHtml = `
      <div class="passenger-pin-badge">
        <div class="passenger-pulse-ring" style="border-color:${isLiveGps ? '#2563eb' : '#0284c7'};"></div>
        <div class="passenger-icon" style="background:${isLiveGps ? '#2563eb' : '#0284c7'};">👤</div>
        <div class="passenger-tag" style="background:${isLiveGps ? 'rgba(37,99,235,0.95)' : 'rgba(15,23,42,0.92)'};">
          <strong>${isLiveGps ? '📡 Canlı Yolcu' : 'Biniş Noktası'}</strong>
          <small>${activeTask.passenger_name?.split(' ')[0] || 'Yolcu'}</small>
        </div>
      </div>
    `;

    const pIcon = L.divIcon({
      className: 'custom-passenger-map-pin',
      html: passengerHtml,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    // Varış Otel / Adres İkonu
    const dIcon = L.divIcon({
      className: 'custom-map-pin',
      html: '<div style="background:#10b981;color:#fff;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:11px;">🏨</div>',
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    const pMarker = L.marker(passengerCoord, { icon: pIcon, zIndexOffset: 950 })
      .addTo(map)
      .bindPopup(`
        <b>VIP Yolcu:</b> ${activeTask.passenger_name}<br>
        <b>Konum:</b> ${isLiveGps ? '📡 Yolcunun Canlı GPS Konumu' : activeTask.pickup_location}<br>
        ${passengerLiveLocation?.updated_at ? `<small>Son sinyal: ${new Date(passengerLiveLocation.updated_at).toLocaleTimeString()}</small>` : ''}
      `);

    const dMarker = L.marker(taskCoords.dest, { icon: dIcon })
      .addTo(map)
      .bindPopup(`<b>Varış Noktası:</b> ${activeTask.destination_location}`);

    // Şoför -> Canlı Yolcu -> Varış Noktası Rota Çizgisi
    const points = location?.lat && location?.lng 
      ? [[location.lat, location.lng], passengerCoord, taskCoords.dest]
      : [passengerCoord, taskCoords.dest];

    const polyline = L.polyline(points, {
      color: isLiveGps ? '#2563eb' : '#0284c7',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 6'
    }).addTo(map);

    taskLayersRef.current.push(pMarker, dMarker, polyline);
  }, [activeTask, location, passengerLiveLocation]);

  const taskCoords = resolveTaskLocations(activeTask);
  const targetCoord = (passengerLiveLocation?.lat && passengerLiveLocation?.lng)
    ? [passengerLiveLocation.lat, passengerLiveLocation.lng]
    : taskCoords?.pickup;

  const distanceToPassenger = (location?.lat && targetCoord)
    ? calculateDistanceKm(location.lat, location.lng, targetCoord[0], targetCoord[1])
    : null;

  const estimatedMins = distanceToPassenger !== null ? Math.max(1, Math.round((distanceToPassenger / 35) * 60)) : null;

  const handleCenterMyLocation = () => {
    if (mapInstanceRef.current && location?.lat && location?.lng) {
      mapInstanceRef.current.flyTo([location.lat, location.lng], 16, { duration: 1.2 });
    }
  };

  const handleFocusPassenger = () => {
    if (mapInstanceRef.current && targetCoord) {
      mapInstanceRef.current.flyTo(targetCoord, 16, { duration: 1.2 });
    }
  };

  const openNativeNavigation = () => {
    if (!activeTask) return;
    let url = '';
    if (passengerLiveLocation?.lat && passengerLiveLocation?.lng) {
      // Yolcunun GERÇEK Canlı GPS Koordinatlarına Navigasyon
      url = `https://www.google.com/maps/dir/?api=1&destination=${passengerLiveLocation.lat},${passengerLiveLocation.lng}`;
    } else {
      const dest = encodeURIComponent(activeTask.pickup_location || 'İstanbul Havalimanı');
      url = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className={`driver-live-map-card ${isExpanded ? 'fullscreen-mode' : ''}`}>
      {/* Header Bar */}
      <div className="driver-live-map-header">
        <div className="driver-live-map-title">
          <Navigation size={15} color="#059669" className="pulse-icon" />
          <strong>Canlı GPS & Yolcu Radarı</strong>
        </div>

        <div className="driver-live-map-controls">
          {passengerLiveLocation ? (
            <span className="driver-live-map-speed" style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8' }}>
              <Radio size={12} className="pulse-icon" />
              <b>Yolcu Canlı</b>
            </span>
          ) : (
            location && (
              <span className="driver-live-map-speed">
                <Gauge size={13} />
                <b>{location.speed || 0} km/s</b>
              </span>
            )
          )}

          <button
            type="button"
            className="driver-map-btn"
            onClick={handleCenterMyLocation}
            title="Konumuma Odaklan"
          >
            <Compass size={15} />
          </button>

          {activeTask && (
            <button
              type="button"
              className="driver-map-btn"
              onClick={handleFocusPassenger}
              title="Yolcuya Odaklan"
              style={{ color: '#2563eb' }}
            >
              <User size={15} />
            </button>
          )}

          <button
            type="button"
            className={`driver-map-btn ${isExpanded ? 'active-close' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Haritayı Küçült' : 'Haritayı Tam Ekran Yap'}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div 
        ref={mapContainerRef} 
        className="driver-live-map-canvas" 
      />

      {/* Footer Info & Nav Action */}
      <div className="driver-live-map-footer">
        <div className="driver-map-stat">
          <span className="driver-map-stat-dot" />
          {activeTask ? (
            <span>
              👤 <b>{activeTask.passenger_name}</b> {passengerLiveLocation ? '(📡 Canlı GPS)' : '(Biniş Noktası)'}
              {distanceToPassenger !== null ? ` · Yolcuya ${distanceToPassenger} km (~${estimatedMins} dk)` : ''}
            </span>
          ) : (
            <span>
              {location 
                ? `GPS Aktif (±${location.accuracy || 5}m) · ${new Date(location.updated_at).toLocaleTimeString('tr-TR')}` 
                : 'GPS aranıyor...'}
            </span>
          )}
        </div>

        {activeTask && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className="driver-map-nav-btn"
              onClick={openNativeNavigation}
            >
              <ExternalLink size={12} />
              <span>{passengerLiveLocation ? 'Canlı Yolcuya Git' : 'Biniş Noktasına Git'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
