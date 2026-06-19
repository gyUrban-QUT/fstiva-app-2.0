import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { getEventImage } from '../assets/eventImages';
import { useNavigate } from 'react-router-dom';
import { reserveUserEvent} from '../services/userEventService'

const normalizeSchedule = (rawSchedule) => {
  if (Array.isArray(rawSchedule)) {
    return rawSchedule
      .map((row) => ({
        day: row?.day ?? '',
        time: row?.time ?? '',
        location: row?.location ?? '',
        program: row?.program ?? '',
        Details: row?.Details ?? '',

      }))
      .filter((row) => row.day || row.time || row.location || row.program || row.Details);
  }

  if (typeof rawSchedule === 'string' && rawSchedule.trim()) {
    return [{ time: '', activity: rawSchedule.trim(), notes: '' }];
  }

  return [];
};


const EventDetailsView = ({ onClose = () => {}, onReserved = () => {} }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [submittingId, setSubmittingId] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axiosInstance.get(`/api/events/${id}/details`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setEventDetails(response.data);
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDetails();
    }
  }, [id, user]);

  if (loading) return <p>Loading event details...</p>;
  if (!eventDetails) return <p>Event not found.</p>;

  const scheduleRows = normalizeSchedule(eventDetails.schedule);
  const handleReserve = async (event) => {
    try {
      setSubmittingId(event._id);

      const reserved = await reserveUserEvent({ event: eventDetails, token: user.token, eventId: id });

      onReserved(reserved);
      onClose();
   } catch (error) {
      console.error('Reserve error:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to reserve event.');

    } finally {
      setSubmittingId(null);
      navigate('/userpage');
    }
    
  };
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#121212' }}>
      <div
        className="mx-auto max-w-4xl rounded-2xl border-2 p-6"
        style={{ borderColor: '#F08B00', backgroundColor: '#272727' }}
      >
        <img
          src={getEventImage(eventDetails.imagekey)}
          alt={eventDetails.title}
          className="mb-6 w-full rounded-xl"
        />

        <h1 className="mb-4 text-3xl font-bold text-white">{eventDetails.title}</h1>

        <p className="mb-2 text-white">Date: {eventDetails.date}</p>
        <p className="mb-2 text-white">Location: {eventDetails.location}</p>
        <p className="mb-2 text-white">Description: {eventDetails.description}</p>
        <p className="mb-2 text-white">Price: {eventDetails.price}</p>
        <div className="mt-6">
          <h2 className="mb-2 text-xl font-semibold text-white">About</h2>
          <p className="text-white">{eventDetails.descriptionDetail}</p>
        </div>

        <div className="mt-6">
          <h2 className="mb-2 text-xl font-semibold text-white">Schedule</h2>

          {scheduleRows.length > 0 ? (
            <div className="overflow-x-auto rounded border border-gray-600">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="p-3 border border-gray-600 text-left text-white">Day</th>
                    <th className="p-3 border border-gray-600 text-left text-white">Time</th>
                    <th className="p-3 border border-gray-600 text-left text-white">Location</th>
                    <th className="p-3 border border-gray-600 text-left text-white">Program</th>
                    <th className="p-3 border border-gray-600 text-left text-white">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleRows.map((row, index) => (
                    <tr key={index} className="bg-gray-900">
                      <td className="p-3 border border-gray-700 text-white">{row.day || '-'}</td>
                      <td className="p-3 border border-gray-700 text-white">{row.time || '-'}</td>
                      <td className="p-3 border border-gray-700 text-white">{row.location || '-'}</td>
                      <td className="p-3 border border-gray-700 text-white">{row.program || '-'}</td>
                      <td className="p-3 border border-gray-700 text-white">{row.Details || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-white">No schedule available.</p>
          )}
        </div>
            <div className="border p-2" style={{ borderColor: '#272727' }}>
                  <button
                    className="rounded p-2 font-semibold text-black hover:opacity-80 disabled:opacity-50"
                    style={{ backgroundColor: '#F08B00' }}
                    onClick={(e) => {e.stopPropagation();
                                      handleReserve(eventDetails);
                      // (e) => 
                    }
                  // window.location.reload(); // Refreshes the current page
                
              }
                    disabled={submittingId === eventDetails._id}
                  >
                    {submittingId === eventDetails._id ? 'Reserving...' : 'Reserve'}
                    {/* {window.location.reload() // Refreshes the current page
                    } */}
                  </button>
                </div>
                
      </div>
    </div>
  );
};

export default EventDetailsView;