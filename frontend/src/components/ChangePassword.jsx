import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ChangePassword = ({ onClose }) => {
  const { user } = useAuth();
  const [passwordData, setPasswordData] = useState({ oldpw: '', newpw: '', newpwrep: '' });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  
  const toggleOldPasswordVisibility = () => {
    setShowOldPassword((prev) => !prev);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword((prev) => !prev);
  };

  const toggleRepeatPasswordVisibility = () => {
    setShowRepeatPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newpw !== passwordData.newpwrep) {
      alert('New passwords do not match.');
      return;
    }
    try {
      await axiosInstance.put('/api/auth/profile/password', {
            currentPassword: passwordData.oldpw,
            newPassword: passwordData.newpw,
            }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      alert('Password changed successfully.');
      setPasswordData({ oldpw: '', newpw: '', newpwrep: '' });
      onClose();
    } catch (error) {
      alert('Password change failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Change Password</h2>
        <form onSubmit={handleSubmit}>

        <div className="relative w-full mb-4">
            <input
                type={showOldPassword ? 'text' : 'password'}
                placeholder="Old Password"
                value={passwordData.oldpw}
                onChange={(e) => setPasswordData({ ...passwordData, oldpw: e.target.value })}
                className="w-full p-2 border rounded pr-10"
            />
            <span
                onClick={toggleOldPasswordVisibility}
                className="absolute right-3 top-3 cursor-pointer text-gray-600"
            >
                {showOldPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            </div>
        <div className="relative w-full mb-4">
          <input
            type={showNewPassword ? 'text' : 'password'}
            placeholder="New Password"
            value={passwordData.newpw}
            onChange={(e) => setPasswordData({ ...passwordData, newpw: e.target.value })}
            className="w-full mb-4 p-2 border rounded"
          />
            <span
                onClick={toggleNewPasswordVisibility}
                className="absolute right-3 top-3 cursor-pointer text-gray-600"
            >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
        </div>
        <div className="relative w-full mb-4">
          <input
            type={showRepeatPassword ? 'text' : 'password'}
            placeholder="Repeat New Password"
            value={passwordData.newpwrep}
            onChange={(e) => setPasswordData({ ...passwordData, newpwrep: e.target.value })}
            className="w-full mb-4 p-2 border rounded"
          />
            <span
                onClick={toggleRepeatPasswordVisibility}
                className="absolute right-3 top-3 cursor-pointer text-gray-600"
            >
                {showRepeatPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
        </div>
        <button
            type="submit"
            className="w-full p-3 rounded font-semibold text-black hover:opacity-80"
            style={{ backgroundColor: '#F08B00' }}
          >
            Change Password
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full p-3 mt-2 rounded font-semibold text-gray-600 hover:bg-gray-100 border"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
