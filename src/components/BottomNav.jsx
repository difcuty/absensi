import React from 'react';
import { Home, BookOpen, History, FileText, Settings } from 'lucide-react'; // Ganti TrendingUp ke History
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 max-w-md w-full bg-white border-t border-gray-100 px-8 py-4 flex justify-between items-center z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] left-1/2 -translate-x-1/2">
      <button 
        onClick={() => navigate('/dashboard')} 
        className={`${isActive('/dashboard') ? 'text-blue-600 scale-110' : 'text-gray-300'} transition-all`}
      >
        <Home size={24} strokeWidth={isActive('/dashboard') ? 3 : 2} />
      </button>
      
      <button 
        onClick={() => navigate('/jadwal-kuliah')} 
        className={`${isActive('/jadwal-kuliah') ? 'text-blue-600 scale-110' : 'text-gray-300'} transition-all`}
      >
        <BookOpen size={24} strokeWidth={isActive('/jadwal-kuliah') ? 3 : 2} />
      </button>

      {/* TOMBOL TENGAH: RIWAYAT */}
      <button 
        onClick={() => navigate('/riwayat')} 
        className={`p-3 rounded-2xl transition-all ${
          isActive('/riwayat') 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' 
            : 'bg-gray-50 text-gray-300'
        }`}
      >
        <History size={26} strokeWidth={3} />
      </button>

      <button 
        onClick={() => navigate('/izin')} 
        className={`${isActive('/izin') ? 'text-blue-600 scale-110' : 'text-gray-300'} transition-all`}
      >
        <FileText size={24} strokeWidth={isActive('/izin') ? 3 : 2} />
      </button>

      <button 
        onClick={() => navigate('/profil')} 
        className={`${isActive('/profil') ? 'text-blue-600 scale-110' : 'text-gray-300'} transition-all`}
      >
        <Settings size={24} strokeWidth={isActive('/profil') ? 3 : 2} />
      </button>
    </nav>
  );
}