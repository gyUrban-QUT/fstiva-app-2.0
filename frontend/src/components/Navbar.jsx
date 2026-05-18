import { Link, useNavigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import { useState } from 'react';
import Logo from '../assets/logo.png';
import Exit from '../assets/Exit.svg';
import Avatar from '../assets/avatar.svg';
import Notif from '../assets/notification.svg';
import Home from '../assets/Home.svg';


const Navbar = () => {
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();


  const handleLogout = () => {
    navigate('/');
    logout();
    
  };


  return (
    <nav className="text-white p-4 flex items-center gap-4" style={{ backgroundColor: '#311B3D' }}>
      <Link to="/" className="text-2xl font-bold flex items-center">
        <img src={Logo} alt="Logo" className="h-8 w-8 mr-2" />
        Fstiva App
      </Link>
      <div className="flex-1 justify-end flex items-center gap-4">
        {/* user Navbar */}
        {user ? (
          user.role === 'admin' ? ( 
            <>
            <div className="flex items-center justify-end w-full">
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/adminpage" className="mr-4">
                  <img src={Home} alt="Home" className="w-10 h-10 object-contain" />
                </Link>
                <Link to="/profile" className="mr-4">
                <img src={Avatar} alt="Avatar" className="w-10 h-10 object-contain" />
                </Link>
                <img src={Notif} alt="Notification" className="w-10 h-10 object-contain" />
                <div className="flex-1 flex justify-start">
                  <button onClick={handleLogout}>
                  <img src={Exit} alt="Exit" className="w-8 h-8 object-contain" />
                  </button>
                </div>
              </div>
              </div>
            </>
          ) : (
            <>

              
            <div className="flex items-center justify-end w-full">
              
                {/* </div> */}
              <div style={{ display: 'flex', gap: '10px' }}>
                  <Link to="/userpage" className="mr-4">
                  <img src={Home} alt="Home" className="w-10 h-10 object-contain" />
                </Link>
                <Link to="/profile" className="mr-4">
                <img src={Avatar} alt="Avatar" className="w-10 h-10 object-contain" />
                </Link>
                <img src={Notif} alt="Notification" className="w-10 h-10 object-contain" />
                <div className="flex-1 flex justify-start">
                  <button onClick={handleLogout}>
                  <img src={Exit} alt="Exit" className="w-8 h-8 object-contain" />
                  </button>
                </div>
              </div>
              </div>
              
            </>
          )
        ) : (
          <>
            {/* <Link to="/login" className="mr-4">Login</Link> */}
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