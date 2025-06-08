export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'participant';
  created_at: Date;
}
