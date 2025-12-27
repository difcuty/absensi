import React, { useState, useEffect } from 'react';
import { Bell, Home, List, BarChart2, FileText, Settings, QrCode, ExternalLink, X, ChevronRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
// Import fungsi service (pastikan path service Anda benar)
import { getPendingIzinCount, getProfilDosen, getJadwalDosen } from '../../services/dosenService';

const DosenDashboard = () => {
  // State Data
  const [jumlahIzin, setJumlahIzin] = useState(0);
  const [userData, setUserData] = useState(null);
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Monitoring Kehadiran (Real-time mockup)
  const [stats, setStats] = useState({ hadir: 0, terlambat: 0, belum: 0 });

  // State Modal QR
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1: Pilih MK, 2: Pilih Pertemuan, 3: QR
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [pertemuan, setPertemuan] = useState("");
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const identifier = storedUser.email || storedUser.kode_dosen;

      if (!identifier) return;

      const profile = await getProfilDosen(identifier);
      setUserData(profile);

      // Ambil Izin & Jadwal secara paralel
      const [totalIzin, daftarJadwal] = await Promise.all([
        getPendingIzinCount(profile.kode_dosen),
        getJadwalDosen(profile.kode_dosen)
      ]);

      setJumlahIzin(totalIzin);
      setJadwal(daftarJadwal);
    } catch (err) {
      console.error("UI Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = () => {
    if (!selectedJadwal || !pertemuan) return;
    
    // Data JSON untuk di-scan mahasiswa
    const payload = {
      id_jadwal: selectedJadwal.id_jadwal,
      kode_mk: selectedJadwal.kode_mk,
      pertemuan: pertemuan,
      timestamp: new Date().toISOString() // Untuk validasi 15 menit di backend
    };
    
    setQrValue(JSON.stringify(payload));
    setModalStep(3);
  };

  const closeAndResetModal = () => {
    setShowModal(false);
    setModalStep(1);
    setSelectedJadwal(null);
    setPertemuan("");
  };

  if (loading && !userData) {
      return (
          <div className="flex h-screen items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* HEADER */}
      <header className="bg-white p-4 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-blue-500">
              <img 
                src={userData?.foto_url || "https://via.placeholder.com/150"} 
                alt="Profil" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{userData?.nama}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                  NIDN: {userData?.nidn || "-"}
              </p>
            </div>
          </div>
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition">
            <Bell size={24} />
            {jumlahIzin > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="p-4 lg:py-8">
        <div className="container mx-auto max-w-4xl">
          
          <div className="grid lg:grid-cols-2 lg:gap-8 mb-6">
            {/* CARD: SESI AKTIF */}
            <section className="bg-blue-600 text-white rounded-2xl shadow-lg p-6 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-blue-100 text-sm font-semibold mb-2 uppercase tracking-widest">Sesi Kelas Saat Ini</h2>
                <p className="text-3xl font-black mb-1">
                    {modalStep === 3 ? selectedJadwal?.nama_mk : "Siap Mengajar?"}
                </p>
                <p className="text-sm opacity-90">
                    {modalStep === 3 ? `Pertemuan ${pertemuan} - Kelas ${selectedJadwal?.kelas}` : "Silakan buka sesi absensi"}
                </p>
                
                <div className="flex flex-col items-center mt-8">
                  <button 
                    onClick={() => setShowModal(true)}
                    className="bg-white text-blue-600 font-bold py-3 px-8 rounded-xl shadow-xl hover:bg-blue-50 transition active:scale-95 flex items-center gap-2 w-full justify-center"
                  >
                    <QrCode size={20} />
                    {modalStep === 3 ? "LIHAT QR CODE" : "BUKA SESI & GENERATE QR"}
                  </button>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500 rounded-full opacity-50"></div>
            </section>

            {/* CARD: MONITORING */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Pemantauan Kehadiran</h2>
                <div className="space-y-4">
                  <StatRow label="Hadir Tepat Waktu" value={stats.hadir} color="text-emerald-600" />
                  <StatRow label="Terlambat" value={stats.terlambat} color="text-orange-500" />
                  <StatRow label="Belum Absen" value={stats.belum} color="text-gray-400" />
                </div>
              </div>
              <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline mt-4">
                Lihat Detail <ExternalLink size={14} />
              </button>
            </section>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Izin Baru</h3>
              <p className="text-4xl font-black text-gray-800">{jumlahIzin}</p>
              <button className="mt-4 w-full py-2 border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-xs uppercase hover:bg-blue-600 hover:text-white transition">
                Tinjau
              </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Kehadiran</h3>
              <p className="text-4xl font-black text-blue-600">92%</p>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL OVERLAY (LOGIKA QR) */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 uppercase text-xs tracking-widest">Setup Absensi QR</h3>
              <button onClick={closeAndResetModal} className="p-1 hover:bg-gray-200 rounded-full"><X size={20}/></button>
            </div>

            <div className="p-6">
              {/* STEP 1: PILIH JADWAL */}
              {modalStep === 1 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 mb-2">Pilih Mata Kuliah Hari Ini:</p>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {jadwal.map((j) => (
                      <button 
                        key={j.id_jadwal}
                        onClick={() => { setSelectedJadwal(j); setModalStep(2); }}
                        className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition flex justify-between items-center group"
                      >
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{j.nama_mk}</p>
                          <p className="text-[10px] text-gray-500 uppercase">Kelas {j.kelas} • {j.hari} {j.jam}</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: INPUT PERTEMUAN */}
              {modalStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-sm font-bold text-blue-600">{selectedJadwal?.nama_mk}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Kelas {selectedJadwal?.kelas}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Input Pertemuan Ke-</label>
                    <input 
                      type="number" 
                      placeholder="Contoh: 1" 
                      className="w-full p-4 text-center text-2xl font-black bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none"
                      value={pertemuan}
                      onChange={(e) => setPertemuan(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setModalStep(1)} className="flex-1 py-3 text-sm font-bold text-gray-400">Kembali</button>
                    <button 
                      disabled={!pertemuan}
                      onClick={handleGenerateQR}
                      className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg disabled:bg-gray-200"
                    >
                      Generate QR
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: TAMPIL QR CODE */}
              {modalStep === 3 && (
                <div className="flex flex-col items-center space-y-6">
                  <div className="p-6 bg-white border-8 border-blue-50 rounded-[2.5rem] shadow-inner">
                    <QRCodeSVG value={qrValue} size={200} level="H" includeMargin={true} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-800">{selectedJadwal?.nama_mk}</p>
                    <div className="flex gap-2 mt-1 justify-center">
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-bold uppercase">Pertemuan {pertemuan}</span>
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold uppercase">Kelas {selectedJadwal?.kelas}</span>
                    </div>
                  </div>
                  <button 
                    onClick={closeAndResetModal}
                    className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-600 hover:text-white transition"
                  >
                    Tutup Sesi & Selesai
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NAVIGASI */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-16 lg:hidden z-50">
        <nav className="flex justify-around items-center h-full">
          <NavItem icon={<Home size={22} />} active />
          <NavItem icon={<List size={22} />} />
          <NavItem icon={<BarChart2 size={22} />} />
          <NavItem icon={<FileText size={22} />} />
          <NavItem icon={<Settings size={22} />} />
        </nav>
      </footer>
    </div>
  );
};

const StatRow = ({ label, value, color }) => (
    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
      <span className="text-gray-600 text-sm font-medium">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
);

const NavItem = ({ icon, active = false }) => (
    <button className={`flex flex-col items-center justify-center w-full transition ${active ? 'text-blue-600' : 'text-gray-400'}`}>
      {icon}
      {active && <span className="w-1 h-1 bg-blue-600 rounded-full mt-1"></span>}
    </button>
);

export default DosenDashboard;