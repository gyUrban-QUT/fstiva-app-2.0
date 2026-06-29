import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
// import TaskForm from '../components/TaskForm';
import UserEventList from '../components/UserEventList';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/logo.png';
import Truck from '../assets/truck.png';
import DJ from '../assets/dj.png';
import Singer from '../assets/singer.png';
import Crowd from '../assets/crowd.png';



const Userpage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  // const [showFindEvents, setShowFindEvents] = useState(false);
  // const [editingEvent, setEditingEvent] = useState(null);
  

  useEffect(() => {
    if (!user) return;
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get('/api/userevents', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        console.log(response);
        const sortedEvents = response.data.sort((a, b) => new Date(a.startdate) - new Date(b.startdate));
        setEvents(sortedEvents);
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to fetch events.');
      }
    };

    fetchEvents();
  }, [user]);

  if (!user) {
return null;
};
  return (
    <div className="min-h-screen p-8 w-full flex flex-col items-start justify-top" style={{ backgroundColor: '#121212' }}>
      {/* Top of page - Logo and greeting */}
      <div className="flex flex-col justify-start md:flex-row items-start gap-6 w-full max-w-9xl px-8">
        <div className="flex-1 flex justify-start">
          <img src={Logo} alt="Logo" className="w-48 h-48 object-contain" />
          <p className="text-white text-left text-4xl font-bold leading-relaxed self-end">
            Hey, <span style={{ color: '#F08B00' }}>{user?.name}</span>!
          </p>
        </div>
        {/* <div className="rounded-2xl border-4 p-4 inline-block opacity-50 w-4/6 " style={{ borderColor: '#F08B00'}}> */}
          <div className="flex flex-col justify-start md:flex-row items-start gap-6 px-8 opacity-50">
            <img src={DJ} alt="DJ" className="w-full h-48 object-contain" />
            <img src={Singer} alt="Singer" className="w-full h-48 object-contain" />
            <img src={Crowd} alt="Crowd" className="w-full h-48 object-contain" />
            <img src={Truck} alt="Truck" className="w-full h-48 object-contain" />
          </div>
            
      </div>
{/* middle of page: list of events booked by user */}
      <div className="w-full flex justify-center pt-12">
        <div className="rounded-2xl border-2 p-4 inline-block" 
          style={{ borderColor: '#121212', backgroundColor: '#121212'  }}>
          <UserEventList events={events} setEvents={setEvents} />

        </div>
        </div> 
      </div>
    // </div>
  );
};

export default Userpage;
