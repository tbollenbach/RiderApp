// Server Configuration
// Update this IP address to match your PC's IP address
export const SERVER_CONFIG = {
  // Replace this with your PC's actual IP address
  // You can find your IP by running 'ipconfig' in Command Prompt
  MUSIC_SERVER_URL: 'http://192.168.1.71:3001', // Change this to your PC's IP
  
  // Alternative: Use localhost if running on same device
  // MUSIC_SERVER_URL: 'http://localhost:3001',
  
  // Alternative: Use your actual IP address (examples)
  // MUSIC_SERVER_URL: 'http://192.168.1.50:3001',
  // MUSIC_SERVER_URL: 'http://10.0.0.100:3001',
  
  // Fallback URLs to try if the main one fails
  FALLBACK_URLS: [
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ],
  
  // Server health check endpoint
  HEALTH_ENDPOINT: '/api/health',
  
  // Songs endpoint
  SONGS_ENDPOINT: '/api/songs',
};

// Helper function to get the server URL
export const getServerUrl = (): string => {
  return SERVER_CONFIG.MUSIC_SERVER_URL;
};

// Helper function to get all possible URLs to try
export const getAllServerUrls = (): string[] => {
  return [SERVER_CONFIG.MUSIC_SERVER_URL, ...SERVER_CONFIG.FALLBACK_URLS];
}; 