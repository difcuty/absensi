import { useState, useEffect } from 'react';
import { getMatkul, saveMatkul, deleteMatkul } from '../../../services/akademikService';

export default function MatkulTab() {
  const [matkuls, setMatkuls] = useState([]);
  const [form, setForm] = useState({ 
    kode: '', 
    nama: '', 
    prodi: 'TEKNIK INFORMATIKA S-1', 
    sem: '',
    sks: '' 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getMatkul();
      setMatkuls(data);
      generateNewCode(data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateNewCode = (data) => {
    if (!data || data.length === 0) {
      setForm(prev => ({ ...prev, kode: 'MK001' }));
      return;
    }
    const max = data.reduce((acc, curr) => {
      // Pastikan menggunakan properti kode_mk sesuai DB
      const num = parseInt(curr.kode_mk?.replace('MK', '')) || 0;
      return num > acc ? num : acc;
    }, 0);
    setForm(prev => ({ ...prev, kode: `MK${String(max + 1).padStart(3, '0')}` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama || !form.sem || !form.sks) return alert("Lengkapi Nama, Semester, dan SKS!");

    try {
      await saveMatkul({
        kode: form.kode,
        nama: form.nama,
        prodi: form.prodi,
        sem: form.sem,
        sks: form.sks 
      });
      
      alert("Mata Kuliah Berhasil Disimpan! ✅");
      // Reset form kecuali prodi
      setForm(prev => ({ ...prev, nama: '', sem: '', sks: '' })); 
      fetchData(); 
    } catch (err) {
      alert("Gagal simpan: " + err.message);
    }
  };

  const handleDelete = async (kode) => {
    if (window.confirm(`Hapus mata kuliah ${kode}?`)) {
      try {
        await deleteMatkul(kode);
        fetchData();
      } catch (err) {
        alert("Gagal menghapus: " + err.message);
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Memuat data mata kuliah...</div>;

  return (
    <div className="space-y-6">
      {/* --- FORM INPUT --- */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <h2 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">📚 Input Master Mata Kuliah</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kode MK</label>
            <input value={form.kode} readOnly className="w-full p-2 border rounded bg-gray-50 text-gray-500 outline-none" />
          </div>
          
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Mata Kuliah</label>
            <input 
              placeholder="Contoh: Algoritma & Pemrograman" 
              value={form.nama} 
              onChange={e => setForm({...form, nama: e.target.value})} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SKS</label>
            <input 
              type="number"
              placeholder="Contoh: 3" 
              value={form.sks} 
              onChange={e => setForm({...form, sks: e.target.value})} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Program Studi / Jurusan</label>
            <select 
              value={form.prodi} 
              onChange={e => setForm({...form, prodi: e.target.value})} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="TEKNIK INFORMATIKA S-1">TEKNIK INFORMATIKA</option>
              <option value="SISTEM INFORMASI S-1">SISTEM INFORMASI</option>
              <option value="SAINS DATA S-1">SAINS DATA</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Semester</label>
            <input 
              type="text"
              placeholder="Contoh: 1 atau III" 
              value={form.sem} 
              onChange={e => setForm({...form, sem: e.target.value})} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          <div className="lg:col-span-2 flex items-end">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-lg transition shadow-md">
              Simpan Mata Kuliah
            </button>
          </div>
        </form>
      </div>

      {/* --- LIST CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matkuls.map(m => (
          <div key={m.kode_mk} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 uppercase">
                {m.kode_mk}
              </span>
              <div className="flex gap-1">
                <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-100 uppercase">
                  {m.sks} SKS
                </span>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded uppercase border border-gray-100">
                  Sem: {m.sem} {/* Perbaikan: m.semester -> m.sem */}
                </span>
              </div>
            </div>
            
            {/* Perbaikan: m.nama_mk -> m.nama */}
            <h3 className="font-bold text-gray-900 leading-tight mb-1">{m.nama}</h3>
            {/* Perbaikan: m.jurusan -> m.prodi */}
            <p className="text-xs text-gray-500 mb-4">{m.prodi}</p>
            
            <div className="flex justify-end border-t pt-3 mt-auto">
              <button 
                onClick={() => handleDelete(m.kode_mk)}
                className="text-xs text-red-500 font-bold hover:text-red-700 transition flex items-center gap-1"
              >
                <span>Hapus</span>
                <span className="text-sm">🗑️</span>
              </button>
            </div>
          </div>
        ))}
        
        {matkuls.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-400 border-2 border-dashed rounded-xl">
            Belum ada mata kuliah yang diinput.
          </div>
        )}
      </div>
    </div>
  );
}