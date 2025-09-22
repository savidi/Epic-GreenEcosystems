const TaskReminder = require("../model/TaskReminder");

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await TaskReminder.find().sort({ dueDate: 1 });
    res.status(200).json({ status: "success", data: tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "fail", message: "Failed to get tasks" });
  }
};

// Add new task
exports.addTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const newTask = await TaskReminder.create({ title, description, dueDate });
    res.status(201).json({ status: "success", data: newTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "fail", message: "Failed to add task" });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;
    const updatedTask = await TaskReminder.findByIdAndUpdate(
      id,
      { title, description, dueDate },
      { new: true }
    );
    res.status(200).json({ status: "success", data: updatedTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "fail", message: "Failed to update task" });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await TaskReminder.findByIdAndDelete(id);
    res.status(200).json({ status: "success", message: "Task deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "fail", message: "Failed to delete task" });
  }
};
