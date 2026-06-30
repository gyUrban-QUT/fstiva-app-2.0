import axiosInstance from '../axiosConfig';
import numericPrice from '../utils/functions.js';

export const mapEventToReservationPayload = (event, qty = 1, eventIdOverride = null, paymentMethod = 'card') => ({
  eventId: eventIdOverride || event._id || event.eventId || event.id,  // Try override, then _id, then eventId
  qty: 1, price: numericPrice(event.price), paymenttype: paymentMethod, transactiontype: 'B'
});

export const reserveUserEvent = async ({ event, token, qty = 1, eventId = null, paymentMethod = 'card' }) => {
  const payload = mapEventToReservationPayload(event, qty, eventId, paymentMethod);
  const response = await axiosInstance.post('/api/userevents', payload, {
    headers: { Authorization: 'Bearer ' + token },
  });
  return response.data;
};