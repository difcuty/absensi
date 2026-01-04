import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, AlertCircle } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import { getRiwayat } from '../../services/absensiService';

const RiwayatPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [riwayatData, setRiwayatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) {
          navigate('/login');
          return;
        }
        setUser(storedUser);

        const mhsId = storedUser.id_mhs || storedUser.id;
        const response = await getRiwayat(mhsId);
        
        if (response.success) {
          setRiwayatData(response.data);
        } else {
          setError("Gagal memuat data riwayat.");
        }
      } catch (err) {
        setError(err.message || "Terjadi kesalahan koneksi.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <div className="bg-[#F3F4F6] min-h-screen pb-32">
      {/* HEADER USER */}
      <header className="bg-white p-4 flex items-center justify-between sticky top-0 z-20 border-b border-gray-100">
        <div className="max-w-md mx-auto w-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-blue-500 shadow-sm">
              <img 
                src={user?.foto_url || "https://via.placeholder.com/150"} 
                alt="Profile" 
                className="w-full h-full object-cover" 
                onError={(e) => { e.target.src = "https://via.placeholder.com/150" }}
              />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 leading-tight">{user?.name || "Mahasiswa"}</p>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">{user?.npm || "NPM Tidak Tersedia"}</p>
            </div>
          </div>
          <button className="p-2 bg-gray-50 rounded-full text-blue-500 shadow-sm active:scale-90 transition">
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* TOP NAVIGATION BAR */}
      <div className="bg-white px-4 py-4 flex items-center shadow-sm max-w-md mx-auto sticky top-[73px] z-10">
        <button onClick={() => navigate('/dashboard')} className="mr-4 p-1 hover:bg-gray-100 rounded-full transition">
          <ChevronLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="flex-1 text-center text-base font-black text-gray-800 pr-10 uppercase tracking-tight">
          Riwayat Kehadiran
        </h1>
      </div>

      {/* CONTENT LIST */}
      <main className="p-4 space-y-4 max-w-md mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-bold text-gray-400 mt-4 tracking-widest uppercase">Sinkronisasi Data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-3xl text-center border border-red-100 mt-10">
            <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
            <p className="text-sm text-red-600 font-bold">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-xs font-black text-red-700 underline uppercase">Coba Lagi</button>
          </div>
        ) : riwayatData.length > 0 ? (
          riwayatData.map((item) => (
            <div 
              key={item.id_jadwal} 
              className="bg-white rounded-2xl p-5 shadow-sm border border-transparent hover:border-blue-100 transition-all active:scale-[0.98] group"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-[13px] font-extrabold text-gray-900 uppercase leading-tight flex-1 pr-4">
                  {item.matkul}
                </h3>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${item.persen >= 75 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                  {item.persen}%
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-4">
                Dosen: <span className="text-gray-600">{item.dosen || 'Belum Diatur'}</span>
              </p>
              
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${item.persen >= 75 ? 'bg-green-500' : 'bg-orange-500'}`} 
                  style={{ width: `${item.persen}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                  {item.hadir} / 7 Pertemuan Tercatat
                </p>
                {item.persen < 75 && (
                  <span className="text-[8px] font-black text-orange-500 uppercase italic">Kurang dari target!</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="mt-10 bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
            <div className="text-4xl mb-4 opacity-30">📊</div>
            <h4 className="text-sm font-bold text-gray-800">Data Tidak Ditemukan</h4>
            <p className="text-[11px] text-gray-400 mt-1 uppercase leading-relaxed">
               Pastikan semester profil & jadwal sudah sinkron (Angka vs Romawi).
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default RiwayatPage;