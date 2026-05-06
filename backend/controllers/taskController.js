const Task = require('../models/Task');
// get tasks function
const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// add task function
const addTask   = async (req, res) => {
    const { title, description , deadline} = req.body;
    try {
        const task = await Task.create({userId: req.user.id, title, description, deadline});
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// update task function
const updateTask = async (req, res) => {
    const { title, description , deadline} = req.body;
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        // if (task.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });
        
        task.title = title || task.title;
        task.description = description || task.description;
        // task.completed = completed ?? task.completed;
        task.deadline = deadline || task.deadline;
        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// delete task function
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        if (task.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });

        await task.remove();
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { getTasks, addTask, updateTask, deleteTask };