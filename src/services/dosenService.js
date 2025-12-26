const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Mengambil jumlah izin yang sedang pending
 */
export const getPendingIzinCount = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/izin/pending/count`);
    if (!res.ok) throw new Error('Gagal mengambil data izin');
    const data = await res.json();
    return data.total || 0;
  } catch (err) {
    console.error("Service Error (getPendingIzinCount):", err);
    throw err;
  }
};

/**
 * Mengambil ringkasan kehadiran sesi saat ini
 */
export const getKehadiranSummary = async (sessionId) => {
  // Contoh jika nanti ada API untuk statistik kehadiran
  try {
    const res = await fetch(`${API_BASE_URL}/api/kehadiran/summary/${sessionId}`);
    return await res.json();
  } catch (err) {
    return { hadir: 0, terlambat: 0, absen: 0 };
  }
};