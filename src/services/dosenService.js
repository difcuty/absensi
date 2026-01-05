/**
 * DOSEN SERVICE (REVISED)
 */

const RAW_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const CLEAN_BASE = RAW_BASE.endsWith('/') ? RAW_BASE.slice(0, -1) : RAW_BASE;

// API BASE ENDPOINTS
const API_DOSEN = `${CLEAN_BASE}/api/dosen`;

/**
 * 1. Mengambil data profil lengkap dosen
 */
export const getProfilDosen = async (identifier) => {
    try {
        if (!identifier) throw new Error("Identifier diperlukan");
        const res = await fetch(`${API_DOSEN}/profil/${identifier}`);
        const result = await res.json();
        return result.data;
    } catch (err) {
        console.error("Service Error (getProfilDosen):", err.message);
        throw err;
    }
};

/**
 * 2. Mengambil daftar jadwal mengajar dosen
 * PERBAIKAN: Menggunakan format /jadwal/:kode_dosen
 */
export const getJadwalDosen = async (kodeDosen) => {
    try {
        if (!kodeDosen) return [];
        const res = await fetch(`${API_DOSEN}/jadwal/${kodeDosen}`);
        const result = await res.json();
        return result.success ? (result.data || []) : [];
    } catch (err) {
        console.error("Service Error (getJadwalDosen):", err.message);
        return [];
    }
};

/**
 * 3. Mengambil jumlah izin pending
 * PERBAIKAN: Mengarah ke API_DOSEN sesuai Router
 */
export const getPendingIzinCount = async (kodeDosen) => {
    try {
        if (!kodeDosen) return 0;
        const res = await fetch(`${API_DOSEN}/izin-count/${kodeDosen}`);
        const result = await res.json();
        return result.success ? result.count : 0;
    } catch (err) {
        console.error("Service Error (getPendingIzinCount):", err.message);
        return 0;
    }
};

/**
 * 4. Mengambil list izin detail
 */
export const getIzinByDosen = async (kodeDosen) => {
    try {
        if (!kodeDosen) return [];
        const res = await fetch(`${API_DOSEN}/list-izin/${kodeDosen}`);
        const result = await res.json();
        return result.success ? result.data : [];
    } catch (err) {
        console.error("Service Error (getIzinByDosen):", err.message);
        return [];
    }
};

/**
 * 5. FITUR RIWAYAT: Mengambil daftar hadir mahasiswa per sesi
 * BARU: Digunakan di RiwayatKehadiran.jsx
 */
export const getRiwayatAbsensiByJadwal = async (idJadwal, pertemuan) => {
    try {
        const res = await fetch(`${API_DOSEN}/riwayat-sesi?id_jadwal=${idJadwal}&pertemuan=${pertemuan}`);
        const result = await res.json();
        return result.success ? result.data : [];
    } catch (err) {
        console.error("Service Error (getRiwayatAbsensiByJadwal):", err.message);
        return [];
    }
};

/**
 * 6. Rekapitulasi Kehadiran per Mata Kuliah (Total)
 */
export const getRekapKehadiranMahasiswa = async (idJadwal) => {
    try {
        const res = await fetch(`${API_DOSEN}/rekap-kehadiran?id_jadwal=${idJadwal}`);
        const result = await res.json();
        return result.success ? result.data : [];
    } catch (err) {
        console.error("Service Error (getRekapKehadiranMahasiswa):", err.message);
        return [];
    }
};

/**
 * 7. Statistik Real-time (Dashboard)
 */
export const getStatistikKehadiranSesi = async (idJadwal, pertemuan) => {
    try {
        const res = await fetch(`${API_DOSEN}/statistik-sesi?id_jadwal=${idJadwal}&pertemuan=${pertemuan}`);
        const result = await res.json();
        return result.success ? result.data : { hadir: 0, terlambat: 0, belum: 0 };
    } catch (err) {
        console.error("Service Error (getStatistikKehadiranSesi):", err.message);
        return { hadir: 0, terlambat: 0, belum: 0 };
    }
};

/**
 * 8. Update status izin
 */
export const updateStatusIzin = async (idAbsensi, statusVerifikasi) => {
    try {
        const res = await fetch(`${API_DOSEN}/izin/status-update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_absensi: idAbsensi,
                status_verifikasi: statusVerifikasi 
            }),
        });
        return await res.json();
    } catch (err) {
        console.error("Service Error (updateStatusIzin):", err.message);
        throw err;
    }
};