import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { normalizeRole } from '../../lib/auth';
import { User, Lock, Mail, Phone, ArrowRight, Eye, EyeOff, ShieldCheck, Car, UserCheck, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, booting, login, register } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  
  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  // Register fields
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const redirectByRole = (authUser, fromPath) => {
    const role = normalizeRole(authUser?.role);
    if (fromPath && fromPath !== '/login' && fromPath !== '/register') {
      navigate(fromPath, { replace: true });
      return;
    }
    if (role === 'admin') {
      navigate('/admin', { replace: true });
    } else if (role === 'driver') {
      navigate('/driver', { replace: true });
    } else {
      navigate('/account', { replace: true });
    }
  };

  useEffect(() => {
    if (!booting && user) {
      const fromPath = location.state?.from;
      redirectByRole(user, fromPath);
    }
  }, [user, booting, location.state?.from]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMsg('Lütfen kullanıcı adı ve şifrenizi giriniz.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await login(loginIdentifier, loginPassword, { rememberMe });
      if (res.success) {
        redirectByRole(res.user, location.state?.from);
      } else {
        setErrorMsg(res.error || 'Giriş yapılamadı.');
      }
    } catch (err) {
      setErrorMsg('Giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      setErrorMsg('Lütfen tüm alanları eksiksiz doldurunuz.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await register({
        full_name: fullName,
        email: regEmail,
        phone: regPhone,
        password: regPassword
      }, { rememberMe });
      if (res.success) {
        redirectByRole(res.user, location.state?.from);
      } else {
        setErrorMsg(res.error || 'Kayıt başarısız oldu.');
      }
    } catch (err) {
      setErrorMsg('Kayıt oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setLoginIdentifier(u);
    setLoginPassword(p);
    setErrorMsg('');
  };

  if (booting) {
    return (
      <div className="auth-page-wrap">
        <div className="auth-card" style={{ textAlign: 'center', padding: '40px 24px', color: '#777' }}>
          Oturum doğrulanıyor...
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-wrap">
      <div className="auth-card">
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Link to="/" className="brand-logo" style={{ textDecoration: 'none', display: 'inline-flex', marginBottom: '8px' }}>
            <div className="logo-dot"></div>
            <div className="logo-text">Secure<span>Drive</span> VIP</div>
          </Link>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Yönetici, VIP Şoför ve Yolcu Tek Giriş Portalı
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="service-chips" style={{ justifyContent: 'center', marginBottom: '20px' }}>
          <button 
            type="button" 
            className={`chip-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            style={{ flex: 1, textAlign: 'center' }}
          >
            Giriş Yap
          </button>
          <button 
            type="button" 
            className={`chip-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            style={{ flex: 1, textAlign: 'center' }}
          >
            Yeni Yolcu Kaydı
          </button>
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

        {/* Form: LOGIN */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="input-block">
              <label className="input-label">Kullanıcı Adı veya E-Posta</label>
              <div className="input-field-box" style={{ height: '42px' }}>
                <User size={15} color="var(--text-muted)" />
                <input 
                  type="text" 
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="admin, sofor veya yolcu"
                  required
                />
              </div>
            </div>

            <div className="input-block">
              <label className="input-label">Şifre</label>
              <div className="input-field-box" style={{ height: '42px' }}>
                <Lock size={15} color="var(--text-muted)" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
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

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              userSelect: 'none'
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#0d0d0d' }}
              />
              Beni hatırla (30 gün)
            </label>

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
              <span>{loading ? 'Giriş Yapılıyor...' : 'Sisteme Giriş Yap'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        ) : (
          /* Form: REGISTER */
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="input-block">
              <label className="input-label">Ad Soyad *</label>
              <div className="input-field-box" style={{ height: '40px' }}>
                <User size={15} color="var(--text-muted)" />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Örn: Onur Sefa"
                  required
                />
              </div>
            </div>

            <div className="input-block">
              <label className="input-label">E-Posta Adresi *</label>
              <div className="input-field-box" style={{ height: '40px' }}>
                <Mail size={15} color="var(--text-muted)" />
                <input 
                  type="email" 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  required
                />
              </div>
            </div>

            <div className="input-block">
              <label className="input-label">Telefon Numarası *</label>
              <div className="input-field-box" style={{ height: '40px' }}>
                <Phone size={15} color="var(--text-muted)" />
                <input 
                  type="text" 
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+90 532 000 00 00"
                  required
                />
              </div>
            </div>

            <div className="input-block">
              <label className="input-label">Şifre Belirleyin *</label>
              <div className="input-field-box" style={{ height: '40px' }}>
                <Lock size={15} color="var(--text-muted)" />
                <input 
                  type="password" 
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
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
              <span>{loading ? 'Kayıt Yapılıyor...' : 'Hesabı Oluştur & Giriş Yap'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        {/* 3 Quick Role Switchers */}
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textAlign: 'center' }}>
            Hızlı Test Girişleri (3 Rol):
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button 
              type="button" 
              className="preset-chip"
              onClick={() => handleQuickFill('admin', 'admin123')}
              style={{ justifyContent: 'space-between', padding: '6px 12px', fontSize: '12px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                👑 <strong>Süper Yönetici:</strong> admin
              </span>
              <small style={{ color: 'var(--text-muted)' }}>/admin</small>
            </button>

            <button 
              type="button" 
              className="preset-chip"
              onClick={() => handleQuickFill('sofor', 'sofor123')}
              style={{ justifyContent: 'space-between', padding: '6px 12px', fontSize: '12px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                🚘 <strong>VIP Şoför:</strong> sofor
              </span>
              <small style={{ color: 'var(--text-muted)' }}>/driver</small>
            </button>

            <button 
              type="button" 
              className="preset-chip"
              onClick={() => handleQuickFill('yolcu', 'yolcu123')}
              style={{ justifyContent: 'space-between', padding: '6px 12px', fontSize: '12px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                👤 <strong>VIP Yolcu:</strong> yolcu
              </span>
              <small style={{ color: 'var(--text-muted)' }}>/account</small>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
