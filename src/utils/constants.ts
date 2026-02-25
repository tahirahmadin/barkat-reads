/**
 * Backend API base URL. Set EXPO_PUBLIC_API_URL in .env (e.g. EXPO_PUBLIC_API_URL=http://192.168.1.2:3001).
 * No trailing slash. If unset or empty, app uses mock data.
 */
const fromEnv = typeof process !== 'undefined' ? process.env.EXPO_PUBLIC_API_URL : undefined;
export const BACKEND_URL =
  (typeof fromEnv === 'string' && fromEnv.trim() !== '') ? fromEnv.trim() : 'http://192.168.1.6:3001';
