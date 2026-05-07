import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import AdminEventList from '../components/AdminEventListList';
import { useAuth } from '../context/AuthContext';

const AdminPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
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

  return (
    <div className="container mx-auto p-6">
      <AdminEventList
        events={events}
        setEvents={setEvents}
        editingEvent={editingEvent}
        setEditingEvent={setEditingEvent}
      />
    </div>
  );
};

export default AdminPage;
