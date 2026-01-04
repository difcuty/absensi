import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Bell, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
// Import fungsi service (Sesuaikan path-nya)
import { getIzinByDosen, updateStatusIzin, getProfilDosen } from '../../services/dosenService';

export default function TinjauanIzin() {
    const navigate = useNavigate();
    const [izinList, setIzinList] = useState([]);
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState('menunggu');
    const [openCardId, setOpenCardId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            const identifier = storedUser.email || storedUser.kode_dosen;
            
            // 1. Ambil Profil (Agar header sinkron dengan dashboard)
            const profile = await getProfilDosen(identifier);
            setUserData(profile);

            // 2. Ambil data izin dari backend
            const data = await getIzinByDosen(profile.kode_dosen);
            setIzinList(data);
        } catch (err) {
            console.error("Gagal memuat data:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleCard = (id) => {
        setOpenCardId(openCardId === id ? null : id);
    };

    const handleAction = async (id, newStatus) => {
        try {
            // Update ke Database via API
            await updateStatusIzin(id, newStatus);
            
            // Update state lokal agar UI langsung berubah
            setIzinList(prev => prev.map(item => 
                item.id === id ? { ...item, status: newStatus } : item
            ));
            
            setOpenCardId(null);
        } catch (err) {
            alert("Gagal memperbarui status izin");
        }
    };

    const filteredData = izinList.filter(item => item.status === activeTab);

    return (
        <div className="bg-[#F3F4F6] min-h-screen pb-20">
            {/* HEADER - Disesuaikan dengan Dashboard */}
            <header className="bg-white p-4 shadow-sm sticky top-0 z-50">
                <div className="container mx-auto max-w-4xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-blue-500">
                            <img 
                                src={userData?.foto_url || "https://via.placeholder.com/150"} 
                                alt="Profil" 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">{userData?.nama || "Loading..."}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                                NIDN: {userData?.nidn || "-"}
                            </p>
                        </div>
                    </div>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition">
                        <Bell size={24} />
                    </button>
                </div>
            </header>

            {/* TITLE BAR */}
            <div className="bg-white px-4 py-4 flex items-center shadow-sm max-w-4xl mx-auto border-t">
                <button onClick={() => navigate('/dosen')} className="mr-4 p-1 hover:bg-gray-100 rounded-full transition">
                    <ChevronLeft size={24} className="text-gray-800" />
                </button>
                <h1 className="flex-1 text-center text-sm font-black text-gray-800 pr-10 uppercase tracking-tight">
                    Manajemen Izin Mahasiswa
                </h1>
            </div>

            {/* TABS - Gaya Dashboard (Pill Style) */}
            <div className="bg-white p-4 flex justify-center gap-2 shadow-sm max-w-4xl mx-auto sticky top-[130px] z-10 border-t">
                {['menunggu', 'diterima', 'ditolak'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                            activeTab === tab 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                            : 'bg-gray-50 text-gray-400'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* LIST CONTENT */}
            <main className="p-4 space-y-4 max-w-4xl mx-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-bold text-gray-400 mt-4 tracking-widest uppercase">Memuat Data...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
                        <FileText size={48} className="mx-auto text-gray-200 mb-2" />
                        <p className="text-xs font-bold text-gray-400 uppercase">Tidak ada data {activeTab}</p>
                    </div>
                ) : (
                    filteredData.map((izin) => (
                        <div 
                            key={izin.id} 
                            className={`bg-white rounded-2xl shadow-sm p-5 border transition-all duration-300 ${openCardId === izin.id ? 'border-blue-400 ring-4 ring-blue-50' : 'border-transparent'}`}
                            onClick={() => toggleCard(izin.id)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-[14px] font-black text-gray-900 uppercase leading-tight">
                                        {izin.nama}
                                    </h3>
                                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter mt-1">
                                        {izin.kelas} • {izin.matkul}
                                    </p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-black uppercase">
                                            {izin.tipe}
                                        </span>
                                        <span className="text-[9px] text-gray-400 font-bold uppercase">
                                            {izin.tanggal}
                                        </span>
                                    </div>
                                </div>
                                <div className={`transition-transform duration-300 ${openCardId === izin.id ? 'rotate-180 text-blue-600' : 'text-gray-300'}`}>
                                    <ChevronLeft size={20} className="-rotate-90" />
                                </div>
                            </div>

                            {/* Collapsible Content */}
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openCardId === izin.id ? 'max-h-96 opacity-100 mt-5' : 'max-h-0 opacity-0'}`}>
                                <div className="pt-4 border-t border-gray-50">
                                    <p className="text-[11px] text-gray-500 font-bold uppercase mb-2">Alasan Izin:</p>
                                    <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-700 italic border-l-4 border-blue-500">
                                        "{izin.alasan}"
                                    </div>
                                    
                                    <div className="mt-4">
                                        <p className="text-[11px] text-gray-500 font-bold uppercase mb-2">Lampiran:</p>
                                        {izin.lampiran ? (
                                            <a 
                                                href={izin.lampiran} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <FileText size={14} /> Lihat Berkas Lampiran
                                            </a>
                                        ) : (
                                            <span className="text-[10px] text-gray-400 italic">Tidak ada lampiran berkas</span>
                                        )}
                                    </div>

                                    {activeTab === 'menunggu' && (
                                        <div className="flex gap-3 mt-6">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleAction(izin.id, 'diterima'); }}
                                                className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 active:scale-95 transition"
                                            >
                                                Setujui
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleAction(izin.id, 'ditolak'); }}
                                                className="flex-1 border-2 border-red-100 text-red-500 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 active:scale-95 transition"
                                            >
                                                Tolak
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}