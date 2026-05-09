import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import Logo from '../assets/logo.png';
import Picnic from '../assets/picnic.svg';
import NightParty from '../assets/nightparty.png';

const Homepage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      navigate('/userpage');
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };
const welcomeText = "Welcome to Fstiva!\nYour one-stop shop of global festivals.\nFun starts at your doorstep! But where will it take you?"
  return (
    <div className="min-h-screen flex flex-col items-center justify-top" style={{ backgroundColor: '#121212' }}>
        <div className="w-full flex justify-left pt-8 pb-8 px-8">
            <div className="rounded-2xl border-2 p-4 inline-block" style={{ borderColor: '#F08B00' }}>
                <img src={NightParty} alt="Night Party" className="w-96 h-72 object-contain" />
            </div>
        </div>

      <div className="flex flex-col justify-start md:flex-row items-start gap-12 w-full max-w-9xl px-8">
        <div className="flex-1 flex justify-start">
          <img src={Logo} alt="Logo" className="w-64 h-64 object-contain" />
          <img src={Picnic} alt="Picnic" className="w-64 h-64 object-contain" />
        </div>
        {/* Left side - Logo and image */}
        <div className="flex-1 flex-row justify-start">
          
        </div>

        <div className="flex-1 flex justify-start">
          <p className="text-white text-left text-lg leading-relaxed max-w-xs">
            {welcomeText.split('\n').map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))}
          </p>
        </div>

        {/* Right side - Login Form */}
        <div className="flex-1 w-full max-w-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="@ Email"
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
