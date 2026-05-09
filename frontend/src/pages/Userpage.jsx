import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import TaskForm from '../components/TaskForm';
import UserEventList from '../components/UserEventList';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/logo.png';

const Userpage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get('/api/tasks', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks(response.data);
      } catch (error) {
        alert('Failed to fetch tasks.');
      }
    };

    fetchTasks();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col items-start justify-top" style={{ backgroundColor: '#121212' }}>
      {/* Top of page - Logo and greeting */}
        <div className="flex items-center gap-4">
          <img src={Logo} alt="Logo" className="w-48 h-48 object-contain" />
          <p className="text-white text-left text-4xl font-bold leading-relaxed">
            Hey, <span style={{ color: '#F08B00' }}>{user.name}</span>!
          </p>
        </div>
      {/* <div className="container mx-auto p-6"> */}
        {/* <TaskForm
          tasks={tasks}
          setTasks={setTasks}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
        /> */}
          <div className="w-full flex justify-center pt-12">
        <div className="rounded-2xl border-2 p-4 inline-block" style={{ borderColor: '#121212', backgroundColor: '#121212'  }}>
          <UserEventList tasks={tasks} setTasks={setTasks} setEditingTask={setEditingTask} />
        </div>
        </div> 
      </div>
    // </div>
  );
};

export default Userpage;
