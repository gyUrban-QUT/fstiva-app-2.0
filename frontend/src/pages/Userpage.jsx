import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
// import TaskForm from '../components/TaskForm';
import UserEventList from '../components/UserEventList';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/logo.png';



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
        setEvents(response.data);
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
    <div className="h-screen w-full flex flex-col items-start justify-top" style={{ backgroundColor: '#121212' }}>
      {/* Top of page - Logo and greeting */}
        <div className="flex items-center gap-4">
          <img src={Logo} alt="Logo" className="w-48 h-48 object-contain" />
          <p className="text-white text-left text-4xl font-bold leading-relaxed">
            Hey, <span style={{ color: '#F08B00' }}>{user?.name}</span>!
          </p>
        </div>
      {/* <div className="container mx-auto p-6"> */}
        {/* <TaskForm
          tasks={tasks}
          setTasks={setTasks}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
        /> */}
          <div className="w-full flex justify-center pt-12">
        <div className="rounded-2xl border-2 p-4 inline-block" style={{ borderColor: '#121212', backgroundColor: '#121212'  }}>
          <UserEventList events={events} setEvents={setEvents} />

        </div>
        </div> 
      </div>
    // </div>
  );
};

export default Userpage;
