import React from 'react';
import { Home, BookOpen, TrendingUp, FileText, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Fungsi untuk mengecek apakah menu sedang aktif
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 max-w-md w-full bg-white border-t border-gray-100 px-8 py-4 flex justify-between items-center z-50 rounded-t-4xl shadow-[0_-10px_40px_rgba(0,0,0,0.06)] left-1/2 -translate-x-1/2">
      <button 
        onClick={() => navigate('/dashboard')} 
        className={`${isActive('/dashboard') ? 'text-blue-600 scale-110' : 'text-gray-300'} transition-all`}
      >
        <Home size={24} />
      </button>
      
      <button 
        onClick={() => navigate('/jadwal')} 
        className={`${isActive('/jadwal') ? 'text-blue-600 scale-110' : 'text-gray-300'} transition-all`}
      >
        <BookOpen size={24} />
      </button>

      <button className="text-gray-300 hover:text-blue-600 transition-all">
        <TrendingUp size={24} />
      </button>

      <button 
        onClick={() => navigate('/izin')} 
        className={`${isActive('/izin') ? 'text-blue-600 scale-110' : 'text-gray-300'} transition-all`}
      >
        <FileText size={24} />
      </button>

      <button 
        onClick={() => navigate('/profil')} 
        className={`${isActive('/profil') ? 'text-blue-600 scale-110' : 'text-gray-300'} transition-all`}
      >
        <Settings size={24} />
      </button>
    </nav>
  );
}