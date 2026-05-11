// UserEventList component
// Displays a list of user event reservations with edit and cancel actions.
// Props:
//   - events: Array of event objects to display
//   - setEvents: State setter to update the event list after deletion
//   - setEditingEvent: Callback to set the event being edited

import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import Empty from '../assets/emptycart.svg';
import UserFindEvents from '../components/UserFindEvents';

const UserEventList = ({ events, setEvents, purchaseEvent, setPurchaseEvent }) => {
  const { user } = useAuth(); // Get current user for auth token
  
  const [showUserFindEvents, setShowUserFindEvents] = useState(false);
  
  useEffect(() => {
      const fetchEvents = async () => {
        try {
          const response = await axiosInstance.get('/api/userevents', {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          setEvents(response.data);
        } catch (error) {
          alert('Failed to fetch events.');
        }
      };

      fetchEvents();
    }, [user]);

  // Handles cancelling a reservation by deleting the event via API
  const handleDelete = async (event) => {
    // const eventToDelete = events.find((event) => event._id === eventId);
    const confirmDelete = window.confirm('Are you sure you want to cancel this reservation?');
    if (!confirmDelete) return;
    try {
      await axiosInstance.delete(`/api/userevents/${event._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      // Remove the deleted event from local state
       setEvents((prevEvents) => prevEvents.filter((e) => e._id !== event._id));
    } catch (error) {
      alert('Failed to cancel reservation.');
    }
  };
  // add new reservation to list of events after successful reservation
  const handleReserved = (newReservation) => {
    setEvents((prevEvents) => [...prevEvents, newReservation]);
  };

  return (
        <div className=" w-full flex-col items-center justify-center gap-12 mt-8"> 
          <div className="mb-6 flex justify-left">
            <button
              className="p-2 rounded font-semibold text-black hover:opacity-80"
              style={{ backgroundColor: '#F08B00' }}
              onClick={() => setShowUserFindEvents(true)}
            >
              Find Events
            </button>
          </div>

          {showUserFindEvents && (
            <UserFindEvents
              onClose={() => setShowUserFindEvents(false)}
              onReserved={handleReserved}
            />
          )}
      {/* Map through each event and render an event card */}
      {events.length > 0 ? (
        events.map((event) => (
          <div
            key={event._id}
            
            className="rounded-2xl border-2 p-4 mb-4 w-full"
            style={{ borderColor: '#F08B00', backgroundColor: '#121212' }}
        >
          <div className="flex flex-row items-start gap-2 max-w-9xl px-8">
          {/* Event details */}
          <div className="w-64 border p-2" style={{ borderColor: '#121212' }}>
            <h2 className="font-bold text-white break-words">{event.title}</h2>
          </div>
          <div className="w-96 border p-2" style={{ borderColor: '#121212' }}>
          <p className="text-white break-words">
            Date: {new Date(event.date).toLocaleDateString()}
          </p>
          </div>
          <div className="w-96 border p-2" style={{ borderColor: '#121212' }}>
          <p className="text-white break-words">{event.location}</p>
          </div>
          <div className="w-96 border p-2" style={{ borderColor: '#121212' }}>
            <p className="text-white break-words">{event.description}</p>
          </div>
          <div className="w-96 border p-2" style={{ borderColor: '#121212' }}>
          <p className="text-white break-words">Tickets from: {event.price}</p>
          </div>

          {/* Action buttons */}
          <div className=" border p-2" style={{ borderColor: '#121212' }}>
            <div className="mt-2 flex gap-8">
              {/* <button
                onClick={() => setEditingEvent(event)}
                className="p-2 rounded font-semibold text-black hover:opacity-80"
                style={{ backgroundColor: '#F08B00' }}
              >
                Edit Reservation
              </button> */}
              <button
                onClick={() => {
                  handleDelete(event);
                  // window.location.reload(); // Refreshes the current page
                }}
                className="p-2 rounded font-semibold text-black hover:opacity-80"
                style={{ backgroundColor: '#F08B00' }}
              >
                Cancel Reservation
              </button>
            </div>
          </div>
        </div>
        </div>
      ))) : (
        <div className="flex flex-col items-center justify-center gap-12 mt-8">
          <div className="flex flex-col items-center justify-center mt-8">
            <img src={Empty} alt="No reservations" className="w-64 h-64 mb-4 opacity-50" />
            <p className="text-gray-400 text-lg">Nothing to see here ... for now.</p>
          </div>
            
      </div>
      )}
    </div>
  );
}
      

export default UserEventList;
