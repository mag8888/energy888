import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type User = {
  id: string;
  username: string;
  email?: string;
  tgId?: number;
};

type AuthCtx = {
  user: User | null;
  loading: boolean;
  registerEmail: (name: string, email: string, password: string) => Promise<void>;
  loginEmail: (email: string, password: string) => Promise<void>;
  loginTelegram: (payload: any) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  async registerEmail() {},
  async loginEmail() {},
  async loginTelegram() {},
  logout() {}
});

const LS_USER = 'eom_user_v1';
const LS_USERS = 'eom_users_v1';

function sha256(str: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) return Promise.resolve(str);
  const enc = new TextEncoder().encode(str);
  return window.crypto.subtle.digest('SHA-256', enc).then(buf =>
    Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  );
}

function genId(prefix = 'u') {
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(LS_USER);
    if (raw) setUser(JSON.parse(raw));
    setLoading(false);
  }, []);

  const saveUser = (u: User | null) => {
    if (typeof window === 'undefined') return;
    if (u) localStorage.setItem(LS_USER, JSON.stringify(u));
    else localStorage.removeItem(LS_USER);
    setUser(u);
  };

  const registerEmail = async (name: string, email: string, password: string) => {
    const pass = await sha256(password);
    if (typeof window !== 'undefined') {
      const all = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
      if (all.find((u: any) => u.email === email)) throw new Error('Email уже зарегистрирован');
      const u: User & { password: string } = { id: genId('e'), username: name || email.split('@')[0], email, password: pass };
      localStorage.setItem(LS_USERS, JSON.stringify([...all, u]));
      saveUser({ id: u.id, username: u.username, email });
    }
  };

  const loginEmail = async (email: string, password: string) => {
    const pass = await sha256(password);
    if (typeof window !== 'undefined') {
      const all = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
      const found = all.find((u: any) => u.email === email && u.password === pass);
      if (!found) throw new Error('Неверный email или пароль');
      saveUser({ id: found.id, username: found.username, email: found.email });
    }
  };

  const loginTelegram = async (payload: any) => {
    // WARNING: для продакшена нужно серверное подтверждение hash.
    const tgId = Number(payload?.id || payload?.user?.id);
    const username = payload?.username || payload?.user?.username || 'TG User';
    const u: User = { id: `tg_${tgId || genId('tg')}`, username, tgId } as User;
    saveUser(u);
  };

  const logout = () => saveUser(null);

  const value = useMemo(() => ({ user, loading, registerEmail, loginEmail, loginTelegram, logout }), [user, loading]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() { return useContext(Ctx); }

