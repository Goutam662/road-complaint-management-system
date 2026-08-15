import React, { useEffect, useState } from 'react';
import { adminService } from '../services/api';
import './adminDashboard.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await adminService.getUsers();
        setUsers(data.users || []);
      } catch (err) {
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  return (
    <div className="admin-dashboard">
      <section className="dashboard-hero">
        <div className="hero-panel">
          <div className="hero-copy">
            <span className="hero-label">Users</span>
            <h1>Registered Users</h1>
            <p>Review all citizens registered on the portal and their verification status.</p>
          </div>
        </div>
      </section>

      <div className="table-card">
        {loading ? (
          <div className="loading-message">Loading users...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : users.length === 0 ? (
          <div className="no-data">No users found.</div>
        ) : (
          <table className="complaints-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Village</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id || user.email}>
                  <td>{user.name || 'Unknown'}</td>
                  <td>{user.email || '—'}</td>
                  <td>{user.mobile || '—'}</td>
                  <td>{user.village || '—'}</td>
                  <td>
                    <span className={`status-badge ${user.isVerified ? 'badge-resolved' : 'badge-pending'}`}>
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
