const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- AUTH ---
/**
 * Login User (Mahasiswa/Dosen/Admin)
 * Mengembalikan objek: { message, data: { id_mhs, name, role, ... } }
 */
export const loginUser = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Login failed");
  
  return result; // Pastikan controller backend mengirim data di dalam properti 'data'
};

export const registerUser = async (userData) => {
  const res = await fetch(`${API_BASE_URL}/api/register/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });
  
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Registrasi gagal");
  
  return result;
};

// --- PROFIL ---
/**
 * Mengambil profil user berdasarkan email
 * PENTING: Pastikan API backend menyertakan id_mhs dalam responsenya
 */
export const getProfile = async (email) => {
  const res = await fetch(`${API_BASE_URL}/api/profile/${email}`);
  const result = await res.json();
  
  if (!res.ok) throw new Error(result.message || "Gagal mengambil profil");

  const data = result.data;

  // --- LOGIKA TRANSFORMASI DATA (DATA MAPPING) ---
  if (data && data.foto_url) {
    // Normalisasi URL Foto agar sinkron dengan VITE_API_URL
    data.foto_url = data.foto_url.startsWith('http') 
      ? data.foto_url.replace('http://localhost:3000', API_BASE_URL)
      : `${API_BASE_URL}${data.foto_url}`;
  }

  return data; // Data ini harus mengandung id_mhs
};

export const updateProfile = async (formData) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}/api/profile/update`, {
    method: "PUT", 
    headers: {
      ...(token && { "Authorization": `Bearer ${token}` }),
      // Jangan set Content-Type karena menggunakan FormData (untuk upload file)
    },
    body: formData,
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Gagal update profil");

  const updatedData = result.data;
  
  // Normalisasi URL Foto hasil update
  if (updatedData && updatedData.foto_url) {
    updatedData.foto_url = updatedData.foto_url.startsWith('http') 
      ? updatedData.foto_url.replace('http://localhost:3000', API_BASE_URL)
      : `${API_BASE_URL}${updatedData.foto_url}`;
  }

  return updatedData;
};

