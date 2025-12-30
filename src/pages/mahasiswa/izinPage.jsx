import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, TrendingUp, FileText, Settings } from 'lucide-react';
import { submitIzin, getMatkulByData } from '../../services/izinService';
import arrowLeft from '../../assets/img/Arrow - Left.png';

export default function IzinPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [jenisIzin, setJenisIzin] = useState('SAKIT'); // Akan masuk ke kolom 'status'
  const [fileName, setFileName] = useState('');
  const [listJadwal, setListJadwal] = useState([]);
  const [selectedDosen, setSelectedDosen] = useState(''); 
  
  const [formData, setFormData] = useState({
    id_jadwal: '', // FK ke tabel jadwal
    pertemuan: '', // Kolom pertemuan di tabel absensi
    alasan: '',    // Akan masuk ke kolom 'keterangan'
    surat_izin: null
  });

  // 1. Load Data Jadwal Berdasarkan Semester Profil Mahasiswa
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.semester) {
      alert("Sesi berakhir atau profil tidak lengkap. Silakan login ulang.");
      navigate('/login');
      return;
    }

    const fetchJadwal = async () => {
      try {
        // Mengambil jadwal (backend akan mengonversi angka ke Romawi)
        const data = await getMatkulByData(user.semester);
        setListJadwal(data);
      } catch (err) {
        console.error("Gagal mengambil jadwal:", err.message);
        setListJadwal([]); // Set kosong jika error agar map tidak crash
      }
    };
    fetchJadwal();
  }, [navigate]);

  const handleJadwalChange = (e) => {
    const idJadwal = e.target.value;
    const found = listJadwal.find(item => item.id_jadwal.toString() === idJadwal);
    
    setFormData({ 
      ...formData, 
      id_jadwal: idJadwal 
    });
    setSelectedDosen(found ? found.nama_dosen : '');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran file (Max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("File terlalu besar! Maksimal 2MB.");
        return;
      }
      setFormData({ ...formData, surat_izin: file });
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));

    // 1. Validasi Keberadaan User & ID
    if (!user || (!user.id_mhs && !user.id)) {
      return alert("Sesi login tidak valid. Silakan login ulang.");
    }

    // 2. Validasi Input Form
    if (!formData.id_jadwal) return alert("Pilih mata kuliah!");
    if (!formData.pertemuan) return alert("Pilih pertemuan!");
    if (!formData.surat_izin) return alert("Wajib mengunggah bukti dukung (PDF/JPG)!");

    const data = new FormData();
    
    // 3. Mapping data ke FormData (Harus sesuai dengan req.body di Controller)
    // Gunakan user.id_mhs atau user.id (sesuai field di localStorage Anda)
    const mhsId = user.id_mhs || user.id;
    
    data.append("id_mhs", mhsId);
    data.append("id_jadwal", formData.id_jadwal);
    // Simpan pertemuan sebagai string (misal: "8") atau "Pertemuan 8"
    data.append("pertemuan", formData.pertemuan); 
    data.append("status", jenisIzin); // 'SAKIT' atau 'IZIN'
    data.append("keterangan", formData.alasan);
    
    // File upload (key "surat_izin" harus sama dengan multer di backend)
    data.append("surat_izin", formData.surat_izin);

    try {
      setLoading(true);
      await submitIzin(data);
      alert("✅ Pengajuan izin berhasil terkirim!");
      navigate('/dashboard');
    } catch (err) {
      console.error("Error submit:", err);
      alert(err.response?.data?.message || "Gagal mengirim izin. Periksa koneksi atau data Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      <header className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-50">
        <button onClick={() => navigate('/dashboard')} className="w-6 h-6 mr-4 outline-none hover:opacity-70 transition-opacity">
          <img src={arrowLeft} alt="Kembali" className="w-full h-full object-contain" />
        </button>
        <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">Pengajuan Izin</h1>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* KATEGORI */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Kategori Absen</label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {['SAKIT', 'IZIN'].map((item) => (
                <button 
                  key={item}
                  type="button" 
                  onClick={() => setJenisIzin(item)}
                  className={`py-4 rounded-2xl font-black transition-all text-sm ${jenisIzin === item ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' : 'bg-white border border-gray-100 text-gray-400'}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* MATKUL */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mata Kuliah</label>
            <select
              value={formData.id_jadwal}
              onChange={handleJadwalChange}
              required
              className="w-full mt-2 p-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800 text-sm appearance-none"
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {listJadwal.map((j) => (
                <option key={j.id_jadwal} value={j.id_jadwal}>
                  {j.nama_mk} - {j.kelas}
                </option>
              ))}
            </select>
            
            {selectedDosen && (
              <div className="mt-4 pt-4 border-t border-dashed border-gray-200 animate-pulse">
                <p className="text-[10px] font-black text-gray-400 uppercase">Dosen Pengampu</p>
                <p className="text-sm font-extrabold text-blue-600 mt-1">{selectedDosen}</p>
              </div>
            )}
          </div>

          {/* PERTEMUAN & ALASAN */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pertemuan Ke-</label>
              <select 
                value={formData.pertemuan} 
                onChange={(e) => setFormData({...formData, pertemuan: e.target.value})}
                className="w-full mt-2 p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800" 
                required
              >
                <option value="">-- Pilih Pertemuan --</option>
                {[...Array(16)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Pertemuan {i + 1}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alasan Detail</label>
              <textarea 
                rows="3" 
                value={formData.alasan} 
                onChange={(e) => setFormData({...formData, alasan: e.target.value})}
                placeholder="Berikan alasan yang jelas..." 
                className="w-full mt-2 p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800" 
                required 
              />
            </div>
          </div>

          {/* UPLOAD FILE */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bukti Dukung (PDF/JPG)</label>
            <label className={`mt-2 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl cursor-pointer bg-white transition-all group ${fileName ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-blue-50'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${fileName ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                <FileText size={24} />
              </div>
              <span className={`font-bold text-xs text-center ${fileName ? 'text-blue-700' : 'text-gray-500'}`}>
                {fileName || "Klik untuk unggah Bukti"}
              </span>
              <input type="file" onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" />
            </label>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black text-lg rounded-4xl shadow-xl shadow-blue-100 hover:shadow-2xl active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest">
            {loading ? "MENGIRIM..." : "KIRIM SEKARANG"}
          </button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 max-w-md w-full bg-white border-t border-gray-100 px-8 py-4 flex justify-between items-center z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] left-1/2 -translate-x-1/2">
      <button onClick={() => navigate('/dashboard')} className={`${isActive('/dashboard') ? 'text-blue-600 scale-110' : 'text-gray-300'} transition-all`}>
        <Home size={24} strokeWidth={isActive('/dashboard') ? 3 : 2} />
      </button>
      <button onClick={() => navigate('/jadwal-kuliah')} className={`${isActive('/jadwal-kuliah') ? 'text-blue-600 scale-110' : 'text-gray-300'} transition-all`}>
        <BookOpen size={24} strokeWidth={isActive('/jadwal-kuliah') ? 3 : 2} />
      </button>
      <button className="text-gray-300 hover:text-blue-600 transition-all">
        <TrendingUp size={24} strokeWidth={2} />
      </button>
      <button onClick={() => navigate('/izin')} className={`${isActive('/izin') ? 'text-blue-600 scale-110' : 'text-gray-300'} transition-all`}>
        <FileText size={24} strokeWidth={isActive('/izin') ? 3 : 2} />
      </button>
      <button onClick={() => navigate('/profil')} className={`${isActive('/profil') ? 'text-blue-600 scale-110' : 'text-gray-300'} transition-all`}>
        <Settings size={24} strokeWidth={isActive('/profil') ? 3 : 2} />
      </button>
    </nav>
  );
}