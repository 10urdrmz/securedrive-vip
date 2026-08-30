import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { getConfirmationPath, loadSubmittedBookingRecord, BOOKING_WIZARD_PATHS } from '../../lib/bookingWizard';
import { ArrowLeft, CheckCircle2, Lock, CreditCard, Banknote, User, Mail, Phone, FileText, ShieldCheck, Sparkles, Building, ChevronRight } from 'lucide-react';
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
    <div className="sky-step-root">
      <div className="sky-passenger-card">
        <div className="sky-step-header-box">
          <h2 className="sky-step-title">Yolcu & İletişim Bilgileri</h2>
          <p className="sky-step-sub">
            VIP karşılama ve SMS/WhatsApp bildirimleri bu bilgilere iletilecektir.
          </p>
        </div>

        {/* Logged in User Quick Sync Banner */}
        {user && (
          <div className="sky-auth-sync-banner">
            <div className="sky-auth-sync-info">
              <ShieldCheck size={16} color="#38bdf8" />
              <span>
                Giriş yapıldı: <strong>{user.full_name || user.email}</strong>
              </span>
            </div>
            <button
              type="button"
              className="sky-auth-sync-btn"
              onClick={handlePrefillProfile}
            >
              <Sparkles size={12} />
              <span>Bilgilerimi Doldur</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="sky-passenger-form">
          <div className="sky-form-row-2">
            <div className="sky-form-group">
              <label>ADINIZ *</label>
              <div className="sky-input-box-dark">
                <User size={15} color="#94a3b8" />
                <input
                  type="text"
                  name="given-name"
                  autoComplete="given-name"
                  required
                  value={passenger.name}
                  onChange={(e) => setPassenger({ ...passenger, name: e.target.value })}
                  placeholder="Adınız"
                />
              </div>
            </div>

            <div className="sky-form-group">
              <label>SOYADINIZ *</label>
              <div className="sky-input-box-dark">
                <User size={15} color="#94a3b8" />
                <input
                  type="text"
                  name="family-name"
                  autoComplete="family-name"
                  required
                  value={passenger.surname}
                  onChange={(e) => setPassenger({ ...passenger, surname: e.target.value })}
                  placeholder="Soyadınız"
                />
              </div>
            </div>
          </div>

          <div className="sky-form-row-2">
            <div className="sky-form-group">
              <label>E-POSTA ADRESİNİZ *</label>
              <div className="sky-input-box-dark">
                <Mail size={15} color="#94a3b8" />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={passenger.email}
                  onChange={(e) => setPassenger({ ...passenger, email: e.target.value })}
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            <div className="sky-form-group">
              <label>TELEFON / WHATSAPP *</label>
              <div className="sky-input-box-dark">
                <Phone size={15} color="#94a3b8" />
                <input
                  type="tel"
                  name="tel"
                  autoComplete="tel"
                  required
                  value={passenger.phone}
                  onChange={(e) => setPassenger({ ...passenger, phone: e.target.value })}
                  placeholder="+90 532 000 00 00"
                />
              </div>
            </div>
          </div>

          <div className="sky-form-group">
            <label>UÇUŞ KODU (İSTEĞE BAĞLI / CANLI RADAR TAKİBİ İÇİN)</label>
            <div className="sky-input-box-dark">
              <FileText size={15} color="#94a3b8" />
              <input
                type="text"
                value={passenger.flightNumber || ''}
                onChange={(e) => setPassenger({ ...passenger, flightNumber: e.target.value })}
                placeholder="Örn: TK 1980 veya PC 2210"
              />
            </div>
          </div>

          <div className="sky-form-group">
            <label>ŞOFÖRE VE KARŞILAMA EKİBİNE ÖZEL NOT</label>
            <div className="sky-input-box-dark">
              <textarea
                rows={2}
                value={passenger.notes || ''}
                onChange={(e) => setPassenger({ ...passenger, notes: e.target.value })}
                placeholder="İsimli karşılama levhası, bebek puseti veya özel karşılama talebiniz..."
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="sky-form-group">
            <label>ÖDEME TÜRÜNÜ SEÇİN</label>
            <div className="sky-payment-grid">
              <label className={`sky-payment-option ${passenger.paymentMethod === 'cash' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={passenger.paymentMethod === 'cash'}
                  onChange={(e) => setPassenger({ ...passenger, paymentMethod: e.target.value })}
                />
                <Banknote size={18} />
                <div>
                  <strong>Araçta Nakit / Kredi Kartı</strong>
                  <small>Transfer sonunda şoföre ödeme</small>
                </div>
              </label>

              <label className={`sky-payment-option ${passenger.paymentMethod === 'online' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={passenger.paymentMethod === 'online'}
                  onChange={(e) => setPassenger({ ...passenger, paymentMethod: e.target.value })}
                />
                <CreditCard size={18} />
                <div>
                  <strong>Online Güvenli Ödeme</strong>
                  <small>3D Secure / Masterpass</small>
                </div>
              </label>

              <label className={`sky-payment-option ${passenger.paymentMethod === 'corporate' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="corporate"
                  checked={passenger.paymentMethod === 'corporate'}
                  onChange={(e) => setPassenger({ ...passenger, paymentMethod: e.target.value })}
                />
                <Building size={18} />
                <div>
                  <strong>Kurumsal Cari Hesap</strong>
                  <small>Aylık kurumsal fatura</small>
                </div>
              </label>
            </div>
          </div>

          {/* Action Submit */}
          <div className="sky-step-actions-bar">
            <button
              type="button"
              className="sky-btn-back"
              onClick={() => navigate(BOOKING_WIZARD_PATHS.amenities)}
            >
              <ArrowLeft size={16} />
              <span>Geri Dön</span>
            </button>

            <button
              type="submit"
              className="sky-btn-next"
              disabled={loading}
            >
              <Lock size={16} />
              <span>{loading ? 'Tahsis Oluşturuluyor...' : 'VIP Transferi Onayla & Kupon Al'}</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
