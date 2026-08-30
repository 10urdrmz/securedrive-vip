import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { supabase } from './supabase';

export const GPS_REALTIME_CHANNEL = 'driver-live-gps-channel';

let activeWatchId = null;
let broadcastChannel = null;
let lastBroadcastTime = 0;
let lastKnownLocation = null;
const listeners = new Set();
const THROTTLE_MS = 2000; // 2 saniyede bir konum yayını

/**
 * Dinleyici ekle / çıkar (Bileşenlerin anlık hızı/konumu okuması için)
 */
export function addLocationListener(callback) {
  if (typeof callback === 'function') {
    listeners.add(callback);
    if (lastKnownLocation) {
      callback(lastKnownLocation);
    }
  }
}

export function removeLocationListener(callback) {
  listeners.delete(callback);
}

export function getLastKnownLocation() {
  return lastKnownLocation;
}

/**
 * Konum izni ister (iOS / Android / Web)
 */
export async function requestLocationPermission() {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await Geolocation.checkPermissions();
      if (status.location !== 'granted') {
        const req = await Geolocation.requestPermissions();
        return req.location === 'granted';
      }
      return true;
    } catch (err) {
      console.warn('[Location] Permission error:', err);
      return false;
    }
  }

  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    return true;
  }
  return false;
}

/**
 * Şoförün canlı GPS konumunu izlemeye başlar ve Supabase Realtime kanalından yayınlar
 * Tüm sayfalarda arka planda çalışır.
 */
export async function startDriverLocationTracking(driver, onLocationUpdate) {
  if (!driver) return null;

  if (typeof onLocationUpdate === 'function') {
    listeners.add(onLocationUpdate);
  }

  // Zaten aktif bir izleme varsa tekrar başlatma
  if (activeWatchId !== null) {
    return activeWatchId;
  }

  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    console.warn('[Location] Konum izni verilmedi.');
  }

  // Supabase Realtime Kanalını Aç
  if (!broadcastChannel) {
    broadcastChannel = supabase.channel(GPS_REALTIME_CHANNEL, {
      config: { broadcast: { self: true } }
    });
    broadcastChannel.subscribe((status) => {
      console.log('[Location] Realtime kanal durumu:', status);
    });
  }

  const handlePosition = async (position) => {
    if (!position?.coords) return;

    const { latitude, longitude, speed, heading, accuracy } = position.coords;
    const now = Date.now();

    const locationData = {
      driver_id: driver.id || driver.phone || driver.username || 'driver',
      driver_name: driver.full_name || driver.name || 'VIP Şoför',
      phone: driver.phone || '',
      vehicle_plate: driver.vehicle_plate || '34 VIP 770',
      lat: latitude,
      lng: longitude,
      speed: Math.round((speed || 0) * 3.6), // m/s -> km/h
      heading: Math.round(heading || 0),
      accuracy: Math.round(accuracy || 5),
      updated_at: new Date().toISOString()
    };

    lastKnownLocation = locationData;

    // Tüm abone olan bileşenleri bilgilendir
    listeners.forEach((fn) => {
      try {
        fn(locationData);
      } catch (e) {
        console.warn('[Location] Listener callback error:', e);
      }
    });

    // Supabase Realtime üzerinden anlık yayınla (Throttle 2sn)
    if (now - lastBroadcastTime > THROTTLE_MS) {
      lastBroadcastTime = now;
      try {
        if (broadcastChannel) {
          await broadcastChannel.send({
            type: 'broadcast',
            event: 'location-update',
            payload: locationData
          });
        }

        // Supabase drivers tablosunu güncelle
        if (driver.id) {
          await supabase
            .from('drivers')
            .update({
              status: 'on_duty'
            })
            .eq('id', driver.id);
        }
      } catch (err) {
        console.warn('[Location] Broadcast send error:', err);
      }
    }
  };

  // 1. İlk anlık konumu hemen al ve gönder (hareket beklemeden)
  if (Capacitor.isNativePlatform()) {
    try {
      Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }).then((pos) => {
        if (pos) handlePosition(pos);
      }).catch((e) => console.warn('[Location] Initial pos error:', e));
    } catch (e) {
      console.warn('[Location] Initial fetch error:', e);
    }
  } else if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      handlePosition,
      (err) => console.warn('[Location] Web initial pos error:', err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // 2. Sürekli GPS Değişimlerini İzle (Watch)
  if (Capacitor.isNativePlatform()) {
    try {
      activeWatchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 3000
        },
        (position, err) => {
          if (err) {
            console.warn('[Location] Capacitor watch error:', err);
            return;
          }
          if (position) handlePosition(position);
        }
      );
      return activeWatchId;
    } catch (e) {
      console.warn('[Location] Geolocation watch error:', e);
    }
  }

  // Web fallback (HTML5 Geolocation API)
  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    activeWatchId = navigator.geolocation.watchPosition(
      handlePosition,
      (err) => console.warn('[Location] Web watch error:', err.message),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000
      }
    );
  }

  return activeWatchId;
}

/**
 * Konum izlemeyi durdurur
 */
export function stopDriverLocationTracking() {
  if (activeWatchId !== null) {
    if (Capacitor.isNativePlatform() && typeof activeWatchId === 'string') {
      Geolocation.clearWatch({ id: activeWatchId }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && 'geolocation' in navigator && typeof activeWatchId === 'number') {
      navigator.geolocation.clearWatch(activeWatchId);
    }
    activeWatchId = null;
  }

  if (broadcastChannel) {
    supabase.removeChannel(broadcastChannel);
    broadcastChannel = null;
  }
}
