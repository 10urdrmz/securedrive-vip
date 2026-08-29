import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchBookingByCode } from '../../lib/bookingService';
import { supabase } from '../../lib/supabase';
import {
  getLocalBookingsForUser,
  bookingBelongsToUser,
  mergeBookingsByCode
} from '../../lib/bookingStorage';
import BoardingPassModal from '../modals/BoardingPassModal';
import DriverReviewForm from './DriverReviewForm';
import BookingCodeLink from '../common/BookingCodeLink';
import { isBookingCompleted, fetchReviewsForBookingCodes } from '../../lib/reviewService';
import { 
  User, 
  CalendarCheck, 
  Ticket, 
  Car, 
  Phone, 
  MapPin, 
  Clock, 
  PlusCircle, 
  LogOut, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  RefreshCw,
  Mail,
  AlertCircle,
  KeyRound,
  FileText
} from 'lucide-react';

export default function CustomerPortal() {
  const navigate = useNavigate();
  const { user: currentUser, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'profile'
  const [myBookings, setMyBookings] = useState([]);
  const [bookingReviews, setBookingReviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  // Fetch ONLY this user's bookings with strict isolation
  const fetchMyBookings = async () => {
    if (!currentUser) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      const remoteBookings = error ? [] : (data || []).filter((b) => bookingBelongsToUser(b, currentUser));

      if (error) {
        console.warn('Booking query notice:', error.message);
        const localBookings = getLocalBookingsForUser(currentUser).filter((b) => bookingBelongsToUser(b, currentUser));
        setMyBookings(mergeBookingsByCode(localBookings));
      } else {
        setMyBookings(remoteBookings);
      }

      const completedCodes = (error
        ? mergeBookingsByCode(getLocalBookingsForUser(currentUser))
        : remoteBookings
      ).filter(isBookingCompleted).map((b) => b.code);
      const reviews = await fetchReviewsForBookingCodes(completedCodes);
      setBookingReviews(reviews);
    } catch (e) {
      console.warn(e);
      setMyBookings(getLocalBookingsForUser(currentUser));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, [currentUser]);

  useEffect(() => {
    const onFocus = () => fetchMyBookings();
    const onBookingUpdated = () => fetchMyBookings();
    window.addEventListener('focus', onFocus);
    window.addEventListener('securedrive-booking-updated', onBookingUpdated);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('securedrive-booking-updated', onBookingUpdated);
    };
  }, [currentUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Ad Soyad ve E-posta alanları zorunludur.');
      return;
    }

    setProfileSaving(true);
    setErrorMsg('');
    setFeedbackMsg('');

    try {
      const updatePayload = {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim()
      };

      if (newPassword.trim()) {
        updatePayload.password_hash = newPassword.trim();
      }

      // 1. Update in Supabase app_users table if user has a DB record
      if (currentUser.id && !currentUser.id.startsWith('user_')) {
        await supabase
          .from('app_users')
          .update(updatePayload)
          .eq('id', currentUser.id);
      }

      // 2. Update local session storage
      updateUser({
        full_name: updatePayload.full_name,
        email: updatePayload.email,
        phone: updatePayload.phone
      });
      setNewPassword('');
      setFeedbackMsg('Profil bilgileriniz ve güvenlik ayarlarınız başarıyla güncellendi.');
    } catch (err) {
      setErrorMsg('Profil güncellenirken bir hata oluştu.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) {
    return (
      <div style={{
        minHeight: '40vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#777777',
        fontSize: '14px'
      }}>
        Hesap bilgileri yükleniyor...
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px 60px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Profile Header Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        padding: '28px 32px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '58px', height: '58px', borderRadius: '50%', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {currentUser.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'VIP'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{currentUser.full_name}</h1>
              <span className="preset-chip" style={{ background: '#eff6ff', color: '#2563eb', fontSize: '11px', fontWeight: 700, padding: '3px 9px' }}>
                🛡️ Doğrulanmış VIP Yolcu
              </span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {currentUser.email} {currentUser.phone ? `· ${currentUser.phone}` : ''}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link to="/" className="btn-action-primary" style={{ height: '40px', textDecoration: 'none', padding: '0 18px', fontSize: '13px' }}>
            <PlusCircle size={14} />
            <span>Yeni Transfer Rezervasyonu</span>
          </Link>
          <button 
            type="button" 
            className="btn-ghost"
            onClick={handleLogout}
            style={{ color: '#ef4444', height: '40px', padding: '0 14px', fontSize: '13px' }}
          >
            <LogOut size={14} />
            <span>Çıkış</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="service-chips" style={{ marginBottom: '20px' }}>
        <button 
          type="button" 
          className={`chip-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => { setActiveTab('bookings'); setFeedbackMsg(''); setErrorMsg(''); }}
        >
          <Ticket size={14} />
          <span>Rezervasyonlarım & Kuponlarım ({myBookings.length})</span>
        </button>
        <button 
          type="button" 
          className={`chip-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => { setActiveTab('profile'); setFeedbackMsg(''); setErrorMsg(''); }}
        >
          <User size={14} />
          <span>Profil & Güvenlik Ayarları</span>
        </button>
      </div>

      {/* Success Alert */}
      {feedbackMsg && (
        <div style={{
          background: 'var(--accent-green-bg)',
          border: '1px solid var(--accent-green-border)',
          color: 'var(--accent-green)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TAB 1: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Kişisel Transfer Rezervasyonlarınız</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Yalnızca sizin adınıza açılmış resmi D2 kuponları ve tahsisli VIP transferler listelenir.
              </p>
            </div>

            <button type="button" className="btn-ghost" onClick={fetchMyBookings} style={{ fontSize: '12px', height: '36px' }}>
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
              <span>Yenile</span>
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', background: '#fff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px auto', display: 'block' }} />
              <span>Rezervasyonlarınız yükleniyor...</span>
            </div>
          ) : myBookings.length === 0 ? (
            <div style={{
              padding: '50px 20px',
              textAlign: 'center',
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '1px dashed var(--border)'
            }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
                <Ticket size={24} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Henüz Adınıza Kayıtlı Rezervasyon Bulunmuyor</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 18px auto' }}>
                Anasayfadaki rezervasyon formundan dilediğiniz rotayı seçerek ilk VIP transferinizi oluşturabilirsiniz.
              </p>
              <Link to="/" className="btn-action-primary" style={{ display: 'inline-flex', textDecoration: 'none', height: '38px' }}>
                <PlusCircle size={14} />
                <span>İlk Rezervasyonunuzu Yapın</span>
              </Link>
            </div>
          ) : (
            myBookings.map(b => (
              <div key={b.id || b.code} className="fleet-item-card" style={{ padding: '24px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BookingCodeLink code={b.code} style={{ fontSize: '15px' }} />
                    <span className="preset-chip" style={{ background: 'var(--accent-green-bg)', color: 'var(--accent-green)', fontWeight: 600 }}>
                      {b.status}
                    </span>
                  </div>

                  <div className="mono" style={{ fontSize: '16px', fontWeight: 800 }}>
                    {Number(b.total_price_try || 0).toLocaleString('tr-TR')} ₺
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>TRANSFER ROTASI</span>
                    <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>
                      🛫 {b.pickup_location}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text)', marginTop: '4px' }}>
                      🏨 ➔ {b.destination_location}
                    </div>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                      Uçuş No: <strong style={{ color: 'var(--accent-green)' }}>{b.flight_no}</strong> · {b.pax_count} Pax / {b.luggage_count} Bag
                    </small>
                  </div>

                  <div>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>TAHSİS EDİLEN VIP ARAÇ & ŞOFÖR</span>
                    <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>
                      {b.vehicle_name}
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Plaka: <strong>{b.vehicle_plate || '—'}</strong> · Şoför: <strong>{b.chauffeur_name || 'Atanmadı'}</strong>
                    </div>
                  </div>
                </div>

                {/* Action Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <a href={`tel:${b.chauffeur_phone}`} className="btn-ghost" style={{ textDecoration: 'none', fontSize: '12.5px' }}>
                    <Phone size={13} />
                    <span>Şoförü Ara ({b.chauffeur_phone})</span>
                  </a>

                  <button 
                    type="button" 
                    className="btn-action-primary"
                    onClick={async () => {
                      const fresh = await fetchBookingByCode(b.code);
                      setSelectedVoucher(fresh || b);
                    }}
                    style={{ height: '38px', padding: '0 16px' }}
                  >
                    <Ticket size={14} />
                    <span>Resmi Boarding Pass Kuponunu Aç / Yazdır</span>
                  </button>
                </div>

                {isBookingCompleted(b) && (
                  <DriverReviewForm
                    booking={b}
                    user={currentUser}
                    existingReview={bookingReviews[b.code]}
                    onSubmitted={(review) => {
                      setBookingReviews((prev) => ({ ...prev, [b.code]: review }));
                      setFeedbackMsg('Şoför değerlendirmeniz için teşekkür ederiz.');
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: PROFILE & SECURITY */}
      {activeTab === 'profile' && (
        <div className="fleet-item-card" style={{ padding: '28px', maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Profil & Hesap Güvenliği</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Kişisel bilgilerinizi ve giriş şifrenizi güncelleyin.
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="input-block">
              <label className="input-label">Ad Soyad *</label>
              <div className="input-field-box" style={{ height: '42px' }}>
                <User size={15} color="var(--text-muted)" />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  required
                />
              </div>
            </div>

            <div className="input-block">
              <label className="input-label">E-Posta Adresi *</label>
              <div className="input-field-box" style={{ height: '42px' }}>
                <Mail size={15} color="var(--text-muted)" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  required
                />
              </div>
            </div>

            <div className="input-block">
              <label className="input-label">Telefon Numarası</label>
              <div className="input-field-box" style={{ height: '42px' }}>
                <Phone size={15} color="var(--text-muted)" />
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+90 532 000 00 00"
                />
              </div>
            </div>

            <div className="input-block">
              <label className="input-label">Yeni Şifre Belirleyin (İsteğe bağlı)</label>
              <div className="input-field-box" style={{ height: '42px' }}>
                <KeyRound size={15} color="var(--text-muted)" />
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Değiştirmek istemiyorsanız boş bırakın"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button 
                type="submit" 
                className="btn-action-primary"
                disabled={profileSaving}
                style={{ height: '42px', padding: '0 20px', background: '#0f172a' }}
              >
                <ShieldCheck size={14} />
                <span>{profileSaving ? 'Kaydediliyor...' : 'Değişiklikleri Güvenle Kaydet'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Boarding Pass Modal */}
      {selectedVoucher && (
        <BoardingPassModal 
          booking={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
          onNewBooking={() => navigate('/')}
        />
      )}

    </div>
  );
}
