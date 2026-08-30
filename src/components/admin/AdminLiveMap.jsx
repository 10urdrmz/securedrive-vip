import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { Satellite, RefreshCw, Car, Radio, MapPin, Clock, ShieldCheck, Gauge, Compass, Trash2, Navigation, Layers } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GPS_REALTIME_CHANNEL } from '../../lib/locationService';

const COORDS = {
  IST: { pickup: [41.2753, 28.7519], label: 'İstanbul Havalimanı (IST)' },
  SAW: { pickup: [40.8986, 29.3092], label: 'Sabiha Gökçen Havalimanı (SAW)' },
  DEFAULT_DEST: [41.0435, 29.0157]
};

function resolveRoute(booking) {
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

export default function AdminLiveMap() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkersRef = useRef(new Map());
  const routeLayersRef = useRef([]);

  const [transfers, setTransfers] = useState([]);
  const [liveDrivers, setLiveDrivers] = useState({});
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [channelStatus, setChannelStatus] = useState('connecting');
  const [lastSignalTime, setLastSignalTime] = useState(null);
  const [showRoutes, setShowRoutes] = useState(true);

  // Transferleri yükle
  const loadTransfers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .lt('status_step', 6)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) console.warn('Live map fetch:', error.message);
      setTransfers(data || []);
    } catch (err) {
      console.warn(err);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  // Supabase Realtime: Bookings tablosundaki değişiklikleri anında dinle
  useEffect(() => {
    const bookingsChannel = supabase
      .channel('admin-livemap-bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          loadTransfers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
    };
  }, []);

  // Supabase Realtime Kanalı: Şoförlerin gerçek canlı GPS konumlarını dinle
  useEffect(() => {
    const channel = supabase
      .channel(GPS_REALTIME_CHANNEL, {
        config: { broadcast: { self: true } }
      })
      .on('broadcast', { event: 'location-update' }, (event) => {
        const payload = event.payload;
        if (payload && payload.lat && payload.lng) {
          const uniqueKey = (payload.phone ? payload.phone.replace(/[^0-9]/g, '') : null) || 
                            payload.driver_id || 
                            payload.driver_name;

          setLiveDrivers((prev) => ({
            ...prev,
            [uniqueKey]: {
              ...payload,
              driver_id: uniqueKey,
              received_at: Date.now()
            }
          }));
          setLastSignalTime(new Date());
        }
      })
      .subscribe((status) => {
        setChannelStatus(status === 'SUBSCRIBED' ? 'connected' : status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Leaflet Harita Başlatma (Filigransız Temiz OpenStreetMap)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([41.05, 28.98], 11);

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
  }, []);

  // Harita Üzerinde Transfer Rotalarını Çizme
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    routeLayersRef.current.forEach((layer) => map.removeLayer(layer));
    routeLayersRef.current = [];

    if (!showRoutes) return;

    transfers.forEach((t) => {
      const route = resolveRoute(t);

      const pIcon = L.divIcon({
        className: 'custom-map-pin',
        html: '<div style="background:#0284c7;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.3);font-size:12px;">🛫</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const dIcon = L.divIcon({
        className: 'custom-map-pin',
        html: '<div style="background:#10b981;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.3);font-size:12px;">🏨</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const pickupMarker = L.marker(route.pickup, { icon: pIcon })
        .addTo(map)
        .bindPopup(`<strong>${t.code}</strong><br>Kalkış: ${t.pickup_location}<br>Şoför: <b>${t.chauffeur_name || 'Atanmadı'}</b>`);
      const destMarker = L.marker(route.dest, { icon: dIcon })
        .addTo(map)
        .bindPopup(`<strong>${t.code}</strong><br>Varış: ${t.destination_location}<br>Araç: <b>${t.vehicle_name || ''}</b>`);
      const line = L.polyline([route.pickup, route.dest], {
        color: '#0284c7',
        weight: 3,
        opacity: 0.6,
        dashArray: '6, 6'
      }).addTo(map);

      routeLayersRef.current.push(pickupMarker, destMarker, line);
    });
  }, [transfers, showRoutes]);

  // Canlı Şoför GPS İşaretçilerini Haritada Güncelleme
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const currentDriverIds = new Set(Object.keys(liveDrivers));

    // Silinen veya süresi dolan şoför markerlarını temizle
    driverMarkersRef.current.forEach((marker, id) => {
      if (!currentDriverIds.has(id)) {
        map.removeLayer(marker);
        driverMarkersRef.current.delete(id);
      }
    });

    // Her gerçek canlı şoför için hareketli VIP Araç Marker'ı
    Object.values(liveDrivers).forEach((driver) => {
      const latLng = [driver.lat, driver.lng];
      const isSelected = selectedDriverId === driver.driver_id;

      const carHtml = `
        <div class="live-driver-radar-marker ${isSelected ? 'selected' : ''}">
          <div class="radar-ping-wave"></div>
          <div class="driver-car-icon">🚘</div>
          <div class="driver-name-tag">
            <strong>${driver.driver_name?.split(' ')[0]}</strong>
            <small>${driver.speed || 0} km/s</small>
          </div>
        </div>
      `;

      const carIcon = L.divIcon({
        className: 'custom-driver-car-pin',
        html: carHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const popupContent = `
        <div style="font-family: Inter, sans-serif; min-width: 190px; padding: 4px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="font-size:18px;">👨‍✈️</span>
            <div>
              <strong style="font-size:13.5px;display:block;color:#0f172a;">${driver.driver_name}</strong>
              <span style="font-size:11px;color:#475569;background:#f1f5f9;padding:2px 6px;border-radius:4px;font-weight:700;">${driver.vehicle_plate || '34 VIP 770'}</span>
            </div>
          </div>
          <div style="font-size:12px;color:#334155;display:flex;flex-direction:column;gap:3px;border-top:1px solid #e2e8f0;padding-top:6px;">
            <div>⚡ <b>Anlık Hız:</b> ${driver.speed || 0} km/s</div>
            <div>📡 <b>GPS Doğruluk:</b> ±${driver.accuracy || 5} m</div>
            <div>🕒 <b>Son Sinyal:</b> ${new Date(driver.updated_at).toLocaleTimeString('tr-TR')}</div>
          </div>
        </div>
      `;

      if (driverMarkersRef.current.has(driver.driver_id)) {
        const marker = driverMarkersRef.current.get(driver.driver_id);
        marker.setLatLng(latLng);
        marker.setIcon(carIcon);
        marker.setPopupContent(popupContent);
      } else {
        const marker = L.marker(latLng, { icon: carIcon, zIndexOffset: 1000 })
          .addTo(map)
          .bindPopup(popupContent);

        marker.on('click', () => {
          setSelectedDriverId(driver.driver_id);
        });

        driverMarkersRef.current.set(driver.driver_id, marker);
        map.flyTo(latLng, 14, { duration: 1 });
      }
    });
  }, [liveDrivers, selectedDriverId]);

  const activeDriverList = useMemo(() => Object.values(liveDrivers), [liveDrivers]);

  const handleFocusDriver = (driver) => {
    setSelectedDriverId(driver.driver_id);
    if (mapInstanceRef.current && driver.lat && driver.lng) {
      mapInstanceRef.current.flyTo([driver.lat, driver.lng], 15, {
        duration: 1.2
      });
      const marker = driverMarkersRef.current.get(driver.driver_id);
      if (marker) marker.openPopup();
    }
  };

  // Radar sinyallerini temizle / sıfırla
  const handleClearRadar = () => {
    if (mapInstanceRef.current) {
      driverMarkersRef.current.forEach((marker) => {
        mapInstanceRef.current.removeLayer(marker);
      });
      driverMarkersRef.current.clear();
    }
    setLiveDrivers({});
    setSelectedDriverId(null);
  };

  return (
    <div className="admin-content">
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Canlı VIP Lojistik & Radar Haritası</h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', padding: '3px 10px', borderRadius: '9999px', fontSize: '11.5px', fontWeight: 700 }}>
              <Radio size={12} className="pulse-icon" />
              <span>{channelStatus === 'connected' ? 'Canlı GPS Yayını Bağlı' : 'Bağlanıyor...'}</span>
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Mobil uygulamadan giriş yapan şoförlerin gerçek zamanlı GPS koordinatları ve transfer rotaları.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className={`btn-ghost ${showRoutes ? 'active' : ''}`}
            onClick={() => setShowRoutes(!showRoutes)}
            style={{ height: '36px', fontSize: '12px' }}
            title="Transfer rotalarını göster / gizle"
          >
            <Layers size={13} />
            <span>{showRoutes ? 'Rotalar Açık' : 'Rotalar Gizli'}</span>
          </button>

          {activeDriverList.length > 0 && (
            <button
              type="button"
              className="btn-ghost"
              onClick={handleClearRadar}
              style={{ height: '36px', fontSize: '12px', color: '#ef4444' }}
              title="Haritadaki eski sinyalleri temizler"
            >
              <Trash2 size={13} />
              <span>Radar Temizle</span>
            </button>
          )}

          <button type="button" className="btn-ghost" onClick={loadTransfers} style={{ height: '36px' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Yenile</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-green-bg)', border: '1px solid var(--accent-green-border)', color: 'var(--accent-green)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '12.5px', fontWeight: 600 }}>
            <Car size={14} />
            <span>{activeDriverList.length} Canlı Şoför</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Map & Live Driver Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: activeDriverList.length > 0 ? '1fr 300px' : '1fr', gap: '16px', alignItems: 'start' }}>
        {/* Map Container */}
        <div className="admin-table-container" style={{ height: '620px', position: 'relative', overflow: 'hidden' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

          {/* Quick HUD Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            zIndex: 500,
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '10px 14px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0284c7' }} />
              <span>Kalkış</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
              <span>Varış</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#059669', border: '2px solid #fff' }} />
              <span><b>Gerçek VIP Araç (Canlı GPS)</b></span>
            </div>
          </div>
        </div>

        {/* Live Driver Side Panel (Visible when drivers are online) */}
        {activeDriverList.length > 0 && (
          <aside style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '620px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Canlıdaki Şoförler</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lastSignalTime ? `Son Sinyal: ${lastSignalTime.toLocaleTimeString()}` : ''}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeDriverList.map((driver) => {
                const isSelected = selectedDriverId === driver.driver_id;
                return (
                  <div
                    key={driver.driver_id}
                    onClick={() => handleFocusDriver(driver)}
                    style={{
                      background: isSelected ? '#eff6ff' : '#f8fafc',
                      border: `1px solid ${isSelected ? '#3b82f6' : '#e2e8f0'}`,
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>{driver.driver_name}</strong>
                      <span style={{ fontSize: '11px', fontWeight: 700, background: '#ecfdf5', color: '#059669', padding: '1px 6px', borderRadius: '4px' }}>
                        {driver.speed || 0} km/s
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b' }}>
                      <span>Plaka: <b>{driver.vehicle_plate || '34 VIP 770'}</b></span>
                      <span style={{ color: '#0284c7', fontWeight: 600 }}>📍 Odaklan</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
