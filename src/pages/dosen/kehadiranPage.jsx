import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Users, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
// Import Service
import { getJadwalDosen } from '../../services/dosenService'; 
import { getRekapDosen } from '../../services/absensiService';

const RekapKehadiran = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [jadwal, setJadwal] = useState([]);
    const [selectedKelas, setSelectedKelas] = useState(null); 
    const [searchQuery, setSearchQuery] = useState("");
    const [detailAbsensi, setDetailAbsensi] = useState([]);

    // Load daftar mata kuliah saat pertama kali buka halaman
    useEffect(() => {
        fetchInitialData();
    }, []);

    // Load detail mahasiswa saat kelas dipilih
    useEffect(() => {
        if (selectedKelas) {
            fetchDetailRekap(selectedKelas.id_jadwal);
        }
    }, [selectedKelas]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            // Ambil jadwal berdasarkan kode dosen yang login
            const data = await getJadwalDosen(storedUser.kode_dosen);
            setJadwal(data);
        } catch (err) {
            console.error("Gagal mengambil jadwal:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetailRekap = async (idJadwal) => {
        try {
            const result = await getRekapDosen(idJadwal);
            if (result.success) {
                setDetailAbsensi(result.data);
            }
        } catch (err) {
            console.error("Gagal mengambil detail rekap:", err);
        }
    };

    const StatusBadge = ({ status }) => {
        const style = {
            H: "bg-emerald-100 text-emerald-700 border border-emerald-200", // Hadir
            T: "bg-orange-100 text-orange-700 border border-orange-200",   // Terlambat
            I: "bg-blue-100 text-blue-700 border border-blue-200",       // Izin
            A: "bg-red-100 text-red-700 border border-red-200",         // Alfa
        };
        return (
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] ${style[status] || "bg-gray-50 text-gray-300 border border-gray-100"}`}>
                {status || "-"}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10 font-sans">
            {/* TOP BAR */}
            <div className="bg-white p-4 sticky top-0 z-40 shadow-sm border-b border-gray-100">
                <div className="container mx-auto max-w-7xl flex items-center gap-4">
                    <button 
                        onClick={() => selectedKelas ? setSelectedKelas(null) : navigate('/dosen')} 
                        className="p-2 hover:bg-gray-100 rounded-full transition active:scale-90"
                    >
                        <ChevronLeft size={24} className="text-gray-600" />
                    </button>
                    <h1 className="font-bold text-gray-800 uppercase tracking-tight text-sm">
                        {selectedKelas ? "Detail Presensi Mahasiswa" : "Rekap Kehadiran"}
                    </h1>
                </div>
            </div>

            <main className="p-4 container mx-auto max-w-7xl">
                {!selectedKelas ? (
                    /* VIEW 1: LIST MATA KULIAH */
                    <div className="grid gap-4 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-[2rem] text-white mb-2 shadow-xl shadow-blue-100 relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-2xl font-black uppercase tracking-tight">Pilih Kelas</h2>
                                <p className="text-blue-100 text-sm opacity-90 mt-1 font-medium">Monitoring kehadiran mahasiswa per pertemuan secara real-time.</p>
                            </div>
                            <Users className="absolute -right-4 -bottom-4 text-white/10" size={140} />
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            {jadwal.map((j) => (
                                <button 
                                    key={j.id_jadwal}
                                    onClick={() => setSelectedKelas(j)}
                                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-blue-500 hover:shadow-md transition-all group text-left"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                            <Users size={28} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors leading-tight">{j.nama_mk}</h3>
                                            <div className="flex gap-2 mt-2">
                                                <span className="text-[10px] font-black bg-gray-100 px-2.5 py-1 rounded-md text-gray-500 uppercase tracking-wider">Kelas {j.kelas}</span>
                                                <span className="text-[10px] font-black bg-blue-50 px-2.5 py-1 rounded-md text-blue-500 uppercase tracking-wider">{j.hari}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronLeft className="rotate-180 text-gray-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" size={20} />
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* VIEW 2: TABEL REKAP MAHASISWA */
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        {/* Header Info */}
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-800 leading-tight">{selectedKelas.nama_mk}</h2>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-blue-600 font-bold uppercase text-[10px] bg-blue-50 px-3 py-1 rounded-full">Kelas {selectedKelas.kelas}</span>
                                        <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">NIDN: {selectedKelas.nidn || "Dosen Pengampu"}</span>
                                    </div>
                                </div>
                                <button className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200 active:scale-95">
                                    <Download size={16}/> Export Laporan (.xlsx)
                                </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold"><CheckCircle size={14}/> Hadir</div>
                                <div className="flex items-center gap-2 text-orange-500 text-xs font-bold"><Clock size={14}/> Terlambat</div>
                                <div className="flex items-center gap-2 text-red-500 text-xs font-bold"><XCircle size={14}/> Alfa</div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input 
                                type="text" 
                                placeholder="Cari Mahasiswa berdasarkan Nama atau NIM..." 
                                className="w-full bg-white border border-gray-200 p-5 pl-14 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 shadow-sm font-medium transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Tabel Rekap Dinamis */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/80 text-[10px] font-black uppercase text-gray-400">
                                            <th className="p-5 w-16 text-center border-b border-gray-100">No</th>
                                            <th className="p-5 min-w-[200px] border-b border-gray-100">Mahasiswa</th>
                                            {/* Render Kolom P1 - P16 */}
                                            {Array.from({ length: 16 }, (_, i) => (
                                                <th key={i} className="p-3 text-center border-b border-gray-100 font-black">P{i + 1}</th>
                                            ))}
                                            <th className="p-5 text-center border-b border-gray-100 bg-blue-50 text-blue-600">%</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {detailAbsensi
                                            .filter(m => m.nama.toLowerCase().includes(searchQuery.toLowerCase()) || m.nim.includes(searchQuery))
                                            .map((m, idx) => (
                                            <tr key={m.id} className="hover:bg-blue-50/20 transition-colors group">
                                                <td className="p-5 text-center text-sm font-bold text-gray-300 group-hover:text-blue-400">{idx + 1}</td>
                                                <td className="p-5">
                                                    <p className="font-bold text-gray-800 text-sm">{m.nama}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{m.nim}</p>
                                                </td>
                                                {/* Render Data Status P1 - P16 secara dinamis */}
                                                {Array.from({ length: 16 }, (_, i) => (
                                                    <td key={i} className="p-2 text-center">
                                                        <StatusBadge status={m[`p${i + 1}`]} />
                                                    </td>
                                                ))}
                                                <td className="p-5 text-center bg-blue-50/30">
                                                    <span className={`text-xs font-black ${parseInt(m.persen) >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                        {m.persen}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {detailAbsensi.length === 0 && (
                                <div className="p-20 text-center text-gray-400 font-medium">
                                    Belum ada data absensi untuk kelas ini.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default RekapKehadiran;