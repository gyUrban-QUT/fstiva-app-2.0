import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import AdminEventList from '../components/AdminEventList';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/logo.png';
import EditEvent from '../components/EditEvent';


const AdminPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [showEditEvent, setShowEditEvent] = useState(false);
  
  useEffect(() => {
    if (!user) return;  //if no user logged in handle elegantly
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get('/api/events', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setEvents(response.data);
      } catch (error) {
        alert('Failed to fetch events.');
      }
    };

    fetchEvents();
  }, [user]);
if (!user) return <div className="text-center mt-20">Please log in.</div>;
  return (
    <div className="min-h-screen flex flex-col items-start justify-top" style={{ backgroundColor: '#ffffff' }}>
      {/* Top of page - Logo and greeting */}
        <div className="flex items-center gap-4">
          <img src={Logo} alt="Logo" className="w-48 h-48 object-contain" />
          <p className="text-black text-left text-4xl font-bold leading-relaxed">
            Hey, <span style={{ color: '#F08B00' }}>{user.name}</span>!
          </p>
        </div>
        {/* <div className="flex items-center gap-4">
          <p className="text-black text-left text-xl font-bold leading-relaxed">
            Welcome to the admin panel.
          </p>
        </div> */}

      
<div className="w-full flex justify-center pt-12">
      <div className="flex flex-col items-center justify-center pt-12">
          <div className="flex flex-row items-start justify-start gap-12 w-full max-w-9xl px-8">
              <button
                className="p-2 rounded font-semibold text-black hover:opacity-80"
                style={{ backgroundColor: '#F08B00' }}
                onClick={() => setShowEditEvent(true)}
              >
                Add New Event
              </button>
              {showEditEvent && (
                      <EditEvent
                        events={events}
                        setEvents={setEvents}
                        editingEvent={null}
                        setEditingEvent={() => setShowEditEvent(false)}
                        onClose={() => setShowEditEvent(false)}
                      />
                    )}
            </div>
        <div className="flex flex-row items-start justify-start gap-12 w-full max-w-9xl px-8">
        <div className="rounded-2xl border-2 p-4 inline-block" style={{ borderColor: '#ffffff', backgroundColor: '#ffffff'  }}>
          <AdminEventList 
            events={events} 
            setEvents={setEvents} />
        </div>
        </div> 
      </div>
     </div>
     </div>
  );
};

export default AdminPage;
