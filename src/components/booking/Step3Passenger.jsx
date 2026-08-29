import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { getConfirmationPath, loadSubmittedBookingRecord, BOOKING_WIZARD_PATHS } from '../../lib/bookingWizard';
import { ArrowLeft, CheckCircle2, Lock, CreditCard, Banknote } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Step3Passenger() {
  const navigate = useNavigate();
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
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
          Yolcu İletişim Bilgileri
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="input-block">
              <label className="input-label">Adınız *</label>
              <div className="input-field-box">
                <input 
                  type="text" 
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
                <input 
                  type="text" 
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
                <input 
                  type="email" 
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
                <input 
                  type="tel" 
                  required
                  value={passenger.phone} 
                  onChange={(e) => setPassenger({ ...passenger, phone: e.target.value })}
                  placeholder="+90 532..."
                />
              </div>
            </div>
          </div>

          <div className="input-block" style={{ marginBottom: '16px' }}>
            <label className="input-label">Şoföre Özel Not / Karşılama Detayı</label>
            <div className="input-field-box">
              <input 
                type="text" 
                value={passenger.notes} 
                onChange={(e) => setPassenger({ ...passenger, notes: e.target.value })}
                placeholder="Örn: Bebek koltuğu sol arkada olsun, gümrük kapısında beklenilsin..."
              />
            </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '16px 0' }} />

          <h2 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>
            Ödeme Seçeneği
          </h2>

          <div className="payment-chips-grid">
            <div 
              className={`payment-chip-card ${passenger.paymentMethod === 'credit-card' ? 'selected' : ''}`}
              onClick={() => setPassenger({ ...passenger, paymentMethod: 'credit-card' })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <Lock size={12} color="var(--accent-green)" />
                <strong style={{ fontSize: '12.5px' }}>3D Secure Kart</strong>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Online %100 Güvenli</span>
            </div>

            <div 
              className={`payment-chip-card ${passenger.paymentMethod === 'pay-in-car-card' ? 'selected' : ''}`}
              onClick={() => setPassenger({ ...passenger, paymentMethod: 'pay-in-car-card' })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <CreditCard size={12} />
                <strong style={{ fontSize: '12.5px' }}>Araçta Kredi Kartı</strong>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mobil POS Cihazı</span>
            </div>

            <div 
              className={`payment-chip-card ${passenger.paymentMethod === 'pay-in-car-cash' ? 'selected' : ''}`}
              onClick={() => setPassenger({ ...passenger, paymentMethod: 'pay-in-car-cash' })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <Banknote size={12} />
                <strong style={{ fontSize: '12.5px' }}>Araçta Nakit</strong>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TRY / EUR / USD / GBP</span>
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
          <ArrowLeft size={12} />
          <span>Özellikleri Değiştir</span>
        </button>

        <button 
          type="button" 
          className="btn-action-primary"
          id="btn-confirm-reservation"
          onClick={handleSubmit}
          disabled={loading}
          style={{ height: '42px', padding: '0 24px' }}
        >
          <CheckCircle2 size={13} />
          <span>{loading ? 'Supabase Kaydediliyor...' : 'Rezervasyonu Tamamla & Tahsis Et'}</span>
        </button>
      </div>
    </div>
  );
}
