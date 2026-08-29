import React, { useState, useEffect } from 'react';
import { fetchFaqsFromDb } from '../../lib/dbService';
import { ChevronDown } from 'lucide-react';

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await fetchFaqsFromDb();
      if (data && data.length > 0) setFaqs(data);
    }
    load();
  }, []);

  return (
    <section className="section-pad" id="faqs" style={{ background: 'var(--bg-stage)' }}>
      <div className="container">
        <div className="section-head-mini" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 30px auto' }}>
          <span className="tag">S.S.S.</span>
          <h2>Sıkça Sorulan Sorular</h2>
        </div>

        <div style={{ maxWidth: '720px', margin: '0 auto' }} className="vehicle-cards-list">
          {faqs.map((f, idx) => (
            <div key={f.id || idx} className="ticket-card" style={{ marginBottom: '8px' }}>
              <div 
                style={{
                  padding: '14px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '13.5px',
                  fontWeight: 600
                }}
                onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
              >
                <span>{f.q}</span>
                <ChevronDown 
                  size={14} 
                  color="var(--text-muted)" 
                  style={{
                    transform: openIdx === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}
                />
              </div>

              {openIdx === idx && (
                <div style={{
                  padding: '0 18px 14px 18px',
                  fontSize: '12.5px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '10px'
                }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
