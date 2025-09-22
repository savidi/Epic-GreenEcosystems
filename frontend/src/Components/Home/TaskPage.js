import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TaskPage.css";

function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [formData, setFormData] = useState({ title: "", description: "", dueDate: "" });
  const [editingTaskId, setEditingTaskId] = useState(null); // new state for editing

  const displayDate = new Date(selectedDate);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/tasks");
      const allTasks = res.data.data || [];
      const filtered = allTasks.filter(
        (t) => new Date(t.dueDate).toISOString().slice(0, 10) === selectedDate
      );
      setTasks(filtered);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load tasks");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);

  const handlePrevDay = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setSelectedDate(prevDate.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setSelectedDate(nextDate.toISOString().slice(0, 10));
  };

  const handleDateChange = (e) => setSelectedDate(e.target.value);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTaskId) {
        // Update existing task
        await axios.put(`http://localhost:5000/tasks/${editingTaskId}`, {
          ...formData,
          dueDate: formData.dueDate || selectedDate,
        });
      } else {
        // Add new task
        await axios.post("http://localhost:5000/tasks", {
          ...formData,
          dueDate: formData.dueDate || selectedDate,
        });
      }

      setFormData({ title: "", description: "", dueDate: "" });
      setEditingTaskId(null);
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Error saving task");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axios.delete(`http://localhost:5000/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Error deleting task");
    }
  };

  const handleEdit = (task) => {
    setEditingTaskId(task._id);
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.slice(0, 10),
    });
    setShowForm(true);
  };

  return (
    <div className="task-page-container">
      <div className="task-page-card">
        <div className="task-page-header">
          <div>
            <h3 className="chart-title">📋 Tasks</h3>
            <div className="chart-month-display">{displayDate.toDateString()}</div>
          </div>
          {!loading && !showForm && (
            <div className="chart-stats-box">
              <div className="chart-stats-label">TOTAL</div>
              <div className="chart-stats-value">{tasks.length}</div>
            </div>
          )}
        </div>

        <div className="date-selector-wrapper">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="date-selector"
          />
          <div className="chart-navigation">
            <button className="nav-btn" onClick={handlePrevDay}>
              &lt;
            </button>
            <button className="nav-btn" onClick={handleNextDay}>
              &gt;
            </button>
            <button className="refresh-btn" onClick={fetchTasks}>
              ↻
            </button>
          </div>
          <button className="refresh-btn add-task-btn" onClick={() => setShowForm(true)}>
            Add Task
          </button>
        </div>

        {showForm ? (
          <div className="task-form-container">
            <form className="task-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="title"
                placeholder="Task Title"
                value={formData.title}
                onChange={handleChange}
                required
              />
              <textarea
                name="description"
                placeholder="Task Description"
                value={formData.description}
                onChange={handleChange}
              />
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
              <div className="chart-navigation">
                <button type="submit" className="refresh-btn">
                  {editingTaskId ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  className="refresh-btn delete-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTaskId(null);
                    setFormData({ title: "", description: "", dueDate: "" });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="task-list-container">
            {loading ? (
              <div className="chart-loading">Loading tasks...</div>
            ) : error ? (
              <div className="chart-error">{error}</div>
            ) : tasks.length === 0 ? (
              <div className="chart-no-data">No tasks for this date</div>
            ) : (
              <ul className="task-list">
                {tasks.map((task) => (
                  <li key={task._id} className="task-item">
                    <div className="task-info">
                      <h4>{task.title}</h4>
                      <p>{task.description}</p>
                      <small>Due: {new Date(task.dueDate).toLocaleDateString()}</small>
                    </div>
                    <div className="task-item-buttons">
                      <button className="refresh-btn" onClick={() => handleEdit(task)}>
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(task._id)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskPage;
