import React, { useState } from 'react';
import { Building2, ShieldCheck, FileText, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitCorporateApplication } from '../../lib/corporateService';

export default function CorporatePage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    taxNumber: '',
    contactPerson: '',
    email: '',
    phone: '',
    monthlyTrips: '10-25'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const result = await submitCorporateApplication({
        ...formData,
        source: 'kurumsal-page'
      });

      if (result.success) {
        setSubmitted(true);
        setFormData({
          companyName: '',
          taxNumber: '',
          contactPerson: '',
          email: '',
          phone: '',
          monthlyTrips: '10-25'
        });
      } else if (result.savedLocally) {
        setSubmitted(true);
        setErrorMsg('Başvurunuz kaydedildi ancak sunucuya iletilemedi. Lütfen kısa süre sonra tekrar deneyin.');
      } else {
        setErrorMsg(result.error || 'Başvuru gönderilemedi. Lütfen bilgilerinizi kontrol edip tekrar deneyin.');
      }
    } catch (err) {
      setErrorMsg('Başvuru gönderilirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span className="section-badge">
          B2B KURUMSAL ÇÖZÜMLER
        </span>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '12px' }}>
          Şirketiniz İçin Özel VIP Ulaşım & Cari Hesap
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '600px', margin: '8px auto 0 auto' }}>
          Aylık toplu faturalandırma, öncelikli VIP araç tahsisi ve dedicated operasyon yöneticisi ile kurumsal süreçlerinizi kolaylaştırın.
        </p>
      </div>

      <div className="page-split-grid">
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="fleet-item-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <FileText size={20} color="#2563eb" />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Aylık Cari E-Fatura</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Tüm çalışanlarınızın ve misafirlerinizin transferlerini tek bir kurumsal raporda toplayıp ay sonunda toplu e-fatura ile muhasebeleştirin.
            </p>
          </div>

          <div className="fleet-item-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <ShieldCheck size={20} color="var(--accent-green)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Sözleşmeli Sabit Fiyatlar</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Dönemsel fiyat dalgalanmalarından etkilenmeden, şirketinize özel indirimli ve sabit transfer tarifelerinden yararlanın.
            </p>
          </div>

          <div className="fleet-item-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Building2 size={20} color="#0d0d0d" />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>7/24 Özel Operasyon Masası</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Acil heyet ve havalimanı talepleriniz için dedicated müşteri temsilciniz 7 gün 24 saat doğrudan hizmetinizdedir.
            </p>
          </div>
        </div>

        <div className="fleet-item-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
            Kurumsal Üyelik & Cari Hesap Başvurusu
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Formu doldurun, kurumsal satış temsilcimiz 15 dakika içinde sizinle iletişime geçsin.
          </p>

          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '12.5px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {submitted ? (
            <div style={{ background: 'var(--accent-green-bg)', border: '1px solid var(--accent-green-border)', padding: '24px', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--accent-green)' }}>
              <CheckCircle2 size={36} style={{ margin: '0 auto 10px auto' }} />
              <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Başvurunuz Alındı!</h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Kurumsal portföy yöneticimiz en kısa sürede sizinle iletişime geçerek özel teklifinizi iletecektir.
              </p>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setSubmitted(false)}
                style={{ marginTop: '14px', fontSize: '12px' }}
              >
                Yeni başvuru gönder
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-block">
                <label className="input-label">Şirket / Kurum Unvanı *</label>
                <input 
                  type="text" 
                  className="input-field-box" 
                  value={formData.companyName} 
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Örn: ABC Lojistik A.Ş."
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-block">
                  <label className="input-label">Yetkili Ad Soyad *</label>
                  <input 
                    type="text" 
                    className="input-field-box" 
                    value={formData.contactPerson} 
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Ad Soyad"
                    required
                  />
                </div>

                <div className="input-block">
                  <label className="input-label">Telefon *</label>
                  <input 
                    type="text" 
                    className="input-field-box" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+90 532 000 00 00"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-block">
                  <label className="input-label">Kurumsal E-Posta *</label>
                  <input 
                    type="email" 
                    className="input-field-box" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ornek@sirket.com"
                    required
                  />
                </div>

                <div className="input-block">
                  <label className="input-label">Tahmini Aylık Transfer</label>
                  <select 
                    className="select-chip"
                    style={{ width: '100%', height: '38px' }}
                    value={formData.monthlyTrips}
                    onChange={(e) => setFormData({ ...formData, monthlyTrips: e.target.value })}
                  >
                    <option value="5-10">5 - 10 Transfer</option>
                    <option value="10-25">10 - 25 Transfer</option>
                    <option value="25-50">25 - 50 Transfer</option>
                    <option value="50+">50+ Transfer</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-action-primary"
                disabled={submitting}
                style={{ height: '42px', justifyContent: 'center', marginTop: '6px' }}
              >
                <span>{submitting ? 'Gönderiliyor...' : 'Kurumsal Teklif İste'}</span>
                <Send size={13} />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
