import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { getConfirmationPath, loadSubmittedBookingRecord, BOOKING_WIZARD_PATHS } from '../../lib/bookingWizard';
import { ArrowLeft, CheckCircle2, Lock, CreditCard, Banknote, User, Mail, Phone, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Step3Passenger() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    passenger,
    setPassenger,
    completeReservation
  } = useBooking();

  const [loading, setLoading] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    const submitted = loadSubmittedBookingRecord();
    if (submitted?.booking?.code) {
      navigate(getConfirmationPath(submitted.booking.code), { replace: true });
    }
  }, [navigate]);

  // Oturum açmış kullanıcının bilgilerini otomatik doldur
  useEffect(() => {
    if (user) {
      const parts = (user.full_name || '').trim().split(/\s+/);
      const fName = parts[0] || '';
      const lName = parts.slice(1).join(' ') || '';

      setPassenger((prev) => ({
        ...prev,
        name: prev.name && prev.name.trim() !== '' ? prev.name : fName,
        surname: prev.surname && prev.surname.trim() !== '' ? prev.surname : lName,
        email: prev.email && prev.email.trim() !== '' ? prev.email : (user.email || ''),
        phone: prev.phone && prev.phone.trim() !== '' ? prev.phone : (user.phone || '')
      }));
    }
  }, [user, setPassenger]);

  const handlePrefillProfile = () => {
    if (!user) return;
    const parts = (user.full_name || '').trim().split(/\s+/);
    setPassenger((prev) => ({
      ...prev,
      name: parts[0] || '',
      surname: parts.slice(1).join(' ') || '',
      email: user.email || '',
      phone: user.phone || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submittedRef.current) return;

    if (!passenger.name.trim() || !passenger.surname.trim() || !passenger.phone.trim()) {
      alert('Lütfen ad, soyad ve telefon numaranızı eksiksiz giriniz.');
      return;
    }

    setLoading(true);
    try {
      const booking = await completeReservation();
      if (!booking?.code) {
        alert('Rezervasyon oluşturulamadı. Lütfen tekrar deneyin.');
        return;
      }

      submittedRef.current = true;

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (cErr) {}

      navigate(getConfirmationPath(booking.code), { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="passenger-card-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
            Yolcu İletişim Bilgileri
          </h2>
        </div>

        {/* Logged in User Quick Sync Banner */}
        {user && (
          <div className="passenger-auth-banner">
            <div className="passenger-auth-info">
              <ShieldCheck size={16} color="#059669" />
              <span>
                Giriş yapıldı: <strong>{user.full_name || user.email}</strong> (Bilgiler aktarıldı)
              </span>
            </div>
            <button
              type="button"
              className="passenger-auth-fill-btn"
              onClick={handlePrefillProfile}
              title="Profil bilgilerinizi form alanlarına yeniden yükleyin"
            >
              <Sparkles size={12} />
              <span>Profilimi Doldur</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="input-block">
              <label className="input-label">Adınız *</label>
              <div className="input-field-box">
                <User size={15} color="var(--text-muted)" />
                <input 
                  type="text" 
                  name="given-name"
                  autoComplete="given-name"
                  autoCapitalize="words"
                  autoCorrect="off"
                  required
                  value={passenger.name} 
                  onChange={(e) => setPassenger({ ...passenger, name: e.target.value })}
                  placeholder="Adınız"
                />
              </div>
            </div>

            <div className="input-block">
              <label className="input-label">Soyadınız *</label>
              <div className="input-field-box">
                <User size={15} color="var(--text-muted)" />
                <input 
                  type="text" 
                  name="family-name"
                  autoComplete="family-name"
                  autoCapitalize="words"
                  autoCorrect="off"
                  required
                  value={passenger.surname} 
                  onChange={(e) => setPassenger({ ...passenger, surname: e.target.value })}
                  placeholder="Soyadınız"
                />
              </div>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="input-block">
              <label className="input-label">E-Posta Adresiniz *</label>
              <div className="input-field-box">
                <Mail size={15} color="var(--text-muted)" />
                <input 
                  type="email" 
                  name="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  required
                  value={passenger.email} 
                  onChange={(e) => setPassenger({ ...passenger, email: e.target.value })}
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            <div className="input-block">
              <label className="input-label">Telefon (WhatsApp) *</label>
              <div className="input-field-box">
                <Phone size={15} color="var(--text-muted)" />
                <input 
                  type="tel" 
                  name="tel"
                  autoComplete="tel"
                  autoCapitalize="none"
                  autoCorrect="off"
                  required
                  value={passenger.phone} 
                  onChange={(e) => setPassenger({ ...passenger, phone: e.target.value })}
                  placeholder="+90 532 000 00 00"
                />
              </div>
            </div>
          </div>

          <div className="input-block" style={{ marginBottom: '16px' }}>
            <label className="input-label">Şoföre Özel Not / Karşılama Detayı</label>
            <div className="input-field-box">
              <FileText size={15} color="var(--text-muted)" />
              <input 
                type="text" 
                value={passenger.notes} 
                onChange={(e) => setPassenger({ ...passenger, notes: e.target.value })}
                placeholder="Örn: Bebek koltuğu sol arkada olsun, gümrük kapısında beklenilsin..."
              />
            </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '18px 0' }} />

          <h2 style={{ fontSize: '14.5px', fontWeight: 700, marginBottom: '10px', color: 'var(--text)' }}>
            Ödeme Seçeneği
          </h2>

          <div className="payment-chips-grid">
            <div 
              className={`payment-chip-card ${passenger.paymentMethod === 'credit-card' ? 'selected' : ''}`}
              onClick={() => setPassenger({ ...passenger, paymentMethod: 'credit-card' })}
            >
              <div className="payment-chip-header">
                <div className="payment-chip-title-wrap">
                  <Lock size={14} color="#10b981" />
                  <strong>3D Secure Kredi Kartı</strong>
                </div>
                <div className="payment-chip-radio">
                  {passenger.paymentMethod === 'credit-card' && <div className="radio-dot" />}
                </div>
              </div>
              <span className="payment-chip-sub">%100 Güvenli Online Tahsilat</span>
            </div>

            <div 
              className={`payment-chip-card ${passenger.paymentMethod === 'pay-in-car-card' ? 'selected' : ''}`}
              onClick={() => setPassenger({ ...passenger, paymentMethod: 'pay-in-car-card' })}
            >
              <div className="payment-chip-header">
                <div className="payment-chip-title-wrap">
                  <CreditCard size={14} color="#0284c7" />
                  <strong>Araçta Kredi Kartı</strong>
                </div>
                <div className="payment-chip-radio">
                  {passenger.paymentMethod === 'pay-in-car-card' && <div className="radio-dot" />}
                </div>
              </div>
              <span className="payment-chip-sub">VIP Araç İçi Mobil POS Cihazı</span>
            </div>

            <div 
              className={`payment-chip-card ${passenger.paymentMethod === 'pay-in-car-cash' ? 'selected' : ''}`}
              onClick={() => setPassenger({ ...passenger, paymentMethod: 'pay-in-car-cash' })}
            >
              <div className="payment-chip-header">
                <div className="payment-chip-title-wrap">
                  <Banknote size={14} color="#d97706" />
                  <strong>Araçta Nakit Ödeme</strong>
                </div>
                <div className="payment-chip-radio">
                  {passenger.paymentMethod === 'pay-in-car-cash' && <div className="radio-dot" />}
                </div>
              </div>
              <span className="payment-chip-sub">TRY / EUR / USD / GBP Geçerli</span>
            </div>
          </div>
        </form>
      </div>

      {/* Navigation */}
      <div className="step-nav-bar">
        <button 
          type="button" 
          className="btn-ghost" 
          onClick={() => navigate(BOOKING_WIZARD_PATHS.amenities)}
        >
          <ArrowLeft size={13} />
          <span>Özellikleri Değiştir</span>
        </button>

        <button 
          type="button" 
          className="btn-action-primary"
          id="btn-confirm-reservation"
          onClick={handleSubmit}
          disabled={loading}
          style={{ height: '44px', padding: '0 24px', fontSize: '13.5px' }}
        >
          <CheckCircle2 size={15} />
          <span>{loading ? 'Supabase Kaydediliyor...' : 'Rezervasyonu Tamamla & Tahsis Et'}</span>
        </button>
      </div>
    </div>
  );
}
