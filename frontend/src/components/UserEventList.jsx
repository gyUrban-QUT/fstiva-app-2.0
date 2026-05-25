// UserEventList component
// Displays a list of user event reservations with edit and cancel actions.
// Props:
//   - events: Array of event objects to display
//   - setEvents: State setter to update the event list after deletion
//   - setEditingEvent: Callback to set the event being edited

import { useAuth } from '../context/AuthContext';
import { useState, useEffect} from 'react';
import axiosInstance from '../axiosConfig';
import Empty from '../assets/emptycart.svg';
import UserFindEvents from '../components/UserFindEvents';
import { getEventImage } from '../assets/eventImages';
import ConfirmationPopup from '../components/ConfirmationPopup';
import { FaPlus, FaMinus } from "react-icons/fa"; //+ and - icons for quantity


const UserEventList = ({ events, setEvents, purchaseEvent, setPurchaseEvent}) => {
  const { user } = useAuth(); // Get current user for auth token
  const [selectedId, setSelectedId] = useState(null); // Track which event is interacted with
  const [showUserFindEvents, setShowUserFindEvents] = useState(false);

    // handles popup for cancel confirmation
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  // const [eventQty, setEventQty] = useState(null);
  
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
  const handleDelete = async (eventId) => {
    const eventToDelete = events.find((event) => event._id === eventId);
    // const confirmDelete = window.confirm('Are you sure you want to cancel this reservation?');
    // if (!confirmDelete) return;
    try {
      await axiosInstance.delete(`/api/userevents/${eventToDelete._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
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

  // convert ticket price to numeric to allow for multiplication
  function numericPrice(stringPrice) {
      const numericString = stringPrice.replace(/[^0-9.-]/g, '');
      return parseFloat(numericString) || 0;
  };
  // function to limit qty to between 1 and 10
  function limitQty(num){
    const MIN = 1;
    const MAX = 10;
    const parsed = parseInt(num)
    return Math.min(Math.max(parsed, MIN), MAX)
  };
  
  // increment function
  function incrementQty(qty) {
    const qtyNum = parseFloat(qty)||0;
    return limitQty(qtyNum + 1)
  };

    // reduce function
  function reduceQty(qty) {
    const qtyNum = parseFloat(qty)||0;
    return limitQty(qtyNum - 1)
  };

  // another solution
  // const [eventQty, setEventQty] = useState([]);
  const handleAdd = (eventId) => {
    setEvents(events => events.map(
      event => event._id === eventId
      ? {...event, qty: incrementQty(event.qty??1)} : event
    ));
  };

  const handleReduce = (eventId) => {
    setEvents(events => events.map(
      event => event._id === eventId
      ? {...event, qty: reduceQty(event.qty??1)} : event
    ));
  };

  const handleUpdate = async (eventId) => {
    
    const eventToUpdate = events.find((event) => event._id === eventId);
    // const confirmDelete = window.confirm('Are you sure you want to cancel this reservation?');
    // if (!confirmDelete) return;
    try {
      await axiosInstance.patch(`/api/userevents/${eventToUpdate._id}`, {
        qty: eventToUpdate.qty
      }, {headers: { Authorization: `Bearer ${user.token}` }});
      // Remove the deleted event from local state
      //  setEvents((prevEvents) => prevEvents.filter((e) => e._id !== eventToDelete._id));
    } catch (error) {
      alert('Failed to update reservation.');
    };
    setSelectedId(null); //reset selected ID once update processed
  };

  const [changedQty, setChangedQty] = useState(false);

  return (
        <div className=" w-full flex-col items-center justify-center gap-12 mt-8"> 
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
          <div
            key={event._id}
            
            className="rounded-2xl border-2 p-4 mb-4 w-full"
            style={{ borderColor: '#F08B00', backgroundColor: '#121212' }}
        >
          <div className="flex flex-row items-start gap-2 max-w-9xl px-8">
          {/* Event details */}
          <div className="w-64 border p-2" style={{ borderColor: '#272727' }}>
            <img src={getEventImage(event.imagekey)} alt={event.title} />
          </div>
          <div className="w-64 border p-2" style={{ borderColor: '#121212' }}>
            <h2 className="font-bold text-white break-words">{event.title}</h2>
          </div>
          <div className="w-64 border p-2" style={{ borderColor: '#121212' }}>
          <p className="text-white break-words">
            Date: {event.date}
          </p>
          </div>
          <div className="w-64 border p-2" style={{ borderColor: '#121212' }}>
          <p className="text-white break-words">{event.location}</p>
          </div>
          <div className="w-3/6 h-36 overflow-y-scroll border p-2" style={{ borderColor: '#121212' }}>
            <p className="text-white break-words">{event.description}</p>
          </div>
          <div className="w-sm border p-2" style={{ borderColor: '#121212' }}>
          <p className="text-white break-words">Ticket price: ${numericPrice(event.price) * event.qty??1 }</p>
          </div>
          <div className="flex flex-row items-start gap-2 w-md border p-2" style={{ borderColor: '#121212' }}>
            <button>
              <FaMinus color='#F08B00' size='1rem'
              onClick={() => {
                  setSelectedId(event._id);
                  handleReduce(selectedId);
                  setChangedQty(true);
                }}/>
              
            </button>
          <p className="text-white break-words text-base">{event.qty??1}</p>
            <button>
              <FaPlus color='#F08B00' size='1rem'
              // {/* Update button - shown when card is clicked */}
              onClick={() => {
                  setSelectedId(event._id);
                  handleAdd(selectedId);
                  setChangedQty(true);
                }}
                />
            </button>
          </div>
          {/* Action buttons */}
          <div className="flex flex-col border p-2" style={{ borderColor: '#121212' }}>
            
            <div className="mt-2 flex-col gap-8">
            
             <button
                    onClick={() => {
                      setSelectedId(event._id);
                      handleUpdate(selectedId);
                      setChangedQty(false);
                    }}
                    className="p-2 rounded font-semibold text-black hover:opacity-80"
                    style={{ backgroundColor: '#097c26' }}
                  >
                    Update Reservation
                </button>
            
                </div>
                
              <div className="mt-2 flex-col gap-8">
              <button
                onClick={() => {
                  setSelectedId(event._id)
                  setShowConfirmationPopup(true);
                }}
                className="p-2 rounded font-semibold text-black hover:opacity-80"
                style={{ backgroundColor: '#F08B00' }}
              >
                Cancel Reservation
              </button>
              <ConfirmationPopup
                    isOpen={showConfirmationPopup}
                    onClose={() => setShowConfirmationPopup(false)}
                    onConfirm={() => {
                      handleDelete(selectedId);
                      setShowConfirmationPopup(false);
                    }}
                    title="Confirm Cancellation"
                    message="Are you sure you want to cancel this reservation?"
                  />
            </div>
          </div>
        </div>
        </div>
      ))) : (
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <img src={Empty} alt="No reservations" className="w-64 h-64 mb-4 opacity-50" />
            <p className="text-gray-400 text-lg">Nothing to see here ... for now.</p>
          </div>
            
      </div>
      )}
    </div>
  );
}
      

export default UserEventList;


