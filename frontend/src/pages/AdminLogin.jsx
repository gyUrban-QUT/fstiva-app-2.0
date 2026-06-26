import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/auth/admin/login', formData);
      login(response.data);
      navigate('/adminpage');
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="w-full md:w-1/6 md:min-w-[20rem] md:ml-auto justify-middle">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Administrator Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />

        <div className="relative w-full mb-4">
            <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full mb-4 p-2 border rounded"
            />
            <span
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-3 cursor-pointer text-gray-400"
            >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
        </div>
        <button 
          type="submit" 
          className="w-full p-2 rounded font-semibold text-black hover:opacity-80" 
          style={{ backgroundColor: '#F08B00' }}>
          Login
        </button>
      </form>
    </div>
    </div>
  );
};

export default AdminLogin;
