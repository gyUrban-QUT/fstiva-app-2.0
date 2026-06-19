import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Navbar from './components/Navbar';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Userpage from './pages/Userpage';
import Adminpage from './pages/Adminpage';
import EventDetailsPage from './pages/EventDetailsPage';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/userpage" element={<Userpage />} />
        <Route path="/adminpage" element={<Adminpage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />

      </Routes>
    </Router>
  );
}

export default App;
