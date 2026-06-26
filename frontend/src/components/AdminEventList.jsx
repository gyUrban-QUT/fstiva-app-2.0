// UserEventList component
// Displays a list of user event reservations with edit and cancel actions.
// Props:
//   - tasks: Array of task/event objects to display
//   - setTasks: State setter to update the task list after deletion
//   - setEditingTask: Callback to set the task being edited

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import EditEvent from '../components/EditEvent';
import { getEventImage } from '../assets/eventImages';
import ConfirmationPopup from '../components/ConfirmationPopup';


const AdminEventList = ({ events, setEvents, setEditingEvent }) => {
  const { user } = useAuth(); // Get current user for auth token
  const [selectedId, setSelectedId] = useState(null); // Track which card is expanded
  const [showEditEvent, setShowEditEvent] = useState(false);

  // handles popup for delete confirmation
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [message, setMessage] = useState('');
  
  
  // const [loading, setLoading] = useState(false);
  const handleCancelClick = async(eventId) => {
    try {
      const response = await axiosInstance.get(`/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      // Extract count from response data
      const deleteImpact = response.data.count;
      // set confirmation message
      setMessage(`Are you sure you want to proceed? This will cancel ${deleteImpact} associated bookings!`)
      setShowConfirmationPopup(true);
      // deletedCount --to do
    } catch (error) {
      alert('Failed to Retrieve Counts.');
    }
  };

  // Handles deleting an event via API
  const handleDelete = async (eventId) => {
    try {
      await axiosInstance.delete(`/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      // const deletedCount = deletedEvent.data.deletedCount
      // Remove the deleted event from local state
      // setTransactionConfMessage(`Event and ${deletedCount} associated bookings cancelled!`)
      setEvents(events.filter((event) => event._id !== eventId));
    } catch (error) {
      alert('Failed to delete event.');
    }
  };

  return (
    <div>
      {/* Map through each event and render an event card */}
      {events.map((event) => (
        <div
          
          key={event._id}
          
          className="rounded-2xl border-2 p-4 mb-4 cursor-pointer"
          style={{ borderColor: '#F08B00', backgroundColor: selectedId === event._id ? '#FFF3E0' : '#ffffff' }}
          onClick={() => setSelectedId(selectedId === event._id ? null : event._id)}
          >
          <div className="flex flex-row items-start gap-8 w-full max-w-9xl px-8">
          {/* Event details */}
          <div className="w-64 border p-2" style={{ borderColor: '#ffffff' }}>
            <img src={getEventImage(event.imagekey)} alt={event.title} />
          </div>
          <div className="w-64 border p-2" style={{ borderColor: '#ffffff' }}>
            <h2 className="font-bold text-black break-words">{event.title}</h2>
          </div>
          <div className="w-64 border p-2" style={{ borderColor: '#ffffff' }}>
            <h2 className="font-bold text-black break-words">{event.date}</h2>
          </div>
          <div className="w-64 border p-2" style={{ borderColor: '#ffffff' }}>
            <h2 className="font-bold text-black break-words">{event.location}</h2>
          </div>
          <div className="w-3/6 h-36 overflow-y-scroll border p-2" style={{ borderColor: '#ffffff' }}>
            <p className="text-black break-words">{event.description}</p>
          </div>
          <div className="w-96 border p-2" style={{ borderColor: '#ffffff' }}>
          <p className="text-black break-words">
            Tickets from: {event.price}
          </p>
          </div>

        </div>

          {/* Action buttons - shown when card is clicked */}
          {selectedId === event._id && (
            <>
              <div className="mt-3 flex gap-2 px-8" onClick={(e) => e.stopPropagation()}>
                <button
                  className="p-2 rounded font-semibold text-black hover:opacity-80"
                  style={{ backgroundColor: '#F08B00' }}
                  onClick={() => setShowEditEvent(true)}
                >
                  Edit Event
                </button>
              {showEditEvent && (
                      <EditEvent
                        events={events}
                        setEvents={setEvents}
                        editingEvent={event}
                        setEditingEvent={() => setShowEditEvent(false)}
                        onClose={() => setShowEditEvent(false)}
                      />
                    )}
                <button
                  onClick={() => {
                    setSelectedId(event._id)
                    handleCancelClick(event._id);
                    // setShowConfirmationPopup(true);
                  }}
                  className="p-2 rounded font-semibold text-black hover:opacity-80"
                  style={{ backgroundColor: '#F08B00' }}
                  
                >
                  Delete Event
                </button>
                <ConfirmationPopup
                    isOpen={showConfirmationPopup}
                    onClose={() => setShowConfirmationPopup(false)}
                    onConfirm={() => {
                      handleDelete(selectedId);
                      setShowConfirmationPopup(false);
                      
                    }}
                    title="Confirm Deletion"
                    message={message}
                  />
                
              </div>
              
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminEventList;



