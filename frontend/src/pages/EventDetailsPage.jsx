import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { getEventImage } from '../assets/eventImages';
import { useNavigate } from 'react-router-dom';
import { reserveUserEvent } from '../services/userEventService';  // Add this import
import { renderManageBookingModule } from '../components/ManageBookingModule';
import numericPrice from '../utils/functions.js';

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
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  // new states for conditional rendering of manage booking module
  const [userBooking, setUserBooking] = useState(null); // User's booking for this event
  const [bookingQty, setBookingQty] = useState(1);
  const [qtyChanged, setQtyChanged] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isReserving, setIsReserving] = useState(false); //state for new reservations


useEffect(() => {
  const fetchDetails = async () => {
    try {
      const [detailsRes, bookingRes] = await Promise.all([
        axiosInstance.get(`/api/events/${id}/details`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
        axiosInstance.get('/api/userevents', {
          headers: { Authorization: `Bearer ${user.token}` },
        })
      ]);
      
      setEventDetails(detailsRes.data);
      
      // Check if user has this event booked
      const booking = bookingRes.data.find(e => e.eventId === id);
      if (booking) {
        setUserBooking(booking);
        setBookingQty(booking.qty ?? 1);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  if (user) fetchDetails();
}, [id, user]);

  if (loading) return <p>Loading event details...</p>;
  if (!eventDetails) return <p>Event not found.</p>;
// create output for schedule
  const scheduleRows = normalizeSchedule(eventDetails.schedule);
 

  // Add handlers for update and cancel:
  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await axiosInstance.patch(`/api/userevents/${userBooking._id}`, {
        qty: bookingQty,
        paymenttype: 'default'
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      setQtyChanged(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    await axiosInstance.delete(`/api/userevents/${userBooking._id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
      data: { price: numericPrice(userBooking.price) }
    });
    setUserBooking(null);
    navigate('/userpage');
  };

const handleReserve = async (paymentMethod) => {
  setIsReserving(true);
  try {
    const reserved = await reserveUserEvent({ 
      event: eventDetails, 
      token: user.token,
      eventId: id,
      paymentMethod
    });
    return reserved;  // Return instead of updating state
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to reserve event.');
    throw error;  // Re-throw so ManageBookingModule knows it failed
  } finally {
    setIsReserving(false);
  }
};

// New handler called when popup is dismissed
const handleReserveComplete = (reserved) => {
  setUserBooking(reserved);
  setBookingQty(reserved.qty ?? 1);
};

  return (
  <div className="min-h-screen p-8" style={{ backgroundColor: '#121212' }}>
    <div
      className="mx-auto max-w-9xl flex flex-row rounded-2xl border-2 p-6 gap-6"
      style={{ borderColor: '#F08B00', backgroundColor: '#272727' }}
    >
      {/* Left 1/3 - Image */}
      <div className="w-1/3 flex-shrink-0">
        <img
          src={getEventImage(eventDetails.imagekey)}
          alt={eventDetails.title}
          className="w-full h-auto rounded-xl object-cover"
        />
      </div>

      {/* Right 2/3 - Content */}
      <div className="w-2/3 flex flex-col">
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

        <div className="border p-2 mt-auto" style={{ borderColor: '#272727' }}>
          {renderManageBookingModule({
                event: userBooking,
                eventDetails: eventDetails,
                qty: bookingQty,
                onQtyChange: (newQty) => {
                  setBookingQty(newQty);
                  setQtyChanged(true);
                },
                onUpdate: handleUpdate,
                onCancel: handleCancel,
                onReserve: handleReserve,
                onReserveComplete: handleReserveComplete,  // ADD THIS
                hasChanges: qtyChanged,
                isUpdating,
                isReserving
              })}
        </div>
      </div>
    </div>
  </div>
);
};

export default EventDetailsView;