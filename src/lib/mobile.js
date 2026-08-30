import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';

export async function initMobileNative() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Status Bar styling (Light background -> Dark icons)
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
    }
  } catch (err) {
    console.warn('[Mobile] StatusBar init error:', err);
  }

  try {
    // Splash screen hide
    await SplashScreen.hide();
  } catch (err) {
    console.warn('[Mobile] SplashScreen hide error:', err);
  }

  try {
    // Keyboard setup
    if (Capacitor.getPlatform() === 'ios') {
      await Keyboard.setAccessoryBarVisible({ isVisible: true });
    }
  } catch (err) {
    console.warn('[Mobile] Keyboard init error:', err);
  }

  try {
    // Notification permission request
    const { requestNotificationPermission, setupNotificationTapListener } = await import('./nativeNotifications');
    await requestNotificationPermission();
    setupNotificationTapListener((extra) => {
      if (extra?.code) {
        window.location.href = `/driver/rezervasyon/${extra.code}`;
      }
    });
  } catch (err) {
    console.warn('[Mobile] Notification init error:', err);
  }
}
