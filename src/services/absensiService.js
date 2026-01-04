const API_URL = import.meta.env.VITE_API_URL;

/**
 * Mengirim data absensi hasil scan QR ke server (Oleh Mahasiswa)
 */
export const submitAbsensi = async (absensiData) => {
    try {
        const response = await fetch(`${API_URL}/api/absensi/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(absensiData)
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Service Error (submitAbsensi):", error);
        throw error;
    }
};

/**
 * Mengambil ringkasan riwayat kehadiran mahasiswa per mata kuliah (Untuk Mahasiswa)
 * @param {string|number} id_mhs - ID unik mahasiswa dari database
 */
export const getRiwayat = async (id_mhs) => {
    try {
        const response = await fetch(`${API_URL}/api/absensi/riwayat/${id_mhs}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Gagal mengambil data riwayat");
        }

        const result = await response.json();
        return result; // Mengembalikan { success: true, data: [...] }
    } catch (error) {
        console.error("Service Error (getRiwayat):", error);
        throw error;
    }
};

/**
 * Mengambil rekap detail kehadiran mahasiswa per kelas (Untuk Dosen)
 * @param {string|number} id_jadwal - ID Jadwal mata kuliah
 */
export const getRekapDosen = async (id_jadwal) => {
    try {
        const response = await fetch(`${API_URL}/api/absensi/rekap-dosen/${id_jadwal}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Gagal mengambil data rekap dosen");
        }

        const result = await response.json();
        return result; // Mengembalikan { success: true, data: [ mahasiswa + status P1-P16 ] }
    } catch (error) {
        console.error("Service Error (getRekapDosen):", error);
        throw error;
    }
};