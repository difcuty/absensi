import React, { useState, useEffect, useRef } from 'react';
import { getMatkul, getDosen, getJadwal, saveFullJadwal } from '../../../services/akademikService';

const DAFTAR_HARI = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
const DAFTAR_JURUSAN = ['TEKNIK INFORMATIKA S-1', 'SISTEM INFORMASI S-1', 'SAINS DATA S-1'];
const TIME_SLOTS = ['AB', 'ABC', 'CD', 'DEF', 'EF', 'GHI', 'JKL', 'IJK'];

export default function JadwalTab() {
  const [jurusan, setJurusan] = useState('TEKNIK INFORMATIKA S-1');
  const [hari, setHari] = useState('SENIN');
  const [rows, setRows] = useState([]);
  const [masterMatkul, setMasterMatkul] = useState([]);
  const [masterDosen, setMasterDosen] = useState([]);
  const [allSchedule, setAllSchedule] = useState([]);

  // State Sugesi
  const [activeMkSuggestion, setActiveMkSuggestion] = useState({ index: null, visible: false, list: [] });
  const [activeDosenSuggestion, setActiveDosenSuggestion] = useState({ index: null, visible: false, list: [] });

  const mkRef = useRef(null);
  const dosenRef = useRef(null);

  useEffect(() => {
    loadData();
    const handleClickOutside = (e) => {
      if (mkRef.current && !mkRef.current.contains(e.target)) setActiveMkSuggestion({ index: null, visible: false, list: [] });
      if (dosenRef.current && !dosenRef.current.contains(e.target)) setActiveDosenSuggestion({ index: null, visible: false, list: [] });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadData = async () => {
    try {
      const [mats, dos, jads] = await Promise.all([getMatkul(), getDosen(), getJadwal()]);
      setMasterMatkul(mats || []);
      setMasterDosen(dos || []);
      setAllSchedule(jads || []);
    } catch (err) { 
      console.error("Data fetch error:", err); 
    }
  };

  useEffect(() => {
    const currentJurusan = jurusan.trim().toUpperCase();
    const filtered = allSchedule.filter(s => 
        String(s.jurusan).trim().toUpperCase() === currentJurusan && s.hari === hari
    );
    
    if (filtered.length > 0) {
      setRows(filtered.map(f => ({
        kode_mk: String(f.kode_mk || '').trim(),
        nama_mk: masterMatkul.find(m => String(m.kode_mk).trim() === String(f.kode_mk).trim())?.nama || f.nama_mk || '',
        kelas: f.kelas, 
        kode_dosen: f.kode_dosen,
        nama_dosen: masterDosen.find(d => d.kode_dosen === f.kode_dosen)?.nama || '',
        jam: f.jam, 
        ruang: f.ruang, 
        sem: f.sem
      })));
    } else {
      setRows([{ kode_mk: '', nama_mk: '', kelas: 'A', kode_dosen: '', nama_dosen: '', jam: 'AB', ruang: '', sem: '' }]);
    }
  }, [jurusan, hari, allSchedule, masterMatkul, masterDosen]);

  // LOGIKA: Auto-fill Dosen berdasarkan MK dan Kelas
  const autoFillDosen = (index, currentRows, targetKodeMk, targetKelas) => {
    if (!targetKodeMk || !targetKelas) return currentRows;
    const cleanKodeMk = String(targetKodeMk).trim();

    const existingAssign = allSchedule.find(s => 
      String(s.kode_mk).trim() === cleanKodeMk && s.kelas === targetKelas
    );

    if (existingAssign) {
      const dosenMatch = masterDosen.find(d => d.kode_dosen === existingAssign.kode_dosen);
      if (dosenMatch) {
        currentRows[index].kode_dosen = dosenMatch.kode_dosen;
        currentRows[index].nama_dosen = dosenMatch.nama;
      }
    }
    return currentRows;
  };

  const handleMkInputChange = (index, value) => {
    const updatedRows = [...rows];
    updatedRows[index].nama_mk = value;
    updatedRows[index].kode_mk = ''; 
    setRows(updatedRows);

    if (value.trim().length > 0) {
      const searchVal = value.toLowerCase().trim();
      const currentJurusanClean = jurusan.trim().toLowerCase();
      const matches = masterMatkul.filter(m => {
        const dbProdiClean = String(m.prodi || '').trim().toLowerCase();
        return dbProdiClean === currentJurusanClean && 
               (String(m.nama).toLowerCase().includes(searchVal) || String(m.kode_mk).toLowerCase().includes(searchVal));
      });
      setActiveMkSuggestion({ index, visible: true, list: matches });
    } else {
      setActiveMkSuggestion({ index: null, visible: false, list: [] });
    }
  };

  const selectMk = (index, mkItem) => {
    let updatedRows = [...rows];
    updatedRows[index].kode_mk = String(mkItem.kode_mk).trim();
    updatedRows[index].nama_mk = mkItem.nama;
    updatedRows[index].sem = mkItem.sem;
    updatedRows = autoFillDosen(index, updatedRows, mkItem.kode_mk, updatedRows[index].kelas);
    setRows(updatedRows);
    setActiveMkSuggestion({ index: null, visible: false, list: [] });
  };

  const handleDosenInputChange = (index, value) => {
    const updatedRows = [...rows];
    updatedRows[index].nama_dosen = value;
    updatedRows[index].kode_dosen = ''; 
    setRows(updatedRows);

    if (value.trim().length > 0) {
      const searchVal = value.toLowerCase().trim();
      const matches = masterDosen.filter(d => 
        String(d.nama).toLowerCase().includes(searchVal) || String(d.nidn).toLowerCase().includes(searchVal)
      );
      setActiveDosenSuggestion({ index, visible: true, list: matches });
    } else {
      setActiveDosenSuggestion({ index: null, visible: false, list: [] });
    }
  };

  const selectDosen = (index, dosenItem) => {
    const updatedRows = [...rows];
    updatedRows[index].kode_dosen = dosenItem.kode_dosen;
    updatedRows[index].nama_dosen = dosenItem.nama;
    setRows(updatedRows);
    setActiveDosenSuggestion({ index: null, visible: false, list: [] });
  };

  const handleRowChange = (index, field, value) => {
    let updatedRows = [...rows];
    updatedRows[index][field] = value;
    if (field === 'kelas' && updatedRows[index].kode_mk) {
      updatedRows = autoFillDosen(index, updatedRows, updatedRows[index].kode_mk, value);
    }
    setRows(updatedRows);
  };

  const handleSave = async () => {
    try {
      const validRows = rows.filter(r => r.kode_mk && r.kode_dosen);
      if (validRows.length === 0) return alert("Pilih Mata Kuliah dan Dosen dari sugesit!");

      const payload = {
        jurusan, hari,
        data: validRows.map(r => ({
          kode_mk: String(r.kode_mk).trim(), // Trim ekstra untuk keamanan FK
          kode_dosen: parseInt(r.kode_dosen),
          kelas: r.kelas,
          jam: r.jam,
          ruang: r.ruang?.toUpperCase().trim() || '',
          sem: String(r.sem).trim()
        }))
      };

      await saveFullJadwal(payload);
      alert(`Jadwal Berhasil Disimpan! ✅`);
      loadData();
    } catch (err) { 
      alert("Gagal menyimpan: " + err.message); 
    }
  };

  const getCellData = (jur, hri, jam) => {
    const targetJur = jur.trim().toUpperCase();
    return allSchedule.filter(s => String(s.jurusan).trim().toUpperCase() === targetJur && s.hari === hri && s.jam === jam);
  };

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* PANEL EDITOR */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-visible">
          <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-t-3xl">
            <h2 className="text-white font-black tracking-widest text-lg uppercase flex items-center gap-3">
              <span className="p-2 bg-blue-500 rounded-lg">📅</span> Manajemen Jadwal
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50">
            <select value={jurusan} onChange={(e) => setJurusan(e.target.value)} className="w-full p-3 border-2 rounded-2xl bg-white font-bold outline-none border-slate-200 focus:border-blue-500 transition-all">
              {DAFTAR_JURUSAN.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
            <select value={hari} onChange={(e) => setHari(e.target.value)} className="w-full p-3 border-2 rounded-2xl bg-white font-bold outline-none border-slate-200 focus:border-blue-500 transition-all">
              {DAFTAR_HARI.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div className="p-6">
            <div className="overflow-visible">
              <table className="w-full text-left min-w-[1000px]">
                <thead>
                  <tr className="text-[10px] text-slate-400 font-black uppercase tracking-widest border-b">
                    <th className="pb-4 px-2">Mata Kuliah</th>
                    <th className="pb-4 px-2 w-24 text-center">Kelas</th>
                    <th className="pb-4 px-2">Dosen Pengajar</th>
                    <th className="pb-4 px-2 w-32 text-center">Jam</th>
                    <th className="pb-4 px-2 w-28 text-center">Ruang</th>
                    <th className="pb-4 px-2 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={`row-${idx}`} className="group">
                      <td className="py-3 px-1 relative" ref={mkRef}>
                        <input 
                          type="text"
                          className={`w-full p-3 border-2 rounded-2xl text-sm font-bold outline-none transition-all ${row.kode_mk ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-100 focus:border-blue-400'}`}
                          placeholder="Cari Mata Kuliah..."
                          value={row.nama_mk}
                          onChange={(e) => handleMkInputChange(idx, e.target.value)}
                          autoComplete="off"
                        />
                        {activeMkSuggestion.index === idx && activeMkSuggestion.visible && (
                          <div className="absolute z-[9999] left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                            {activeMkSuggestion.list.map(m => (
                              <div key={m.kode_mk} onClick={() => selectMk(idx, m)} className="p-4 hover:bg-blue-600 hover:text-white cursor-pointer border-b last:border-none">
                                <div className="font-black text-xs">{m.nama}</div>
                                <div className="text-[10px] opacity-60 font-bold">{m.kode_mk} - SMT {m.sem}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-1">
                        <select className="w-full p-3 border-2 border-slate-100 rounded-2xl text-sm font-black text-center outline-none focus:border-blue-400" value={row.kelas} onChange={(e) => handleRowChange(idx, 'kelas', e.target.value)}>
                          {['A', 'B', 'C', 'D'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>

                      <td className="py-3 px-1 relative" ref={dosenRef}>
                        <input 
                          type="text"
                          className={`w-full p-3 border-2 rounded-2xl text-sm font-bold outline-none transition-all ${row.kode_dosen ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-100 focus:border-blue-400'}`}
                          placeholder="Cari Dosen..."
                          value={row.nama_dosen || ''}
                          onChange={(e) => handleDosenInputChange(idx, e.target.value)}
                          autoComplete="off"
                        />
                        {activeDosenSuggestion.index === idx && activeDosenSuggestion.visible && (
                          <div className="absolute z-[9999] left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                            {activeDosenSuggestion.list.map(d => (
                              <div key={d.kode_dosen} onClick={() => selectDosen(idx, d)} className="p-4 hover:bg-blue-600 hover:text-white cursor-pointer border-b last:border-none">
                                <div className="font-black text-xs">{d.nama}</div>
                                <div className="text-[10px] opacity-60 font-bold">NIDN: {d.nidn || '-'}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-1">
                        <select className="w-full p-3 border-2 border-slate-100 rounded-2xl text-sm font-black text-center outline-none focus:border-blue-400" value={row.jam} onChange={(e) => handleRowChange(idx, 'jam', e.target.value)}>
                          {TIME_SLOTS.map(t => <option key={t} value={t}>JAM {t}</option>)}
                        </select>
                      </td>

                      <td className="py-3 px-1">
                        <input className="w-full p-3 border-2 border-slate-100 rounded-2xl text-sm font-black text-center uppercase outline-none focus:border-blue-400" placeholder="RUANG" value={row.ruang || ''} onChange={(e) => handleRowChange(idx, 'ruang', e.target.value)} />
                      </td>

                      <td className="py-3 px-1 text-center">
                        <button onClick={() => setRows(rows.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 pt-6 border-t flex justify-between">
              <button onClick={() => setRows([...rows, { kode_mk: '', nama_mk: '', kelas: 'A', kode_dosen: '', nama_dosen: '', jam: 'AB', ruang: '', sem: '' }])} className="px-6 py-2 border-2 border-blue-500 text-blue-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-50">
                ➕ Tambah Baris
              </button>
              <button onClick={handleSave} className="px-10 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all">
                💾 Simpan Jadwal
              </button>
            </div>
          </div>
        </div>

        {/* MASTER PREVIEW */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 overflow-hidden">
          <h3 className="font-black text-slate-800 text-lg uppercase mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
            Master Preview Jadwal
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-inner">
            <table className="w-full text-[10px] border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-900 text-white font-black">
                  <th className="p-4 border-r border-slate-700 w-24 sticky left-0 bg-slate-900 z-20">HARI</th>
                  <th className="p-4 border-r border-slate-700 w-20 text-center">JAM</th>
                  {DAFTAR_JURUSAN.map(j => (
                    <th key={j} colSpan="3" className="p-4 border-r border-slate-700 text-center bg-slate-800 text-blue-400 text-[9px] uppercase tracking-widest italic">{j}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAFTAR_HARI.map(hri => (
                  TIME_SLOTS.map((slot, sIdx) => (
                    <tr key={`${hri}-${slot}`} className="border-b border-slate-50 hover:bg-blue-50/50 transition-colors">
                      {sIdx === 0 && (
                        <td rowSpan={TIME_SLOTS.length} className="p-4 border-r-2 border-slate-200 text-center font-black bg-slate-50 text-slate-900 align-middle sticky left-0 z-10 shadow-sm uppercase tracking-widest">
                          {hri}
                        </td>
                      )}
                      <td className="p-2 border-r border-slate-100 text-center font-black bg-slate-50/30 text-slate-500">{slot}</td>
                      {DAFTAR_JURUSAN.map(jur => {
                        const dataList = getCellData(jur, hri, slot);
                        const d = dataList[0];
                        const dosenInfo = masterDosen.find(ds => ds.kode_dosen === d?.kode_dosen);
                        return (
                          <React.Fragment key={`${jur}-${hri}-${slot}`}>
                            <td className="p-2 border-r border-slate-50 font-bold text-slate-700 bg-white/50">
                              <div className="truncate w-44" title={d?.nama_mk}>{d?.nama_mk || '-'}</div>
                              {d?.ruang && <span className="block text-[8px] text-blue-500 font-black">📍 {d.ruang}</span>}
                            </td>
                            <td className="p-2 border-r border-slate-50 text-center font-black text-slate-400 bg-white/50">{d?.kelas || '-'}</td>
                            <td className="p-2 border-r border-slate-100 italic text-slate-500 font-medium bg-white/50">
                              <div className="truncate w-36" title={dosenInfo?.nama}>{dosenInfo?.nama || '-'}</div>
                            </td>
                          </React.Fragment>
                        )
                      })}
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}