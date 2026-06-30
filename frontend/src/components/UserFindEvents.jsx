import { useState, useEffect} from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { getEventImage } from '../assets/eventImages';
import { useNavigate } from 'react-router-dom';
import { reserveUserEvent} from '../services/userEventService'
import { renderButton} from '../components/ReserveButton'
import PaymentMethodPopup from '../components/PaymentMethodPopup';

const UserFindEvents = ({  onClose, onReserved }) => {
  const navigate = useNavigate();

  const { user } = useAuth();
  const [allEvents, setAllEvents] = useState([]);  
  const [loading, setLoading] = useState(true); 
  const [submittingId, setSubmittingId] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenDetails = (eventId) => {
    if (onClose) onClose();
    navigate('/events/' + eventId);
  };
 
   useEffect(() => {
   const fetchAllEvents = async () => {
      try {
        const response = await axiosInstance.get('/api/userevents/all', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const sortedEvents = response.data.toSorted((a, b) => new Date(a.startdate) - new Date(b.startdate));
        setAllEvents(sortedEvents);
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to load events.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAllEvents();
    }
  }, [user]);

  // Step 1: Reserve button clicked — show payment popup instead of reserving immediately
  const handleReserve = async (event) => {
    setPendingEvent(event);
    setShowPaymentPopup(true);
  };

  // Step 2: User confirmed payment method — now actually reserve
  const handlePaymentConfirm = async (paymentMethod) => {
    try {
      setIsProcessing(true);
      setSubmittingId(pendingEvent._id);

      const reserved = await reserveUserEvent({ 
        event: pendingEvent, 
        token: user.token,
        paymentMethod
      });

      setShowPaymentPopup(false);
      setPendingEvent(null);
      onReserved(reserved);
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reserve event.');
    } finally {
      setSubmittingId(null);
      setIsProcessing(false);
    }
  };

 return (
    <div className="flex items-center justify-center w-full">
    <div
      className="fixed inset-0 z-50 flex items-center justify-center "
      onClick={onClose}
    >
      <div
        className="w-4/5 max-h-[85vh] overflow-y-auto rounded-2xl border-2 p-6"
        style={{ borderColor: '#F08B00', backgroundColor: '#121212' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Find Events</h2>
          <button
            className="rounded p-2 font-semibold text-black hover:opacity-80"
            style={{ backgroundColor: '#F08B00' }}
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {loading ? (
          <p className="text-white">Loading events...</p>
        ) : allEvents.length === 0 ? (
          <p className="text-white">No events available right now.</p>
        ) : (
          allEvents.map((event) => (
            
            <div
              key={event._id}
              className="mb-4 rounded-2xl border-2 p-4 w-full"
              style={{ borderColor: '#272727', backgroundColor: '#272727' }}
              onClick={() => handleOpenDetails(event.id)}
            >
              <div className="flex flex-row items-start gap-8 w-full px-4">
                <div className="w-64 border p-2" style={{ borderColor: '#272727' }}>
                  <img src={getEventImage(event.imagekey)} alt={event.title} />
                </div>

                <div className="w-64 border p-2" style={{ borderColor: '#272727' }}>
                  <h3 className="font-bold text-white break-words">{event.title}</h3>
                </div>

                <div className="w-64 border p-2" style={{ borderColor: '#272727' }}>
                  <p className="text-white break-words">{event.date}</p>
                </div>

                <div className="w-64 border p-2" style={{ borderColor: '#272727' }}>
                  <p className="text-white break-words">{event.location}</p>
                </div>

                <div className="w-4/6 h-36 overflow-y-scroll border p-2" style={{ borderColor: '#272727' }}>
                  <p className="text-white break-words">{event.description}</p>
                </div>

                <div className="w-64 border p-2" style={{ borderColor: '#272727' }}>
                  <p className="text-white break-words">Tickets from: {event.price}</p>
                </div>
                
                <div className="border p-2" style={{ borderColor: '#272727' }}>
                  {renderButton(submittingId, event, event.isBooked, handleReserve)} 
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>

    {/* Payment method popup */}
    <PaymentMethodPopup
      isOpen={showPaymentPopup}
      onClose={() => { setShowPaymentPopup(false); setPendingEvent(null); }}
      onConfirm={handlePaymentConfirm}
      isProcessing={isProcessing}
    />

    </div>
  );
};

export default UserFindEvents;