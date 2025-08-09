// controllers/taskController.js
const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  try {
    const { title, description, due_date } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const task = await Task.create({
      user: req.userId,
      title,
      description,
      due_date
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating task' });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { status, sortBy } = req.query;
    const filter = { user: req.userId };
    if (status && ['pending', 'completed'].includes(status)) filter.status = status;

    // Default sort: newest first by created_at
    let sort = { created_at: -1 };

    // Allow sortBy=created_asc | created_desc | due_asc | due_desc
    if (sortBy === 'created_asc') sort = { created_at: 1 };
    if (sortBy === 'created_desc') sort = { created_at: -1 };
    if (sortBy === 'due_asc') sort = { due_date: 1 };
    if (sortBy === 'due_desc') sort = { due_date: -1 };

    const tasks = await Task.find(filter).sort(sort);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting task' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, due_date } = req.body;

    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined && ['pending', 'completed'].includes(status)) task.status = status;
    if (due_date !== undefined) task.due_date = due_date;

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating task' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting task' });
  }
};
