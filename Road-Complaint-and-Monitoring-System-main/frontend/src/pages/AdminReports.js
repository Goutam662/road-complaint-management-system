import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { adminService } from '../services/api';
import './adminDashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const AdminReports = () => {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    withPhotosComplaints: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats({
          totalComplaints: data.totalComplaints || 0,
          pendingComplaints: data.pendingComplaints || 0,
          inProgressComplaints: data.inProgressComplaints || 0,
          resolvedComplaints: data.resolvedComplaints || 0,
          withPhotosComplaints: data.withPhotosComplaints || 0,
          totalUsers: data.totalUsers || 0,
        });
      } catch (err) {
        setError(err.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const reportCards = [
    { label: 'Total Complaints', value: stats.totalComplaints },
    { label: 'Pending', value: stats.pendingComplaints },
    { label: 'In Progress', value: stats.inProgressComplaints },
    { label: 'Resolved', value: stats.resolvedComplaints },
    { label: 'With Photos', value: stats.withPhotosComplaints },
    { label: 'Total Users', value: stats.totalUsers },
  ];

  const statusChartData = {
    labels: ['Pending', 'In Progress', 'Resolved'],
    datasets: [
      {
        label: 'Complaints',
        data: [
          stats.pendingComplaints,
          stats.inProgressComplaints,
          stats.resolvedComplaints,
        ],
        backgroundColor: ['#ffc107', '#0f3d84', '#2a8f6f'],
        borderRadius: 10,
        borderColor: ['#ffb300', '#0a2452', '#1f6c53'],
        borderWidth: 2,
      },
    ],
  };

  const coverageChartData = {
    labels: ['With Photos', 'Without Photos'],
    datasets: [
      {
        data: [
          stats.withPhotosComplaints,
          Math.max(stats.totalComplaints - stats.withPhotosComplaints, 0),
        ],
        backgroundColor: ['#0f3d84', '#c5d9f1'],
        borderColor: ['#0a2452', '#a8c5e6'],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="admin-dashboard">
      <section className="dashboard-hero">
        <div className="hero-panel">
          <div className="hero-copy">
            <span className="hero-label">Reports</span>
            <h1>Portal Analytics</h1>
            <p>Monitor complaint flow, resolution performance, and citizen participation across the platform.</p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="loading-message">Loading reports...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="metrics-grid">
            {reportCards.map((item) => (
              <div key={item.label} className="metric-card">
                <div className="metric-value">{item.value}</div>
                <div className="metric-label">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="chart-grid">
            <div className="chart-panel">
              <h3>Complaint status</h3>
              <Bar
                data={statusChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                  },
                }}
              />
            </div>

            <div className="chart-panel">
              <h3>Evidence coverage</h3>
              <Doughnut
                data={coverageChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } },
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReports;
