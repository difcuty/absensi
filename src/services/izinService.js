import axios from 'axios';

// Gunakan fallback ke localhost jika env tidak terbaca
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"; 

/**
 * 1. Ambil daftar mata kuliah berdasarkan semester dan kelas
 */
export const getMatkulByData = async (semester, kelas) => {
    try {
        const response = await axios.get(`${API_URL}/api/izin/matakuliah/${semester}/${kelas}`);
        return response.data;
    } catch (error) {
        console.error("Error getMatkulByData:", error);
        throw error.response?.data || { message: "Gagal memuat mata kuliah" };
    }
};

/**
 * 2. Ambil riwayat pertemuan yang sudah diisi (Fungsi Filter)
 * URL: /api/izin/cek-pertemuan/:id_mhs/:id_jadwal
 */
export const getPertemuanTerisi = async (id_mhs, id_jadwal) => {
    try {
        const response = await axios.get(`${API_URL}/api/izin/cek-pertemuan/${id_mhs}/${id_jadwal}`);
        // Pastikan return array kosong jika data tidak ada agar .includes() di frontend tidak error
        return response.data.data || []; 
    } catch (error) {
        console.error("Error getPertemuanTerisi:", error);
        return []; // Jika error, kembalikan array kosong agar dropdown tetap muncul (tanpa filter)
    }
};

/**
 * 3. Kirim pengajuan izin (Multipart Form Data)
 */
export const submitIzin = async (formData) => {
    try {
        const response = await axios.post(`${API_URL}/api/izin`, formData, {
            headers: { 
                'Content-Type': 'multipart/form-data' 
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error submitIzin:", error);
        throw error.response?.data || { message: "Gagal mengirim pengajuan izin" };
    }
};