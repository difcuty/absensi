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
      
      // 2. AMBIL DATA & NORMALISASI (Ini kuncinya!)
      // Kita pastikan data yang masuk ke LocalStorage selalu rapi
      const rawData = result.data || result; 
      
      const cleanUser = {
        ...rawData,
        // Paksa role jadi UPPERCASE dan hapus spasi (mencegah "" atau "mahasiswa")
        role: (rawData.role || rawData.Role || "MAHASISWA").toUpperCase().trim(),
        // Pastikan field pendukung mahasiswa tetap ada agar fitur filter matkul tidak error
        jurusan: rawData.jurusan || "",
        semester: rawData.semester || ""
      };

      // 3. Simpan data yang sudah "bersih"
      localStorage.setItem("user", JSON.stringify(cleanUser));
      console.log("Login sukses, data tersimpan:", cleanUser);

      alert(result.message || "Login Berhasil");

      // 4. NAVIGASI BERDASARKAN ROLE
      if (cleanUser.role === 'ADMIN') {
        navigate('/admin');
      } else if (cleanUser.role === 'DOSEN') {
        navigate('/dosen');
      } else {
        // Default untuk MAHASISWA
        navigate('/dashboard');
      }

    } catch (err) {
      console.error("Login error:", err);
      alert(err.message || "Email atau Password salah");
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
              className="border rounded-[5px] p-3 border-[#635C5C]" 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input 
              className="border border-[#635C5C] rounded-[5px] p-3" 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex justify-between text-sm text-[#635C5C]">
              <label className="flex items-center">
                <input className="mr-2" type="checkbox" /> remember me
              </label>
              <div className="cursor-pointer">Forgot Password?</div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`bg-[#0B6EFE] text-white font-bold rounded-[5px] p-3 mt-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Processing...' : 'Login'}
            </button>
          </div>                
        </form>

        <div className="text-center text-sm text-[#000000] mt-4 mb-4">
          Don't have an account?  
          <Link to="/register">
            <span className="text-[#4C84FF] ml-1 font-bold">Sign Up</span>
          </Link>
        </div> 
      </div>
      <img className="absolute bottom-0 left-0 w-full object-cover pointer-events-none" src={vectorBg} alt="" />
    </div>
  );
}