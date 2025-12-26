import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Data Dummy (Nanti bisa diganti dengan fetch dari API)
const initialIzinData = [
    { id: 1, nama: "Yesya", kelas: "TI-D 2024", matkul: "Algoritma", tanggal: "22/11/25", tipe: "sakit", lampiran: null, alasan: "tidak enak badan", status: "menunggu" },
    { id: 2, nama: "Budi", kelas: "TI-D 2024", matkul: "Algoritma", tanggal: "22/11/25", tipe: "sakit", lampiran: "surat_dokter.pdf", alasan: "Demam tinggi", status: "menunggu" },
];

export default function TinjauanIzin() {
    const [izinList, setIzinList] = useState(initialIzinData);
    const [activeTab, setActiveTab] = useState('menunggu');
    const [openCardId, setOpenCardId] = useState(null);

    const toggleCard = (id) => {
        setOpenCardId(openCardId === id ? null : id);
    };

    const handleAction = (id, newStatus) => {
        setIzinList(prev => prev.map(item => 
            item.id === id ? { ...item, status: newStatus } : item
        ));
        alert(`Izin berhasil ${newStatus}`);
    };

    const filteredData = izinList.filter(item => item.status === activeTab);

    return (
        <div className="bg-gray-100 min-h-screen pb-20 lg:pb-0">
            {/* HEADER */}
            <header className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-blue-200 flex items-center justify-center text-white font-bold">
                        D
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Dr. Budi Onhar S.kom, M.kom</p>
                        <p className="text-xs text-gray-500">Basis Data</p>
                    </div>
                </div>
                <button className="p-2 bg-gray-50 rounded-full">🔔</button>
            </header>

            {/* TITLE BAR */}
            <div className="bg-white px-4 py-3 flex items-center shadow-md max-w-4xl mx-auto">
                <Link to="/dosen/dashboard" className="mr-4">
                    <span className="text-2xl">←</span>
                </Link>
                <h1 className="text-lg font-semibold text-gray-800">Manajemen Izin Mahasiswa</h1>
            </div>

            {/* TABS */}
            <div className="bg-white p-4 flex justify-center shadow-sm max-w-4xl mx-auto sticky top-29 z-10">
                {['menunggu', 'diterima', 'ditolak'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 mx-1 py-2 text-sm rounded-lg capitalize transition-all ${
                            activeTab === tab ? 'bg-blue-600 text-white font-bold' : 'bg-gray-100 text-gray-500'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* LIST CONTENT */}
            <main className="p-4 space-y-4 max-w-4xl mx-auto">
                {filteredData.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 italic">Tidak ada data {activeTab}</div>
                ) : (
                    filteredData.map((izin) => (
                        <div key={izin.id} className="bg-white rounded-xl shadow-md p-4 cursor-pointer overflow-hidden border border-gray-50">
                            {/* Card Header */}
                            <div className="flex justify-between items-start" onClick={() => toggleCard(izin.id)}>
                                <div>
                                    <p className="text-base font-bold text-gray-900">{izin.nama} {izin.kelas}</p>
                                    <p className="text-sm text-gray-700 font-medium">{izin.matkul}</p>
                                    <p className="text-xs text-gray-500 mt-1">{izin.tipe}: {izin.tanggal}</p>
                                    <p className="text-xs text-gray-500">
                                        lampiran: {izin.lampiran ? (
                                            <a href="#" className="text-blue-500 underline ml-1" onClick={(e) => e.stopPropagation()}>
                                                {izin.lampiran}
                                            </a>
                                        ) : "tidak ada"}
                                    </p>
                                </div>
                                <div className={`text-xl transition-transform duration-300 ${openCardId === izin.id ? 'rotate-180' : ''}`}>
                                    ▼
                                </div>
                            </div>

                            {/* Collapsible Content */}
                            <div 
                                className={`transition-all duration-300 ease-in-out ${
                                    openCardId === izin.id ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'
                                }`}
                            >
                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded italic">
                                        Alasan: {izin.alasan}
                                    </p>
                                    
                                    {activeTab === 'menunggu' && (
                                        <div className="flex gap-3 mt-4">
                                            <button 
                                                onClick={() => handleAction(izin.id, 'diterima')}
                                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                                            >
                                                Setujui
                                            </button>
                                            <button 
                                                onClick={() => handleAction(izin.id, 'ditolak')}
                                                className="flex-1 border border-red-200 text-red-600 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition"
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