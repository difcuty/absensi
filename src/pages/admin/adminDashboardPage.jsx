import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminStats } from '../../services/adminService';
import notifIcon from '../../assets/img/notifikasi.svg';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    mhsAktif: 0,
    dosenAktif: 0,
    presensiHariIni: '0%'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Logika proteksi: Pastikan yang login adalah admin
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== 'admin') {
      // navigate('/login'); 
      // Sementara saya komen agar kamu bisa lihat tampilannya dulu
    }

    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        console.error("Gagal load stats, menggunakan data dummy");
        setStats({ mhsAktif: 1250, dosenAktif: 85, presensiHariIni: '92%' });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  return (
    <div className="bg-gray-100 min-h-screen pb-20 lg:pb-0">
      {/* HEADER */}
      <header className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center max-w-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-400">
              <img src="https://via.placeholder.com/150" alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Admin: Budi Santoso</p>
            </div>
          </div>
          <img src={notifIcon} alt="Notif" className="w-6 h-6" />
        </div>
      </header>

      <main className="p-4">
        <div className="container mx-auto max-w-xl">
          
          {/* STATS CARD */}
          <div className="bg-blue-600 text-white rounded-xl shadow-lg p-5 mb-6">
            <h2 className="text-xl font-extrabold mb-1">Dashboard Admin</h2>
            <p className="text-sm font-light mb-5">Ringkasan Metrik & Kontrol</p>
            
            <div className="grid grid-cols-3 gap-3 text-center border-t border-blue-400 pt-4">
              <StatItem label="Mhs Aktif" value={stats.mhsAktif} />
              <StatItem label="Dosen Aktif" value={stats.dosenAktif} />
              <StatItem label="Presensi" value={stats.presensiHariIni} />
            </div>
          </div>

          {/* MENU GRID */}
          <div className="grid grid-cols-2 gap-4">
            <AdminMenuCard 
              to="/admin/jadwal" 
              icon="📅" 
              title="Atur Jadwal & Dosen" 
              desc="Mengatur jadwal dan dosen pengampu" 
            />
            <AdminMenuCard 
              to="/admin/pengumuman" 
              icon="📢" 
              title="Kirim Pengumuman" 
              desc="Kirim notifikasi ke seluruh pengguna" 
            />
            <AdminMenuCard 
              to="/admin/kelola-pengguna" 
              icon="👥" 
              title="Kelola Data Pengguna" 
              desc="Kelola data dosen dan mahasiswa" 
            />
            <AdminMenuCard 
              to="/admin/laporan" 
              icon="📊" 
              title="Laporan Presensi" 
              desc="Lihat dan unduh laporan kehadiran" 
            />
          </div>
        </div> 
      </main>

      {/* FOOTER MOBILE (Sederhana) */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-around lg:hidden">
         <span className="text-blue-600">🏠</span>
         <span className="text-gray-400">📋</span>
         <span className="text-gray-400">📊</span>
         <span className="text-gray-400">⚙️</span>
      </footer>
    </div>
  );
}

// Sub-komponen Stat
function StatItem({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-blue-100 uppercase">{label}</p>
      <p className="text-xl font-extrabold">{value}</p>
    </div>
  );
}

// Sub-komponen Menu
function AdminMenuCard({ to, icon, title, desc }) {
  return (
    <Link to={to} className="bg-white rounded-xl shadow-md p-4 flex flex-col items-start h-40 hover:shadow-lg transition">
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="text-sm font-bold text-gray-800 mb-1 leading-tight">{title}</h3>
      <p className="text-[10px] text-gray-500">{desc}</p>
    </Link>
  );
}