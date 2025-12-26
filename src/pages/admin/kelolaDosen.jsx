import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDosen, createDosen, deleteDosen } from '../../services/adminService';

export default function KelolaDosen() {
    const [dosenList, setDosenList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        nama: '', nidn: '', email: '', password: 'pass123'
    });

    // Ambil semua data dosen dari backend
    const fetchAllDosen = async () => {
        try {
            setLoading(true);
            const data = await getDosen();
            setDosenList(data);
        } catch (err) {
            console.error("Gagal memuat dosen:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllDosen();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Matkul_ajar dikirim kosong karena ini fitur registrasi akun, bukan penjadwalan
            await createDosen({ ...formData, matkul_ajar: "" });
            
            alert("✅ Akun Dosen Berhasil Dibuat!");
            setIsModalOpen(false);
            
            // Reset form ke default
            setFormData({ nama: '', nidn: '', email: '', password: 'pass123' });
            
            // Refresh data
            fetchAllDosen();
        } catch (err) {
            alert("❌ Gagal membuat akun: " + err.message);
        }
    };

    const handleDelete = async (kode, nama) => {
        // Konfirmasi keamanan sebelum menghapus data permanen
        const confirmDelete = window.confirm(
            `PERINGATAN: Hapus akun ${nama} secara permanen?\n\n` +
            `Tindakan ini tidak dapat dibatalkan dan semua data terkait dosen ini akan hilang.`
        );

        if (confirmDelete) {
            try {
                const response = await deleteDosen(kode);
                
                // Alert pesan sukses dari backend
                alert("🗑️ " + (response.message || "Akun berhasil dihapus."));

                // OPTIMASI: Update state secara lokal agar UI langsung berubah tanpa fetch ulang
                setDosenList(prevList => prevList.filter(dosen => dosen.kode_dosen !== kode));
                
            } catch (err) {
                // Tampilkan pesan error jika gagal (misal: karena relasi database/foreign key)
                alert("❌ Gagal menghapus: " + err.message);
            }
        }
    };

    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <div className="bg-gray-100 min-h-screen pb-20 lg:pb-0 font-sans">
            {/* Header Section */}
            <header className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <div className="container mx-auto flex justify-between items-center max-w-xl">
                    <Link to="/admin" className="text-xl text-gray-600 hover:text-blue-600 transition-colors">
                        <span className="p-2">←</span>
                    </Link>
                    <h1 className="text-lg font-bold text-gray-800 tracking-tight">Kelola Data Dosen</h1>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="p-4">
                <div className="container mx-auto max-w-xl">
                    {/* Button Tambah */}
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="w-full flex items-center justify-center bg-blue-600 text-white rounded-xl p-4 mb-6 shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all duration-200"
                    >
                        <span className="text-2xl mr-2 font-light">+</span>
                        <span className="font-bold tracking-wide">TAMBAH DOSEN BARU</span>
                    </button>

                    {/* List Card Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <div className="flex justify-between items-center border-b border-gray-50 pb-4 mb-4">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Daftar Dosen Aktif</h2>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                {dosenList.length} Total
                            </span>
                        </div>
                        
                        {loading ? (
                            <div className="flex flex-col items-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                <p className="text-gray-400 text-sm italic">Menghubungkan ke database...</p>
                            </div>
                        ) : dosenList.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-400 font-medium">Belum ada data dosen terdaftar.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {dosenList.map((dosen) => (
                                    <div key={dosen.kode_dosen} className="flex items-center justify-between py-4 group animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-center space-x-4 overflow-hidden">
                                            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-inner shrink-0 uppercase">
                                                {getInitials(dosen.nama)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-800 truncate capitalize">{dosen.nama}</p>
                                                <p className="text-[10px] font-mono text-gray-500 bg-gray-50 inline-block px-1 rounded mt-1">NIDN: {dosen.nidn || 'N/A'}</p>
                                                <p className="text-[11px] text-blue-500 font-medium truncate mt-0.5">{dosen.email}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(dosen.kode_dosen, dosen.nama)}
                                            className="bg-red-50 text-red-400 hover:bg-red-500 hover:text-white p-2.5 rounded-lg transition-all duration-200"
                                            title="Hapus Permanen"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* MODAL TAMBAH DOSEN */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-5">
                                <h3 className="text-lg font-extrabold text-gray-800">Registrasi Akun Dosen</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-tighter">Nama Lengkap & Gelar</label>
                                    <input type="text" name="nama" required value={formData.nama} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" placeholder="Contoh: Dr. John Doe, M.Kom"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-tighter">Nomor Induk (NIDN)</label>
                                    <input type="text" name="nidn" required value={formData.nidn} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" placeholder="Masukkan 10 digit NIDN"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-tighter">Email Instansi</label>
                                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" placeholder="nama@univ.ac.id"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-tighter">Password Default</label>
                                    <input type="text" name="password" value={formData.password} onChange={handleChange} className="w-full p-3 border border-amber-100 bg-amber-50 rounded-xl text-amber-700 font-mono text-sm"/>
                                    <p className="text-[10px] text-amber-600 mt-1 italic">*Password ini akan dienkripsi otomatis saat disimpan.</p>
                                </div>
                                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all mt-4">
                                    SIMPAN & AKTIFKAN AKUN
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}