import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation, Compass, MapPin, Gauge, Maximize2, Minimize2, ExternalLink, X } from 'lucide-react';
import { addLocationListener, removeLocationListener, getLastKnownLocation } from '../../lib/locationService';

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

export default function DriverLiveMap({ activeTask }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const taskLayersRef = useRef([]);

  const [location, setLocation] = useState(() => getLastKnownLocation());
  const [isExpanded, setIsExpanded] = useState(false);

  // Canlı GPS konumunu dinle
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

  // Haritayı başlat
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

    // Harita boyutu değişiminde invalidateSize tetikle
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [isExpanded]);

  // Şoförün Canlı Marker'ını Güncelle
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

  // Aktif Görev Varsa Rota Çiz
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    taskLayersRef.current.forEach((layer) => map.removeLayer(layer));
    taskLayersRef.current = [];

    if (!activeTask) return;

    const taskCoords = resolveTaskLocations(activeTask);
    if (!taskCoords) return;

    const pIcon = L.divIcon({
      className: 'custom-map-pin',
      html: '<div style="background:#0284c7;color:#fff;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:11px;">🛫</div>',
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    const dIcon = L.divIcon({
      className: 'custom-map-pin',
      html: '<div style="background:#10b981;color:#fff;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:11px;">🏨</div>',
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    const pMarker = L.marker(taskCoords.pickup, { icon: pIcon }).addTo(map);
    const dMarker = L.marker(taskCoords.dest, { icon: dIcon }).addTo(map);

    const points = location?.lat && location?.lng 
      ? [[location.lat, location.lng], taskCoords.pickup, taskCoords.dest]
      : [taskCoords.pickup, taskCoords.dest];

    const polyline = L.polyline(points, {
      color: '#0284c7',
      weight: 3.5,
      opacity: 0.8,
      dashArray: '8, 6'
    }).addTo(map);

    taskLayersRef.current.push(pMarker, dMarker, polyline);
  }, [activeTask, location]);

  const handleCenterMyLocation = () => {
    if (mapInstanceRef.current && location?.lat && location?.lng) {
      mapInstanceRef.current.flyTo([location.lat, location.lng], 16, { duration: 1.2 });
    }
  };

  const openNativeNavigation = () => {
    if (!activeTask) return;
    const dest = encodeURIComponent(activeTask.pickup_location || 'İstanbul Havalimanı');
    const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`driver-live-map-card ${isExpanded ? 'fullscreen-mode' : ''}`}>
      {/* Header Bar */}
      <div className="driver-live-map-header">
        <div className="driver-live-map-title">
          <Navigation size={15} color="#059669" className="pulse-icon" />
          <strong>Canlı GPS Radarı</strong>
        </div>

        <div className="driver-live-map-controls">
          {location && (
            <span className="driver-live-map-speed">
              <Gauge size={13} />
              <b>{location.speed || 0} km/s</b>
            </span>
          )}

          <button
            type="button"
            className="driver-map-btn"
            onClick={handleCenterMyLocation}
            title="Konumuma Odaklan"
          >
            <Compass size={15} />
          </button>

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
          <span>
            {location 
              ? `GPS Aktif (±${location.accuracy || 5}m) · ${new Date(location.updated_at).toLocaleTimeString('tr-TR')}` 
              : 'GPS aranıyor...'}
          </span>
        </div>

        {activeTask && (
          <button
            type="button"
            className="driver-map-nav-btn"
            onClick={openNativeNavigation}
          >
            <ExternalLink size={12} />
            <span>Navigasyon Başlat</span>
          </button>
        )}
      </div>
    </div>
  );
}
