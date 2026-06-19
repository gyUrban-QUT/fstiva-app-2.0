import axiosInstance from '../axiosConfig';

export const mapEventToReservationPayload = (event, qty = 1, eventIdOverride = null) => ({
  eventId: eventIdOverride || event._id || event.eventId,  // Try override, then _id, then eventId
  title: event.title,
  date: event.date,
  location: event.location,
  description: event.description,
  price: event.price,
  purchased: true,
  purchaseDate: new Date().toISOString(),
  imagekey: event.imagekey,
  qty,
});

export const reserveUserEvent = async ({ event, token, qty = 1, eventId = null }) => {
  const payload = mapEventToReservationPayload(event, qty, eventId);
  const response = await axiosInstance.post('/api/userevents', payload, {
    headers: { Authorization: 'Bearer ' + token },
  });
  return response.data;
};