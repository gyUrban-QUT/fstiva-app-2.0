import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="text-white p-4 flex justify-between items-center" style={{ backgroundColor: '#311B3D' }}>
      <Link to="/" className="text-2xl font-bold flex items-center">
        <img src={Logo} alt="Logo" className="h-8 w-8 mr-2" />
        Fstiva
      </Link>
      <div>
        {user ? (
          <>
            <Link to="/tasks" className="mr-4">Tasks</Link>
            <Link to="/profile" className="mr-4">Profile</Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4">Login</Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded hover:opacity-80"
              style={{ backgroundColor: '#F08B00' }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
