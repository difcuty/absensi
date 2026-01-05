import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminStats } from '../../services/adminService';
import { Home, BarChart3, Settings, Bell, LogOut, Users, Calendar, Megaphone, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    mhsAktif: 0,
    dosenAktif: 0,
    presensiHariIni: '0%'
  });
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState({ name: 'Admin' });

  useEffect(() => {
    // 1. Ambil data user dari localStorage
    const storedUser = localStorage.getItem("user");
    
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);

    // 2. Logika proteksi: Gunakan .toUpperCase() agar sinkron dengan Backend ('ADMIN')
    if (user.role?.toUpperCase() !== 'ADMIN') {
      console.warn("Akses ditolak: Role bukan ADMIN");
      navigate('/login');
      return;
    }

    setAdminData(user);

    // 3. Fetch Data Statistik
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getAdminStats();
        setStats({
          mhsAktif: data.mhsAktif || 0,
          dosenAktif: data.dosenAktif || 0,
          presensiHariIni: data.presensiHariIni || '0%'
        });
      } catch (err) {
        console.error("Gagal load statistik:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FD] min-h-screen pb-24 lg:pb-12 font-sans">
      {/* HEADER */}
      <header className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center max-w-4xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-blue-600 flex items-center justify-center text-white font-bold">
              {adminData.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Administrator</p>
              <p className="text-sm font-black text-gray-800 leading-none">{adminData.name || 'Admin'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button onClick={handleLogout} className="lg:flex hidden items-center gap-2 text-red-500 font-bold text-xs hover:bg-red-50 p-2 rounded-lg transition">
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 lg:py-8">
        <div className="container mx-auto max-w-4xl">
          
          {/* STATS CARD */}
          <section className="bg-gradient-to-br from-blue-800 to-blue-600 text-white rounded-[2.5rem] shadow-xl shadow-blue-200 p-8 mb-8 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-black mb-1 italic">Dashboard Panel</h2>
              <p className="text-xs font-medium text-blue-100 mb-8 uppercase tracking-[0.3em] opacity-80">Monitoring Sistem Real-time</p>
              
              <div className="grid grid-cols-3 gap-4 text-center bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                <StatItem label="Mhs Aktif" value={stats.mhsAktif} />
                <StatItem label="Dosen Aktif" value={stats.dosenAktif} />
                <StatItem label="Presensi" value={stats.presensiHariIni} />
              </div>
            </div>
            {/* Dekorasi Objek */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
          </section>

          {/* MENU GRID */}
          <div className="flex justify-between items-center mb-6 px-2">
             <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Menu Utama</h3>
             <div className="h-[1px] flex-1 bg-gray-200 ml-4"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AdminMenuCard 
              to="/admin/jadwal" 
              icon={<Calendar className="text-blue-600" size={28} />} 
              title="Jadwal" 
              desc="Atur ploting dosen" 
            />
            <AdminMenuCard 
              to="/admin/pengumuman" 
              icon={<Megaphone className="text-orange-500" size={28} />} 
              title="Blast" 
              desc="Kirim notifikasi" 
            />
            <AdminMenuCard 
              to="/admin/kelola-pengguna" 
              icon={<Users className="text-purple-600" size={28} />} 
              title="Pengguna" 
              desc="Mhs & Dosen" 
            />
            <AdminMenuCard 
              to="/admin/laporan" 
              icon={<FileText className="text-emerald-600" size={28} />} 
              title="Laporan" 
              desc="Rekap presensi" 
            />
          </div>
        </div> 
      </main>

      {/* FOOTER MOBILE */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-2 flex justify-around lg:hidden z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
         <NavItem icon={<Home size={22} />} label="Home" active />
         <NavItem icon={<Users size={22} />} label="Users" onClick={() => navigate('/admin/kelola-pengguna')} />
         <NavItem icon={<BarChart3 size={22} />} label="Grafik" onClick={() => navigate('/admin/laporan')} />
         <NavItem icon={<LogOut size={22} className="text-red-400" />} label="Keluar" onClick={handleLogout} />
      </footer>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-[10px] text-blue-100 uppercase font-black tracking-widest mb-1 opacity-70">{label}</p>
      <p className="text-2xl md:text-3xl font-black">{value}</p>
    </div>
  );
}

function AdminMenuCard({ to, icon, title, desc }) {
  return (
    <Link to={to} className="bg-white rounded-[2rem] border border-gray-50 shadow-sm p-5 flex flex-col items-center text-center h-48 hover:shadow-xl hover:shadow-blue-100 hover:-translate-y-1 transition-all group">
      <div className="bg-gray-50 p-4 rounded-2xl mb-4 group-hover:bg-blue-50 group-hover:scale-110 transition-all">
        {icon}
      </div>
      <h3 className="text-[11px] font-black text-gray-800 mb-1 leading-tight uppercase tracking-tighter">{title}</h3>
      <p className="text-[9px] text-gray-400 font-medium leading-tight px-2">{desc}</p>
    </Link>
  );
}

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center py-2 px-5 rounded-2xl transition-all ${active ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-400'}`}>
      {icon}
      <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">{label}</span>
    </button>
  );
}