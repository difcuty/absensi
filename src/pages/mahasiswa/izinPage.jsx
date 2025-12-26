import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, TrendingUp, FileText, Settings } from 'lucide-react';
import { submitIzin, getMatkulByData } from '../../services/izinService';
import arrowLeft from '../../assets/img/Arrow - Left.png';

export default function IzinPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [jenisIzin, setJenisIzin] = useState('SAKIT');
  const [fileName, setFileName] = useState('');
  const [listMatkul, setListMatkul] = useState([]);
  const [selectedDosen, setSelectedDosen] = useState(''); 
  
  const [formData, setFormData] = useState({
    tanggal_izin: new Date().toISOString().split("T")[0],
    mata_kuliah: '',
    nidn_dosen: '', 
    alasan: '',
    surat_izin: null
  });

  // 1. Load Data Matkul
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.npm) {
      alert("Silakan login ulang.");
      navigate('/login');
      return;
    }

    const fetchMatkul = async () => {
      try {
        const data = await getMatkulByData(user.jurusan, user.semester);
        setListMatkul(data);
      } catch (err) {
        console.error(err.message);
        // Data Dummy
        setListMatkul([
          { nama_matkul: "Praktik RPL", nama_dosen: "Budi M.Kom", nidn: "12345" },
          { nama_matkul: "Basis Data", nama_dosen: "Siti M.T", nidn: "67890" }
        ]);
      }
    };
    fetchMatkul();
  }, [navigate]);

  const handleMatkulChange = (e) => {
    const matkulNama = e.target.value;
    const found = listMatkul.find(item => item.nama_matkul === matkulNama);
    
    setFormData({ 
      ...formData, 
      mata_kuliah: matkulNama,
      nidn_dosen: found ? found.nidn : '' 
    });
    setSelectedDosen(found ? found.nama_dosen : '');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, surat_izin: file });
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));

    if (!formData.mata_kuliah) return alert("Pilih mata kuliah!");

    const data = new FormData();
    data.append("npm", user.npm);
    data.append("jenis_izin", jenisIzin);
    data.append("tanggal_izin", formData.tanggal_izin);
    data.append("mata_kuliah", formData.mata_kuliah);
    data.append("nidn", formData.nidn_dosen);
    data.append("alasan", formData.alasan);
    if (formData.surat_izin) data.append("surat_izin", formData.surat_izin);

    try {
      setLoading(true);
      await submitIzin(data);
      alert("Pengajuan izin berhasil terkirim ke Dosen!");
      navigate('/dashboard');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-32"> {/* Tambah padding bottom agar tidak tertutup footer */}
      {/* HEADER */}
      <header className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-50">
        <button onClick={() => navigate('/dashboard')} className="w-6 h-6 mr-4 outline-none">
          <img src={arrowLeft} alt="Kembali" className="w-full h-full object-contain" />
        </button>
        <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">Pengajuan Izin</h1>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* JENIS IZIN */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Jenis Ketidakhadiran</label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <button type="button" onClick={() => setJenisIzin('SAKIT')}
                className={`py-4 rounded-2xl font-black transition-all text-sm ${jenisIzin === 'SAKIT' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' : 'bg-white border border-gray-100 text-gray-400'}`}>
                SAKIT
              </button>
              <button type="button" onClick={() => setJenisIzin('IZIN')}
                className={`py-4 rounded-2xl font-black transition-all text-sm ${jenisIzin === 'IZIN' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' : 'bg-white border border-gray-100 text-gray-400'}`}>
                IZIN
              </button>
            </div>
          </div>

          {/* PILIH MATKUL */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mata Kuliah</label>
            <select
              name="mata_kuliah"
              value={formData.mata_kuliah}
              onChange={handleMatkulChange}
              required
              className="w-full mt-2 p-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800 text-sm appearance-none"
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {listMatkul.map((mk, i) => (
                <option key={i} value={mk.nama_matkul}>{mk.nama_matkul}</option>
              ))}
            </select>
            
            {/* INFO DOSEN */}
            <div className={`mt-4 pt-4 border-t border-dashed border-gray-200 transition-all duration-300 ${selectedDosen ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
              <p className="text-[10px] font-black text-gray-400 uppercase">Dosen Pengampu</p>
              <p className="text-sm font-extrabold text-blue-600 mt-1">{selectedDosen}</p>
            </div>
          </div>

          {/* TANGGAL & ALASAN */}
          <div className="space-y-4">
            <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tanggal Absen</label>
                <input type="date" name="tanggal_izin" value={formData.tanggal_izin} onChange={(e) => setFormData({...formData, tanggal_izin: e.target.value})}
                className="w-full mt-2 p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800" required />
            </div>
            
            <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Keterangan Alasan</label>
                <textarea name="alasan" rows="3" value={formData.alasan} onChange={(e) => setFormData({...formData, alasan: e.target.value})}
                placeholder="Tulis alasan Anda..." className="w-full mt-2 p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800" required />
            </div>
          </div>

          {/* FILE UPLOAD */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bukti Dukung (PDF/JPG)</label>
            <label className="mt-2 flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer bg-white hover:bg-blue-50 transition-colors group">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                <FileText className="text-blue-600 w-6 h-6" />
              </div>
              <span className="text-gray-500 font-bold text-xs">{fileName || "Unggah Surat Izin / Bukti"}</span>
              <p className="text-[9px] text-gray-400 mt-1 uppercase font-black">Maksimal 2MB</p>
              <input type="file" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black text-lg rounded-[2rem] shadow-xl shadow-blue-100 hover:shadow-2xl active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest">
            {loading ? "MENGIRIM..." : "KIRIM SEKARANG"}
          </button>
        </form>
      </main>

      {/* FOOTER NAV */}
      <BottomNav />
    </div>
  );
}

// Sub-komponen Bottom Navigation (Konsisten dengan Dashboard)
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