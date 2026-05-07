import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import PhoneInput from 'react-phone-input-2/lib/lib.js';
import 'react-phone-input-2/lib/style.css';
import Logo from '../assets/logo.png';
import ChangePassword from '../components/ChangePassword';


const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    dateofbirth: '',
    country: '',
    city: '',
    email: '',
    phone: '',
    gender: '',
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFormData({
          name: response.data.name,
          dateofbirth: response.data.dateofbirth || '',
          country: response.data.country || '',
          city: response.data.city || '',
          email: response.data.email,
          phone: response.data.phone || '',
          gender: response.data.gender || '',
        });
      } catch (error) {
        alert('Failed to fetch profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put('/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <div className="flex flex-col justify-start md:flex-row items-start gap-12 w-full max-w-9xl px-8">
        {/* Left side - Logo and greeting */}
        <div className="flex items-center gap-4">
          <img src={Logo} alt="Logo" className="w-48 h-48 object-contain" />
          <p className="text-black text-left text-4xl font-bold leading-relaxed">
            Hey, <span style={{ color: '#F08B00' }}>{formData.name}</span>!
          </p>
        </div>

    <div className="max-w-md ml-auto mt-20">
      <h1 className="text-2xl font-bold mb-4 text-center">Update Your Profile</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="date"
          placeholder="Date of Birth"
          value={formData.dateofbirth}
          onChange={(e) => setFormData({ ...formData, dateofbirth: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Country"
          value={formData.country}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="City"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <PhoneInput
          country={'au'}
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Gender"
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <button type="submit" 
              className="w-full p-3 rounded font-semibold text-black hover:opacity-80"
              style={{ backgroundColor: '#F08B00' }}
        >
          {loading ? 'Updating...' : 'Save changes'}
        </button>
      </form>

      <p
        className="mt-4 text-center text-sm cursor-pointer underline"
        style={{ color: '#F08B00' }}
        onClick={() => setShowChangePassword(true)}
      >
        Change Password
      </p>

      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}
    </div>
      </div>
  );
};

export default Profile;

