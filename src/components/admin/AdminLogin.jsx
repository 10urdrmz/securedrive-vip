import React, { useState } from 'react';
import { loginAdmin } from '../../lib/auth';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess, onReturnToSite }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Lütfen kullanıcı adı ve şifrenizi giriniz.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await loginAdmin(username, password);
      if (res.success) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Geçersiz kimlik bilgileri.');
      }
    } catch (err) {
      setErrorMsg('Giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMsg('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 28px',
        boxShadow: 'var(--shadow-modal)'
      }}>
        
        {/* Header / Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div className="logo-dot" style={{ background: '#2563eb', width: '12px', height: '12px' }}></div>
            <div className="logo-text" style={{ fontSize: '18px' }}>Cargo<span>Drive</span></div>
            <span style={{ fontSize: '11px', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              ADMIN
            </span>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>
            Yönetici Girişi
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Lojistik ve operasyon kontrol merkezine erişmek için lütfen giriş yapınız.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="input-block">
            <label className="input-label">Kullanıcı Adı veya E-Posta</label>
            <div className="input-field-box" style={{ height: '42px' }}>
              <User size={15} color="var(--text-muted)" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Örn: admin"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="input-block">
            <label className="input-label">Şifre</label>
            <div className="input-field-box" style={{ height: '42px', position: 'relative' }}>
              <Lock size={15} color="var(--text-muted)" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-action-primary"
            disabled={loading}
            style={{
              height: '42px',
              justifyContent: 'center',
              background: '#0d0d0d',
              marginTop: '6px',
              fontSize: '13.5px'
            }}
          >
            <span>{loading ? 'Doğrulanıyor...' : 'Panele Giriş Yap'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Örnek Yönetici Girişi:</span>
          <button 
            type="button"
            className="preset-chip"
            onClick={handleFillDemo}
            style={{ fontSize: '11.5px', padding: '4px 12px' }}
          >
            Kullanıcı: <strong>admin</strong> | Şifre: <strong>admin123</strong> (Doldur)
          </button>
        </div>

        {/* Back to Client Site */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button 
            type="button"
            className="btn-ghost"
            onClick={onReturnToSite}
            style={{ fontSize: '12px', border: 'none', margin: '0 auto', color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={13} />
            <span>Müşteri Rezervasyon Sitesine Dön</span>
          </button>
        </div>

      </div>
    </div>
  );
}
