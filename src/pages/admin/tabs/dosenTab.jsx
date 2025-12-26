import React, { useState, useEffect, useRef } from 'react';
import { getDosen, getMatkul, assignDosen, deleteDosenAssignment } from '../../../services/akademikService';

export default function DosenTab() {
  const [dosenList, setDosenList] = useState([]);
  const [matkulList, setMatkulList] = useState([]);
  const [namaInput, setNamaInput] = useState('');
  const [matkulInput, setMatkulInput] = useState('');
  const [loading, setLoading] = useState(true);
  
  // State Sugesi Dosen
  const [showDosenSuggestions, setShowDosenSuggestions] = useState(false);
  const [filteredDosen, setFilteredDosen] = useState([]);
  
  // State Sugesi Matkul
  const [showMatkulSuggestions, setShowMatkulSuggestions] = useState(false);
  const [filteredMatkul, setFilteredMatkul] = useState([]);
  
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Refs untuk menutup dropdown saat klik di luar
  const dosenRef = useRef(null);
  const matkulRef = useRef(null);

  useEffect(() => {
    loadInitialData();
    const handleClickOutside = (e) => {
      if (dosenRef.current && !dosenRef.current.contains(e.target)) setShowDosenSuggestions(false);
      if (matkulRef.current && !matkulRef.current.contains(e.target)) setShowMatkulSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [dataDsn, dataMk] = await Promise.all([getDosen(), getMatkul()]);
      setDosenList(dataDsn || []);
      setMatkulList(dataMk || []);
    } catch (err) {
      alert("Gagal memuat data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIKA DOSEN ---
  const handleDosenChange = (e) => {
    const value = e.target.value;
    setNamaInput(value);
    if (value.trim().length > 0) {
      const matches = dosenList.filter(d => d.nama.toLowerCase().includes(value.toLowerCase()));
      setFilteredDosen(matches);
      setShowDosenSuggestions(true);
    } else {
      setShowDosenSuggestions(false);
    }
  };

  const selectDosen = (nama) => {
    setNamaInput(nama);
    setShowDosenSuggestions(false);
  };

  // --- LOGIKA MATKUL ---
  const handleMatkulChange = (e) => {
    const value = e.target.value;
    setMatkulInput(value);
    const parts = value.split(',');
    const lastWord = parts[parts.length - 1].trim().toLowerCase();

    if (lastWord.length > 0) {
      const matches = matkulList.filter(m => m.nama.toLowerCase().includes(lastWord));
      setFilteredMatkul(matches);
      setShowMatkulSuggestions(true);
    } else {
      setShowMatkulSuggestions(false);
    }
  };

  const selectMatkul = (matkulName) => {
    const parts = matkulInput.split(',');
    parts.pop(); 
    const newVal = parts.length > 0 ? [...parts, ` ${matkulName}`].join(',') : matkulName;
    setMatkulInput(newVal + ', '); 
    setShowMatkulSuggestions(false);
  };

  const handleEditTrigger = (dosen) => {
    setIsEditMode(true);
    setNamaInput(dosen.nama);
    setMatkulInput(dosen.matkul_ajar);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (dosen) => {
    if (window.confirm(`Copot semua penugasan mengajar untuk ${dosen.nama}? (Akun dosen tidak akan dihapus)`)) {
      try {
        await deleteDosenAssignment(dosen.kode_dosen);
        alert("Penugasan berhasil dicopot! ✅");
        loadInitialData();
      } catch (err) {
        alert("Error: " + err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validasi Input Kosong
    if (!namaInput.trim() || !matkulInput.trim()) {
      return alert("Mohon lengkapi Nama Dosen dan Mata Kuliah!");
    }

    // 2. Validasi Dosen (Harus ada di daftar)
    const targetDosen = dosenList.find(d => d.nama.toLowerCase() === namaInput.trim().toLowerCase());
    if (!targetDosen) {
      return alert(`Dosen "${namaInput}" tidak ditemukan dalam daftar. Gunakan saran yang muncul.`);
    }

    // 3. Validasi Mata Kuliah (Semua yang diketik harus valid)
    const inputMatkulArray = matkulInput.split(',').map(m => m.trim()).filter(m => m !== "");
    const invalidMatkul = inputMatkulArray.filter(
      (nama) => !matkulList.some(m => m.nama.toLowerCase() === nama.toLowerCase())
    );

    if (invalidMatkul.length > 0) {
      return alert(`Mata kuliah berikut tidak terdaftar: ${invalidMatkul.join(', ')}`);
    }

    // 4. Proses Simpan
    try {
      const cleanMatkul = inputMatkulArray.join(', ');
      await assignDosen({ 
        kode: targetDosen.kode_dosen, 
        nama: targetDosen.nama, 
        matkul_ajar: cleanMatkul 
      });

      alert("Data berhasil diproses! ✨");
      setNamaInput(''); 
      setMatkulInput(''); 
      setIsEditMode(false);
      loadInitialData();
    } catch (err) { 
      alert("Error: " + err.message); 
    }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || "??";

  if (loading) return <div className="p-10 text-center font-bold text-gray-400">Memuat Data...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 font-sans">
      {/* --- FORM SECTION --- */}
      <div className={`p-6 rounded-2xl border-2 transition-all ${isEditMode ? 'border-orange-400 bg-orange-50' : 'border-gray-100 bg-white shadow-sm'}`}>
        <h2 className="text-xl font-bold mb-4">{isEditMode ? '✏️ Edit Penugasan' : '👨‍🏫 Tugaskan Dosen'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Dropdown Dosen */}
          <div className="relative" ref={dosenRef}>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Dosen</label>
            <input 
              type="text"
              value={namaInput}
              onChange={handleDosenChange}
              onFocus={() => namaInput && setShowDosenSuggestions(true)}
              disabled={isEditMode}
              className={`w-full p-3 mt-1 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              placeholder="Cari nama dosen..."
            />
            {showDosenSuggestions && filteredDosen.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                {filteredDosen.map((d) => (
                  <div key={d.kode_dosen} onClick={() => selectDosen(d.nama)} className="p-3 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-none flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-700">{d.nama}</div>
                      <div className="text-[10px] text-gray-400">{d.kode_dosen}</div>
                    </div>
                    <span className="text-blue-500 text-xs">Pilih</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dropdown Matkul */}
          <div className="relative" ref={matkulRef}>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mata Kuliah (Pisahkan Koma)</label>
            <input 
              type="text"
              value={matkulInput}
              onChange={handleMatkulChange}
              className="w-full p-3 mt-1 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Contoh: Basis Data, Algoritma..."
            />
            {showMatkulSuggestions && filteredMatkul.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                {filteredMatkul.map((m) => (
                  <div key={m.kode_mk} onClick={() => selectMatkul(m.nama)} className="p-3 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-none flex justify-between items-center">
                    <span className="font-medium text-gray-700">{m.nama}</span>
                    <span className="text-[9px] bg-gray-100 px-2 py-1 rounded text-gray-500 font-bold uppercase">{m.prodi}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-sm">
              {isEditMode ? 'Simpan Perubahan' : 'Tugaskan Sekarang'}
            </button>
            {isEditMode && (
              <button 
                type="button" 
                onClick={() => { setIsEditMode(false); setNamaInput(''); setMatkulInput(''); }} 
                className="px-8 py-3 bg-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-300"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- GRID LIST --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dosenList.filter(d => d.matkul_ajar && d.matkul_ajar.trim() !== "").map((dosen) => (
          <div key={dosen.kode_dosen} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                {getInitials(dosen.nama)}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition">{dosen.nama}</h3>
                <p className="text-[10px] text-gray-400 font-medium">{dosen.kode_dosen}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-4 h-16 overflow-y-auto content-start">
              {dosen.matkul_ajar.split(',').map((s, i) => (
                <span key={i} className="px-2 py-1 bg-gray-50 text-gray-500 border border-gray-100 rounded text-[9px] font-bold uppercase">
                  {s.trim()}
                </span>
              ))}
            </div>
            <div className="flex gap-2 border-t pt-4">
              <button 
                onClick={() => handleEditTrigger(dosen)} 
                className="flex-1 text-blue-600 text-xs font-bold py-2 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(dosen)} 
                className="px-3 py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition text-xs"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}