import React, { useState } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { submitCorporateApplication } from '../../lib/corporateService';

export default function CorporateSection() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const result = await submitCorporateApplication({
        ...formData,
        monthlyTrips: null,
        source: 'anasayfa-corporate-section'
      });

      if (result.success) {
        setSubmitted(true);
        setFormData({ companyName: '', contactPerson: '', email: '', phone: '' });
        setTimeout(() => setSubmitted(false), 8000);
      } else if (result.savedLocally) {
        setSubmitted(true);
        setErrorMsg('Başvurunuz kaydedildi ancak sunucuya iletilemedi.');
        setTimeout(() => { setSubmitted(false); setErrorMsg(''); }, 8000);
      } else {
        setErrorMsg(result.error || 'Başvuru gönderilemedi. Lütfen tekrar deneyin.');
      }
    } catch {
      setErrorMsg('Başvuru gönderilirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section-pad" id="corporate">
      <div className="container">
        <div className="ticket-card" style={{ padding: '28px' }}>
          <div className="corporate-form-grid">
            <div>
              <span className="tag" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                KURUMSAL CARİ HESAP
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '6px 0 12px 0' }}>
                Şirketiniz İçin Özel Filo & Aylık Vadeli Faturalandırma
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Aylık toplu e-fatura, 30 gün vade avantajı, kurumsal indirim protokolü ve şirketinize özel atanmış VIP operasyon koordinatörü ile tüm iş seyahatlerinizi tek merkezden yönetin.
              </p>
            </div>

            {submitted ? (
              <div style={{ background: 'var(--accent-green-bg)', border: '1px solid var(--accent-green-border)', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center' }}>
                <h4 style={{ color: 'var(--accent-green)', fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>Talebiniz Alındı</h4>
                <p style={{ fontSize: '12px', color: 'var(--text)' }}>Kurumsal müşteri temsilcimiz 15 dakika içinde sizinle iletişime geçecektir.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {errorMsg && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '8px 10px', borderRadius: 'var(--radius-md)', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={13} />
                    <span>{errorMsg}</span>
                  </div>
                )}
                <div className="input-field-box">
                  <input
                    type="text"
                    placeholder="Şirket Resmi Ünvanı"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>
                <div className="input-field-box">
                  <input
                    type="text"
                    placeholder="Yetkili Adı & Soyadı"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    required
                  />
                </div>
                <div className="input-field-box">
                  <input
                    type="email"
                    placeholder="Kurumsal E-Posta"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="input-field-box">
                  <input
                    type="text"
                    placeholder="Telefon"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn-action-primary" disabled={submitting} style={{ justifyContent: 'center', height: '40px' }}>
                  <span>{submitting ? 'Gönderiliyor...' : 'Kurumsal Teklif Al'}</span>
                  <ArrowRight size={13} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
