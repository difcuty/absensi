import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// --- IMPORT HALAMAN ---
import LoginPage from './pages/auth/loginPage';
import RegisterPage from './pages/auth/registerPage';
import DashboardPage from './pages/mahasiswa/dashboardPage';
import EditProfilePage from './pages/mahasiswa/EditProfilePage'; 
import IzinPage from './pages/mahasiswa/izinPage';
import JadwalMahasiswa from './pages/mahasiswa/jadwalMhsPage';

// Admin Pages
import AdminDashboard from './pages/admin/adminDashboardPage';
import KelolaDosen from './pages/admin/kelolaDosen';
import AkademikPage from './pages/admin/akademikPage'; // <--- TAMBAHKAN INI

// Dosen Pages
import DosenDashboard from './pages/dosen/dashboardDosen';
import TinjauanIzin from './pages/dosen/tinjauIzin';

/**
 * Komponen ProtectedRoute
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const userString = localStorage.getItem("user");
  
  if (!userString) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userString);
    const userRole = (user.role || "").toUpperCase().trim();

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      if (userRole === 'ADMIN') return <Navigate to="/admin" replace />;
      if (userRole === 'DOSEN') return <Navigate to="/dosen" replace />;
      return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
    
  } catch (error) {
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Routes>
      {/* RUTE PUBLIK */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* RUTE MAHASISWA */}
      <Route element={<ProtectedRoute allowedRoles={['MAHASISWA']} />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/izin" element={<IzinPage />} />
        <Route path="/jadwal-kuliah" element={<JadwalMahasiswa />} />
      </Route>

      {/* RUTE ADMIN */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/kelola-pengguna" element={<KelolaDosen />} />
        {/* PERBAIKAN: Menambahkan rute untuk AkademikPage (Tab Jadwal/Matkul) */}
        <Route path="/admin/jadwal" element={<AkademikPage />} />
      </Route>

      {/* RUTE DOSEN */}
      <Route element={<ProtectedRoute allowedRoles={['DOSEN']} />}>
        <Route path="/dosen" element={<DosenDashboard />} />
        <Route path="/dosen/tinjau-izin" element={<TinjauanIzin />} />
      </Route>

      {/* RUTE BERSAMA */}
      <Route element={<ProtectedRoute allowedRoles={['MAHASISWA', 'ADMIN', 'DOSEN']} />}>
        <Route path="/profil" element={<EditProfilePage />} />
      </Route>

      {/* 404 FALLBACK */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;