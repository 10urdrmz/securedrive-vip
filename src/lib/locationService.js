import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { supabase } from './supabase';

export const GPS_REALTIME_CHANNEL = 'driver-live-gps-channel';

let activeDriverWatchId = null;
let activePassengerWatchId = null;
let broadcastChannel = null;

let lastBroadcastTime = 0;
let lastKnownDriverLocation = null;
let lastKnownPassengerLocation = null;

const driverListeners = new Set();
const passengerListeners = new Set();
const THROTTLE_MS = 2000; // 2 saniyede bir konum yayını

/**
 * Dinleyici ekle / çıkar (Bileşenlerin anlık hızı/konumu okuması için)
 */
export function addLocationListener(callback) {
  if (typeof callback === 'function') {
    driverListeners.add(callback);
    if (lastKnownDriverLocation) {
      callback(lastKnownDriverLocation);
    }
  }
}

export function removeLocationListener(callback) {
  driverListeners.delete(callback);
}

export function getLastKnownLocation() {
  return lastKnownDriverLocation;
}

export function getLastKnownPassengerLocation() {
  return lastKnownPassengerLocation;
}

function getOrCreateBroadcastChannel() {
  if (!broadcastChannel) {
    broadcastChannel = supabase.channel(GPS_REALTIME_CHANNEL, {
      config: { broadcast: { self: true } }
    });

    // Yönetici veya Şoför anlık GPS ping'i attığında cevap ver
    broadcastChannel.on('broadcast', { event: 'request-driver-locations' }, () => {
      if (lastKnownDriverLocation && broadcastChannel) {
        broadcastChannel.send({
          type: 'broadcast',
          event: 'location-update',
          payload: lastKnownDriverLocation
        }).catch(() => {});
      }
    });

    // Şoför yolcunun anlık GPS'ini istediğinde yolcu cihazı cevap verir
    broadcastChannel.on('broadcast', { event: 'request-passenger-location' }, () => {
      if (lastKnownPassengerLocation && broadcastChannel) {
        broadcastChannel.send({
          type: 'broadcast',
          event: 'passenger-location-update',
          payload: lastKnownPassengerLocation
        }).catch(() => {});
      }
    });

    broadcastChannel.subscribe((status) => {
      console.log('[Location] Realtime kanal durumu:', status);
    });
  }
  return broadcastChannel;
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
 * ==============================================================================
 * 1. ŞOFÖR CANLI GPS İZLEME SERVİSİ
 * ==============================================================================
 */
export async function startDriverLocationTracking(driver, onLocationUpdate) {
  if (!driver) return null;

  if (typeof onLocationUpdate === 'function') {
    driverListeners.add(onLocationUpdate);
  }

  if (activeDriverWatchId !== null) {
    return activeDriverWatchId;
  }

  await requestLocationPermission();
  const channel = getOrCreateBroadcastChannel();

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

    lastKnownDriverLocation = locationData;

    driverListeners.forEach((fn) => {
      try {
        fn(locationData);
      } catch (e) {
        console.warn('[Location] Driver listener error:', e);
      }
    });

    if (now - lastBroadcastTime > THROTTLE_MS) {
      lastBroadcastTime = now;
      try {
        if (channel) {
          await channel.send({
            type: 'broadcast',
            event: 'location-update',
            payload: locationData
          });
        }

        if (driver.id) {
          await supabase
            .from('drivers')
            .update({ status: 'on_duty' })
            .eq('id', driver.id);
        }
      } catch (err) {
        console.warn('[Location] Driver broadcast error:', err);
      }
    }
  };

  // İlk konumu hemen al
  if (Capacitor.isNativePlatform()) {
    Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000
    }).then((pos) => {
      if (pos) handlePosition(pos);
    }).catch(() => {});
  } else if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      handlePosition,
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Sürekli GPS izle
  if (Capacitor.isNativePlatform()) {
    try {
      activeDriverWatchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 },
        (position, err) => {
          if (position && !err) handlePosition(position);
        }
      );
      return activeDriverWatchId;
    } catch (e) {
      console.warn('[Location] Geolocation driver watch error:', e);
    }
  }

  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    activeDriverWatchId = navigator.geolocation.watchPosition(
      handlePosition,
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
    );
  }

  return activeDriverWatchId;
}

export function stopDriverLocationTracking() {
  if (activeDriverWatchId !== null) {
    if (Capacitor.isNativePlatform() && typeof activeDriverWatchId === 'string') {
      Geolocation.clearWatch({ id: activeDriverWatchId }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && 'geolocation' in navigator && typeof activeDriverWatchId === 'number') {
      navigator.geolocation.clearWatch(activeDriverWatchId);
    }
    activeDriverWatchId = null;
  }
}

/**
 * ==============================================================================
 * 2. YOLCU CANLI GPS İZLEME VE YAYIN SERVİSİ
 * ==============================================================================
 */
let lastPassengerBroadcastTime = 0;

export async function startPassengerLocationTracking(passenger, onLocationUpdate) {
  if (!passenger) return null;

  if (typeof onLocationUpdate === 'function') {
    passengerListeners.add(onLocationUpdate);
  }

  if (activePassengerWatchId !== null) {
    return activePassengerWatchId;
  }

  await requestLocationPermission();
  const channel = getOrCreateBroadcastChannel();

  const handlePassengerPosition = async (position) => {
    if (!position?.coords) return;

    const { latitude, longitude, accuracy } = position.coords;
    const now = Date.now();

    const passengerData = {
      booking_code: passenger.booking_code || passenger.code || '',
      passenger_id: passenger.id || passenger.email || 'passenger',
      passenger_name: passenger.full_name || passenger.passenger_name || 'VIP Yolcu',
      phone: passenger.phone || passenger.passenger_phone || '',
      lat: latitude,
      lng: longitude,
      accuracy: Math.round(accuracy || 5),
      updated_at: new Date().toISOString()
    };

    lastKnownPassengerLocation = passengerData;

    passengerListeners.forEach((fn) => {
      try {
        fn(passengerData);
      } catch (e) {
        console.warn('[Location] Passenger listener error:', e);
      }
    });

    if (now - lastPassengerBroadcastTime > THROTTLE_MS) {
      lastPassengerBroadcastTime = now;
      try {
        if (channel) {
          await channel.send({
            type: 'broadcast',
            event: 'passenger-location-update',
            payload: passengerData
          });
        }
      } catch (err) {
        console.warn('[Location] Passenger broadcast error:', err);
      }
    }
  };

  // İlk konumu anında al
  if (Capacitor.isNativePlatform()) {
    Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000
    }).then((pos) => {
      if (pos) handlePassengerPosition(pos);
    }).catch(() => {});
  } else if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      handlePassengerPosition,
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Sürekli GPS izle
  if (Capacitor.isNativePlatform()) {
    try {
      activePassengerWatchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 },
        (position, err) => {
          if (position && !err) handlePassengerPosition(position);
        }
      );
      return activePassengerWatchId;
    } catch (e) {
      console.warn('[Location] Passenger watch error:', e);
    }
  }

  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    activePassengerWatchId = navigator.geolocation.watchPosition(
      handlePassengerPosition,
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
    );
  }

  return activePassengerWatchId;
}

export function stopPassengerLocationTracking() {
  if (activePassengerWatchId !== null) {
    if (Capacitor.isNativePlatform() && typeof activePassengerWatchId === 'string') {
      Geolocation.clearWatch({ id: activePassengerWatchId }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && 'geolocation' in navigator && typeof activePassengerWatchId === 'number') {
      navigator.geolocation.clearWatch(activePassengerWatchId);
    }
    activePassengerWatchId = null;
  }
}
