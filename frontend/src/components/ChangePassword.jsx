import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const ChangePassword = ({ onClose }) => {
  const { user } = useAuth();
  const [passwordData, setPasswordData] = useState({ oldpw: '', newpw: '', newpwrep: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newpw !== passwordData.newpwrep) {
      alert('New passwords do not match.');
      return;
    }
    try {
      await axiosInstance.post('/api/auth/change-password', passwordData, {
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
          <input
            type="password"
            placeholder="Old Password"
            value={passwordData.oldpw}
            onChange={(e) => setPasswordData({ ...passwordData, oldpw: e.target.value })}
            className="w-full mb-4 p-2 border rounded"
          />
          <input
            type="password"
            placeholder="New Password"
            value={passwordData.newpw}
            onChange={(e) => setPasswordData({ ...passwordData, newpw: e.target.value })}
            className="w-full mb-4 p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Repeat New Password"
            value={passwordData.newpwrep}
            onChange={(e) => setPasswordData({ ...passwordData, newpwrep: e.target.value })}
            className="w-full mb-4 p-2 border rounded"
          />
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
