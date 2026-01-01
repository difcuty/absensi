import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import * as faceapi from 'face-api.js';

import { getProfile } from '../../services/authServices';
import { submitAbsensi } from '../../services/absensiService';
import { useFaceAI } from '../../hooks/useFaceAI'; 

// Import Footer Komponen Pusat
import BottomNav from '../../components/BottomNav';

import notifIcon from '../../assets/img/notifikasi.svg';
import qrIcon from '../../assets/img/qr.svg';
import jadwalIcon from '../../assets/img/jadwal.svg';
import riwayatIcon from '../../assets/img/riwayat.svg';
import izinIcon from '../../assets/img/izin.svg';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false); 
  
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isFaceVerifyOpen, setIsFaceVerifyOpen] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState('idle'); 
  const [tempQrData, setTempQrData] = useState(null);
  
  const scannerRef = useRef(null);
  const videoRef = useRef(null);
  const { detectFace, stopCamera: stopFaceCam } = useFaceAI();

  // 1. Load Face AI Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models'; 
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setIsModelsLoaded(true);
      } catch (err) {
        console.error("Gagal load model:", err);
      }
    };
    loadModels();
  }, []);

  // 2. Fetch User Data
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

  // 3. Logika Kamera QR
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
                setTempQrData(qrData);
                await handleCloseScanner();
                setIsFaceVerifyOpen(true);
              } catch (err) {
                alert("QR Code tidak valid.");
                handleCloseScanner();
              }
            },
            () => {} 
          );
        } catch (err) {
          console.error("Gagal memulai kamera QR:", err);
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

  // 4. Kamera Wajah Stream
  useEffect(() => {
    let stream = null;
    const enableFaceCamera = async () => {
      if (isFaceVerifyOpen && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' } 
          });
          videoRef.current.srcObject = stream;
        } catch (err) {
          alert("Gagal akses kamera depan.");
        }
      }
    };
    enableFaceCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [isFaceVerifyOpen]);

  // 5. Logika Verifikasi Wajah
  const handleVerifyFace = async () => {
    if (!isModelsLoaded) return alert("Sistem AI sedang bersiap, tunggu sebentar...");
    if (!user?.face_descriptor) return alert("Wajah belum terdaftar.");
    
    setVerifyStatus('scanning');
    try {
      const detection = await detectFace(videoRef);
      if (detection) {
        const registeredDescriptor = new Float32Array(JSON.parse(user.face_descriptor));
        const distance = faceapi.euclideanDistance(detection.descriptor, registeredDescriptor);

        if (distance < 0.45) { 
          setVerifyStatus('success');
          await handleProsesAbsensi(tempQrData);
          setTimeout(() => handleCloseFaceVerify(), 2000);
        } else {
          alert("Wajah tidak cocok.");
          setVerifyStatus('idle');
        }
      } else {
        alert("Wajah tidak terdeteksi.");
        setVerifyStatus('idle');
      }
    } catch (err) {
      setVerifyStatus('idle');
      alert("Error sistem verifikasi.");
    }
  };

  const handleProsesAbsensi = async (qrData) => {
    try {
      await submitAbsensi({
        nim: user?.npm,
        id_jadwal: qrData.id_jadwal,
        pertemuan: qrData.pertemuan,
        qr_timestamp: qrData.timestamp 
      });
    } catch (error) {
      console.error("Gagal kirim ke database");
    }
  };

  const handleCloseScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
      scannerRef.current.clear();
    }
    setIsScannerOpen(false);
  };

  const handleCloseFaceVerify = () => {
    stopFaceCam(videoRef);
    setIsFaceVerifyOpen(false);
    setVerifyStatus('idle');
  };

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
      <p className="text-gray-500 text-[10px] font-medium tracking-widest uppercase">Memuat Dashboard...</p>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-28">
      <style>{`
        #reader { border: none !important; border-radius: 2rem !important; }
        #reader video { width: 100% !important; height: 100% !important; object-fit: cover !important; border-radius: 2rem !important; }
        #reader__dashboard, #reader__status_span { display: none !important; }
      `}</style>

      {/* HEADER */}
      <header className="bg-white p-4 shadow-sm sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div onClick={() => navigate('/profil')} className="flex items-center space-x-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-blue-500 shadow-sm">
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
          <img src={notifIcon} alt="Notifikasi" className="w-6 h-6 cursor-pointer" />
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Kehadiran Hari Ini</h2>
            <p className="text-sm font-extrabold text-gray-800 mt-0.5">1/2 Matakuliah Selesai</p>
          </div>
          <div className="bg-green-100 text-green-600 text-[10px] font-black px-2 py-1 rounded-lg">50%</div>
        </div>

        <div className="bg-linear-to-br from-blue-600 to-blue-500 text-white rounded-4xl shadow-xl shadow-blue-100 p-8 flex flex-col items-center mb-8">
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

      {/* MODAL SCANNER */}
      <AnimatePresence>
        {isScannerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseScanner} className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 h-[85vh] bg-[#121212] rounded-t-[3rem] z-[70] overflow-hidden flex flex-col shadow-2xl">
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
                  <div id="reader" className="w-full h-full"></div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL VERIFIKASI WAJAH */}
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
                disabled={!isModelsLoaded || verifyStatus === 'scanning' || verifyStatus === 'success'}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-50"
              >
                {!isModelsLoaded ? "Menyiapkan AI..." : verifyStatus === 'scanning' ? "Memproses..." : "Verifikasi Sekarang"}
              </button>
              <button onClick={handleCloseFaceVerify} className="w-full py-4 bg-white/5 text-white/50 rounded-2xl font-bold uppercase text-[10px] tracking-widest">Batalkan</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panggil Footer Komponen */}
      <BottomNav />
    </div>
  );
}

// Sub Komponen Card Menu
function MenuCard({ icon, label, to }) {
  return (
    <Link to={to} className="flex flex-col items-center p-5 bg-white rounded-2xl shadow-sm border border-gray-50 active:scale-95 transition-all text-decoration-none">
      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
        <img src={icon} alt={label} className="w-6 h-6" />
      </div>
      <span className="text-[10px] font-black text-gray-500 uppercase text-center tracking-tighter">{label}</span>
    </Link>
  );
}