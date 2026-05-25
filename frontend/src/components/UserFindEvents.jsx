import { useState, useEffect} from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { getEventImage } from '../assets/eventImages';


const UserFindEvents = ({  onClose, onReserved }) => {
  const { user } = useAuth();
  const [allEvents, setAllEvents] = useState([]);  
  const [loading, setLoading] = useState(true); 
  const [submittingId, setSubmittingId] = useState(null);

   useEffect(() => {
   const fetchAllEvents = async () => {
      try {
        const response = await axiosInstance.get('/api/userevents/all', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setAllEvents(response.data);
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
  
  const handleReserve = async (event) => {
    try {
      setSubmittingId(event._id);

      const response = await axiosInstance.post(
        '/api/userevents',
        { eventId: event._id,
          title: event.title,
          date: event.date,
          location: event.location,
          description: event.description,
          price: event.price,
          purchased: true,
          purchaseDate: new Date().toISOString(),
          imagekey: event.imagekey,
          qty: 1,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      onReserved(response.data);
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reserve event.');
    } finally {
      setSubmittingId(null);
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
                  <button
                    className="rounded p-2 font-semibold text-black hover:opacity-80 disabled:opacity-50"
                    style={{ backgroundColor: '#F08B00' }}
                    onClick={() => {handleReserve(event);
                  // window.location.reload(); // Refreshes the current page
                }}
                    disabled={submittingId === event._id}
                  >
                    {submittingId === event._id ? 'Reserving...' : 'Reserve'}
                    {/* {window.location.reload() // Refreshes the current page
                    } */}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </div>
  );
};

export default UserFindEvents;