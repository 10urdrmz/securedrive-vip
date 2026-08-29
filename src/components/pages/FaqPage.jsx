import React, { useState, useEffect } from 'react';
import { fetchFaqsFromDb } from '../../lib/dbService';
import { Search, ChevronDown, HelpCircle, Phone, MessageCircle } from 'lucide-react';

export default function FaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    async function load() {
      const data = await fetchFaqsFromDb();
      if (data && data.length > 0) setFaqs(data);
    }
    load();
  }, []);

  const filtered = faqs.filter(f => 
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '40px 20px', maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span className="section-badge">
          YARDIM & SIKÇA SORULAN SORULAR
        </span>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '12px' }}>
          Nasıl Yardımcı Olabiliriz?
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '540px', margin: '8px auto 0 auto' }}>
          Rezervasyon, ödeme, iptal ve havalimanı karşılama süreçleri hakkında merak ettikleriniz.
        </p>

        {/* Search */}
        <div style={{ maxWidth: '440px', margin: '20px auto 0 auto' }}>
          <div className="input-field-box" style={{ height: '42px' }}>
            <Search size={15} color="var(--text-muted)" />
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Soru veya konu ara (Örn: rötar, iptal, fatura)..." 
              style={{ fontSize: '13.5px' }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map((f, i) => {
          const isOpen = openIndex === i;
          return (
            <div 
              key={f.id || i} 
              className="fleet-item-card" 
              style={{ padding: '18px 20px', cursor: 'pointer' }}
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '15px', color: 'var(--text)' }}>{f.q}</strong>
                <ChevronDown 
                  size={16} 
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', color: 'var(--text-muted)' }} 
                />
              </div>

              {isOpen && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {f.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Direct Contact Support Box */}
      <div className="fleet-item-card" style={{ marginTop: '36px', padding: '24px', textAlign: 'center', background: '#f8fafc' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Cevabınızı bulamadınız mı?</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          7/24 kesintisiz hizmet veren VIP Operasyon Masamızla iletişime geçebilirsiniz.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <a href="tel:+908503080444" className="btn-action-primary" style={{ height: '38px', padding: '0 18px', textDecoration: 'none' }}>
            <Phone size={14} />
            <span>+90 850 308 04 44</span>
          </a>
          <a href="https://wa.me/905329998877" target="_blank" rel="noreferrer" className="btn-ghost" style={{ height: '38px', padding: '0 18px', textDecoration: 'none', background: '#fff' }}>
            <MessageCircle size={14} color="#10b981" />
            <span>WhatsApp Canlı Destek</span>
          </a>
        </div>
      </div>
    </div>
  );
}
