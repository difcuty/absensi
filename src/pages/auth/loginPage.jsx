import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../services/authServices';

import loginImg from '../../assets/img/undraw_login_re_4vu2 1.svg';
import vectorBg from '../../assets/img/Vector.svg';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // State baru untuk checkbox
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Efek untuk mengecek data "Remember Me" saat halaman pertama kali dimuat
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedStatus = localStorage.getItem('rememberMeStatus');
    
    if (savedStatus === 'true' && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

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
      
      // 2. AMBIL DATA & NORMALISASI
      const rawData = result.data || result; 
      
      const cleanUser = {
        ...rawData,
        role: (rawData.role || rawData.Role || "MAHASISWA").toUpperCase().trim(),
        jurusan: rawData.jurusan || "",
        semester: rawData.semester || ""
      };

      // LOGIKA REMEMBER ME: Simpan atau hapus email berdasarkan checkbox
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberMeStatus', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.setItem('rememberMeStatus', 'false');
      }

      // 3. Simpan data yang sudah "bersih" (Session User)
      localStorage.setItem("user", JSON.stringify(cleanUser));
      console.log("Login sukses, data tersimpan:", cleanUser);

      // 4. NAVIGASI BERDASARKAN ROLE
      if (cleanUser.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (cleanUser.role === 'DOSEN') {
        navigate('/dosen', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
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
              <label className="flex items-center cursor-pointer">
                <input 
                  className="mr-2" 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                /> remember me
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