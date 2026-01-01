const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- AUTH ---
export const loginUser = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Login failed");
  return result;
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
export const getProfile = async (email) => {
  const res = await fetch(`${API_BASE_URL}/api/profile/${email}`);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Gagal mengambil profil");

  const data = result.data;

  // --- LOGIKA TRANSFORMASI DATA (DATA MAPPING) ---
  // Pindahkan dari UI ke sini agar komponen tetap bersih
  if (data && data.foto_url) {
    data.foto_url = data.foto_url.startsWith('http') 
      ? data.foto_url.replace('http://localhost:3000', API_BASE_URL)
      : `${API_BASE_URL}${data.foto_url}`;
  }

  return data;
};

export const updateProfile = async (formData) => {
  // Ambil token jika ada (untuk keamanan)
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}/api/profile/update`, {
    method: "PUT", // Pastikan backend mendukung PUT atau ubah ke POST
    headers: {
      ...(token && { "Authorization": `Bearer ${token}` }),
      // Jangan set Content-Type ke JSON karena kita pakai FormData
    },
    body: formData,
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Gagal update profil");

  // Jika update berhasil, bersihkan URL hasil kembalian dari backend juga
  const updatedData = result.data;
  if (updatedData && updatedData.foto_url) {
    updatedData.foto_url = updatedData.foto_url.startsWith('http') 
      ? updatedData.foto_url.replace('http://localhost:3000', API_BASE_URL)
      : `${API_BASE_URL}${updatedData.foto_url}`;
  }

  return updatedData;
};

// --- IZIN ---
export const submitIzin = async (formData) => {
  const res = await fetch(`${API_BASE_URL}/api/izin`, {
    method: "POST",
    body: formData,
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Gagal mengirim izin");
  return result;
};