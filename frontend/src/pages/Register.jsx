import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import Logo from '../assets/logo.png';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' , confirmPassword: ''});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
    const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    try {
      await axiosInstance.post('/api/auth/register', formData);
      alert('Registration successful. Please log in.');
      navigate('/');
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-start justify-top" style={{ backgroundColor: '#ffffff' }}>
      {/* Left side - Logo and greeting */}
      <div className="flex items-center gap-4">
          <img src={Logo} alt="Logo" className="w-48 h-48 object-contain" />
          <p className="text-black text-left text-4xl font-bold leading-relaxed">
            Hey, welcome to <span style={{ color: '#F08B00' }}>Fstiva</span>!
          </p>
        </div>
    <div className="max-w-md mx-auto mt-20">

        

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
        <div className="relative w-full mb-4">
                <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full mb-4 p-2 border rounded"
                />
                <span
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-3 cursor-pointer text-gray-400"
                >
                    {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
            </div>
        <button type="submit" className="w-full text-white p-2 rounded" style={{ backgroundColor: '#F08B00' }}>
          Register
        </button>
      </form>
    </div>
    </div>
  );
};

export default Register;
