import React, { useState, useEffect } from 'react';
import { Bell, Home, List, BarChart2, FileText, Settings, QrCode, ExternalLink } from 'lucide-react';
// Import fungsi service
import { getPendingIzinCount } from '../../services/dosenService';

const DosenDashboard = () => {
  const [jumlahIzin, setJumlahIzin] = useState(0);
  const [loading, setLoading] = useState(true);

  // LOGIKA BISNIS: Fetch data saat mounting
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Memanggil service, bukan fetch langsung
      const total = await getPendingIzinCount();
      setJumlahIzin(total);
    } catch (err) {
      // Logika penanganan error UI (misal: tampilkan toast)
      console.error("UI Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* HEADER */}
      <header className="bg-white p-4 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-blue-500">
              <img src="https://via.placeholder.com/150" alt="Profil" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Dr. Budi Onhar S.Kom, M.Kom</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Basis Data</p>
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
                <p className="text-3xl font-black mb-1">Basis Data - 2.1</p>
                <p className="text-sm opacity-90">Jam GHI (14:00 - 16:30)</p>
                
                <div className="flex flex-col items-center mt-8">
                  <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-xl shadow-xl hover:bg-blue-50 transition active:scale-95 flex items-center gap-2 w-full justify-center">
                    <QrCode size={20} />
                    BUKA SESI & GENERATE QR
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
                  <StatRow label="Hadir Tepat Waktu" value="-" color="text-emerald-600" />
                  <StatRow label="Terlambat" value="-" color="text-orange-500" />
                  <StatRow label="Belum Absen" value="-" color="text-gray-400" />
                </div>
              </div>
              <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline mt-4">
                Lihat Detail <ExternalLink size={14} />
              </button>
            </section>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* MINI CARD: IZIN */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Izin Baru</h3>
              <p className="text-4xl font-black text-gray-800">{loading ? '...' : jumlahIzin}</p>
              <button className="mt-4 w-full py-2 border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-xs uppercase">
                Tinjau
              </button>
            </div>
            
            {/* MINI CARD: PERSENTASE */}
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

// Komponen Kecil (Helper) untuk merapikan kode
const StatRow = ({ label, value, color }) => (
  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
    <span className="text-gray-600 text-sm">{label}</span>
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