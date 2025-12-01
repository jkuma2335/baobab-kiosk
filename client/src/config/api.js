// API Configuration
// This handles the API base URL for both development and production

const getApiBaseUrl = () => {
  // In production, use the environment variable or default to relative URLs
  // Vercel will handle proxying through vercel.json
  if (import.meta.env.PROD) {
    // Production: Use environment variable if set, otherwise use relative paths
    return import.meta.env.VITE_API_URL || '';
  }
  
  // Development: Use relative paths (vite proxy will handle it)
  return '';
};

// Create axios instance with base URL
const apiBaseUrl = getApiBaseUrl();

// Export the base URL for use in axios instances
export default apiBaseUrl;

// Helper function to create full API URL
export const createApiUrl = (endpoint) => {
  const base = apiBaseUrl || '';
  // Remove leading slash from endpoint if base already has trailing slash or vice versa
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return base ? `${base.replace(/\/$/, '')}/${cleanEndpoint}` : `/${cleanEndpoint}`;
};
