// Konfigurasi Base URL dari Environment Variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const DOSEN_API_URL = `${API_BASE_URL}/api/dosen`;
const ADMIN_API_URL = `${API_BASE_URL}/api/admin`;

/**
 * 1. FUNGSI STATISTIK (DASHBOARD)
 * Digunakan di AdminDashboard.jsx
 */
export const getAdminStats = async () => {
    try {
        const res = await fetch(`${ADMIN_API_URL}/stats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Jika butuh auth, tambahkan di sini:
                // 'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const result = await res.json();
        
        if (!res.ok) throw new Error(result.message || "Gagal mengambil statistik");
        
        // Mengembalikan result (yang berisi mhsAktif, dosenAktif, presensiHariIni)
        return result; 
    } catch (error) {
        console.error("Service Error:", error.message);
        throw error;
    }
};

/**
 * 2. FUNGSI KELOLA DOSEN
 */

// Ambil semua data dosen
export const getDosen = async () => {
    try {
        const res = await fetch(DOSEN_API_URL);
        if (!res.ok) throw new Error("Gagal mengambil data dosen");
        return await res.json();
    } catch (error) {
        throw error;
    }
};

// Buat Dosen baru (POST)
export const createDosen = async (payload) => {
    try {
        const res = await fetch(DOSEN_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Gagal memproses data dosen");
        return result;
    } catch (error) {
        throw error;
    }
};

// Hapus Akun Permanen (DELETE)
export const deleteDosen = async (kode) => {
    try {
        const res = await fetch(`${DOSEN_API_URL}/${kode}`, { 
            method: 'DELETE' 
        });
        
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Gagal menghapus akun");
        return result;
    } catch (error) {
        throw error;
    }
};

/**
 * 3. FUNGSI AKADEMIK / JADWAL
 */

// Copot Penugasan Mata Kuliah Saja (PUT)
export const resetPenugasan = async (kode) => {
    try {
        const res = await fetch(`${DOSEN_API_URL}/reset-tugas/${kode}`, { 
            method: 'PUT' 
        });
        
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Gagal mencopot penugasan");
        return result;
    } catch (error) {
        throw error;
    }
};