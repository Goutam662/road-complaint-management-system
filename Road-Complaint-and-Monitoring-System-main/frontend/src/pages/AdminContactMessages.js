import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/api';
import './adminDashboard.css';

const AdminContactMessages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await adminService.getContactMessages();
        setMessages(data.messages || []);
      } catch (err) {
        setError(err.message || 'Failed to load contact messages');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  return (
    <div className="admin-dashboard">
      <section className="dashboard-hero">
        <div className="hero-panel">
          <div className="hero-copy">
            <span className="hero-label">Admin</span>
            <h1>Contact Messages</h1>
            <p>Review messages submitted by users from the Contact page.</p>
          </div>
          <div className="hero-action-bar">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin')}>Complaint Dashboard</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/profile?section=password')}>Change Password</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/profile?section=users')}>Manage Users</button>
          </div>
        </div>
      </section>

      <div className="table-card">
        {loading ? (
          <div className="loading-message">Loading contact messages...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : messages.length === 0 ? (
          <div className="no-data">No contact messages found.</div>
        ) : (
          <table className="complaints-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id || message._id || message.createdAt + message.email}>
                  <td>{message.name || 'Unknown'}</td>
                  <td>{message.email || 'Unknown'}</td>
                  <td>{message.subject || 'No subject'}</td>
                  <td>{message.message || 'No message'}</td>
                  <td>{new Date(message.createdAt || message.created_at || message.updatedAt || Date.now()).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminContactMessages;
