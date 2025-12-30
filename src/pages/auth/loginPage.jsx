import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../services/authServices';

import loginImg from '../../assets/img/undraw_login_re_4vu2 1.svg';
import vectorBg from '../../assets/img/Vector.svg';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert("Harap isi email dan password");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Panggil API Login
      const result = await loginUser(email, password);
      
      /**
       * 2. AMBIL DATA & NORMALISASI
       * Kita mengambil userData dari result.data.data 
       * (Menyesuaikan standar Axios dan format res.json({ data: userData }) di backend)
       */
      const userData = result.data?.data || result.data || result; 
      
      if (!userData) {
        throw new Error("Data user tidak ditemukan dalam respon server");
      }

      // 3. MEMBERSIHKAN SESI LAMA
      // Sangat penting untuk menghapus sisa data login sebelumnya agar tidak bentrok
      localStorage.clear();

      /**
       * 4. SPREAD OPERATOR (...)
       * Ini bagian terpenting. Dengan menggunakan ...userData, 
       * semua kolom dari MySQL (termasuk id_mhs yang Auto Increment) 
       * akan otomatis masuk ke objek cleanUser tanpa harus ditulis satu-satu.
       */
      const cleanUser = {
        ...userData,
        role: (userData.role || "MAHASISWA").toUpperCase().trim(),
      };

      // 5. SIMPAN KE LOCALSTORAGE
      localStorage.setItem("user", JSON.stringify(cleanUser));
      
      // DEBUG: Cek di console (F12) apakah id_mhs sudah muncul setelah copas kode ini
      console.log("Login sukses! Data tersimpan:", cleanUser);

      // 6. NAVIGASI BERDASARKAN ROLE
      const role = cleanUser.role;
      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'DOSEN') {
        navigate('/dosen');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error("Login error detail:", err);
      const errorMessage = err.response?.data?.message || err.message || "Email atau Password salah";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex flex-col h-screen items-center justify-center relative">
      <div className="flex flex-col justify-center gap-2 mx-7 lg:backdrop-blur-md lg:bg-white/30 lg:p-10 lg:rounded-lg lg:shadow-lg lg:z-10">
        <img src={loginImg} alt="logo_login" />
        <div className="text-lg font-semibold my-4">Login details</div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col justify-center gap-2">
            <input 
              className="border rounded-[5px] p-3 border-[#635C5C] outline-none focus:ring-2 focus:ring-blue-400" 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input 
              className="border border-[#635C5C] rounded-[5px] p-3 outline-none focus:ring-2 focus:ring-blue-400" 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex justify-between text-sm text-[#635C5C]">
              <label className="flex items-center cursor-pointer">
                <input className="mr-2" type="checkbox" /> remember me
              </label>
              <div className="cursor-pointer hover:text-blue-500">Forgot Password?</div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`bg-[#0B6EFE] text-white font-bold rounded-[5px] p-3 mt-2 transition-all active:scale-95 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Processing...' : 'Login'}
            </button>
          </div>                
        </form>

        <div className="text-center text-sm text-[#000000] mt-4 mb-4">
          Don't have an account?  
          <Link to="/register">
            <span className="text-[#4C84FF] ml-1 font-bold hover:underline">Sign Up</span>
          </Link>
        </div> 
      </div>
      <img className="absolute bottom-0 left-0 w-full object-cover pointer-events-none" src={vectorBg} alt="" />
    </div>
  );
}