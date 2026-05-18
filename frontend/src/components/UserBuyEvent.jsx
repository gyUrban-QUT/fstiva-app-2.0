import { useState, useEffect} from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const BuyEvent = ({ events, setEvents, editingEvent, setEditingEvent, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ title: '', description: '', date: '', location: '', price: '' });

   useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        description: editingEvent.description,
        date: editingEvent.date,
        location: editingEvent.location,
        price: editingEvent.price,
      });
    } else {
      setFormData({ title: '', description: '', date: '', location: '', price: '' });
    }
  }, [editingEvent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        const response = await axiosInstance.put(`/api/userevents/${editingEvent._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setEvents(events.map((event) => (event._id === response.data._id ? response.data : event)));
      } else {
        const response = await axiosInstance.post('/api/userevents', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setEvents([...events, response.data]);
      }
      setEditingEvent(null);
      setFormData({ title: '', description: '', date: '', location: '', price: '' });
    } catch (error) {
      alert('Failed to save event.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-100">
      <div class="flex h-auto w-[1000px] ">
      <div className="bg-white p-6 rounded shadow-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full mb-4 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full mb-4 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full mb-4 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full mb-4 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full mb-4 p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full p-3 rounded font-semibold text-black hover:opacity-80"
            style={{ backgroundColor: '#F08B00' }}
          >
            {editingEvent ? 'Update Event' : 'Add New Event'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full p-3 mt-2 rounded font-semibold text-gray-600 hover:bg-gray-100 border"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
</div>
  );
};

export default EditEvent;
