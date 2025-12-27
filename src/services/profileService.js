import axios from 'axios';

// Gunakan environment variable untuk URL API Anda (misal: link Serveo atau Localhost)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Mengambil profil user berdasarkan email
 */
export const getProfile = async (email) => {
  try {
    const response = await axios.get(`${API_URL}/api/profile/${email}`);
    // Backend harus mengembalikan object user { name, jurusan, foto_url, face_descriptor, dll }
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Gagal mengambil data profil');
  }
};

/**
 * Memperbarui profil user
 * Menggunakan FormData karena mengirimkan file (foto)
 */
export const updateProfile = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/api/profile/update`, formData, {
      headers: {
        // Penting: Jangan manual set Content-Type ke application/json
        // Biarkan axios menangani multipart/form-data untuk file upload
        'Content-Type': 'multipart/form-data',
        // Jika Anda menggunakan proteksi JWT, tambahkan token di sini:
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Gagal memperbarui profil');
  }
};