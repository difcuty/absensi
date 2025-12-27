// Mengambil base URL dari .env (http://localhost:3000)
const RAW_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Membersihkan slash di akhir jika ada, lalu tambahkan prefix /api/dosen
const CLEAN_BASE = RAW_BASE.endsWith('/') ? RAW_BASE.slice(0, -1) : RAW_BASE;
const API_BASE_URL = `${CLEAN_BASE}/api/dosen`;

/**
 * Mengambil jumlah izin mahasiswa yang pending untuk dosen tertentu
 */
export const getPendingIzinCount = async (kodeDosen) => {
    try {
        const url = `${API_BASE_URL}/izin-count?kode_dosen=${kodeDosen}`;
        const res = await fetch(url);
        const result = await res.json();
        return result.success ? result.total : 0;
    } catch (err) {
        console.error("Service Error (Izin):", err);
        return 0;
    }
};

/**
 * Mengambil data profil dosen berdasarkan email atau kode_dosen
 */
export const getProfilDosen = async (identifier) => {
    try {
        const url = `${API_BASE_URL}/profil/${identifier}`;
        
        // Log ini sangat berguna untuk debugging di F12 Browser
        console.log("Fetching Profil from:", url);

        const res = await fetch(url);
        
        // Cek jika response status bukan 2xx (misal 404 atau 500)
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Gagal mengambil data profil");
        }

        const result = await res.json();
        return result.data;
    } catch (err) {
        console.error("Service Error (Profil):", err.message);
        throw err;
    }
};

export const getJadwalDosen = async (kodeDosen) => {
    try {
        const res = await fetch(`${API_BASE_URL}/jadwal?kode_dosen=${kodeDosen}`);
        const result = await res.json();
        return result.success ? result.data : [];
    } catch (err) {
        console.error("Service Error (Jadwal):", err);
        return [];
    }
};