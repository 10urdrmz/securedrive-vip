import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchNotificationsForUser,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotificationsForUser,
  subscribeToUserNotifications,
  upsertNotificationInList
} from '../../lib/notificationService';

function getTypeLabel(type) {
  const map = {
    new_assignment: 'Yeni Görev',
    reassigned: 'Yeniden Atama',
    assignment_cancelled: 'Görev İptali',
    driver_assigned: 'Şoför Atandı',
    driver_changed: 'Şoför Değişti',
    status_update: 'Durum',
    booking_created: 'Rezervasyon',
    driver_action: 'Şoför Bildirimi'
  };
  return map[type] || 'Bildirim';
}

function getTypeClass(type) {
  if (type === 'assignment_cancelled') return 'cancelled';
  if (type === 'new_assignment' || type === 'reassigned') return 'assignment';
  if (type === 'status_update' || type === 'driver_action') return 'status';
  if (type === 'driver_changed' || type === 'driver_assigned') return 'info';
  return 'default';
}

export default function NotificationBell({ variant = 'light' }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const wrapRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const items = await fetchNotificationsForUser(user);
      setNotifications(items);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;

    loadNotifications();

    const unsubscribe = subscribeToUserNotifications(user, ({ event, notification }) => {
      if (event === 'INSERT' && notification) {
        setNotifications((prev) => upsertNotificationInList(prev, notification));
        return;
      }
      if (event === 'UPDATE' && notification) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? notification : n))
        );
        return;
      }
      loadNotifications();
    });

    const onBooking = () => loadNotifications();
    window.addEventListener('securedrive-booking-updated', onBooking);

    return () => {
      unsubscribe();
      window.removeEventListener('securedrive-booking-updated', onBooking);
    };
  }, [user, loadNotifications]);

  useEffect(() => {
    if (!open) return undefined;
    const onOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const isDark = variant === 'dark';

  const handleItemClick = async (notification) => {
    if (!notification.is_read) {
      await markNotificationRead(notification.id);
      await loadNotifications();
    }
    setOpen(false);
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    if (actionLoading || unreadCount === 0) return;
    setActionLoading(true);
    try {
      await markAllNotificationsRead(user);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearAll = async (e) => {
    e.stopPropagation();
    if (actionLoading || notifications.length === 0) return;
    setActionLoading(true);
    try {
      await clearAllNotificationsForUser(user);
      setNotifications([]);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      ref={wrapRef}
      className={`notification-bell${isDark ? ' notification-bell--dark' : ''}${open ? ' is-open' : ''}`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="notification-bell__trigger btn-ghost"
        title="Bildirimler"
        aria-expanded={open}
        aria-label={`Bildirimler${unreadCount ? `, ${unreadCount} okunmamış` : ''}`}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="notification-bell__badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-bell__panel" role="dialog" aria-label="Bildirim listesi">
          <div className="notification-bell__header">
            <div>
              <strong className="notification-bell__title">Bildirimler</strong>
              {unreadCount > 0 && (
                <span className="notification-bell__count">{unreadCount} okunmamış</span>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="notification-bell__actions">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={actionLoading}
                    className="notification-bell__action-btn notification-bell__action-btn--read btn-ghost"
                    title="Tümünü okundu işaretle"
                  >
                    <CheckCheck size={13} />
                    <span>Tümünü okundu işaretle</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={actionLoading}
                  className="notification-bell__action-btn notification-bell__action-btn--clear btn-ghost"
                  title="Tümünü temizle"
                >
                  <Trash2 size={13} />
                  <span>Tümünü temizle</span>
                </button>
              </div>
            )}
          </div>

          <div className="notification-bell__list">
            {loading && notifications.length === 0 ? (
              <div className="notification-bell__empty">Yükleniyor...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-bell__empty">Henüz bildirim yok.</div>
            ) : (
              notifications.map((n) => {
                const itemClass = `notification-bell__item${n.is_read ? '' : ' is-unread'}`;
                const inner = (
                  <div className={itemClass}>
                    <div className="notification-bell__item-indicator" aria-hidden="true" />
                    <div className="notification-bell__item-body">
                      <div className="notification-bell__item-top">
                        <span className={`notification-bell__type notification-bell__type--${getTypeClass(n.type)}`}>
                          {getTypeLabel(n.type)}
                        </span>
                        <time className="notification-bell__time">
                          {n.created_at
                            ? new Date(n.created_at).toLocaleString('tr-TR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : ''}
                        </time>
                      </div>
                      <div className="notification-bell__item-title">{n.title}</div>
                      <div className="notification-bell__item-message">{n.message}</div>
                      {n.booking_code && (
                        <div className="notification-bell__code">{n.booking_code}</div>
                      )}
                    </div>
                  </div>
                );

                if (n.link_path) {
                  return (
                    <Link
                      key={n.id}
                      to={n.link_path}
                      onClick={() => handleItemClick(n)}
                      className="notification-bell__link"
                    >
                      {inner}
                    </Link>
                  );
                }

                return (
                  <div
                    key={n.id}
                    className="notification-bell__link"
                    onClick={() => handleItemClick(n)}
                    role="presentation"
                  >
                    {inner}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
