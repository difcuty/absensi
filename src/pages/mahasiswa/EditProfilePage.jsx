import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, TrendingUp, FileText, Settings, LogOut } from 'lucide-react';
import { getProfile, updateProfile } from '../../services/authServices';

import arrowLeft from '../../assets/img/Arrow - Left.png';
import cameraIcon from '../../assets/img/25.Camera-Front (1).svg';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    jurusan: 'ti',
    semester: '1',
    kelas: 'A'
  });

  useEffect(() => {
    const loadData = async () => {
      const userString = localStorage.getItem("user");
      if (!userString) return window.location.href = '/login';
      
      const user = JSON.parse(userString);

      try {
        setLoading(true);
        const data = await getProfile(user.email);
        
        if (data) {
          setFormData({
            name: data.name || user.name || '',
            jurusan: data.jurusan || user.jurusan || 'ti',
            semester: data.semester || user.semester || '1',
            kelas: data.kelas || user.kelas || 'A'
          });
          
          // UBAH DISINI: Membersihkan URL localhost menjadi link Serveo
          if (data.foto_url) {
            const sanitizedUrl = data.foto_url.startsWith('http') 
              ? data.foto_url.replace('http://localhost:3000', import.meta.env.VITE_API_URL)
              : `${import.meta.env.VITE_API_URL}${data.foto_url}`;
            setPreview(sanitizedUrl);
          }

          const roleTetap = user.role || user.Role || data.role || data.Role;
          const updatedStorage = { ...user, ...data, role: roleTetap };
          localStorage.setItem("user", JSON.stringify(updatedStorage));
        }
      } catch (err) {
        console.error("Gagal load profil:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = '/login';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userString = localStorage.getItem("user");
    const user = JSON.parse(userString);
    
    const data = new FormData();
    data.append("email", user.email);
    data.append("name", formData.name);
    data.append("jurusan", formData.jurusan);
    data.append("semester", formData.semester);
    data.append("kelas", formData.kelas);
    if (file) data.append("foto", file);

    try {
      setSubmitting(true);
      const result = await updateProfile(data);
      
      const roleLama = user.role || user.Role;
      const newUserSession = { ...user, ...result, role: roleLama };
      
      localStorage.setItem("user", JSON.stringify(newUserSession));
      alert("Profil berhasil diperbarui!");

      const target = roleLama?.toUpperCase() === 'ADMIN' ? '/admin' : 
                     roleLama?.toUpperCase() === 'DOSEN' ? '/dosen' : '/dashboard';
      
      window.location.href = target;
    } catch (err) {
      alert("Gagal update: " + err.message);
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      <header className="bg-white p-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button type="button" onClick={() => navigate(-1)} className="mr-4 p-1 hover:bg-gray-100 rounded-full">
              <img src={arrowLeft} alt="Back" className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">Edit Profil</h1>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img 
                // UBAH DISINI: Logika src agar mendukung blob (file baru) dan link dinamis Serveo
                src={
                  !preview 
                    ? "https://via.placeholder.com/150" 
                    : preview.startsWith('blob:') 
                      ? preview 
                      : preview.startsWith('http') 
                        ? preview.replace('http://localhost:3000', import.meta.env.VITE_API_URL)
                        : `${import.meta.env.VITE_API_URL}${preview}`
                } 
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md" 
                alt="Profile" 
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 p-2.5 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-colors">
                <img src={cameraIcon} className="w-5 h-5" alt="camera" />
                <input type="file" className="hidden" onChange={(e) => {
                  const f = e.target.files[0];
                  if(f) {
                    setFile(f);
                    setPreview(URL.createObjectURL(f));
                  }
                }} />
              </label>
            </div>
          </div>

          <div className="space-y-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <input 
                className="w-full mt-1 p-4 border border-gray-100 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jurusan</label>
              <select 
                className="w-full mt-1 p-4 border border-gray-100 rounded-2xl bg-gray-50 outline-none transition-all"
                value={formData.jurusan}
                onChange={(e) => setFormData({...formData, jurusan: e.target.value})}
              >
                <option value="ti">Teknik Informatika</option>
                <option value="si">Sistem Informasi</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Semester</label>
                <select className="w-full mt-1 p-4 border border-gray-100 rounded-2xl bg-gray-50" value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})}>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Smstr {s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kelas</label>
                <select className="w-full mt-1 p-4 border border-gray-100 rounded-2xl bg-gray-50" value={formData.kelas} onChange={(e) => setFormData({...formData, kelas: e.target.value})}>
                  <option value="A">Kelas A</option>
                  <option value="B">Kelas B</option>
                  <option value="C">Kelas C</option>
                  <option value="D">Kelas D</option>
                </select>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:bg-gray-400 transition-all active:scale-95 uppercase tracking-widest text-sm"
          >
            {submitting ? "MEMPROSES..." : "SIMPAN PERUBAHAN"}
          </button>

          <button 
            type="button"
            onClick={handleLogout}
            className="w-full py-4 bg-red-50 text-red-600 font-black rounded-2xl border border-red-100 flex items-center justify-center space-x-2 hover:bg-red-100 transition-all active:scale-95 uppercase tracking-widest text-sm"
          >
            <LogOut size={18} />
            <span>Keluar Akun</span>
          </button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 max-w-md w-full bg-white border-t border-gray-100 px-8 py-4 flex justify-between items-center z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] left-1/2 -translate-x-1/2">
      <button onClick={() => navigate('/dashboard')} className={`${isActive('/dashboard') ? 'text-blue-600 scale-110' : 'text-gray-300'} transition-all`}>
        <Home size={24} strokeWidth={isActive('/dashboard') ? 3 : 2} />
      </button>
      <button onClick={() => navigate('/jadwal-kuliah')} className={`${isActive('/jadwal-kuliah') ? 'text-blue-600 scale-110' : 'text-gray-300'} transition-all`}>
        <BookOpen size={24} strokeWidth={isActive('/jadwal-kuliah') ? 3 : 2} />
      </button>
      <button className="text-gray-300 hover:text-blue-600 transition-all"><TrendingUp size={24} strokeWidth={2} /></button>
      <button onClick={() => navigate('/izin')} className={`${isActive('/izin') ? 'text-blue-600 scale-110' : 'text-gray-300'} transition-all`}><FileText size={24} strokeWidth={isActive('/izin') ? 3 : 2} /></button>
      <button onClick={() => navigate('/profil')} className={`${isActive('/profil') ? 'text-blue-600 scale-110' : 'text-gray-300'} transition-all`}><Settings size={24} strokeWidth={isActive('/profil') ? 3 : 2} /></button>
    </nav>
  );
}