import axios from 'axios';

// Jika VITE_API_URL Anda bernilai "http://localhost:3000"
const API_URL = import.meta.env.VITE_API_URL; 

/**
 * 1. Ambil daftar matakuliah berdasarkan Jadwal & Semester
 */
export const getMatkulByData = async (semester) => {
    try {
        // Penambahan /api secara manual sebelum /izin
        const response = await axios.get(`${API_URL}/api/izin/matakuliah/${semester}`);
        return response.data; 
    } catch (error) {
        console.error("Service Error - getMatkulByData:", error);
        throw error.response?.data || { message: "Gagal mengambil data jadwal mata kuliah" };
    }
};

/**
 * 2. Submit Form Izin (Multipart/Form-Data)
 */
export const submitIzin = async (formData) => {
    try {
        // Penambahan /api secara manual sebelum /izin
        const response = await axios.post(`${API_URL}/api/izin`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Service Error - submitIzin:", error);
        throw error.response?.data || { message: "Gagal mengirim pengajuan izin" };
    }
};