const API_BASE_URL = import.meta.env.VITE_API_URL;


//login dan regis
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



//profil
export const getProfile = async (email) => {
  const res = await fetch(`${API_BASE_URL}/api/profile/${email}`);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Gagal mengambil profil");
  return result.data;
};

export const updateProfile = async (formData) => {
  const res = await fetch(`${API_BASE_URL}/api/profile/update`, {
    method: "PUT",
    body: formData, // Jangan set Header Content-Type manual jika menggunakan FormData
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Gagal update profil");
  return result.data;
};


//izin
export const submitIzin = async (formData) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/izin`, {
    method: "POST",
    body: formData, // Mengirim file wajib pakai FormData
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Gagal mengirim izin");
  return result;
};