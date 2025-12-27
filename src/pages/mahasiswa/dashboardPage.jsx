import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, TrendingUp, FileText, Settings, X, Camera, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import * as faceapi from 'face-api.js'; // Pastikan library ini terinstal

// Import Services & Hooks
import { getProfile } from '../../services/authServices';
import { submitAbsensi } from '../../services/absensiService';
import { useFaceAI } from '../../hooks/useFaceAI'; 

// Import Ikon/Gambar (Tetap Sesuai Design Anda)
import notifIcon from '../../assets/img/notifikasi.svg';
import qrIcon from '../../assets/img/qr.svg';
import jadwalIcon from '../../assets/img/jadwal.svg';
import riwayatIcon from '../../assets/img/riwayat.svg';
import izinIcon from '../../assets/img/izin.svg';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State Scanner & Face Verify
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isFaceVerifyOpen, setIsFaceVerifyOpen] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState('idle'); // idle | scanning | success
  const [tempQrData, setTempQrData] = useState(null);
  
  const scannerRef = useRef(null);
  const videoRef = useRef(null);
  const { detectFace, stopCamera: stopFaceCam } = useFaceAI();

  // 1. Fetch User Data (Tetap)
  useEffect(() => {
    const fetchData = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser || !storedUser.email) {
        navigate('/login');
        return;
      }
      try {
        const latestData = await getProfile(storedUser.email);
        if (latestData) {
          const mergedData = { ...storedUser, ...latestData };
          setUser(mergedData);
          localStorage.setItem("user", JSON.stringify(mergedData));
        } else {
          setUser(storedUser);
        }
      } catch (error) {
        setUser(storedUser);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // 2. Logika Kamera QR (Design & Logika Tetap)
  useEffect(() => {
    if (isScannerOpen) {
      scannerRef.current = new Html5Qrcode("reader");
      const startScanner = async () => {
        try {
          await scannerRef.current.start(
            { facingMode: "environment" },
            { fps: 20, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
            async (decodedText) => {
              try {
                const qrData = JSON.parse(decodedText);
                setTempQrData(qrData); // Simpan data QR
                handleCloseScanner(); // Tutup Scanner
                setIsFaceVerifyOpen(true); // Buka Verifikasi Wajah
              } catch (err) {
                alert("QR Code tidak valid atau format salah.");
                handleCloseScanner();
              }
            },
            () => {} 
          );
        } catch (err) {
          console.error("Gagal memulai kamera:", err);
        }
      };
      startScanner();
    }
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => scannerRef.current.clear());
      }
    };
  }, [isScannerOpen]);

  // 3. Logika Verifikasi Wajah
  const handleVerifyFace = async () => {
    if (!user?.face_descriptor) {
      return alert("Data wajah belum terdaftar di profil Anda.");
    }

    setVerifyStatus('scanning');
    try {
      const detection = await detectFace(videoRef);
      if (detection) {
        const registeredDescriptor = new Float32Array(JSON.parse(user.face_descriptor));
        const distance = faceapi.euclideanDistance(detection.descriptor, registeredDescriptor);

        if (distance < 0.45) { // Cocok
          setVerifyStatus('success');
          await handleProsesAbsensi(tempQrData); // Panggil fungsi kirim DB asli Anda
          setTimeout(() => handleCloseFaceVerify(), 2000);
        } else {
          alert("Wajah tidak cocok. Gunakan wajah asli pemilik akun.");
          setVerifyStatus('idle');
        }
      } else {
        alert("Wajah tidak terdeteksi jelas.");
        setVerifyStatus('idle');
      }
    } catch (err) {
      setVerifyStatus('idle');
      alert("Terjadi kesalahan sistem verifikasi.");
    }
  };

  const handleProsesAbsensi = async (qrData) => {
    try {
      const result = await submitAbsensi({
        nim: user?.npm,
        id_jadwal: qrData.id_jadwal,
        pertemuan: qrData.pertemuan,
        qr_timestamp: qrData.timestamp 
      });

      if (result.success) {
        // Biarkan modal sukses terlihat sebentar
      } else {
        alert("Gagal Absen: " + result.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi ke server.");
    }
  };

  const handleCloseScanner = () => setIsScannerOpen(false);
  const handleCloseFaceVerify = () => {
    stopFaceCam(videoRef);
    setIsFaceVerifyOpen(false);
    setVerifyStatus('idle');
  };

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
      <p className="text-gray-500 text-sm font-medium tracking-widest uppercase text-[10px]">Memuat Dashboard...</p>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-28">
      <style>{`
        #reader { border: none !important; border-radius: 2rem !important; }
        #reader video { width: 100% !important; height: 100% !important; object-fit: cover !important; border-radius: 2rem !important; }
        #reader__dashboard, #reader__status_span { display: none !important; }
      `}</style>

      {/* HEADER (Sesuai Design Anda) */}
      <header className="bg-white p-4 shadow-sm sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div onClick={() => navigate('/profil')} className="flex items-center space-x-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-blue-500 transition-transform group-hover:scale-105 shadow-sm">
              <img 
                src={!user?.foto_url ? "https://via.placeholder.com/150" : user.foto_url.startsWith('http') ? user.foto_url.replace('http://localhost:3000', import.meta.env.VITE_API_URL) : `${import.meta.env.VITE_API_URL}${user.foto_url}`} 
                alt="Profile" className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 leading-tight">{user?.name || "Mahasiswa"}</p>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">{user?.npm || "NPM Tidak Tersedia"}</p>
            </div>
          </div>
          <img src={notifIcon} alt="Notifikasi" className="w-6 h-6 cursor-pointer hover:opacity-70 transition-opacity" />
        </div>
      </header>

      {/* MAIN CONTENT (Sesuai Design Anda) */}
      <main className="p-4 max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Kehadiran Hari Ini</h2>
            <p className="text-sm font-extrabold text-gray-800 mt-0.5">1/2 Matakuliah Selesai</p>
          </div>
          <div className="bg-green-100 text-green-600 text-[10px] font-black px-2 py-1 rounded-lg">50%</div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-[2rem] shadow-xl shadow-blue-100 p-8 flex flex-col items-center mb-8">
          <h2 className="text-base font-black mb-6 tracking-widest uppercase opacity-90">Absensi Mahasiswa</h2>
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="bg-white text-blue-600 font-black py-4 px-10 rounded-2xl shadow-2xl hover:bg-gray-50 transition active:scale-95 flex items-center space-x-3 w-full justify-center"
          >
            <img src={qrIcon} alt="QR" className="w-6 h-6" />
            <span className="tracking-tighter text-sm font-bold uppercase">Scan QR Sekarang</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <MenuCard icon={jadwalIcon} label="Jadwal" to="/jadwal-kuliah" />
          <MenuCard icon={riwayatIcon} label="Riwayat" to="/riwayat" />
          <MenuCard icon={izinIcon} label="Izin" to="/izin" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 relative overflow-hidden">
          <h2 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 relative z-10">Mata Kuliah Berikutnya</h2>
          <p className="text-lg font-black text-gray-900 leading-tight relative z-10">Basis Data</p>
          <div className="flex items-center space-x-2 mt-2 relative z-10">
            <span className="text-[10px] text-blue-600 font-black bg-blue-50 px-2 py-1 rounded-md border border-blue-100">R. 2.1</span>
            <span className="text-[10px] text-gray-400 font-bold italic">14:00 - 16:30 WIB</span>
          </div>
        </div>
      </main>

      {/* --- MODAL SCANNER (Design Anda) --- */}
      <AnimatePresence>
        {isScannerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseScanner} className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 h-[85vh] bg-[#121212] rounded-t-[3rem] z-[70] overflow-hidden flex flex-col shadow-2xl border-t border-white/10">
              <div className="w-full flex justify-center p-4"><div className="w-12 h-1.5 bg-white/20 rounded-full" /></div>
              <div className="px-8 flex justify-between items-center text-white mb-6">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Scan QR Absensi</h3>
                  <p className="text-xs text-white/40">Pastikan kode QR berada di dalam kotak</p>
                </div>
                <button onClick={handleCloseScanner} className="p-3 bg-white/10 rounded-full text-white"><X size={24} /></button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                <div className="relative w-full aspect-square max-w-[320px] overflow-hidden rounded-[2rem] bg-black shadow-2xl">
                  <div id="reader" className="w-full h-full overflow-hidden"></div>
                  <div className="absolute inset-0 pointer-events-none z-20">
                    <div className="absolute top-8 left-8 w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                    <div className="absolute top-8 right-8 w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                    <div className="absolute bottom-8 left-8 w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                    <div className="absolute bottom-8 right-8 w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
                    <motion.div animate={{ top: ["15%", "85%", "15%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute left-10 right-10 h-0.5 bg-blue-500 shadow-[0_0_15px_#3b82f6]" />
                  </div>
                </div>
                <div className="mt-12 flex items-center space-x-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                   <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Kamera Aktif</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- MODAL VERIFIKASI WAJAH (Design Baru Mengikuti Tema Anda) --- */}
      <AnimatePresence>
        {isFaceVerifyOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-6 backdrop-blur-md">
            <h2 className="text-white text-xl font-black mb-2 uppercase tracking-tight">Konfirmasi Biometrik</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-10">Arahkan wajah ke kamera</p>
            
            <div className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)] bg-gray-900">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
              
              {verifyStatus === 'success' && (
                <div className="absolute inset-0 bg-green-500/80 flex flex-col items-center justify-center text-white">
                  <CheckCircle2 size={64} className="mb-2" />
                  <span className="font-black text-xs uppercase tracking-widest">Berhasil</span>
                </div>
              )}
            </div>

            <div className="mt-12 w-full max-w-xs space-y-4">
              <button 
                onClick={handleVerifyFace}
                disabled={verifyStatus === 'scanning' || verifyStatus === 'success'}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50"
              >
                {verifyStatus === 'scanning' ? "Memproses..." : "Verifikasi Sekarang"}
              </button>
              <button 
                onClick={handleCloseFaceVerify}
                className="w-full py-4 bg-white/5 text-white/50 rounded-2xl font-bold uppercase text-[10px] tracking-widest"
              >
                Batalkan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

// --- SUB KOMPONEN (Design Anda) ---
function MenuCard({ icon, label, to }) {
  return (
    <Link to={to} className="flex flex-col items-center p-5 bg-white rounded-2xl shadow-sm border border-gray-50 hover:shadow-md hover:border-blue-100 transition-all active:scale-95 group text-decoration-none">
      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-50 transition-colors">
        <img src={icon} alt={label} className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </div>
      <span className="text-[10px] font-black text-gray-500 uppercase text-center leading-tight tracking-tighter">{label}</span>
    </Link>
  );
}

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  return (
    <nav className="fixed bottom-0 max-w-md w-full bg-white border-t border-gray-100 px-8 py-4 flex justify-between items-center z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] left-1/2 -translate-x-1/2">
      <button onClick={() => navigate('/dashboard')} className={`${isActive('/dashboard') ? 'text-blue-600 scale-110' : 'text-gray-300'} transition-all`}><Home size={24} strokeWidth={isActive('/dashboard') ? 3 : 2} /></button>
      <button onClick={() => navigate('/jadwal-kuliah')} className={`${isActive('/jadwal-kuliah') ? 'text-blue-600 scale-110' : 'text-gray-300'} transition-all`}><BookOpen size={24} strokeWidth={isActive('/jadwal-kuliah') ? 3 : 2} /></button>
      <button className="text-gray-300 hover:text-blue-600 transition-all"><TrendingUp size={24} strokeWidth={2} /></button>
      <button onClick={() => navigate('/izin')} className={`${isActive('/izin') ? 'text-blue-600 scale-110' : 'text-gray-300'} transition-all`}><FileText size={24} strokeWidth={isActive('/izin') ? 3 : 2} /></button>
      <button onClick={() => navigate('/profil')} className={`${isActive('/profil') ? 'text-blue-600 scale-110' : 'text-gray-300'} transition-all`}><Settings size={24} strokeWidth={isActive('/profil') ? 3 : 2} /></button>
    </nav>
  );
}