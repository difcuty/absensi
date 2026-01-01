/**
 * DOSEN SERVICE
 * Menangani komunikasi antara Frontend Dashboard Dosen dan API Backend
 */

// 1. Konfigurasi Base URL
const RAW_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const CLEAN_BASE = RAW_BASE.endsWith('/') ? RAW_BASE.slice(0, -1) : RAW_BASE;
const API_BASE_URL = `${CLEAN_BASE}/api/dosen`;

/**
 * 2. Mengambil jumlah izin mahasiswa yang statusnya 'pending'
 * Difilter berdasarkan mata kuliah yang diampu oleh dosen terkait
 */
export const getPendingIzinCount = async (kodeDosen) => {
    try {
        if (!kodeDosen) return 0;

        const url = `${API_BASE_URL}/izin-count?kode_dosen=${kodeDosen}`;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const result = await res.json();
        
        // SINKRONISASI: Mengambil properti 'count' dari backend
        return result.success ? (result.count || 0) : 0;
    } catch (err) {
        console.error("Service Error (getPendingIzinCount):", err.message);
        return 0;
    }
};

/**
 * 3. Mengambil data profil lengkap dosen
 * @param {string} identifier - Bisa berupa email atau kode_dosen
 */
export const getProfilDosen = async (identifier) => {
    try {
        if (!identifier) throw new Error("Identifier (email/kode) diperlukan");

        const url = `${API_BASE_URL}/profil/${identifier}`;
        console.log("Fetching Profil from:", url);

        const res = await fetch(url);
        
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Gagal mengambil data profil");
        }

        const result = await res.json();
        return result.data; // Mengembalikan objek profil {nama, nidn, foto_url, dll}
    } catch (err) {
        console.error("Service Error (getProfilDosen):", err.message);
        throw err; // Dilempar agar UI bisa menampilkan pesan error jika perlu
    }
};

/**
 * 4. Mengambil daftar jadwal mengajar dosen
 * Digunakan untuk setup absensi QR dan list jadwal di dashboard
 */
export const getJadwalDosen = async (kodeDosen) => {
    try {
        if (!kodeDosen) return [];

        const url = `${API_BASE_URL}/jadwal?kode_dosen=${kodeDosen}`;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const result = await res.json();
        return result.success ? (result.data || []) : [];
    } catch (err) {
        console.error("Service Error (getJadwalDosen):", err.message);
        return [];
    }
};