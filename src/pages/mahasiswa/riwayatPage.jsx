import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell } from 'lucide-react';
import BottomNav from '../../components/BottomNav'; // Sesuaikan path folder components kamu

const RiwayatPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [riwayatData, setRiwayatData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
      
      // Mockup Data
      const mockupData = [
        { id: 1, matkul: "etika profesi", dosen: "budi S.kom,M.kom", hadir: 6, total: 7, persen: 90 },
        { id: 2, matkul: "Algoritma", dosen: "budi S.kom,M.kom", hadir: 3, total: 7, persen: 90 },
        { id: 3, matkul: "Program Berorientasi Objek", dosen: "budi S.kom,M.kom", hadir: 7, total: 7, persen: 100 },
        { id: 4, matkul: "Pengantar Teknologi Buatan", dosen: "budi S.kom,M.kom", hadir: 6, total: 7, persen: 90 },
        { id: 5, matkul: "Sistem Operasi", dosen: "budi S.kom,M.kom", hadir: 7, total: 7, persen: 90 },
        { id: 6, matkul: "Rekayasa Perangkat Lunak", dosen: "budi S.kom,M.kom", hadir: 5, total: 7, persen: 80 },
        { id: 7, matkul: "Basis Data", dosen: "budi S.kom,M.kom", hadir: 7, total: 7, persen: 100 },
      ];
      setRiwayatData(mockupData);
      setLoading(false);
    };
    fetchData();
  }, []);

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
        <button onClick={() => navigate(-1)} className="mr-4 p-1 hover:bg-gray-100 rounded-full transition">
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
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-bold text-gray-400 mt-4 tracking-widest uppercase">Memuat Riwayat...</p>
          </div>
        ) : (
          riwayatData.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl p-5 shadow-sm border border-transparent hover:border-blue-100 transition-all active:scale-[0.98] group"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-base font-bold text-gray-900 capitalize leading-tight flex-1 pr-4">
                    {item.matkul}
                </h3>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${item.persen >= 90 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    {item.persen}%
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                dosen: {item.dosen}
              </p>
              <div className="mt-4 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full ${item.persen >= 90 ? 'bg-green-500' : 'bg-blue-500'}`} 
                    style={{ width: `${item.persen}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-tighter">
                {item.hadir}/{item.total} pertemuan tercatat
              </p>
            </div>
          ))
        )}
      </main>

      {/* FOOTER NAVIGASI */}
      <BottomNav />
    </div>
  );
};

export default RiwayatPage;