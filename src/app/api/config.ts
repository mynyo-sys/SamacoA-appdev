// Symfony Backend API URL
// Update this to your backend URL when deployed to Railway
export const API_BASE_URL: string = __DEV__
  ? 'http://192.168.1.55:8000/api'    // Local development (your computer IP)
  : 'https://your-backend.railway.app/api'; // Production (Railway)

// Mercure Hub URL for real-time updates
export const MERCURE_URL: string = __DEV__
  ? 'http://192.168.1.55:8000/.well-known/mercure'    // Local development
  : 'https://your-backend.railway.app/.well-known/mercure'; // Production
