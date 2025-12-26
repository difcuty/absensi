import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../services/authServices';
import vectorBg from '../../assets/img/Vector.svg';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    npm: '',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  // Fungsi untuk update state saat input diketik
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, npm, password, confirmPassword } = formData;

    // Validasi
    if (!name || !email || !npm || !password || !confirmPassword) {
      return alert("Semua field harus diisi!");
    }
    if (password !== confirmPassword) {
      return alert("Password dan confirm password tidak sama!");
    }

    setIsLoading(true);
    try {
      const dataToSend = { name, email, npm, password };
      await registerUser(dataToSend);
      
      alert("Registrasi berhasil!");
      navigate('/login'); // Redirect ke login setelah sukses
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex flex-col h-screen items-center justify-center relative">
      <form onSubmit={handleSubmit} className="z-10">
        <div className="flex flex-col justify-center gap-2 mx-7 lg:backdrop-blur-md lg:bg-white/30 lg:p-10 lg:rounded-lg lg:shadow-lg">
          <div className="text-lg font-semibold my-4">Mendaftar</div>
          
          <div className="flex flex-col justify-center gap-2">
            <input 
              className="border rounded-[5px] p-3 border-[#635C5C]" 
              type="text" placeholder="Nama" name="name"
              value={formData.name} onChange={handleChange} 
            />
            <input 
              className="border rounded-[5px] p-3 border-[#635C5C]" 
              type="text" placeholder="Email" name="email"
              value={formData.email} onChange={handleChange} 
            />
            <input 
              className="border rounded-[5px] p-3 border-[#635C5C]" 
              type="text" placeholder="NPM" name="npm"
              value={formData.npm} onChange={handleChange} 
            />
            <input 
              className="border border-[#635C5C] rounded-[5px] p-3" 
              type="password" placeholder="Password" name="password"
              value={formData.password} onChange={handleChange} 
            />
            <input 
              className="border border-[#635C5C] rounded-[5px] p-3" 
              type="password" placeholder="Confirm Password" name="confirmPassword"
              value={formData.confirmPassword} onChange={handleChange} 
            />

            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-[#4C84FF] text-white rounded-[5px] p-3 mt-2 disabled:opacity-50"
            >
              {isLoading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </div>
          
          <Link to="/login" className="flex justify-center mt-2 hover:underline text-sm">
            Sudah punya akun? Login
          </Link>
        </div>
      </form>

      <img className="absolute bottom-0 left-0 w-full object-cover pointer-events-none" src={vectorBg} alt="" />
    </div>
  );
}