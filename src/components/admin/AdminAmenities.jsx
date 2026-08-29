import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Sparkles, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  X, 
  RefreshCw, 
  Search,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AdminAmenities() {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    subtitle: '',
    price_try: 150,
    is_free: false,
    icon: 'Sparkles',
    has_count: false,
    checked_by_default: false,
    category: 'comfort',
    is_visible: true
  });

  const fetchAmenities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('amenities').select('*').order('price_try', { ascending: true });
      if (data && data.length > 0) {
        setAmenities(data);
      } else {
        setAmenities([]);
      }
    } catch (e) {
      console.warn(e);
      setAmenities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  const handleOpenAdd = () => {
    setEditingAmenity(null);
    setFormData({
      id: 'amenity_' + Date.now(),
      title: '',
      subtitle: '',
      price_try: 150,
      is_free: false,
      icon: 'Sparkles',
      has_count: false,
      checked_by_default: false,
      category: 'comfort',
      is_visible: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a) => {
    setEditingAmenity(a);
    setFormData({
      id: a.id,
      title: a.title,
      subtitle: a.subtitle,
      price_try: a.price_try || 0,
      is_free: a.is_free || false,
      icon: a.icon || 'Sparkles',
      has_count: a.has_count || false,
      checked_by_default: a.checked_by_default || false,
      category: a.category || 'comfort',
      is_visible: a.is_visible !== false
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingAmenity) {
      try {
        await supabase.from('amenities').update(formData).eq('id', editingAmenity.id);
      } catch (e) {
        console.warn(e);
      }
      setAmenities(prev => prev.map(a => a.id === editingAmenity.id ? { ...a, ...formData } : a));
    } else {
      try {
        await supabase.from('amenities').insert([formData]);
      } catch (e) {
        console.warn(e);
      }
      setAmenities(prev => [...prev, formData]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu donanımı silmek istediğinize emin misiniz?')) return;
    try {
      await supabase.from('amenities').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setAmenities(prev => prev.filter(a => a.id !== id));
  };

  const toggleVisibility = async (amenity) => {
    const nextVisible = amenity.is_visible === false;
    try {
      await supabase.from('amenities').update({ is_visible: nextVisible }).eq('id', amenity.id);
    } catch (e) {
      console.warn(e);
    }
    setAmenities(prev => prev.map(a => a.id === amenity.id ? { ...a, is_visible: nextVisible } : a));
  };

  return (
    <div className="admin-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>VIP Konfor Donanımları & Ek Hizmetler</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Rezervasyon sırasında müşteriye sunulan bebek koltuğu, minibar, yıldız tavan gibi donanımları ve ücretlerini yönetin.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn-ghost" onClick={fetchAmenities} style={{ height: '38px', gap: '6px' }}>
            <RefreshCw size={13} />
            <span>Yenile</span>
          </button>
          <button type="button" className="btn-action-primary" onClick={handleOpenAdd} style={{ height: '38px' }}>
            <PlusCircle size={14} />
            <span>Yeni Donanım Ekle</span>
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>DONANIM / HİZMET</th>
                <th>AÇIKLAMA</th>
                <th>TİP</th>
                <th>ÜCRET (TRY)</th>
                <th>SİTEDE</th>
                <th>İŞLEM</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>Yükleniyor...</td></tr>
              ) : amenities.map(a => (
                <tr key={a.id} style={{ opacity: a.is_visible === false ? 0.55 : 1 }}>
                  <td><strong>{a.title}</strong></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px', maxWidth: '350px' }}>{a.subtitle}</td>
                  <td>
                    <span className="preset-chip" style={{ background: a.is_free ? 'var(--accent-green-bg)' : '#eff6ff', color: a.is_free ? 'var(--accent-green)' : '#2563eb' }}>
                      {a.is_free ? 'Ücretsiz / Standart' : 'Ücretli Opsiyon'}
                    </span>
                  </td>
                  <td className="mono" style={{ fontWeight: 700 }}>
                    {a.is_free ? '0 ₺' : `${Number(a.price_try || 0).toLocaleString('tr-TR')} ₺`}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => toggleVisibility(a)}
                      title={a.is_visible !== false ? 'Sitede gizle' : 'Sitede göster'}
                      style={{
                        padding: '6px 10px',
                        gap: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: a.is_visible !== false ? 'var(--accent-green)' : 'var(--text-muted)',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      {a.is_visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                      <span>{a.is_visible !== false ? 'Görünür' : 'Gizli'}</span>
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button type="button" className="btn-ghost" onClick={() => handleOpenEdit(a)} style={{ padding: '6px 8px' }}>
                        <Edit3 size={13} />
                      </button>
                      <button type="button" className="btn-ghost" onClick={() => handleDelete(a.id)} style={{ padding: '6px 8px', color: '#ef4444' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <button type="button" className="modal-close" onClick={() => setIsModalOpen(false)}><X size={14} /></button>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>{editingAmenity ? 'Donanımı Düzenle' : 'Yeni Donanım Ekle'}</h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-block">
                <label className="input-label">Donanım Başlığı *</label>
                <input type="text" className="input-field-box" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>

              <div className="input-block">
                <label className="input-label">Açıklama / Detay</label>
                <input type="text" className="input-field-box" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-block">
                  <label className="input-label">Ücret (TRY)</label>
                  <input type="number" className="input-field-box" value={formData.price_try} onChange={(e) => setFormData({ ...formData, price_try: Number(e.target.value) })} />
                </div>

                <div className="input-block">
                  <label className="input-label">Ücretsiz Mi?</label>
                  <select className="select-chip" style={{ width: '100%', height: '38px' }} value={formData.is_free ? 'true' : 'false'} onChange={(e) => setFormData({ ...formData, is_free: e.target.value === 'true' })}>
                    <option value="false">Ücretli Ekstra</option>
                    <option value="true">Ücretsiz Standart</option>
                  </select>
                </div>
              </div>

              <div className="input-block">
                <label className="input-label">Sitede Göster</label>
                <select
                  className="select-chip"
                  style={{ width: '100%', height: '38px' }}
                  value={formData.is_visible ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, is_visible: e.target.value === 'true' })}
                >
                  <option value="true">Evet — rezervasyon adımında görünsün</option>
                  <option value="false">Hayır — sadece admin panelinde kalsın</option>
                </select>
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
