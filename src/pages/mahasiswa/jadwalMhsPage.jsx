import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  Home, 
  BookOpen, 
  TrendingUp, 
  FileText, 
  Settings 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getJadwal, getDosen } from '../../services/akademikService';

const DAFTAR_HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Mapping untuk menyesuaikan input user dengan data di Database
const MAP_JURUSAN = {
  'ti': 'TEKNIK INFORMATIKA S-1',
  'si': 'SISTEM INFORMASI S-1',
  'sd': 'SAINS DATA S-1',
};

export default function JadwalMahasiswa() {
  const navigate = useNavigate();
  const [selectedHari, setSelectedHari] = useState('Senin');
  const [jadwal, setJadwal] = useState([]);
  const [dosenList, setDosenList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data user dari localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Ambil data secara paralel
      const [resJadwal, resDosen] = await Promise.all([getJadwal(), getDosen()]);
      
      // Pastikan res adalah array (menangani jika API membungkus dalam { data: [] })
      const allDosen = Array.isArray(resDosen) ? resDosen : (resDosen?.data || []);
      const allJadwal = Array.isArray(resJadwal) ? resJadwal : (resJadwal?.data || []);
      
      setDosenList(allDosen);

      // Normalisasi Jurusan
      const kodeJurusanUser = (user.jurusan || "").toLowerCase();
      const namaJurusanLengkap = MAP_JURUSAN[kodeJurusanUser] || kodeJurusanUser.toUpperCase();

      // Logika Filter yang diperketat dengan .trim() dan .toUpperCase()
      const filtered = allJadwal.filter(item => {
        const matchJurusan = String(item.jurusan || '').trim().toUpperCase() === namaJurusanLengkap.trim().toUpperCase();
        const matchHari = String(item.hari || '').trim().toUpperCase() === selectedHari.toUpperCase();
        return matchJurusan && matchHari;
      });

      // Urutkan berdasarkan jam
      const sorted = filtered.sort((a, b) => (String(a.jam) > String(b.jam) ? 1 : -1));
      setJadwal(sorted);

    } catch (err) {
      console.error("Gagal sinkronisasi jadwal:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedHari, user.jurusan]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatJam = (slot) => {
    const map = {
      'AB': '08:00 - 09:40',
      'ABC': '08:00 - 10:30',
      'CD': '09:40 - 11:20',
      'DEF': '13:00 - 15:30',
      'EF': '14:40 - 16:20',
      'GHI': '16:20 - 18:50',
      'JKL': '19:00 - 21:30'
    };
    return map[slot] || `Jam ${slot}`;
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex flex-col font-sans text-gray-800 shadow-xl relative pb-24">
      
      {/* HEADER NAV */}
      <div className="sticky top-0 z-50 shadow-sm bg-white">
        <div className="px-4 py-4 flex items-center justify-between border-b border-gray-100">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <h2 className="font-bold text-base text-gray-800">Jadwal Kuliah</h2>
          <div className="w-10"></div>
        </div>

        <div className="p-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-gray-100 bg-white">
          {DAFTAR_HARI.map((hari) => (
            <button
              key={hari}
              onClick={() => setSelectedHari(hari)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                selectedHari === hari 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                  : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {hari}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4">
        <div className="flex justify-between items-center mb-5 px-1">
          <div>
            <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest">{selectedHari}</h3>
            <p className="text-[10px] text-gray-500 font-medium italic">Data Realtime</p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-blue-50 text-blue-600 text-[9px] font-bold px-3 py-1 rounded-full border border-blue-100 uppercase">
              {user.jurusan || 'Mahasiswa'}
            </span>
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Memproses Data...</p>
          </div>
        ) : jadwal.length > 0 ? (
          <div className="space-y-4">
            {jadwal.map((item, index) => {
              // SINKRONISASI FIELD: Gunakan kode_dosen bukan dsn_kode
              const dosen = dosenList.find(d => String(d.kode_dosen) === String(item.kode_dosen));
              
              return (
                <div key={item.id_jadwal || index} className="bg-white rounded-2xl shadow-sm border-l-4 border-blue-600 p-4 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-blue-600 text-[11px] font-black italic tracking-tight">
                      {formatJam(item.jam)}
                    </span>
                    <div className="flex gap-1">
                      <span className="bg-blue-50 text-blue-500 text-[8px] font-bold px-2 py-0.5 rounded uppercase">
                        SMT {item.sem}
                      </span>
                      <span className="bg-gray-100 text-gray-500 text-[8px] font-bold px-2 py-0.5 rounded uppercase">
                        KLS {item.kelas}
                      </span>
                    </div>
                  </div>
                  
                  {/* SINKRONISASI FIELD: Gunakan nama_mk atau kode_mk */}
                  <h4 className="text-[14px] font-extrabold text-gray-900 leading-tight mb-3 uppercase">
                    {item.nama_mk || item.kode_mk || 'Mata Kuliah'}
                  </h4>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Dosen Pengampu</span>
                      <p className="text-[10px] text-gray-600 font-semibold truncate max-w-[180px]">
                        {dosen ? dosen.nama : (item.nama_dosen || 'Dosen Belum Diatur')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter block mb-0.5">Ruang</span>
                      <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase shadow-sm min-w-[30px] inline-block text-center">
                        {item.ruang || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-3xl opacity-60">📅</div>
            <h4 className="text-sm font-bold text-gray-800 mb-1">Tidak Ada Jadwal</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed px-4">
              Hari ini tidak ada jadwal perkuliahan untuk jurusan Anda.
            </p>
          </div>
        )}
      </main>

      {/* FOOTER NAV */}
      <nav className="fixed bottom-0 max-w-md w-full bg-white border-t border-gray-100 px-8 py-4 flex justify-between items-center z-50 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.06)]">
        <button onClick={() => navigate('/dashboard')} className="text-gray-300 hover:text-blue-600 transition-all"><Home size={24} /></button>
        <button className="text-blue-600 scale-125 transition-all"><BookOpen size={24} /></button>
        <button className="text-gray-300 hover:text-blue-600 transition-all"><TrendingUp size={24} /></button>
        <button onClick={() => navigate('/izin')} className="text-gray-300 hover:text-blue-600 transition-all"><FileText size={24} /></button>
        <button onClick={() => navigate('/profil')} className="text-gray-300 hover:text-blue-600 transition-all"><Settings size={24} /></button>
      </nav>

    </div>
  );
}