import React from 'react';
import { formatDate } from '../utils/formatDate';

const ComplaintCard = ({ complaint, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#FFC107';
      case 'In Progress':
        return '#2196F3';
      case 'Resolved':
        return '#4CAF50';
      default:
        return '#999';
    }
  };

  return (
    <div className="complaint-card" onClick={onClick}>
      <div className="complaint-header">
        <div>
          <p className="complaint-kicker">Complaint</p>
          <h3>#{complaint._id || complaint.id}</h3>
        </div>
        <span 
          className="status-badge" 
          style={{ background: getStatusColor(complaint.status) }}
        >
          {complaint.status}
        </span>
      </div>

      <div className="complaint-body">
        <p className="complaint-location">
          <span className="complaint-icon">📍</span>
          {complaint.location}
        </p>
        <p className="complaint-date">
          <span className="complaint-icon">📅</span>
          {formatDate(complaint.createdAt)}
        </p>
        {complaint.description && (
          <p className="complaint-description">{complaint.description.slice(0, 110)}{complaint.description.length > 110 ? '...' : ''}</p>
        )}
      </div>
    </div>
  );
};

export default ComplaintCard;
