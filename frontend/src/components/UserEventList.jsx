// UserEventList component
// Displays a list of user event reservations with edit and cancel actions.
// Props:
//   - events: Array of event objects to display
//   - setEvents: State setter to update the event list after deletion
//   - setEditingEvent: Callback to set the event being edited

import { useAuth } from '../context/AuthContext';
import { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import Empty from '../assets/emptycart.svg';
import UserFindEvents from '../components/UserFindEvents';
import { getEventImage } from '../assets/eventImages';
import fx from '../utils/functions.js';
import { renderManageBookingModule } from './ManageBookingModule';



const UserEventList = ({ onClose, events, setEvents, purchaseEvent, setPurchaseEvent}) => {
  const navigate = useNavigate();
  const handleOpenDetails = (eventId) => {
    if (onClose) onClose();
    navigate('/events/' + eventId);
  };
  const { user } = useAuth(); // Get current user for auth token
  const [selectedId, setSelectedId] = useState(null); // Track which event is interacted with
  const [showUserFindEvents, setShowUserFindEvents] = useState(false);
  const [changedQty, setChangedQty] = useState(null); //track if qty changes

  useEffect(() => {
      const fetchEvents = async () => {
        try {
          const response = await axiosInstance.get('/api/userevents', {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          const sortedEvents = response.data.toSorted((a, b) => new Date(a.startdate) - new Date(b.startdate));
          setEvents(sortedEvents);
        } catch (error) {
          alert('Failed to fetch events.');
        }
      };

      fetchEvents();
    }, [user, setEvents]);

  // Handles cancelling a reservation by deleting the event via API
  const handleDelete = async (eventId) => {
    const eventToDelete = events.find((event) => event._id === eventId);

    
    try {
      await axiosInstance.delete(`/api/userevents/${eventToDelete._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
        data: { price: fx.numericPrice(eventToDelete.price) }
      });
       
      // Remove the deleted event from local state
       setEvents((prevEvents) => prevEvents.filter((e) => e._id !== eventToDelete._id));
    } catch (error) {
      alert('Failed to cancel reservation.');
    }
  };

  // add new reservation to list of events after successful reservation
  const handleReserved = (newReservation) => {
    setEvents((prevEvents) => [...prevEvents, newReservation]);
  };

  const handleUpdate = async (eventId) => {
    
    const eventToUpdate = events.find((event) => event._id === eventId);
    // const confirmDelete = window.confirm('Are you sure you want to cancel this reservation?');
    // if (!confirmDelete) return;
    try {
      await axiosInstance.patch(`/api/userevents/${eventToUpdate._id}`, {
        qty: eventToUpdate.qty,
        //unitPrice: numericPrice(eventToUpdate.price), 
        paymenttype: 'default'  // get from user selection later
      }, {headers: { Authorization: `Bearer ${user.token}` }});
      // Refetch events to get updated prices from server
      const response = await axiosInstance.get('/api/userevents', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEvents(response.data);
      setChangedQty(null); // Reset changed state after successful update
    } catch (error) {
      alert('Failed to update reservation.');
    };
    setSelectedId(null); //reset selected ID once update processed

  };

     return (
        <div className="w-full flex-col items-center justify-center gap-12 mt-8 px-4 md:px-8"> 
          <div className={`mb-6 flex ${events.length > 0 ? 'justify-left' : 'justify-center'}`}>
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
          // add opening event details page functionality
      <div
          key={event._id}
          className="mb-4 rounded-2xl border-0 p-0 w-full"
          // style={{backgroundColor: '#272727' }}
          onClick={() => handleOpenDetails(event.eventId)}
        >
          <div
            key={event._id}
            
            className="flex flex-col md:flex-row rounded-2xl border-2 p-4 mb-4 w-full"
            style={{ borderColor: '#F08B00', backgroundColor: '#272727' }}
        >
          <div className="flex flex-col md:flex-row items-start gap-2 w-full max-w-9xl px-4 md:px-8">
          {/* Event details */}
          <div className="w-full md:w-1/6 flex-shrink-0 border p-2" style={{ borderColor: '#272727' }}>
            <img src={getEventImage(event.imagekey)} alt={event.title} />
          </div>
          <div className="w-full md:w-1/12 flex-shrink-0 border-0 p-2" style={{ borderColor: '#121212' }}>
            <h2 className="font-bold text-white break-words">{event.title}</h2>
          </div>
          <div className="w-full md:w-1/12 flex-shrink-0 border-0 p-2" style={{ borderColor: '#121212' }}>
          <p className="text-white break-words">
            Date: {event.date}
          </p>
          </div>
          <div className="w-full md:w-1/12 flex-shrink-0 border-0 p-2" style={{ borderColor: '#121212' }}>
          <p className="text-white break-words">{event.location}</p>
          </div>
          <div className="w-full md:w-2/6 h-42 overflow-y-scroll border-0 p-2" style={{ borderColor: '#121212' }}>
            <p className="text-white break-words">{event.description}</p>
          </div>
          <div className="w-full md:w-auto flex-shrink-0 border-0 p-2" style={{ borderColor: '#121212' }}>
            <p className="text-white break-words">Ticket price: {event.price} </p>
          </div>
          {/* ManageBookingModule - quantity controls and action buttons */}
          {renderManageBookingModule({
            event,
            qty: event.qty ?? 1,
            onQtyChange: (newQty) => {
              setEvents(events => events.map(
                e => e._id === event._id ? {...e, qty: newQty} : e
              ));
              setChangedQty(event._id);
            },
            onUpdate: () => handleUpdate(event._id),
            onCancel: () => handleDelete(event._id),
            hasChanges: changedQty === event._id,
            isUpdating: selectedId === event._id
          })}
        </div>
        </div>
      </div>
      ))) : (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center justify-center gap-4">
            <img src={Empty} alt="No reservations" className="w-48 h-48 md:w-64 md:h-64 mb-4 opacity-50" />
            <p className="text-gray-400 text-lg">Nothing to see here ... for now.</p>
          </div>
            
      </div>
      )}
    </div>
  );
}
      

export default UserEventList;


