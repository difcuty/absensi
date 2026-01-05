import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
// Pastikan service getPertemuanTerisi sudah diimport
import { submitIzin, getMatkulByData, getPertemuanTerisi } from '../../services/izinService';

import BottomNav from '../../components/BottomNav';
import arrowLeft from '../../assets/img/Arrow - Left.png';

export default function IzinPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [jenisIzin, setJenisIzin] = useState('SAKIT'); 
  const [fileName, setFileName] = useState('');
  const [listJadwal, setListJadwal] = useState([]);
  const [pertemuanTerisi, setPertemuanTerisi] = useState([]); // Untuk menyimpan riwayat DB
  const [selectedDosen, setSelectedDosen] = useState(''); 
  
  const [formData, setFormData] = useState({
    id_jadwal: '', 
    pertemuan: '', 
    alasan: '',    
    surat_izin: null
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return navigate('/login');

    const fetchJadwal = async () => {
      try {
        const data = await getMatkulByData(user.semester, user.kelas);
        setListJadwal(data);
      } catch (err) {
        console.error("Gagal ambil matkul:", err);
      }
    };
    fetchJadwal();
  }, [navigate]);

  // LOGIKA PENTING: Saat matkul dipilih, cek ke database pertemuan mana yang sudah absen
  const handleJadwalChange = async (e) => {
    const idJadwal = e.target.value;
    const user = JSON.parse(localStorage.getItem("user"));
    const found = listJadwal.find(item => item.id_jadwal.toString() === idJadwal);
    
    setFormData({ ...formData, id_jadwal: idJadwal, pertemuan: '' });
    setSelectedDosen(found ? found.nama_dosen : '');

    if (idJadwal && user) {
      try {
        const mhsId = user.id_mhs || user.id;
        // Panggil service untuk cek pertemuan yang sudah ada di tabel 'absensi'
        const terisi = await getPertemuanTerisi(mhsId, idJadwal);
        setPertemuanTerisi(terisi); 
      } catch (err) {
        console.error("Gagal cek pertemuan:", err);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("File maksimal 2MB!");
      setFormData({ ...formData, surat_izin: file });
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    if (!formData.pertemuan) return alert("Pilih pertemuan!");

    const data = new FormData();
    data.append("id_mhs", user.id_mhs || user.id);
    data.append("id_jadwal", formData.id_jadwal);
    data.append("pertemuan", formData.pertemuan); 
    data.append("status", jenisIzin); 
    data.append("keterangan", formData.alasan);
    data.append("surat_izin", formData.surat_izin);

    try {
      setLoading(true);
      await submitIzin(data);
      alert("✅ Pengajuan berhasil!");
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || "Gagal mengirim.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      <header className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-50">
        <button onClick={() => navigate('/dashboard')} className="w-6 h-6 mr-4">
          <img src={arrowLeft} alt="Back" className="w-full h-full object-contain" />
        </button>
        <h1 className="text-lg font-black uppercase tracking-tight">Pengajuan Izin</h1>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* KATEGORI */}
          <div className="grid grid-cols-2 gap-4">
            {['SAKIT', 'IZIN'].map((item) => (
              <button 
                key={item} type="button" 
                onClick={() => setJenisIzin(item)}
                className={`py-4 rounded-2xl font-black transition-all ${jenisIzin === item ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}>
                {item}
              </button>
            ))}
          </div>

          {/* MATA KULIAH */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mata Kuliah</label>
            <select
              value={formData.id_jadwal}
              onChange={handleJadwalChange}
              required
              className="w-full mt-2 p-3 bg-gray-50 rounded-xl font-bold text-gray-800 outline-none"
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {listJadwal.map((j) => (
                <option key={j.id_jadwal} value={j.id_jadwal}>{j.nama_mk}</option>
              ))}
            </select>
            {selectedDosen && <p className="text-sm font-extrabold text-blue-600 mt-2">{selectedDosen}</p>}
          </div>

          {/* PERTEMUAN - DISINI PERBAIKANNYA */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pilih Pertemuan (Maks 7)</label>
            <select 
              value={formData.pertemuan} 
              onChange={(e) => setFormData({...formData, pertemuan: e.target.value})}
              className="w-full mt-2 p-4 bg-white border border-gray-100 rounded-2xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500" 
              required
            >
              <option value="">-- Pilih Pertemuan --</option>
              {/* Loop hanya 7 kali, dan filter yang sudah terisi */}
              {[...Array(7)].map((_, i) => {
                const pNum = (i + 1).toString();
                if (!pertemuanTerisi.includes(pNum)) {
                  return <option key={pNum} value={pNum}>Pertemuan {pNum}</option>;
                }
                return null;
              })}
            </select>
          </div>

          {/* ALASAN & UPLOAD (Sama seperti sebelumnya) */}
          <textarea 
            rows="3" 
            value={formData.alasan} 
            onChange={(e) => setFormData({...formData, alasan: e.target.value})}
            placeholder="Alasan detail..." 
            className="w-full p-4 bg-white border border-gray-100 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />

          <label className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl cursor-pointer bg-white transition-all ${fileName ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
            <FileText className={fileName ? 'text-blue-600' : 'text-gray-300'} />
            <span className="font-bold text-xs mt-2 text-gray-500">{fileName || "Klik untuk unggah Bukti"}</span>
            <input type="file" onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" />
          </label>

          <button type="submit" disabled={loading}
            className="w-full py-5 bg-blue-600 text-white font-black text-lg rounded-4xl shadow-xl active:scale-95 disabled:opacity-50 transition-all uppercase">
            {loading ? "MENGIRIM..." : "KIRIM SEKARANG"}
          </button>
        </form>
      </main>
      <BottomNav />
    </div>
  );
}