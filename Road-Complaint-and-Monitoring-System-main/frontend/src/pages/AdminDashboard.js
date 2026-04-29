import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, API_BASE_URL } from '../services/api';
import ComplaintLocationMap from '../components/ComplaintLocationMap';
import './adminDashboard.css';


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ location: '', status: '' });
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    withPhotosComplaints: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedComplaintPath, setSelectedComplaintPath] = useState([]);
  const [selectedComplaintRoutePath, setSelectedComplaintRoutePath] = useState([]);

  const handleChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ location: '', status: '' });
    fetchComplaints();
  };

  const fetchComplaints = async () => {
    try {
      const data = await adminService.getComplaints(filters);
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('fetch complaints', err);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats({
        totalComplaints: data.totalComplaints || 0,
        pendingComplaints: data.pendingComplaints || 0,
        inProgressComplaints: data.inProgressComplaints || 0,
        resolvedComplaints: data.resolvedComplaints || 0,
        withPhotosComplaints: data.withPhotosComplaints || 0
      });
    } catch (err) {
      console.error('fetch stats', err);
    }
  };

  const getComplaintId = (complaint) => complaint.id || complaint._id;

  const exportCSV = () => {
    if (complaints.length === 0) return;
    const header = ['ID', 'User', 'Mobile', 'Village', 'Location', 'Status', 'Flags'];
    const rows = complaints.map(c => [
      getComplaintId(c),
      c.user?.name || '',
      c.user?.mobile || '',
      c.user?.village || '',
      c.location || '',
      c.status,
      c.flags || ''
    ]);
    const csv = [header, ...rows]
      .map(r => r.map(v => `"${v}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'complaints.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const changeStatus = async (id, status) => {
    try {
      await adminService.updateComplaintStatus(id, status);
      fetchComplaints();
    } catch (err) {
      console.error('status update', err);
    }
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    try {
      await adminService.deleteComplaint(id);
      fetchComplaints();
    } catch (err) {
      console.error('delete complaint', err);
    }
  };

  const viewImage = (filename) => {
    // open image in modal viewer
    if (filename) {
      setModalImage(`${serverBase}/uploads/${encodeURIComponent(filename)}`);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalImage('');
  };

  const openMap = (complaint) => {
    const roadPath = Array.isArray(complaint.path)
      ? complaint.path
      : [];
    const actualRoadRoute = Array.isArray(complaint.routePath)
      ? complaint.routePath
      : [];
    const fallbackLat = complaint.lat ?? complaint.latitude;
    const fallbackLng = complaint.lng ?? complaint.longitude;

    if (roadPath.length === 0 && actualRoadRoute.length === 0 && (typeof fallbackLat !== 'number' || typeof fallbackLng !== 'number')) {
      return;
    }

    if (roadPath.length > 0 || actualRoadRoute.length > 0) {
      setSelectedComplaintPath(roadPath);
      setSelectedComplaintRoutePath(actualRoadRoute);
    } else {
      setSelectedComplaintPath([{ lat: fallbackLat, lng: fallbackLng }]);
      setSelectedComplaintRoutePath([]);
    }

    setShowLocationModal(true);
  };

  const closeLocationModal = () => {
    setShowLocationModal(false);
    setSelectedComplaintPath([]);
  };

  const renderStatus = status => {
    const map = {
      Pending: 'badge-pending',
      'In Progress': 'badge-progress',
      Resolved: 'badge-resolved'
    };
    return <span className={`status-badge ${map[status]}`}>{status}</span>;
  };

  // initial load
  React.useEffect(() => {
    fetchComplaints();
    fetchStats();
  }, []);

  const serverBase = API_BASE_URL.replace(/\/api$/, '');

  return (
    <div className="admin-dashboard">
      <section className="dashboard-hero">
        <div className="hero-panel">
          <div className="hero-copy">
            <span className="hero-label">Operational Overview</span>
            <h1>Live road complaint monitoring</h1>
            <p>Monitor current workflows, geographic patterns, and priority actions in a single authoritative dashboard.</p>
          </div>
          <div className="hero-action-bar">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin')}>Complaint Dashboard</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/profile')}>Change Password</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/profile')}>Manage Users</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/map')}>Map View</button>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{stats.totalComplaints}</div>
            <div className="metric-label">Total Complaints</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{stats.pendingComplaints}</div>
            <div className="metric-label">Pending</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{stats.inProgressComplaints}</div>
            <div className="metric-label">In Progress</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{stats.resolvedComplaints}</div>
            <div className="metric-label">Resolved</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{stats.withPhotosComplaints}</div>
            <div className="metric-label">With Photos</div>
          </div>
        </div>
      </section>

      <div className="complaints-section">
        <div className="filter-card">
          <div className="filter-header">
            <h2>Search complaints</h2>
            <button type="button" className="btn btn-export" onClick={exportCSV}>Export CSV</button>
          </div>
          <form className="filters" onSubmit={e => { e.preventDefault(); fetchComplaints(); }}>
            <input
              type="text"
              name="location"
              placeholder="Search by location..."
              value={filters.location}
              onChange={handleChange}
            />
            <select name="status" value={filters.status} onChange={handleChange}>
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <button type="submit" className="btn btn-primary">Search</button>
            <button type="button" className="btn btn-secondary" onClick={clearFilters}>Clear</button>
          </form>
        </div>

        <div className="table-card">
          <table className="complaints-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Photo</th>
                <th>User</th>
                <th>Mobile</th>
                <th>Village</th>
                <th>Location</th>
                <th>Status</th>
                <th>Flags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(item => {
                const complaintId = getComplaintId(item);
                return (
                  <tr key={complaintId}>
                    <td>{complaintId}</td>
                    <td>
                      {item.image ? (
                        <img
                          src={`${serverBase}/uploads/${encodeURIComponent(item.image)}`}
                          alt="complaint"
                          className="thumb"
                          onClick={() => viewImage(item.image)}
                        />
                      ) : (
                        <span className="no-thumb">—</span>
                      )}
                    </td>
                    <td>{item.user?.name}</td>
                    <td>{item.user?.mobile}</td>
                    <td>{item.user?.village}</td>
                    <td>{item.location}</td>
                    <td>{renderStatus(item.status)}</td>
                    <td>{item.flags}</td>
                    <td className="actions-cell">
                      <button onClick={() => viewImage(item.image)} className="btn btn-small">View Image</button>
                      <button onClick={() => changeStatus(complaintId, 'Resolved')} className="btn btn-small">Resolve</button>
                      <button onClick={() => deleteComplaint(complaintId)} className="btn btn-small btn-danger">Delete</button>
                      <button
                        onClick={() => openMap(item)}
                        className="btn btn-small"
                      >
                        Map
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="img-modal-overlay" onClick={closeModal}>
          <div className="img-modal" onClick={(e) => e.stopPropagation()}>
            <button className="img-modal-close" onClick={closeModal}>×</button>
            <img src={modalImage} alt="uploaded" />
          </div>
        </div>
      )}

      {showLocationModal && (
        <div className="img-modal-overlay" onClick={closeLocationModal}>
          <div className="location-modal" onClick={(e) => e.stopPropagation()}>
            <button className="img-modal-close" onClick={closeLocationModal}>×</button>
            <h3>Complaint Location</h3>
            <ComplaintLocationMap
              path={selectedComplaintPath}
              routePath={selectedComplaintRoutePath}
              lat={selectedComplaintPath[0]?.lat}
              lng={selectedComplaintPath[0]?.lng}
              height={320}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

