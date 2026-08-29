import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  HelpCircle, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  X, 
  RefreshCw, 
  Search 
} from 'lucide-react';

export default function AdminFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'transfer',
    display_order: 1
  });

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('faqs').select('*').order('display_order', { ascending: true });
      if (data && data.length > 0) {
        setFaqs(data);
      } else {
        setFaqs([]);
      }
    } catch (e) {
      console.warn(e);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenAdd = () => {
    setEditingFaq(null);
    setFormData({ question: '', answer: '', category: 'transfer', display_order: faqs.length + 1 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f) => {
    setEditingFaq(f);
    setFormData({ question: f.question, answer: f.answer, category: f.category || 'transfer', display_order: f.display_order || 1 });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) return;

    if (editingFaq) {
      try {
        await supabase.from('faqs').update(formData).eq('id', editingFaq.id);
      } catch (e) {
        console.warn(e);
      }
      setFaqs(prev => prev.map(f => f.id === editingFaq.id ? { ...f, ...formData } : f));
    } else {
      const newF = { id: 'faq_' + Date.now(), ...formData, created_at: new Date().toISOString() };
      try {
        const { data } = await supabase.from('faqs').insert([newF]).select().single();
        if (data) newF.id = data.id;
      } catch (e) {
        console.warn(e);
      }
      setFaqs(prev => [...prev, newF]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu soruyu silmek istediğinize emin misiniz?')) return;
    try {
      await supabase.from('faqs').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setFaqs(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="admin-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Sıkça Sorulan Sorular (S.S.S.) Yönetimi</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Müşteri web sitesindeki yardım ve SSS bölümünü yönetin, yeni sorular ekleyin ve düzenleyin.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn-ghost" onClick={fetchFaqs} style={{ height: '38px', gap: '6px' }}>
            <RefreshCw size={13} />
            <span>Yenile</span>
          </button>
          <button type="button" className="btn-action-primary" onClick={handleOpenAdd} style={{ height: '38px' }}>
            <PlusCircle size={14} />
            <span>Yeni Soru Ekle</span>
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>SIRA</th>
                <th>SORU</th>
                <th>CEVAP</th>
                <th>KATEGORİ</th>
                <th>İŞLEM</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>Yükleniyor...</td></tr>
              ) : faqs.map(f => (
                <tr key={f.id}>
                  <td className="mono" style={{ fontWeight: 700 }}>#{f.display_order}</td>
                  <td><strong>{f.question}</strong></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12.5px', maxWidth: '400px' }}>{f.answer}</td>
                  <td><span className="preset-chip">{f.category}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button type="button" className="btn-ghost" onClick={() => handleOpenEdit(f)} style={{ padding: '6px 8px' }}><Edit3 size={13} /></button>
                      <button type="button" className="btn-ghost" onClick={() => handleDelete(f.id)} style={{ padding: '6px 8px', color: '#ef4444' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <button type="button" className="modal-close" onClick={() => setIsModalOpen(false)}><X size={14} /></button>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>{editingFaq ? 'Soruyu Düzenle' : 'Yeni S.S.S. Ekle'}</h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-block">
                <label className="input-label">Soru Başlığı *</label>
                <input type="text" className="input-field-box" value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} required />
              </div>

              <div className="input-block">
                <label className="input-label">Cevap Metni *</label>
                <textarea className="input-field-box" style={{ height: '100px', resize: 'vertical' }} value={formData.answer} onChange={(e) => setFormData({ ...formData, answer: e.target.value })} required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>İptal</button>
                <button type="submit" className="btn-action-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
