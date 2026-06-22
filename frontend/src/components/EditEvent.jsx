import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const EMPTY_SCHEDULE_ROW = { day: '', time: '', location: '', program: '', Details: ''};


const normalizeSchedule = (rawSchedule) => {
  if (Array.isArray(rawSchedule)) {
    return rawSchedule.map((row) => ({
      day: row?.day ?? '',
      time: row?.time ?? '',
      location: row?.location ?? '',
      program: row?.program ?? '',
      Details: row?.Details ?? '',
    }));
  }

  if (typeof rawSchedule === 'string' && rawSchedule.trim()) {
    return [{ day: '', time: '', location: '', program: rawSchedule.trim(), Details: '' }];
  }

  return [{ ...EMPTY_SCHEDULE_ROW }];
};

const EditEvent = ({ events, setEvents, editingEvent, setEditingEvent, onClose }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    price: '',
    imagekey: '',
  });

  const [formDetail, setFormDetail] = useState({
    descriptionDetail: '',
    schedule: [{ ...EMPTY_SCHEDULE_ROW }],
  });

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title || '',
        description: editingEvent.description || '',
        date: editingEvent.date || '',
        location: editingEvent.location || '',
        price: editingEvent.price || '',
        imagekey: editingEvent.imagekey || '',
      });
      setFormDetail({
        descriptionDetail: editingEvent.descriptionDetail || '',
        schedule: normalizeSchedule(editingEvent.schedule),
      });
    } else {
      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        price: '',
        imagekey: '',
      });
      setFormDetail({
        descriptionDetail: '',
        schedule: [{ ...EMPTY_SCHEDULE_ROW }],
      });
    }
  }, [editingEvent]);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!editingEvent?._id || !user?.token) return;

      try {
        const response = await axiosInstance.get(`/api/events/${editingEvent._id}/details`, {
         headers: { Authorization: `Bearer ${user.token}` },
        });

        const details = response.data || {};
        setFormDetail({
          descriptionDetail: details.descriptionDetail || '',
          schedule: normalizeSchedule(details.schedule),
        });
      } catch {
        // Keep defaults if details cannot be fetched.
        setFormDetail({
          descriptionDetail: '',
          schedule: [{ ...EMPTY_SCHEDULE_ROW }],
        });
      }
    };

    fetchEventDetails();
  }, [editingEvent?._id, user?.token]);

  const updateScheduleCell = (index, field, value) => {
    setFormDetail((prev) => {
      const updated = [...prev.schedule];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, schedule: updated };
    });
  };

  const addScheduleRow = () => {
    setFormDetail((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { ...EMPTY_SCHEDULE_ROW }],
    }));
  };

  const removeScheduleRow = (index) => {
    setFormDetail((prev) => {
      if (prev.schedule.length <= 1) return prev;
      return {
        ...prev,
        schedule: prev.schedule.filter((_, i) => i !== index),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedSchedule = formDetail.schedule
      .map((row) => ({
        day: (row.day || '').trim(),
        time: (row.time || '').trim(),
        location: (row.location || '').trim(),
        program: (row.program || '').trim(),
        Details: (row.Details || '').trim(),
      }))
      .filter((row) => row.day || row.time || row.location || row.program || row.Details);

    const payload = {
      ...formData,
      descriptionDetail: formDetail.descriptionDetail,
      schedule: cleanedSchedule,
    };

    try {
      if (editingEvent) {
        const response = await axiosInstance.put('/api/events/'+editingEvent._id, payload, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setEvents(events.map((event) => (event._id === response.data.event._id ? response.data.event : event)));
      } else {
        const response = await axiosInstance.post('/api/events', payload, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setEvents([...events, response.data]);
      }

      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        price: '',
        imagekey: '',
      });
      setFormDetail({
        descriptionDetail: '',
        schedule: [{ ...EMPTY_SCHEDULE_ROW }],
      });
    } catch {
      alert('Failed to save event.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-100">
      <div className="flex h-auto w-[1000px]">
        <div className="bg-white p-6 rounded shadow-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-center">
            {editingEvent ? 'Edit Event' : 'Add New Event'}
          </h2>

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
            <input
              type="text"
              placeholder="Image Key"
              value={formData.imagekey}
              onChange={(e) => setFormData({ ...formData, imagekey: e.target.value })}
              className="w-full mb-4 p-2 border rounded"
            />

            <textarea
              placeholder="Description Detail"
              value={formDetail.descriptionDetail}
              onChange={(e) =>
                setFormDetail({ ...formDetail, descriptionDetail: e.target.value })
              }
              className="w-full mb-4 p-2 border rounded min-h-[100px]"
            />

            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Schedule</h3>
              <button
                type="button"
                onClick={addScheduleRow}
                className="px-3 py-1 rounded border text-sm hover:bg-gray-100"
              >
                Add Row
              </button>
            </div>

            <div className="mb-4 overflow-x-auto border rounded">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border text-left">Day</th>
                    <th className="p-2 border text-left">Time</th>
                    <th className="p-2 border text-left">Location</th>
                    <th className="p-2 border text-left">Program</th>
                    <th className="p-2 border text-left">Details</th>
                    <th className="p-2 border text-left w-[90px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formDetail.schedule.map((row, index) => (
                    <tr key={index}>
                    <td className="p-2 border">
                        <input
                          type="text"
                          value={row.day}
                          onChange={(e) => updateScheduleCell(index, 'day', e.target.value)}
                          placeholder="Day 1"
                          className="w-full p-2 border rounded"
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          type="text"
                          value={row.time}
                          onChange={(e) => updateScheduleCell(index, 'time', e.target.value)}
                          placeholder="10:00 AM"
                          className="w-full p-2 border rounded"
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          type="text"
                          value={row.location}
                          onChange={(e) => updateScheduleCell(index, 'location', e.target.value)}
                          placeholder="Main Stage"
                          className="w-full p-2 border rounded"
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          type="text"
                          value={row.program}
                          onChange={(e) => updateScheduleCell(index, 'program', e.target.value)}
                          placeholder="Headline Band"
                          className="w-full p-2 border rounded"
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          type="text"
                          value={row.Details}
                          onChange={(e) => updateScheduleCell(index, 'Details', e.target.value)}
                          placeholder="watch this band perform"
                          className="w-full p-2 border rounded"
                        />
                      </td>
                      <td className="p-2 border">
                        <button
                          type="button"
                          onClick={() => removeScheduleRow(index)}
                          disabled={formDetail.schedule.length === 1}
                          className="w-full px-2 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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