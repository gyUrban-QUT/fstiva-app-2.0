import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import Logo from '../assets/logo.png';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/auth/register', formData);
      alert('Registration successful. Please log in.');
      navigate('/login');
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
{/* Left side - Logo and greeting */}
        <div className="flex items-center gap-4">
          <img src={Logo} alt="Logo" className="w-48 h-48 object-contain" />
          <p className="text-black text-left text-4xl font-bold leading-relaxed">
            Hey, welcome to <span style={{ color: '#F08B00' }}>Fstiva</span>!
          </p>
        </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <button type="submit" className="w-full text-white p-2 rounded" style={{ backgroundColor: '#F08B00' }}>
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
