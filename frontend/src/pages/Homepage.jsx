import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import Logo from '../assets/logo.png';

const Homepage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      navigate('/tasks');
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#121212' }}>
      <div className="flex flex-col md:flex-row items-center gap-12 w-full max-w-6xl px-8">
        {/* Left side - Logo */}
        <div className="flex-1 flex justify-left">
          <img src={Logo} alt="Logo" className="w-64 h-64 object-contain" />
        </div>

        <div className="flex-1 flex justify-center">
          <p className="text-white text-center text-lg leading-relaxed max-w-xs">
            Welcome to Fstiva! Your one-stop shop of global festivals. Fun starts at your doorstep! But where will it take you? 
          </p>
        </div>

        {/* Right side - Login Form */}
        <div className="flex-1 w-full max-w-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 rounded bg-white text-black"
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-3 rounded bg-white text-black"
            />
            <button
              type="submit"
              className="w-full p-3 rounded font-semibold text-black hover:opacity-80"
              style={{ backgroundColor: '#F08B00' }}
            >
              Sign In
            </button>
          </form>

          {/* Hidden admin login link */}
          <p
            className="mt-6 text-center text-xs cursor-pointer select-none"
            style={{ color: '#121212' }}
            onMouseEnter={(e) => (e.target.style.color = '#555')}
            onMouseLeave={(e) => (e.target.style.color = '#121212')}
            onClick={() => navigate('/login')}
          >
            Admin Access
          </p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
