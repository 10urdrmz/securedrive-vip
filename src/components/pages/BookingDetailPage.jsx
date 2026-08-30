import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Ticket,
  RefreshCw,
  AlertCircle,
  Lock,
  User,
  Car,
  MapPin,
  Plane,
  CheckCircle2,
  MessageSquareWarning,
  Star,
  CreditCard,
  Clock,
  Mail,
  FileText,
  Edit3,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  fetchBookingByCode,
  updateBookingStatus,
  assignDriverToBooking,
  findDriverIdForBooking,
  confirmVehicleAllocation
} from '../../lib/bookingService';
import {
  BOOKING_STATUS_STEPS,
  normalizeStatusStep,
  getStatusLabel,
  hasAssignedDriver
} from '../../lib/bookingStatus';
import { getBookingAccess, verifyGuestAccess } from '../../lib/bookingAccess';
import BoardingPassModal from '../modals/BoardingPassModal';
import DriverReviewForm from '../customer/DriverReviewForm';
import PassengerLiveTracking from '../common/PassengerLiveTracking';
import { isBookingCompleted, fetchReviewsForBookingCodes, isComplaintReview } from '../../lib/reviewService';

function feedbackLabel(type, rating) {
  if (type === 'complaint' || Number(rating) <= 2) return 'Şikayet';
  if (type === 'neutral' || Number(rating) === 3) return 'Orta';
  return 'Olumlu';
}

function paymentMethodLabel(method) {
  const map = {
    'credit-card': 'Kredi Kartı (3D Secure)',
    card: 'Kredi Kartı',
    cash: 'Nakit',
    corporate: 'Kurumsal Cari'
  };
  return map[method] || method || '—';
}

function InfoRow({ label, value, highlight, icon: Icon }) {
  return (
    <div>
      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
        {Icon && <Icon size={11} />}
        {label}
      </span>
      <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px', color: highlight || 'var(--text)' }}>
        {value || '—'}
      </div>
    </div>
  );
}

