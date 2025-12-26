import axios from 'axios';

// PERBAIKAN: Gunakan BASE URL saja (tanpa /izin di ujungnya agar fleksibel)
const API_URL = import.meta.env.VITE_API_URL; 

// Ambil daftar matkul berdasarkan jurusan & semester mahasiswa
export const getMatkulByData = async (jurusan, semester) => {
    try {
        /**
         * PERBAIKAN: Tambahkan path /izin sebelum /matakuliah
         * URL akan menjadi: http://localhost:3000/api/izin/matakuliah/ti/4
         */
        const response = await axios.get(`${API_URL}/izin/matakuliah/${jurusan}/${semester}`);
        return response.data; 
    } catch (error) {
        throw error.response?.data || { message: "Gagal mengambil data mata kuliah" };
    }
};

// Submit Form Izin (Multipart/Form-Data)
export const submitIzin = async (formData) => {
    try {
        /**
         * PERBAIKAN: Pastikan endpoint POST juga konsisten
         * Jika di router backend adalah router.post("/", ...), maka di sini cukup /izin
         */
        const response = await axios.post(`${API_URL}/izin`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Gagal mengirim izin" };
    }
};