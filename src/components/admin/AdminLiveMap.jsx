import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Satellite, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { normalizeStatusStep } from '../../lib/bookingStatus';

const COORDS = {
  IST: { pickup: [41.2753, 28.7519], label: 'IST' },
  SAW: { pickup: [40.8986, 29.3092], label: 'SAW' },
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

  return { pickup, dest };
}

export default function AdminLiveMap() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([41.08, 29.05], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    layersRef.current.forEach((layer) => map.removeLayer(layer));
    layersRef.current = [];

    transfers.forEach((t) => {
      const route = resolveRoute(t);

      const pIcon = L.divIcon({
        className: 'custom-map-pin',
        html: '<div style="background:#2563eb;color:#fff;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:11px;">🛫</div>',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const dIcon = L.divIcon({
        className: 'custom-map-pin',
        html: '<div style="background:#10b981;color:#fff;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:11px;">🏨</div>',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const pickupMarker = L.marker(route.pickup, { icon: pIcon })
        .addTo(map)
        .bindPopup(`<strong>${t.code}</strong><br>Kalkış<br>Şoför: ${t.chauffeur_name || '—'}`);
      const destMarker = L.marker(route.dest, { icon: dIcon })
        .addTo(map)
        .bindPopup(`<strong>${t.code}</strong><br>Varış<br>${t.vehicle_name || ''}`);
      const line = L.polyline([route.pickup, route.dest], {
        color: '#2563eb',
        weight: 3,
        opacity: 0.8,
        dashArray: '6, 6'
      }).addTo(map);

      layersRef.current.push(pickupMarker, destMarker, line);
    });
  }, [transfers]);

  return (
    <div className="admin-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Canlı VIP Lojistik & Radar Haritası</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Aktif transferlerin kalkış ve varış rotaları (tamamlanmamış rezervasyonlar).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button type="button" className="btn-ghost" onClick={loadTransfers} style={{ height: '36px' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Yenile</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-green-bg)', border: '1px solid var(--accent-green-border)', color: 'var(--accent-green)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600 }}>
            <Satellite size={14} />
            <span>{transfers.length} aktif transfer</span>
          </div>
        </div>
      </div>

      {transfers.length === 0 && !loading && (
        <div style={{ marginBottom: '12px', padding: '12px 16px', background: '#f8fafc', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-muted)' }}>
          Haritada gösterilecek aktif rezervasyon yok. Demo verileri yüklemek için{' '}
          <code>supabase/migrations/20260829191500_seed_demo_bookings.sql</code> dosyasını çalıştırın.
        </div>
      )}

      <div className="admin-table-container" style={{ height: '560px', position: 'relative' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}
