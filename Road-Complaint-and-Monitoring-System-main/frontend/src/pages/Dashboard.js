import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { complaintService } from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import Loader from '../components/Loader';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = complaints;

    if (statusFilter) {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (locationFilter) {
      filtered = filtered.filter(c =>
        c.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredComplaints(filtered);
  }, [complaints, statusFilter, locationFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintService.getComplaints();
      setComplaints(response.complaints || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <h1>Welcome, {user?.name || 'User'}!</h1>
            <p>Manage and track all your road complaints from here</p>
          </div>
          {user && (
            <div>
              <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-controls">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <input
            type="text"
            placeholder="Search location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />

          <button onClick={() => { setStatusFilter(''); setLocationFilter(''); }}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Complaints List */}
      <div className="complaints-section">
        <div className="section-header">
          <h2>Your Complaints</h2>
          <Link to="/upload" className="btn btn-primary">+ Submit New Complaint</Link>
        </div>

        {loading ? (
          <Loader message="Loading your complaints..." />
        ) : filteredComplaints.length > 0 ? (
          <div className="complaints-grid">
            {filteredComplaints.map(complaint => (
              <ComplaintCard 
                key={complaint._id || complaint.id} 
                complaint={complaint}
                onClick={() => navigate(`/complaint/${complaint._id || complaint.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>You haven't submitted any complaints yet.</p>
            <Link to="/upload" className="btn btn-primary">Submit Your First Complaint</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
