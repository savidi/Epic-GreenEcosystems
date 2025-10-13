import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ContactMessagesList.css';
import Nav from "../Nav/Nav";
//import Footer from '../Footer/Footer';

const ContactMessagesList = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch all contact messages
  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/contact');
      
      if (response.data.success) {
        // Handle both possible response formats
        const contactData = response.data.contacts || response.data.messages || [];
        setMessages(contactData);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load contact messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete a message
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:5000/contact/${id}`);
      
      if (response.data.success) {
        setMessages(messages.filter(msg => msg._id !== id));
        setDeleteConfirm(null);
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Failed to delete message. Please try again.');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // View message details
  const viewMessage = (message) => {
    setSelectedMessage(message);
  };

  // Close modal
  const closeModal = () => {
    setSelectedMessage(null);
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="messages-page">
        
        <div className="messages-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading messages...</p>
          </div>
        </div>
      
      </div>
    );
  }

  return (
    <div className="messages-page">
       <Nav />
      
      <div className="messages-container">
        <div className="messages-header">
          <h1>Contact Messages</h1>
          <p className="messages-count">Total Messages: {messages.length}</p>
          <button className="refresh-btn" onClick={fetchMessages}>
            <i className="icon-refresh"></i> Refresh
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchMessages}>Retry</button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="no-messages">
            <i className="icon-inbox"></i>
            <h3>No messages yet</h3>
            <p>Contact form submissions will appear here</p>
          </div>
        ) : (
          <div className="messages-grid">
            {messages.map((message) => (
              <div key={message._id} className="message-card">
                <div className="message-card-header">
                  <h3>{message.name}</h3>
                  <span className="message-date">{formatDate(message.date)}</span>
                </div>
                
                <div className="message-card-body">
                  <div className="message-info">
                    <p><strong>Email:</strong> {message.email}</p>
                    {message.company && <p><strong>Company:</strong> {message.company}</p>}
                    {message.phone && <p><strong>Phone:</strong> {message.phone}</p>}
                    <p><strong>Subject:</strong> {message.subject}</p>
                  </div>
                  
                  <div className="message-preview">
                    <p>{message.message.substring(0, 100)}
                      {message.message.length > 100 && '...'}
                    </p>
                  </div>
                </div>

                <div className="message-card-actions">
                  <button 
                    className="view-btn"
                    onClick={() => viewMessage(message)}
                  >
                    View Details
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => setDeleteConfirm(message._id)}
                  >
                    Delete
                  </button>
                </div>

                {deleteConfirm === message._id && (
                  <div className="delete-confirm">
                    <p>Are you sure you want to delete this message?</p>
                    <div className="confirm-actions">
                      <button 
                        className="confirm-yes"
                        onClick={() => handleDelete(message._id)}
                      >
                        Yes, Delete
                      </button>
                      <button 
                        className="confirm-no"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            
            <div className="modal-header">
              <h2>Message Details</h2>
              <span className="modal-date">{formatDate(selectedMessage.date)}</span>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <label>Name:</label>
                <p>{selectedMessage.name}</p>
              </div>

              <div className="detail-row">
                <label>Email:</label>
                <p><a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a></p>
              </div>

              {selectedMessage.company && (
                <div className="detail-row">
                  <label>Company:</label>
                  <p>{selectedMessage.company}</p>
                </div>
              )}

              {selectedMessage.phone && (
                <div className="detail-row">
                  <label>Phone:</label>
                  <p><a href={`tel:${selectedMessage.phone}`}>{selectedMessage.phone}</a></p>
                </div>
              )}

              <div className="detail-row">
                <label>Subject:</label>
                <p>{selectedMessage.subject}</p>
              </div>

              <div className="detail-row">
                <label>Message:</label>
                <p className="message-full">{selectedMessage.message}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="reply-btn"
                onClick={() => window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
              >
                Reply via Email
              </button>
              <button 
                className="modal-delete-btn"
                onClick={() => {
                  handleDelete(selectedMessage._id);
                }}
              >
                Delete Message
              </button>
            </div>
          </div>
        </div>
      )}
 
    </div>
  );
};

export default ContactMessagesList;