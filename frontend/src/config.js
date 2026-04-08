export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function to get full image URL
export const getImageUrl = (url) => {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_URL}${url}`;
};

