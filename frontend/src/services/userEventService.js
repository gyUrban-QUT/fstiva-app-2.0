import axiosInstance from '../axiosConfig';
import fx from '../utils/functions.js';

export const mapEventToReservationPayload = (event, qty = 1, eventIdOverride = null) => ({
  eventId: eventIdOverride || event._id || event.eventId || event.id,  // Try override, then _id, then eventId
  qty: 1, price: fx.numericPrice(event.price), paymenttype: 'default', transactiontype: 'B'

});

export const reserveUserEvent = async ({ event, token, qty = 1, eventId = null }) => {
  const payload = mapEventToReservationPayload(event, qty, eventId);
  const response = await axiosInstance.post('/api/userevents', payload, {
    headers: { Authorization: 'Bearer ' + token },
  });
  return response.data;
};