import { supabase } from './supabase';

export const SESSION_KEY = 'securedrive_auth_session';
export const AUTH_EVENT = 'securedrive-auth-changed';

const REMEMBER_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 gün
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 saat (beni hatırla kapalı)

export const SEED_USERS = [
  {
    id: 'user_admin',
    username: 'admin',
    email: 'admin@securedrive.com',
    password: 'admin123',
    full_name: 'Operasyon Müdürü',
    phone: '+90 532 100 00 00',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'user_driver',
    username: 'sofor',
    email: 'sofor@securedrive.com',
    password: 'sofor123',
    full_name: 'Kemal S. (Protokol Şoförü)',
    phone: '+90 532 888 77 66',
    role: 'driver',
    vehicle_plate: '34 VIP 770 (Maybach V-Class)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'user_passenger',
    username: 'yolcu',
    email: 'yolcu@example.com',
    password: 'yolcu123',
    full_name: 'Onur Sefa',
    phone: '+90 532 999 88 77',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'
  }
];

export function normalizeRole(role) {
  const value = String(role || '').trim().toLowerCase();
  if (value === 'admin' || value === 'driver' || value === 'customer') return value;
  return 'customer';
}

function createToken() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `auth_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function emitAuthChange(user) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { user } }));
}

function clearAllStorages() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

function getStorageForSession(session) {
  return session?.rememberMe !== false ? localStorage : sessionStorage;
}

function buildSession(user, rememberMe = true) {
  const now = Date.now();
  const ttl = rememberMe ? REMEMBER_TTL_MS : SESSION_TTL_MS;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    full_name: user.full_name,
    phone: user.phone,
    role: normalizeRole(user.role),
    avatar: user.avatar,
    vehicle_plate: user.vehicle_plate,
    rememberMe,
    token: createToken(),
    issuedAt: now,
    expiresAt: now + ttl,
    lastActiveAt: now
  };
}

function parseSession(raw) {
  const session = JSON.parse(raw);
  if (!session?.id) return null;

  session.role = normalizeRole(session.role);

  if (!session.token) {
    session.token = createToken();
    session.rememberMe = session.rememberMe !== false;
  }

  if (!session.expiresAt) {
    session.expiresAt = Date.now() + REMEMBER_TTL_MS;
    session.rememberMe = session.rememberMe !== false;
  }

  if (Date.now() > session.expiresAt) return null;
  return session;
}

function touchSession(session) {
  const ttl = session.rememberMe !== false ? REMEMBER_TTL_MS : SESSION_TTL_MS;
  return {
    ...session,
    lastActiveAt: Date.now(),
    expiresAt: Date.now() + ttl
  };
}

export function saveSession(session) {
  const fresh = touchSession(session);
  clearAllStorages();
  getStorageForSession(fresh).setItem(SESSION_KEY, JSON.stringify(fresh));
  emitAuthChange(fresh);
  return fresh;
}

export function restoreSession() {
  try {
    const storages = [localStorage, sessionStorage];

    for (const storage of storages) {
      const raw = storage.getItem(SESSION_KEY);
      if (!raw) continue;

      const session = parseSession(raw);
      if (!session) {
        storage.removeItem(SESSION_KEY);
        continue;
      }

      const refreshed = touchSession(session);
      storage.setItem(SESSION_KEY, JSON.stringify(refreshed));
      return refreshed;
    }

    return null;
  } catch {
    clearAllStorages();
    return null;
  }
}

export async function refreshSessionUser(session) {
  if (!session?.id) return null;

  if (String(session.id).startsWith('user_')) {
    const seed = SEED_USERS.find((u) => u.id === session.id);
    if (!seed) return null;
    return saveSession(
      buildSession(
        {
          id: seed.id,
          username: seed.username,
          email: seed.email,
          full_name: seed.full_name,
          phone: seed.phone,
          role: seed.role,
          avatar: seed.avatar,
          vehicle_plate: seed.vehicle_plate
        },
        session.rememberMe
      )
    );
  }

  try {
    const { data, error } = await supabase
      .from('app_users')
      .select('id, username, email, full_name, phone, role, avatar_url, is_active')
      .eq('id', session.id)
      .maybeSingle();

    if (error || !data || data.is_active === false) return null;

    return saveSession(
      buildSession(
        {
          id: data.id,
          username: data.username,
          email: data.email,
          full_name: data.full_name,
          phone: data.phone,
          role: normalizeRole(data.role),
          avatar: data.avatar_url
        },
        session.rememberMe
      )
    );
  } catch {
    return session;
  }
}

export function getCurrentUser() {
  return restoreSession();
}

export function updateSessionUser(patch) {
  const current = restoreSession();
  if (!current) return null;
  return saveSession({ ...current, ...patch });
}

async function findAppUserByCredentials(input, pwd) {
  const base = () =>
    supabase
      .from('app_users')
      .select('*')
      .eq('password_hash', pwd)
      .eq('is_active', true);

  const { data: byUsername } = await base().eq('username', input).maybeSingle();
  if (byUsername) return byUsername;

  const { data: byEmail } = await base().eq('email', input).maybeSingle();
  return byEmail || null;
}

export async function loginUser(identifier, password, options = {}) {
  const rememberMe = options.rememberMe !== false;
  const input = identifier.trim().toLowerCase();
  const pwd = password.trim();

  try {
    const data = await findAppUserByCredentials(input, pwd);

    if (data) {
      const session = saveSession(
        buildSession(
          {
            id: data.id,
            username: data.username,
            email: data.email,
            full_name: data.full_name,
            phone: data.phone,
            role: normalizeRole(data.role),
            avatar: data.avatar_url
          },
          rememberMe
        )
      );
      return { success: true, user: session };
    }
  } catch (err) {
    console.warn('Supabase auth notice:', err);
  }

  const match = SEED_USERS.find(
    (u) => (u.username.toLowerCase() === input || u.email.toLowerCase() === input) && u.password === pwd
  );

  if (match) {
    const session = saveSession(
      buildSession(
        {
          id: match.id,
          username: match.username,
          email: match.email,
          full_name: match.full_name,
          phone: match.phone,
          role: match.role,
          avatar: match.avatar,
          vehicle_plate: match.vehicle_plate
        },
        rememberMe
      )
    );
    return { success: true, user: session };
  }

  return { success: false, error: 'Kullanıcı adı / e-posta veya şifre hatalı!' };
}

export async function registerCustomer(payload, options = {}) {
  const rememberMe = options.rememberMe !== false;
  const { full_name, email, phone, username, password } = payload;
  const uname = (username || email.split('@')[0]).toLowerCase();

  try {
    const { data } = await supabase
      .from('app_users')
      .insert([
        {
          username: uname,
          email: email.toLowerCase(),
          password_hash: password,
          full_name,
          phone,
          role: 'customer',
          is_active: true,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (data) {
      const session = saveSession(
        buildSession(
          {
            id: data.id,
            username: data.username,
            email: data.email,
            full_name: data.full_name,
            phone: data.phone,
            role: 'customer'
          },
          rememberMe
        )
      );
      return { success: true, user: session };
    }
  } catch (e) {
    console.warn('Supabase register notice:', e);
  }

  const session = saveSession(
    buildSession(
      {
        id: `user_${Date.now()}`,
        username: uname,
        email: email.toLowerCase(),
        full_name,
        phone,
        role: 'customer'
      },
      rememberMe
    )
  );
  return { success: true, user: session };
}

export function getAdminSession() {
  const user = getCurrentUser();
  return user?.role === 'admin' ? user : null;
}

export function logoutUser() {
  clearAllStorages();
  emitAuthChange(null);
}

export function logoutAdmin() {
  logoutUser();
}

export const loginAdmin = loginUser;
