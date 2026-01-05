import React, { useState, useEffect } from 'react';
import { ChevronLeft, Users, Search, FileSpreadsheet, BookOpen, UserCheck, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getJadwalDosen, getRekapKehadiranMahasiswa } from '../../services/dosenService';

const RiwayatKehadiran = () => {
  const navigate = useNavigate();
  const [jadwal, setJadwal] = useState([]);
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [rekapMhs, setRekapMhs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  // Target standar pertemuan satu semester
  const TARGET_PERTEMUAN = 14;

  useEffect(() => {
    fetchJadwal();
  }, []);

  const fetchJadwal = async () => {
    try {
      setLoading(true);
      const userString = localStorage.getItem("user");
      
      if (!userString) {
        navigate('/login');
        return;
      }

      const user = JSON.parse(userString);
      const identifier = user.id || user.kode_dosen || user.nidn;

      if (!identifier) {
        setError("ID Dosen tidak ditemukan. Harap login ulang.");
        return;
      }

      const data = await getJadwalDosen(identifier);
      setJadwal(data);
    } catch (err) {
      console.error("Gagal memuat jadwal:", err);
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  const handlePilihJadwal = async (j) => {
    setLoadingDetail(true);
    setSelectedJadwal(j);
    try {
      const data = await getRekapKehadiranMahasiswa(j.id_jadwal);
      setRekapMhs(data);
    } catch (err) {
      console.error("Gagal memuat rekap:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredMhs = rekapMhs.filter(mhs => 
    (mhs.nama && mhs.nama.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (mhs.npm && mhs.npm.toString().includes(searchTerm))
  );

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm font-medium text-gray-500 font-bold tracking-widest uppercase text-[10px]">Sinkronisasi Jadwal...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex h-screen items-center justify-center p-6 text-center">
        <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 max-w-sm shadow-xl shadow-red-100">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
            <h2 className="text-red-800 font-black mb-2 uppercase tracking-tight">Terjadi Kesalahan</h2>
            <p className="text-red-600/70 text-sm mb-6 font-medium leading-relaxed">{error}</p>
            <button onClick={() => navigate('/login')} className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-200">Kembali ke Login</button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      {/* HEADER */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 border-b border-gray-100">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => selectedJadwal ? setSelectedJadwal(null) : navigate('/dosen')} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <div>
                <h1 className="font-black text-gray-800 tracking-tight text-lg uppercase">Rekap Kehadiran</h1>
                {selectedJadwal && <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Target 14 Pertemuan</p>}
            </div>
          </div>
          {selectedJadwal && (
              <button className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-emerald-100 transition tracking-widest">
                  <FileSpreadsheet size={16} />
                  EXPORT
              </button>
          )}
        </div>
      </div>

      <main className="container mx-auto max-w-4xl p-4">
        {!selectedJadwal ? (
          /* STEP 1: DAFTAR MATA KULIAH */
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 px-1">
                <BookOpen size={18} className="text-blue-600" />
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Pilih Mata Kuliah</p>
            </div>
            
            <div className="grid gap-3">
              {jadwal.length > 0 ? jadwal.map((j) => (
                <button 
                  key={j.id_jadwal}
                  onClick={() => handlePilihJadwal(j)}
                  className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex justify-between items-center hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all group text-left"
                >
                  <div className="flex-1">
                    <p className="font-black text-gray-800 group-hover:text-blue-600 transition-colors text-lg leading-tight mb-2 uppercase">{j.nama_mk}</p>
                    <div className="flex gap-2">
                        <span className="text-[9px] bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-black uppercase tracking-widest">Kls {j.kelas}</span>
                        <span className="text-[9px] bg-gray-100 text-gray-500 px-3 py-1 rounded-lg font-black uppercase tracking-widest">{j.hari} • {j.jam}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all ml-4">
                    <ChevronLeft size={20} className="rotate-180" />
                  </div>
                </button>
              )) : (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border-4 border-dashed border-gray-100">
                    <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Data Jadwal Kosong</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* STEP 2: DETAIL REKAP MAHASISWA */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl font-black leading-tight mb-2 uppercase tracking-tight">{selectedJadwal.nama_mk}</h2>
                <div className="flex items-center gap-4 text-blue-100 text-[10px] font-black tracking-widest uppercase">
                   <span className="bg-white/20 px-3 py-1.5 rounded-xl border border-white/10">Kelas {selectedJadwal.kelas}</span>
                   <span className="flex items-center gap-2"><Users size={14}/> {rekapMhs.length} Mahasiswa</span>
                </div>
              </div>
              <BookOpen className="absolute -right-6 -bottom-6 text-white/10" size={160} />
            </div>

            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Cari Nama atau NPM..." 
                className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] border border-gray-100 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm font-medium"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              {loadingDetail ? (
                  <div className="p-24 text-center flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-blue-600" size={32} />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Menghitung Kehadiran...</p>
                  </div>
              ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Mahasiswa</th>
                            <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Hadir</th>
                            <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Progress Kehadiran</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {filteredMhs.length > 0 ? filteredMhs.map((mhs) => {
                            // Menghitung persentase berdasarkan target 14 pertemuan
                            const percent = Math.round((mhs.total_hadir / TARGET_PERTEMUAN) * 100);
                            
                            return (
                                <tr key={mhs.npm} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="p-6">
                                    <p className="font-black text-gray-800 group-hover:text-blue-600 transition-colors uppercase text-sm tracking-tight">{mhs.nama}</p>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-widest uppercase">{mhs.npm}</p>
                                </td>
                                <td className="p-6 text-center">
                                    <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-2xl group-hover:bg-white group-hover:border-blue-100 transition-all shadow-sm">
                                        <UserCheck size={14} className={mhs.total_hadir > 0 ? "text-emerald-500" : "text-gray-300"} />
                                        <span className="font-black text-gray-700 text-xs">
                                        {mhs.total_hadir} <span className="text-gray-400 font-bold">/ {TARGET_PERTEMUAN}</span>
                                        </span>
                                    </div>
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex flex-col items-end gap-1.5">
                                        <span className={`text-[10px] font-black tracking-widest ${percent < 75 ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {percent}%
                                        </span>
                                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${percent < 75 ? 'bg-gradient-to-r from-red-500 to-orange-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`} 
                                                style={{ width: `${Math.min(percent, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="3" className="p-24 text-center">
                                    <div className="flex flex-col items-center gap-2 text-gray-300">
                                        <Search size={48} className="opacity-20 mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Belum Ada Data Absensi</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RiwayatKehadiran;