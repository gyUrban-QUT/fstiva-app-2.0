// UserEventList component
// Displays a list of user event reservations with edit and cancel actions.
// Props:
//   - tasks: Array of task/event objects to display
//   - setTasks: State setter to update the task list after deletion
//   - setEditingTask: Callback to set the task being edited

import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const UserEventList = ({ tasks, setTasks, setEditingTask }) => {
  const { user } = useAuth(); // Get current user for auth token

  // Handles cancelling a reservation by deleting the task via API
  const handleDelete = async (taskId) => {
    try {
      await axiosInstance.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      // Remove the deleted task from local state
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      alert('Failed to cancel reservation.');
    }
  };

  return (
    <div>
      {/* Map through each task and render an event card */}
      {tasks.map((task) => (
        <div
          key={task._id}
          
          className="rounded-2xl border-2 p-4 mb-4"
          style={{ borderColor: '#F08B00', backgroundColor: '#121212' }}
        >
          <div className="flex flex-row items-start gap-8 w-full max-w-9xl px-8">
          {/* Event details */}
          <div className="w-64 border p-2" style={{ borderColor: '#121212' }}>
            <h2 className="font-bold text-white break-words">{task.title}</h2>
          </div>
          <div className="w-96 border p-2" style={{ borderColor: '#121212' }}>
            <p className="text-white break-words">{task.description}</p>
          </div>
          <div className="w-96 border p-2" style={{ borderColor: '#121212' }}>
          <p className="text-white break-words">
            Deadline: {new Date(task.deadline).toLocaleDateString()}
          </p>
          </div>
          {/* Action buttons */}
          <div className="w-96 border p-2" style={{ borderColor: '#121212' }}>
            <div className="mt-2 flex gap-8">
              <button
                onClick={() => setEditingTask(task)}
                className="p-2 rounded font-semibold text-black hover:opacity-80"
                style={{ backgroundColor: '#F08B00' }}
              >
                Edit Reservation
              </button>
              <button
                onClick={() => handleDelete(task._id)}
                className="p-2 rounded font-semibold text-black hover:opacity-80"
                style={{ backgroundColor: '#F08B00' }}
              >
                Cancel Reservation
              </button>
            </div>
          </div>
        </div>
        </div>
      ))}
    </div>
  );
};

export default UserEventList;
