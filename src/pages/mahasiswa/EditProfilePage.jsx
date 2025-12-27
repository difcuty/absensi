import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, TrendingUp, FileText, Settings, LogOut, ScanFace } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import Hook dan Service
import { useFaceAI } from '../../hooks/useFaceAI';
import { getProfile, updateProfile } from '../../services/authServices'; // Menggunakan authServices sesuai kode lama Anda

import arrowLeft from '../../assets/img/Arrow - Left.png';
import cameraIcon from '../../assets/img/25.Camera-Front (1).svg';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const { loadModels, detectFace, stopCamera } = useFaceAI();

  // UI States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);

  // Data States
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    jurusan: 'ti',
    semester: '1',
    kelas: 'A'
  });

  // Fungsi Helper untuk membersihkan URL Foto (Sesuai Logika Kode Lama)
  const getSanitizedImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/150";
    if (url.startsWith('blob:')) return url;
    
    const apiBase = import.meta.env.VITE_API_URL;
    // Ganti localhost ke URL tunnel jika ada
    const cleanUrl = url.replace('http://localhost:3000', apiBase);
    
    return cleanUrl.startsWith('http') ? cleanUrl : `${apiBase}${cleanUrl}`;
  };

  useEffect(() => {
    const initPage = async () => {
      const userString = localStorage.getItem("user");
      if (!userString) return navigate('/login');
      const user = JSON.parse(userString);

      try {
        setLoading(true);
        // Load AI Models
        await loadModels();

        // Load Profile Data
        const data = await getProfile(user.email);
        
        if (data) {
          setFormData({
            name: data.name || user.name || '',
            jurusan: data.jurusan || user.jurusan || 'ti',
            semester: data.semester || user.semester || '1',
            kelas: data.kelas || user.kelas || 'A'
          });
          
          // Set Preview menggunakan logika sanitize
          setPreview(data.foto_url);
          setFaceDescriptor(data.face_descriptor);

          const roleTetap = user.role || user.Role || data.role || data.Role;
          localStorage.setItem("user", JSON.stringify({ ...user, ...data, role: roleTetap }));
        }
      } catch (err) {
        console.error("Gagal load profil:", err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, [loadModels, navigate]);

  const startFaceScan = async () => {
    setIsFaceModalOpen(true);
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        alert("Kamera tidak dapat diakses");
        setIsFaceModalOpen(false);
      }
    }, 300);
  };

  const handleCaptureFace = async () => {
    const detection = await detectFace(videoRef);
    if (detection) {
      setFaceDescriptor(JSON.stringify(Array.from(detection.descriptor)));
      alert("✅ Wajah berhasil dipindai!");
      handleCloseScanner();
    } else {
      alert("❌ Wajah tidak terdeteksi.");
    }
  };

  const handleCloseScanner = () => {
    stopCamera(videoRef);
    setIsFaceModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    
    const data = new FormData();
    data.append("email", user.email);
    data.append("name", formData.name);
    data.append("jurusan", formData.jurusan);
    data.append("semester", formData.semester);
    data.append("kelas", formData.kelas);
    if (file) data.append("foto", file);
    if (faceDescriptor) data.append("face_descriptor", faceDescriptor);

    try {
      setSubmitting(true);
      const result = await updateProfile(data);
      
      const roleLama = user.role || user.Role;
      localStorage.setItem("user", JSON.stringify({ ...user, ...result, role: roleLama }));
      
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
        <div className="max-w-md mx-auto flex items-center">
          <button type="button" onClick={() => navigate(-1)} className="mr-4 p-1 hover:bg-gray-100 rounded-full">
            <img src={arrowLeft} alt="Back" className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">Edit Profil</h1>
        </div>
      </header>

      <main className="p-6 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* FOTO PROFILE DENGAN LOGIKA SANITIZE */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img 
                src={getSanitizedImageUrl(preview)} 
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md" 
                alt="Profile" 
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 p-2.5 rounded-full cursor-pointer shadow-lg hover:bg-blue-700">
                <img src={cameraIcon} className="w-5 h-5" alt="camera" />
                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                  const f = e.target.files[0];
                  if(f) {
                    setFile(f);
                    setPreview(URL.createObjectURL(f));
                  }
                }} />
              </label>
            </div>
          </div>

          {/* INPUT FORM */}
          <div className="space-y-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <input 
                className="w-full mt-1 p-4 border border-gray-100 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
            {/* Field lainnya sama seperti kode Anda sebelumnya */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jurusan</label>
              <select className="w-full mt-1 p-4 border border-gray-100 rounded-2xl bg-gray-50 outline-none" value={formData.jurusan} onChange={(e) => setFormData({...formData, jurusan: e.target.value})}>
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

          {/* UI SCAN WAJAH */}
          <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-2xl ${faceDescriptor ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                <ScanFace size={24} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-800">Scan Wajah</h3>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                  {faceDescriptor ? "✅ Sudah Terdaftar" : "❌ Belum Terdaftar"}
                </p>
              </div>
            </div>
            <button type="button" onClick={startFaceScan} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all">
              {faceDescriptor ? "Update" : "Daftar"}
            </button>
          </div>

          <button type="submit" disabled={submitting} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 disabled:bg-gray-400 uppercase tracking-widest text-sm transition-all active:scale-95">
            {submitting ? "MEMPROSES..." : "SIMPAN PERUBAHAN"}
          </button>
        </form>
      </main>

      {/* MODAL SCANNER */}
      <AnimatePresence>
        {isFaceModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-6 backdrop-blur-md">
            <div className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
            </div>
            <h2 className="text-white mt-8 font-bold text-center">Pindai Wajah Anda</h2>
            <div className="mt-10 flex space-x-4 w-full max-w-xs">
              <button onClick={handleCloseScanner} className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-bold uppercase text-xs">Batal</button>
              <button onClick={handleCaptureFace} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs">Ambil Data</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      <button onClick={() => navigate('/dashboard')} className={`${isActive('/dashboard') ? 'text-blue-600' : 'text-gray-300'}`}><Home size={24} /></button>
      <button onClick={() => navigate('/jadwal-kuliah')} className={`${isActive('/jadwal-kuliah') ? 'text-blue-600' : 'text-gray-300'}`}><BookOpen size={24} /></button>
      <button className="text-gray-300"><TrendingUp size={24} /></button>
      <button onClick={() => navigate('/izin')} className={`${isActive('/izin') ? 'text-blue-600' : 'text-gray-300'}`}><FileText size={24} /></button>
      <button onClick={() => navigate('/profil')} className={`${isActive('/profil') || isActive('/edit-profil') ? 'text-blue-600' : 'text-gray-300'}`}><Settings size={24} /></button>
    </nav>
  );
}