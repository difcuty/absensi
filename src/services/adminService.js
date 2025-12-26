// Konfigurasi Base URL dari Environment Variable
const API_BASE_URL = import.meta.env.VITE_API_URL;
const DOSEN_API_URL = `${API_BASE_URL}/api/dosen`;

/**
 * 1. FUNGSI STATISTIK (DASHBOARD)
 * Digunakan di adminDashboardPage.jsx
 */
export const getAdminStats = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/stats`);
        const result = await res.json();
        
        if (!res.ok) throw new Error(result.message || "Gagal mengambil statistik");
        
        // Pastikan backend mengirimkan object data { totalMahasiswa, totalDosen, dll }
        return result.data; 
    } catch (error) {
        throw error;
    }
};

/**
 * 2. FUNGSI KELOLA DOSEN
 */

// Ambil semua data dosen
export const getDosen = async () => {
    const res = await fetch(DOSEN_API_URL);
    if (!res.ok) throw new Error("Gagal mengambil data dosen");
    return await res.json();
};

// Buat Dosen baru (POST) atau Update Matkul (POST jika body berisi 'kode')
export const createDosen = async (payload) => {
    const res = await fetch(DOSEN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Gagal memproses data dosen");
    return result;
};

// Hapus Akun Permanen (DELETE) - Dipakai di KelolaDosen.jsx
export const deleteDosen = async (kode) => {
    const res = await fetch(`${DOSEN_API_URL}/${kode}`, { 
        method: 'DELETE' 
    });
    
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Gagal menghapus akun");
    return result;
};

/**
 * 3. FUNGSI AKADEMIK / JADWAL
 */

// Copot Penugasan Mata Kuliah Saja (PUT) - Tanpa menghapus akun
export const resetPenugasan = async (kode) => {
    const res = await fetch(`${DOSEN_API_URL}/reset-tugas/${kode}`, { 
        method: 'PUT' 
    });
    
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Gagal mencopot penugasan");
    return result;
};