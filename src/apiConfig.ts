import { dev } from '$app/environment';

export module apiConfig {
    const baseUrl = dev ? 'http://localhost:5173' : 'https://whatthefridge.vercel.app';
    const baseApiUrl = dev ? 'http://127.0.0.1:8000' : 'https://whatthefridge-api.vercel.app';
    export const auth = {
      login: `${baseApiUrl}/api/auth/login`,
      logout: `${baseApiUrl}/api/auth/logout`,
      session: `${baseApiUrl}/api/auth/session`,
    };
  
    // Add more endpoints as needed
  }