// src/utils/imageHelper.js
export const getImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/150";
  if (path.startsWith('blob:')) return path;
  const apiBase = import.meta.env.VITE_API_URL;
  const cleanPath = path.replace('http://localhost:3000', apiBase);
  return cleanPath.startsWith('http') ? cleanPath : `${apiBase}${cleanPath}`;
};