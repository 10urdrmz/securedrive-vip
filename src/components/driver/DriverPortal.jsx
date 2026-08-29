import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchDriverBookings, updateBookingStatus } from '../../lib/bookingService';
import { getStatusLabel, normalizeStatusStep } from '../../lib/bookingStatus';
import NotificationBell from '../common/NotificationBell';
import { fetchDriverReviewStats, getDriverStatsForPhone } from '../../lib/reviewService';
import BookingCodeLink from '../common/BookingCodeLink';
import {
  Car,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  LogOut,
  RefreshCw,
  Award,
  Navigation,
  Clock,
  ExternalLink,
  AlertCircle,
  ChevronRight,
  Bell,
  User,
  ListChecks,
  CircleDot
} from 'lucide-react';

function formatTransferDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function DriverMenuItem({ icon: Icon, label, badge, active, onClick, trailing }) {
  return (
    <button type="button" className={`driver-menu-item${active ? ' is-active' : ''}`} onClick={onClick}>
      <span className="driver-menu-item__icon">{Icon && <Icon size={18} strokeWidth={1.75} />}</span>
      <span className="driver-menu-item__label">{label}</span>
      {badge != null && <span className="driver-menu-item__badge">{badge}</span>}
      {trailing}
    </button>
  );
}

function DriverTaskRow({ task, updatingCode, onUpdateStatus }) {
  const step = normalizeStatusStep(task.status_step, task);
  const isCompleted = step >= 6;
  const statusLabel = task.status || getStatusLabel(step, task);

  return (
    <article className={`driver-trip${isCompleted ? ' is-done' : ''}`}>
      <div className="driver-trip__head">
        <div className="driver-trip__main">
          <BookingCodeLink code={task.code} />
          <span className={`driver-trip__pill${isCompleted ? ' muted' : ''}`}>{statusLabel}</span>
        </div>
        <div className="driver-trip__meta">
          <span><Clock size={12} /> {formatTransferDate(task.transfer_datetime)}</span>
          <span>Uçuş {task.flight_no || '—'}</span>
        </div>
      </div>

      <div className="driver-trip__body">
        <div className="driver-trip__row">
          <span className="driver-trip__label">Yolcu</span>
          <span className="driver-trip__value">{task.passenger_name}</span>
        </div>
        <div className="driver-trip__row">
          <span className="driver-trip__label">Güzergah</span>
          <span className="driver-trip__value">{task.pickup_location} → {task.destination_location}</span>
        </div>
        <div className="driver-trip__row">
          <span className="driver-trip__label">İletişim</span>
          <span className="driver-trip__value">{task.passenger_phone}</span>
        </div>
      </div>

      {step === 2 && (
        <p className="driver-trip__hint">Araç tahsisi onaylanınca kapı adımına geçebilirsiniz.</p>
      )}

      <div className="driver-trip__actions">
        <a href={`tel:${task.passenger_phone}`} className="driver-trip__btn">
          <Phone size={14} /> Ara
        </a>
        <a
          href={`https://wa.me/${(task.passenger_phone || '').replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="driver-trip__btn"
        >
          <MessageCircle size={14} /> WhatsApp
        </a>
        <Link to={`/driver/rezervasyon/${task.code}`} className="driver-trip__btn">
          <ExternalLink size={14} /> Detay
        </Link>

        {step === 3 && (
          <button
            type="button"
            className="driver-trip__btn primary"
            disabled={updatingCode === task.code}
            onClick={() => onUpdateStatus(task, 4)}
          >
            <MapPin size={14} />
            {updatingCode === task.code ? '...' : 'Kapıya Geçtim'}
          </button>
        )}
        {step === 4 && (
          <button
            type="button"
            className="driver-trip__btn warn"
            disabled={updatingCode === task.code}
            onClick={() => onUpdateStatus(task, 5)}
          >
            <Car size={14} />
            {updatingCode === task.code ? '...' : 'Yolcuyu Aldım'}
          </button>
        )}
        {step === 5 && (
          <button
            type="button"
            className="driver-trip__btn success"
            disabled={updatingCode === task.code}
            onClick={() => onUpdateStatus(task, 6)}
          >
            <CheckCircle2 size={14} />
            {updatingCode === task.code ? '...' : 'Tamamla'}
          </button>
        )}
      </div>
    </article>
  );
}

export default function DriverPortal() {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingCode, setUpdatingCode] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackType, setFeedbackType] = useState('success');
  const [taskFilter, setTaskFilter] = useState('active');
  const [driverRating, setDriverRating] = useState({ average: 4.99, count: 0, complaints: 0 });

  const fetchDriverTasks = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setFeedbackMsg('');
    try {
      const data = await fetchDriverBookings(currentUser);
      setTasks(data);
    } catch (e) {
      console.warn(e);
      setFeedbackType('error');
      setFeedbackMsg('Görevler yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchDriverTasks();
  }, [fetchDriverTasks]);

  useEffect(() => {
    if (!currentUser?.phone) return;
    fetchDriverReviewStats().then((stats) => {
      const mine = getDriverStatsForPhone(stats, currentUser.phone);
      if (mine) {
        setDriverRating({ average: mine.average, count: mine.count, complaints: mine.complaints });
      }
    });
  }, [currentUser]);

  const { activeTasks, completedTasks } = useMemo(() => {
    const active = [];
    const completed = [];
    tasks.forEach((task) => {
      if (normalizeStatusStep(task.status_step, task) >= 6) completed.push(task);
      else active.push(task);
    });
    return { activeTasks: active, completedTasks: completed };
  }, [tasks]);

  const displayedTasks = useMemo(() => {
    if (taskFilter === 'active') return activeTasks;
    if (taskFilter === 'completed') return completedTasks;
    return tasks;
  }, [taskFilter, activeTasks, completedTasks, tasks]);

  const filterTitle = {
    active: 'Aktif Görevler',
    completed: 'Tamamlanan Transferler',
    all: 'Tüm Görevler'
  }[taskFilter];

  const handleUpdateTripStatus = async (task, newStep) => {
    setUpdatingCode(task.code);
    setFeedbackMsg('');
    try {
      const newStatus = getStatusLabel(newStep, task);
      const updated = await updateBookingStatus(
        task,
        { status: newStatus, status_step: newStep },
        { actorRole: 'driver' }
      );
      setTasks((prev) => prev.map((t) => (t.code === task.code ? { ...t, ...updated } : t)));
      setFeedbackType('success');
      setFeedbackMsg(`${task.code} · ${newStatus}`);
    } catch (e) {
      setFeedbackType('error');
      setFeedbackMsg(e?.message || 'Durum güncellenemedi.');
    } finally {
      setUpdatingCode(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  const initials = (currentUser.full_name || 'VIP')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="driver-portal">
      <div className="driver-shell">
        <aside className="driver-panel">
          <div className="driver-profile">
            <div className="driver-profile__avatar">{initials}</div>
            <div className="driver-profile__info">
              <div className="driver-profile__top">
                <h1>{currentUser.full_name}</h1>
                <span className={`driver-profile__status${isOnDuty ? '' : ' idle'}`}>
                  {isOnDuty ? 'Nöbette' : 'Molada'}
                </span>
              </div>
              <p>{currentUser.phone || currentUser.email}</p>
              <p className="driver-profile__plate">{currentUser.vehicle_plate || '34 VIP 770'}</p>
            </div>
          </div>

          <div className="driver-panel__divider" />

          <div className="driver-menu-group">
            <button
              type="button"
              className="driver-menu-item driver-menu-item--status"
              onClick={() => setIsOnDuty(!isOnDuty)}
            >
              <span className="driver-menu-item__icon"><CircleDot size={18} strokeWidth={1.75} /></span>
              <span className="driver-menu-item__label">Durum güncelle</span>
              <span className="driver-menu-item__chevron"><ChevronRight size={16} /></span>
            </button>
            <DriverMenuItem icon={User} label="Profilim" />
            <div className="driver-menu-item driver-menu-item--static">
              <span className="driver-menu-item__icon"><Award size={18} strokeWidth={1.75} /></span>
              <span className="driver-menu-item__label">Şoför puanı</span>
              <span className="driver-menu-item__badge green">{driverRating.average}</span>
            </div>
          </div>

          <div className="driver-panel__divider" />

          <div className="driver-menu-group">
            <p className="driver-menu-group__title">Görevler</p>
            <DriverMenuItem
              icon={Navigation}
              label="Aktif görevler"
              badge={activeTasks.length || '0'}
              active={taskFilter === 'active'}
              onClick={() => setTaskFilter('active')}
            />
            <DriverMenuItem
              icon={CheckCircle2}
              label="Tamamlanan"
              badge={completedTasks.length || '0'}
              active={taskFilter === 'completed'}
              onClick={() => setTaskFilter('completed')}
            />
            <DriverMenuItem
              icon={ListChecks}
              label="Tüm görevler"
              badge={tasks.length || '0'}
              active={taskFilter === 'all'}
              onClick={() => setTaskFilter('all')}
            />
          </div>

          <div className="driver-panel__divider" />

          <div className="driver-menu-group">
            <div className="driver-menu-item driver-menu-item--static">
              <span className="driver-menu-item__icon"><Bell size={18} strokeWidth={1.75} /></span>
              <span className="driver-menu-item__label">Bildirimler</span>
              <span className="driver-menu-item__bell"><NotificationBell variant="light" /></span>
            </div>
            <DriverMenuItem icon={RefreshCw} label="Listeyi yenile" onClick={fetchDriverTasks} />
          </div>

          <div className="driver-panel__divider" />

          <button type="button" className="driver-menu-item driver-menu-item--logout" onClick={handleLogout}>
            <span className="driver-menu-item__icon"><LogOut size={18} strokeWidth={1.75} /></span>
            <span className="driver-menu-item__label">Çıkış yap</span>
          </button>
        </aside>

        <main className="driver-workspace">
          <header className="driver-workspace__head">
            <div>
              <h2>{filterTitle}</h2>
              <p>{displayedTasks.length} kayıt listeleniyor</p>
            </div>
            <button type="button" className="driver-workspace__refresh" onClick={fetchDriverTasks}>
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
            </button>
          </header>

          {feedbackMsg && (
            <div className={`driver-toast ${feedbackType}`}>{feedbackMsg}</div>
          )}

          {loading ? (
            <div className="driver-skeleton-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="driver-skeleton-card" />
              ))}
            </div>
          ) : displayedTasks.length === 0 ? (
            <div className="driver-empty-state">
              <AlertCircle size={28} strokeWidth={1.5} />
              <p>
                {taskFilter === 'active' && 'Aktif transfer bulunmuyor.'}
                {taskFilter === 'completed' && 'Tamamlanan transfer yok.'}
                {taskFilter === 'all' && 'Henüz atama yapılmadı.'}
              </p>
            </div>
          ) : (
            <div className="driver-trip-list">
              {displayedTasks.map((task) => (
                <DriverTaskRow
                  key={task.id || task.code}
                  task={task}
                  updatingCode={updatingCode}
                  onUpdateStatus={handleUpdateTripStatus}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
