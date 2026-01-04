/**
 * DOSEN SERVICE
 * Menangani komunikasi antara Frontend Dashboard Dosen dan API Backend
 */

const RAW_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const CLEAN_BASE = RAW_BASE.endsWith('/') ? RAW_BASE.slice(0, -1) : RAW_BASE;

// API BASE untuk profil & jadwal tetap di /api/dosen
const API_DOSEN = `${CLEAN_BASE}/api/dosen`;

// API BASE untuk izin (disesuaikan dengan izinRoutes.js Anda)
const API_IZIN = `${CLEAN_BASE}/api/izin`;

/**
 * 1. Mengambil data profil lengkap dosen
 */
export const getProfilDosen = async (identifier) => {
    try {
        if (!identifier) throw new Error("Identifier diperlukan");
        const res = await fetch(`${API_DOSEN}/profil/${identifier}`);
        if (!res.ok) throw new Error("Gagal mengambil data profil");
        const result = await res.json();
        return result.data;
    } catch (err) {
        console.error("Service Error (getProfilDosen):", err.message);
        throw err;
    }
};

/**
 * 2. Mengambil daftar jadwal mengajar dosen
 */
export const getJadwalDosen = async (kodeDosen) => {
    try {
        if (!kodeDosen) return [];
        const res = await fetch(`${API_DOSEN}/jadwal?kode_dosen=${kodeDosen}`);
        if (!res.ok) throw new Error("Gagal memuat jadwal");
        const result = await res.json();
        return result.success ? (result.data || []) : [];
    } catch (err) {
        console.error("Service Error (getJadwalDosen):", err.message);
        return [];
    }
};

/**
 * 3. Mengambil jumlah izin mahasiswa yang statusnya 'pending'
 * URL disesuaikan dengan izinRoutes yang baru
 */
export const getPendingIzinCount = async (kodeDosen) => {
    try {
        if (!kodeDosen) return 0;
        // Kita gunakan endpoint list-dosen tapi hitung jumlah yang 'menunggu'
        const res = await fetch(`${API_IZIN}/list-dosen?kode_dosen=${kodeDosen}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const result = await res.json();
        
        if (result.success) {
            // Filter hanya yang statusnya 'menunggu' (sesuai tab frontend) atau 'PENDING'
            const pending = result.data.filter(i => i.status.toLowerCase() === 'pending' || i.status.toLowerCase() === 'menunggu');
            return pending.length;
        }
        return 0;
    } catch (err) {
        console.error("Service Error (getPendingIzinCount):", err.message);
        return 0;
    }
};

/**
 * 4. Mengambil daftar detail izin mahasiswa
 * URL: /api/izin/list-dosen (Sesuai rute router.get("/list-dosen", ...))
 */
export const getIzinByDosen = async (kodeDosen) => {
    try {
        if (!kodeDosen) return [];
        const res = await fetch(`${API_IZIN}/list-dosen?kode_dosen=${kodeDosen}`);
        if (!res.ok) throw new Error("Gagal mengambil daftar izin");
        const result = await res.json();
        
        // Normalisasi status dari 'Verified/Rejected' ke 'diterima/ditolak' agar sesuai Tab UI
        if (result.success && result.data) {
            return result.data.map(item => ({
                ...item,
                status: item.status === 'Verified' ? 'diterima' : 
                        item.status === 'Rejected' ? 'ditolak' : 'menunggu'
            }));
        }
        return [];
    } catch (err) {
        console.error("Service Error (getIzinByDosen):", err.message);
        return [];
    }
};

/**
 * 5. Memperbarui status izin
 * URL: /api/izin/status-update (Sesuai rute router.post("/status-update", ...))
 */
export const updateStatusIzin = async (idIzin, status) => {
    try {
        const res = await fetch(`${API_IZIN}/status-update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_izin: idIzin,
                status: status // status dikirim sebagai 'diterima' atau 'ditolak'
            }),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Gagal update status");
        return result;
    } catch (err) {
        console.error("Service Error (updateStatusIzin):", err.message);
        throw err;
    }
};