function StatusTimeline({ booking }) {
  const step = normalizeStatusStep(booking?.status_step, booking);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {BOOKING_STATUS_STEPS.map((item, index) => {
        const isPast = item.step < step;
        const isActive = item.step === step;

        return (
          <div key={item.step} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isPast || isActive ? item.color : '#e5e7eb',
                border: `2px solid ${isPast || isActive ? item.color : '#d1d5db'}`,
                flexShrink: 0,
                marginTop: '4px'
              }} />
              {index < BOOKING_STATUS_STEPS.length - 1 && (
                <div style={{ width: '2px', height: '24px', background: isPast ? item.color : '#e5e7eb', margin: '2px 0' }} />
              )}
            </div>
            <div style={{ paddingBottom: index < BOOKING_STATUS_STEPS.length - 1 ? '12px' : 0 }}>
              <div style={{ fontSize: '12.5px', fontWeight: isActive ? 700 : 600, color: isPast || isActive ? 'var(--text)' : 'var(--text-muted)' }}>
                {item.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CustomerReviewPanel({ review, forAdmin }) {
  if (!review) return null;

  const isComplaint = isComplaintReview(review);
  const reviewDate = new Date(review.created_at || review._savedAt || Date.now()).toLocaleString('tr-TR');

  return (
    <div style={{
      marginTop: '16px',
      padding: '16px',
      borderRadius: 'var(--radius-md)',
      border: `1px solid ${isComplaint ? '#fecaca' : '#bfdbfe'}`,
      background: isComplaint ? '#fef2f2' : '#eff6ff'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isComplaint ? (
            <MessageSquareWarning size={18} color="#b91c1c" />
          ) : (
            <Star size={18} color="#f59e0b" />
          )}
          <strong style={{ fontSize: '14px', color: isComplaint ? '#b91c1c' : '#1d4ed8' }}>
            {isComplaint ? 'Müşteri Şikayeti' : 'Müşteri Değerlendirmesi'}
          </strong>
          <span className="preset-chip" style={{
            fontSize: '10px',
            background: isComplaint ? '#fee2e2' : '#dbeafe',
            color: isComplaint ? '#b91c1c' : '#2563eb'
          }}>
            {feedbackLabel(review.feedback_type, review.rating)}
          </span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{reviewDate}</span>
      </div>

      <div style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b', marginBottom: '8px' }}>
        {'★'.repeat(review.rating)}{'☆'.repeat(5 - Number(review.rating))} ({review.rating}/5)
      </div>

      {review.comment ? (
        <blockquote style={{
          margin: 0,
          padding: '12px 14px',
          background: '#ffffff',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${isComplaint ? '#fecaca' : 'var(--border)'}`,
          fontSize: '13.5px',
          lineHeight: 1.55,
          color: 'var(--text)',
          fontStyle: 'italic'
        }}>
          “{review.comment}”
        </blockquote>
      ) : (
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
          Müşteri yorum bırakmadı, yalnızca puan verdi.
        </p>
      )}

      {forAdmin && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px dashed ${isComplaint ? '#fecaca' : '#bfdbfe'}`, fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <span><strong>Yolcu:</strong> {review.passenger_name}</span>
          {review.passenger_phone && <span><strong>Tel:</strong> {review.passenger_phone}</span>}
          <span><strong>Şoför:</strong> {review.chauffeur_name}</span>
        </div>
      )}
    </div>
  );
}

export default function BookingDetailPage({ backPath, backLabel }) {
  const { code } = useParams();
  const { user: currentUser } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestVerified, setGuestVerified] = useState(false);
  const [verifyName, setVerifyName] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [showVoucher, setShowVoucher] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [review, setReview] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [assigningDriver, setAssigningDriver] = useState(false);

  const loadDrivers = async (currentBooking) => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('name', { ascending: true });

      if (error || !data?.length) {
        setDrivers([]);
        return;
      }

      setDrivers(data);
      if (currentBooking) {
        const assignedId = findDriverIdForBooking(data, currentBooking);
        setSelectedDriverId(
          hasAssignedDriver(currentBooking) ? '' : (assignedId || '')
        );
      }
    } catch (err) {
      console.warn(err);
      setDrivers([]);
    }
  };

  const loadBooking = async () => {
    if (!code) return;
    setLoading(true);
    try {
      const data = await fetchBookingByCode(code);
      setBooking(data);
      if (data?.code) {
        const reviews = await fetchReviewsForBookingCodes([data.code]);
        setReview(reviews[data.code] || null);
      } else {
        setReview(null);
      }

      if (currentUser?.role === 'admin' && data) {
        await loadDrivers(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [code]);

  useEffect(() => {
    const onUpdated = (e) => {
      if (e.detail?.code === code?.toUpperCase()) loadBooking();
    };
    window.addEventListener('securedrive-booking-updated', onUpdated);
    return () => window.removeEventListener('securedrive-booking-updated', onUpdated);
  }, [code]);

  const access = getBookingAccess(currentUser, booking, guestVerified);

  const handleGuestVerify = (e) => {
    e.preventDefault();
    if (
      verifyGuestAccess(booking, {
        fullName: verifyName,
        email: verifyEmail
      })
    ) {
      setGuestVerified(true);
      setVerifyError('');
    } else {
      setVerifyError('Doğrulama başarısız. Ad soyad ve e-posta rezervasyon kaydıyla birebir eşleşmiyor.');
    }
  };

  const handleAssignDriver = async () => {
    if (!booking || !selectedDriverId) return;

    const driver = drivers.find((d) => d.id === selectedDriverId);
    if (!driver) return;

    const isReassignment = hasAssignedDriver(booking);
    const currentStep = normalizeStatusStep(booking.status_step, booking);

    if (isReassignment && currentStep >= 3) {
      const confirmed = window.confirm(
        'Transfer devam ediyor. Şoför değiştirilirse durum "VIP Şoför Atandı" adımına döner ve araç tahsisi yeniden yapılmalıdır. Devam edilsin mi?'
      );
      if (!confirmed) return;
    }

    setAssigningDriver(true);
    setFeedbackMsg('');
    try {
      const updated = await assignDriverToBooking(booking, driver, { assignedBy: 'admin' });
      setBooking((prev) => ({ ...prev, ...updated }));
      setSelectedDriverId('');
      setFeedbackMsg(
        isReassignment
          ? `"${driver.name}" ile şoför değiştirildi. Önceki şoföre iptal bildirimi gönderildi.`
          : `"${driver.name}" bu rezervasyona atandı. Müşteri ve şoföre bildirim gönderildi.`
      );
    } catch (err) {
      setFeedbackMsg(err?.message || 'Şoför ataması kaydedilemedi.');
    } finally {
      setAssigningDriver(false);
    }
  };

  const handleDriverStatus = async (statusStep) => {
    if (!booking) return;
    setUpdating(true);
    setFeedbackMsg('');
    try {
      const label = getStatusLabel(statusStep, booking);
      const updated = await updateBookingStatus(
        booking,
        { status: label, status_step: statusStep },
        { actorRole: 'driver' }
      );
      setBooking((prev) => ({ ...prev, ...updated }));
      setFeedbackMsg('Transfer durumu güncellendi.');
    } catch (err) {
      setFeedbackMsg(err?.message || 'Durum güncellenemedi.');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmVehicle = async () => {
    if (!booking) return;
    setUpdating(true);
    setFeedbackMsg('');
    try {
      const updated = await confirmVehicleAllocation(booking);
      setBooking((prev) => ({ ...prev, ...updated }));
      setFeedbackMsg('Araç tahsisi onaylandı.');
    } catch (err) {
      setFeedbackMsg(err?.message || 'Araç tahsisi yapılamadı.');
    } finally {
      setUpdating(false);
    }
  };

  const defaultBack = () => {
    if (backPath) return backPath;
    if (currentUser?.role === 'admin') return '/admin/reservations';
    if (currentUser?.role === 'driver') return '/driver';
    if (currentUser?.role === 'customer') return '/account';
    return '/takip';
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px auto', display: 'block' }} />
        Rezervasyon yükleniyor...
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
        <AlertCircle size={32} color="#b91c1c" style={{ margin: '0 auto 12px auto' }} />
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Rezervasyon Bulunamadı</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          <span className="mono">{code}</span> koduna ait kayıt bulunamadı.
        </p>
        <Link to={defaultBack()} className="btn-ghost" style={{ marginTop: '16px', display: 'inline-flex', textDecoration: 'none' }}>
          <ArrowLeft size={14} />
          <span>{backLabel || 'Geri Dön'}</span>
        </Link>
      </div>
    );
  }

  if (!access.allowed && access.needsVerification) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '520px', margin: '0 auto' }}>
        <Link to={defaultBack()} className="btn-ghost" style={{ marginBottom: '20px', display: 'inline-flex', textDecoration: 'none', fontSize: '13px' }}>
          <ArrowLeft size={14} />
          <span>{backLabel || 'Geri'}</span>
        </Link>
        <div className="fleet-item-card" style={{ padding: '28px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Lock size={28} color="#2563eb" style={{ margin: '0 auto 10px auto' }} />
            <h1 className="mono" style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb' }}>{booking.code}</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Güvenlik için kayıtlı ad soyadınızı ve e-posta adresinizi eksiksiz giriniz.
            </p>
          </div>
          <form onSubmit={handleGuestVerify} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="input-field-box" style={{ height: '42px' }}>
              <User size={15} color="var(--text-muted)" />
              <input
                type="text"
                value={verifyName}
                onChange={(e) => setVerifyName(e.target.value)}
                placeholder="Ad Soyad (tam)"
                autoComplete="name"
                required
              />
            </div>
            <div className="input-field-box" style={{ height: '42px' }}>
              <Mail size={15} color="var(--text-muted)" />
              <input
                type="email"
                value={verifyEmail}
                onChange={(e) => setVerifyEmail(e.target.value)}
                placeholder="Kayıtlı e-posta"
                autoComplete="email"
                required
              />
            </div>
            {verifyError && (
              <div style={{ fontSize: '12px', color: '#b91c1c' }}>{verifyError}</div>
            )}
            <button type="submit" className="btn-action-primary" style={{ justifyContent: 'center', height: '42px' }}>
              Doğrula & Detayı Gör
            </button>
          </form>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '14px' }}>
            Hesabınız varsa <Link to="/login">giriş yapın</Link>
          </p>
        </div>
      </div>
    );
  }

  if (!access.allowed) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
        <AlertCircle size={32} color="#b91c1c" style={{ margin: '0 auto 12px auto' }} />
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Erişim Reddedildi</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{access.message}</p>
        <Link to={defaultBack()} className="btn-ghost" style={{ marginTop: '16px', display: 'inline-flex', textDecoration: 'none' }}>
          <ArrowLeft size={14} />
          <span>Geri Dön</span>
        </Link>
      </div>
    );
  }

  const showPassengerContact = access.level === 'admin' || access.level === 'driver';
  const isAdmin = access.level === 'admin';
  const formattedDate = booking.transfer_datetime
    ? new Date(booking.transfer_datetime).toLocaleString('tr-TR')
    : '—';
  const createdAt = booking.created_at
    ? new Date(booking.created_at).toLocaleString('tr-TR')
    : '—';
  const updatedAt = booking.updated_at
    ? new Date(booking.updated_at).toLocaleString('tr-TR')
    : '—';
  const hasComplaint = review && isComplaintReview(review);
  const currentStep = normalizeStatusStep(booking.status_step, booking);
  const assignedDriverId = findDriverIdForBooking(drivers, booking);
  const isSameDriverSelected = Boolean(assignedDriverId && selectedDriverId === assignedDriverId);
  const driverAlreadyAssigned = hasAssignedDriver(booking);

  return (
    <div style={{ padding: isAdmin ? '24px 20px 60px' : '32px 20px 60px', maxWidth: isAdmin ? '1100px' : '900px', margin: '0 auto' }}>
      <Link to={defaultBack()} className="btn-ghost" style={{ marginBottom: '18px', display: 'inline-flex', textDecoration: 'none', fontSize: '13px' }}>
        <ArrowLeft size={14} />
        <span>{backLabel || 'Geri'}</span>
      </Link>

      {hasComplaint && isAdmin && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <MessageSquareWarning size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <strong>Bu transfer için müşteri şikayeti kayıtlı.</strong>
            {review.comment && (
              <div style={{ fontWeight: 500, marginTop: '4px', fontSize: '12.5px' }}>
                “{review.comment.length > 120 ? `${review.comment.slice(0, 120)}...` : review.comment}”
              </div>
            )}
          </div>
        </div>
      )}

      {feedbackMsg && (
        <div style={{
          background: 'var(--accent-green-bg)',
          border: '1px solid var(--accent-green-border)',
          color: 'var(--accent-green)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          fontSize: '12.5px',
          fontWeight: 600,
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={15} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 300px' : '1fr', gap: '16px', alignItems: 'start' }}>
        <div className="fleet-item-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>REZERVASYON</span>
            <h1 className="mono" style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb', margin: '4px 0' }}>
              {booking.code}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="preset-chip" style={{ background: 'var(--accent-green-bg)', color: 'var(--accent-green)', fontWeight: 600 }}>
                {booking.status}
              </span>
              {isAdmin && (
                <span className="preset-chip" style={{ fontSize: '10.5px', background: '#f1f5f9', color: '#64748b' }}>
                  Adım {currentStep}/6
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {isAdmin && (
              <Link to="/admin/reservations" className="btn-ghost" style={{ height: '38px', textDecoration: 'none', fontSize: '12px' }}>
                <Edit3 size={14} />
                <span>Düzenle</span>
              </Link>
            )}
            {(access.level === 'admin' || access.level === 'customer' || access.level === 'guest') && (
              <button type="button" className="btn-action-primary" onClick={() => setShowVoucher(true)} style={{ height: '38px' }}>
                <Ticket size={14} />
                <span>Boarding Pass</span>
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <InfoRow label="Yolcu" value={booking.passenger_name} icon={User} />
          {showPassengerContact && (
            <>
              <InfoRow label="Yolcu Telefon" value={booking.passenger_phone} icon={Phone} />
              {isAdmin && booking.passenger_email && (
                <InfoRow label="Yolcu E-posta" value={booking.passenger_email} icon={Mail} />
              )}
            </>
          )}
          <InfoRow label="Uçuş No" value={booking.flight_no} highlight="var(--accent-green)" icon={Plane} />
          <InfoRow label="Transfer Tarihi" value={formattedDate} icon={Clock} />
          <InfoRow label="Kapasite" value={`${booking.pax_count || 2} Pax / ${booking.luggage_count || 2} Bag`} />
          {(access.level === 'admin' || access.level === 'customer') && (
            <InfoRow
              label="Toplam Tutar"
              value={`${Number(booking.total_price_try || 0).toLocaleString('tr-TR')} ₺`}
              highlight="#2563eb"
              icon={CreditCard}
            />
          )}
          {isAdmin && (
            <>
              <InfoRow label="Ödeme Durumu" value={booking.payment_status === 'completed' ? 'Ödendi' : booking.payment_status} />
              <InfoRow label="Ödeme Yöntemi" value={paymentMethodLabel(booking.payment_method)} />
            </>
          )}
        </div>

        {isAdmin && booking.passenger_notes && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <FileText size={14} color="#d97706" />
              <strong style={{ fontSize: '12px', color: '#92400e' }}>Yolcu Notu</strong>
            </div>
            <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.5 }}>{booking.passenger_notes}</p>
          </div>
        )}

        <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <MapPin size={15} color="var(--text-muted)" />
            <strong style={{ fontSize: '13px' }}>Güzergah</strong>
          </div>
          <div style={{ fontSize: '13.5px' }}>🛫 {booking.pickup_location}</div>
          <div style={{ fontSize: '13.5px', marginTop: '4px' }}>🏨 ➔ {booking.destination_location}</div>
          {isAdmin && (
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Hizmet: {booking.service_type || 'transfer'} · Tip: {booking.trip_type === 'roundtrip' ? 'Gidiş-Dönüş' : 'Tek Yön'}
            </div>
          )}
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Car size={15} color="var(--text-muted)" />
            <strong style={{ fontSize: '13px' }}>VIP Araç & Şoför</strong>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>{booking.vehicle_name}</div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Plaka: {booking.vehicle_plate} · Şoför: {booking.chauffeur_name}
          </div>
          {(access.level === 'admin' || access.level === 'customer' || access.level === 'driver') && booking.chauffeur_phone && (
            <a href={`tel:${booking.chauffeur_phone}`} className="btn-ghost" style={{ marginTop: '10px', textDecoration: 'none', fontSize: '12px', display: 'inline-flex' }}>
              <Phone size={13} />
              <span>Şoförü Ara ({booking.chauffeur_phone})</span>
            </a>
          )}
          {isAdmin && !hasAssignedDriver(booking) && (
            <p style={{ fontSize: '12px', color: '#d97706', marginTop: '10px', marginBottom: 0 }}>
              Henüz şoför atanmadı. Sağ panelden atama yapabilirsiniz.
            </p>
          )}
        </div>

        {/* Canlı VIP Şoför & Yolcu Radarı */}
        {currentStep < 6 && (
          <PassengerLiveTracking booking={booking} />
        )}

        {(isAdmin || access.level === 'driver') && review && (
          <CustomerReviewPanel review={review} forAdmin={isAdmin} />
        )}

        {isAdmin && !review && isBookingCompleted(booking) && (
          <div style={{
            marginTop: '16px',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border)',
            background: '#f8fafc',
            fontSize: '12.5px',
            color: 'var(--text-muted)',
            textAlign: 'center'
          }}>
            Bu transfer için henüz müşteri değerlendirmesi veya şikayeti bulunmuyor.
          </div>
        )}

        {access.level === 'driver' && currentStep < 6 && (
          <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {currentStep === 2 && (
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                Araç tahsisi operasyon ekibi tarafından onaylandığında görev adımları aktif olacaktır.
              </p>
            )}
            {currentStep === 3 && (
              <button type="button" className="btn-action-primary" disabled={updating} onClick={() => handleDriverStatus(4)} style={{ fontSize: '12px', height: '36px', background: '#2563eb' }}>
                Karşılama Kapısına Geçtim
              </button>
            )}
            {currentStep === 4 && (
              <button type="button" className="btn-action-primary" disabled={updating} onClick={() => handleDriverStatus(5)} style={{ fontSize: '12px', height: '36px', background: '#d97706' }}>
                Yolcuyu Aldım
              </button>
            )}
            {currentStep === 5 && (
              <button type="button" className="btn-action-primary" disabled={updating} onClick={() => handleDriverStatus(6)} style={{ fontSize: '12px', height: '36px', background: '#10b981' }}>
                Transferi Tamamla
              </button>
            )}
          </div>
        )}

        {(access.level === 'customer' || access.level === 'guest') && isBookingCompleted(booking) && (
          <DriverReviewForm
            booking={booking}
            user={currentUser}
            existingReview={review}
            onSubmitted={(r) => {
              setReview(r);
              setFeedbackMsg('Değerlendirmeniz kaydedildi.');
            }}
          />
        )}
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="fleet-item-card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={15} color="#2563eb" />
                  <strong style={{ fontSize: '13px' }}>
                    {driverAlreadyAssigned ? 'Şoför Yönetimi' : 'Şoför Ataması'}
                  </strong>
                </div>
                {driverAlreadyAssigned && (
                  <span className="preset-chip" style={{ fontSize: '10px', background: '#eff6ff', color: '#2563eb' }}>
                    Atanmış
                  </span>
                )}
              </div>

              {driverAlreadyAssigned && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                    Mevcut Şoför
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700 }}>{booking.chauffeur_name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {booking.chauffeur_phone} · {booking.vehicle_plate || 'Plaka yok'}
                  </div>
                </div>
              )}

              {drivers.length === 0 ? (
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                  Kayıtlı şoför bulunamadı.{' '}
                  <Link to="/admin/drivers" style={{ color: '#2563eb', fontWeight: 600 }}>
                    Şoför ekleyin
                  </Link>
                </p>
              ) : (
                <>
                  <label className="input-label" style={{ fontSize: '11px' }}>
                    {driverAlreadyAssigned ? 'Yeni Şoför Seç (Değiştir)' : 'VIP Şoför Seç'}
                  </label>
                  <select
                    className="select-chip"
                    style={{ width: '100%', height: '40px', marginBottom: '10px' }}
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                  >
                    <option value="">
                      {driverAlreadyAssigned ? 'Değiştirmek için şoför seçin...' : 'Sistemdeki şoförlerden seçin...'}
                    </option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id} disabled={d.id === assignedDriverId}>
                        {d.name} · {d.phone} · {d.vehicle_plate || 'Plaka yok'} · {d.status === 'on_duty' ? 'Nöbette' : 'İzinli'}
                        {d.id === assignedDriverId ? ' (Mevcut)' : ''}
                      </option>
                    ))}
                  </select>

                  {selectedDriverId && !isSameDriverSelected && (() => {
                    const selected = drivers.find((d) => d.id === selectedDriverId);
                    if (!selected) return null;
                    return (
                      <div style={{
                        fontSize: '12px',
                        color: driverAlreadyAssigned ? '#92400e' : 'var(--text-muted)',
                        marginBottom: '12px',
                        lineHeight: 1.5,
                        background: driverAlreadyAssigned ? '#fffbeb' : 'transparent',
                        border: driverAlreadyAssigned ? '1px solid #fde68a' : 'none',
                        borderRadius: 'var(--radius-md)',
                        padding: driverAlreadyAssigned ? '8px 10px' : 0
                      }}>
                        {driverAlreadyAssigned && (
                          <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '11px' }}>Yeni atama özeti</div>
                        )}
                        <div><strong>Ad:</strong> {selected.name}</div>
                        <div><strong>Tel:</strong> {selected.phone}</div>
                        <div><strong>Plaka:</strong> {selected.vehicle_plate || '—'}</div>
                      </div>
                    );
                  })()}

                  <button
                    type="button"
                    className="btn-action-primary"
                    style={{
                      width: '100%',
                      height: '38px',
                      justifyContent: 'center',
                      background: driverAlreadyAssigned && !isSameDriverSelected ? '#d97706' : undefined
                    }}
                    disabled={!selectedDriverId || isSameDriverSelected || assigningDriver}
                    onClick={handleAssignDriver}
                  >
                    {assigningDriver
                      ? 'Kaydediliyor...'
                      : isSameDriverSelected
                        ? 'Mevcut Şoför'
                        : driverAlreadyAssigned
                          ? 'Şoför Değiştir'
                          : 'Şoförü Ata & Kaydet'}
                  </button>
                </>
              )}
            </div>

            <div className="fleet-item-card" style={{ padding: '18px' }}>
              <strong style={{ fontSize: '13px', display: 'block', marginBottom: '14px' }}>Transfer Durumu</strong>
              <StatusTimeline booking={booking} />
              {hasAssignedDriver(booking) && currentStep === 2 && (
                <button
                  type="button"
                  className="btn-action-primary"
                  style={{ width: '100%', height: '36px', justifyContent: 'center', marginTop: '14px', fontSize: '12px' }}
                  disabled={updating}
                  onClick={handleConfirmVehicle}
                >
                  {updating ? 'Kaydediliyor...' : 'Araç Tahsis Et'}
                </button>
              )}
            </div>

            <div className="fleet-item-card" style={{ padding: '18px' }}>
              <strong style={{ fontSize: '13px', display: 'block', marginBottom: '12px' }}>Kayıt Bilgileri</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10.5px', textTransform: 'uppercase', fontWeight: 700 }}>Oluşturulma</span>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>{createdAt}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10.5px', textTransform: 'uppercase', fontWeight: 700 }}>Son Güncelleme</span>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>{updatedAt}</div>
                </div>
                {booking.id && (
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10.5px', textTransform: 'uppercase', fontWeight: 700 }}>Kayıt ID</span>
                    <div className="mono" style={{ fontSize: '10.5px', marginTop: '2px', wordBreak: 'break-all' }}>{booking.id}</div>
                  </div>
                )}
              </div>
            </div>

            {hasComplaint && (
              <Link
                to="/admin/driver-reviews"
                className="btn-ghost"
                style={{
                  textDecoration: 'none',
                  fontSize: '12.5px',
                  justifyContent: 'center',
                  border: '1px solid #fecaca',
                  background: '#fef2f2',
                  color: '#b91c1c'
                }}
              >
                <MessageSquareWarning size={14} />
                <span>Tüm Şoför Şikayetlerini Gör</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {showVoucher && (
        <BoardingPassModal
          booking={booking}
          onClose={() => setShowVoucher(false)}
        />
      )}
    </div>
  );
}
