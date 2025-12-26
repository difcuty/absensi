/**
 * akademikService.js
 * Konfigurasi Service untuk Frontend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * ==========================================
 * 1. MATA KULIAH (MATKUL) SERVICES
 * ==========================================
 */

export const getMatkul = async () => {
    try {
        const res = await fetch(`${API_URL}/api/matkul`);
        if (!res.ok) throw new Error("Gagal mengambil data mata kuliah");
        return await res.json();
    } catch (err) {
        throw err;
    }
};

export const saveMatkul = async (payload) => {
    try {
        const res = await fetch(`${API_URL}/api/matkul`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Gagal menyimpan mata kuliah");
        return result;
    } catch (err) {
        throw err;
    }
};

export const deleteMatkul = async (kode) => {
    try {
        const res = await fetch(`${API_URL}/api/matkul/${kode}`, { method: 'DELETE' });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Gagal menghapus mata kuliah");
        return result;
    } catch (err) {
        throw err;
    }
};

/**
 * ==========================================
 * 2. DOSEN & PENUGASAN SERVICES
 * ==========================================
 */

export const getDosen = async () => {
    try {
        const res = await fetch(`${API_URL}/api/dosen`);
        if (!res.ok) throw new Error("Gagal mengambil data dosen");
        return await res.json();
    } catch (err) {
        throw err;
    }
};

export const assignDosen = async (payload) => {
    try {
        const res = await fetch(`${API_URL}/api/dosen`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Gagal menugaskan dosen");
        return result;
    } catch (err) {
        throw err;
    }
};

export const deleteDosenAssignment = async (kode) => {
    try {
        const res = await fetch(`${API_URL}/api/dosen/reset/${kode}`, { 
            method: 'DELETE' 
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Gagal mencopot penugasan");
        return result;
    } catch (err) {
        throw err;
    }
};

/**
 * ==========================================
 * 3. JADWAL KULIAH SERVICES
 * ==========================================
 */

export const getJadwal = async () => {
    try {
        const res = await fetch(`${API_URL}/api/jadwal`);
        if (!res.ok) throw new Error("Gagal mengambil data jadwal");
        return await res.json();
    } catch (err) {
        throw err;
    }
};

/**
 * PERBAIKAN: Sync Save Jadwal
 * Pastikan menangani result.message agar error duplikasi dari Backend muncul di alert
 */
export const saveFullJadwal = async (payload) => {
    try {
        const res = await fetch(`${API_URL}/api/jadwal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload) 
        });

        const result = await res.json();
        if (!res.ok) {
            // Melempar error dengan pesan dari backend (misal: "Bentrok jadwal!")
            throw new Error(result.message || "Gagal sinkronisasi jadwal");
        }
        return result;
    } catch (err) {
        throw err;
    }
};