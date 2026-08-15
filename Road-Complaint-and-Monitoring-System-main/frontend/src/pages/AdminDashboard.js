import React, { useState, useCallback } from 'react';
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
  const [activeStatus, setActiveStatus] = useState('');

  const getComplaintId = (item) => {
    return item.id || item._id || item.dataValues?.id || item.dataValues?._id || '';
  };

  const normalizePathData = (value) => {
    if (Array.isArray(value)) {
      return value
        .map((point) => {
          if (!point) return null;
          const lat = Number(point.lat ?? point.latitude ?? (Array.isArray(point) ? point[0] : undefined));
          const lng = Number(point.lng ?? point.longitude ?? (Array.isArray(point) ? point[1] : undefined));
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
          return { lat, lng };
        })
        .filter(Boolean);
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return normalizePathData(parsed);
      } catch (err) {
        return [];
      }
    }

    if (value && typeof value === 'object') {
      const lat = Number(value.lat ?? value.latitude);
      const lng = Number(value.lng ?? value.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return [{ lat, lng }];
      }
    }

    return [];
  };

  const handleChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ location: '', status: '' });
    setActiveStatus('');
    fetchComplaints();
  };

  const handleStatusTab = (status) => {
    setActiveStatus(status);
    setFilters({ ...filters, status });
  };

  const fetchComplaints = useCallback(async () => {
    try {
      const data = await adminService.getComplaints(filters);
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('fetch complaints', err);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
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
  }, []);

  const exportCSV = () => {
    if (complaints.length === 0) return;
    const header = ['ID', 'User', 'Mobile', 'Village', 'Location', 'Status', 'Flags'];
    const rows = complaints.map(c => [
      getComplaintId(c),
      c.user?.name || '',
      c.user?.mobile || '',
      c.user?.village || '',
      c.location || '',
      c.status || '',
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
    if (!id) {
      console.error('Missing complaint ID for status update');
      return;
    }

    try {
      await adminService.updateComplaintStatus(id, status);
      fetchComplaints();
      fetchStats(); // Refresh stats after status change
    } catch (err) {
      console.error('status update', err);
    }
  };

  const deleteComplaint = async (id) => {
    if (!id) {
      console.error('Missing complaint ID for delete');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    try {
      await adminService.deleteComplaint(id);
      fetchComplaints();
      fetchStats(); // Refresh stats after delete
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
    const roadPath = normalizePathData(complaint.path);
    const actualRoadRoute = normalizePathData(complaint.routePath);
    const fallbackLat = Number(complaint.lat ?? complaint.latitude ?? roadPath[0]?.lat ?? actualRoadRoute[0]?.lat);
    const fallbackLng = Number(complaint.lng ?? complaint.longitude ?? roadPath[0]?.lng ?? actualRoadRoute[0]?.lng);

    if (roadPath.length === 0 && actualRoadRoute.length === 0 && (!Number.isFinite(fallbackLat) || !Number.isFinite(fallbackLng))) {
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
    setSelectedComplaintRoutePath([]);
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
  }, [fetchComplaints, fetchStats]);

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
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/reports')}>Reports</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/users')}>Users</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/settings')}>Website Settings</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/profile?section=password')}>Change Password</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/contact-messages')}>Contact Messages</button>
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
            <div className="status-tabs">
              {['', 'Pending', 'In Progress', 'Resolved'].map((status) => (
                <button
                  key={status || 'all'}
                  type="button"
                  className={`tab-btn ${activeStatus === status ? 'tab-active' : ''}`}
                  onClick={() => handleStatusTab(status)}
                >
                  {status || 'All'}
                </button>
              ))}
            </div>
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
                  <tr key={complaintId || item.location || Math.random()}>
                    <td>{complaintId || 'N/A'}</td>
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
                      <button type="button" onClick={() => viewImage(item.image)} className="btn btn-small btn-secondary">View Image</button>
                      <button type="button" onClick={() => changeStatus(complaintId, 'Resolved')} className="btn btn-small btn-secondary">Resolve</button>
                      <button
                        type="button"
                        title="Open the complaint location on the map"
                        onClick={() => openMap(item)}
                        className="btn btn-small btn-info"
                      >
                        🚩 Map
                      </button>
                      <button type="button" onClick={() => deleteComplaint(complaintId)} className="btn btn-small btn-danger">Delete</button>
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

