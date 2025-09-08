export * from './game';
export * from './auth';

export interface User {
  id: string;
  username: string;
  email?: string;
  tgId?: number;
  photoUrl?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthContext {
  user: User | null;
  loading: boolean;
  registerEmail: (name: string, email: string, password: string) => Promise<void>;
  loginEmail: (email: string, password: string) => Promise<void>;
  loginTelegram: (payload: any) => Promise<void>;
  logout: () => void;
}
