import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { SiteSettingsProvider, useSiteSettings } from './context/SiteSettingsContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import Contact from './pages/Contact';
import About from './pages/About';
import Help from './pages/Help';
import Upload from './pages/Upload';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';
import AdminContactMessages from './pages/AdminContactMessages';
import AdminSiteSettings from './pages/AdminSiteSettings';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';
import AdminSidebar from './components/AdminSidebar';
import './styles/global.css';
 
const AdminLayout = ({ children }) => (
  <div className="admin-layout">
    <AdminSidebar />
    <main className="admin-main-content">{children}</main>
  </div>
);
 
const AppShell = () => {
  const { settings } = useSiteSettings();
 
  return (
    <div
      className="App"
      style={{
        '--brand-primary': settings.primaryColor || '#0f3d84',
        '--brand-secondary': settings.secondaryColor || '#2a8f6f',
        '--brand-accent': settings.accentColor || '#ffc107',
        '--brand-header': settings.headerBackground || '#04275c'
      }}
    >
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        <Route path="/admin/complaints" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
        <Route path="/admin/reports" element={<AdminLayout><AdminReports /></AdminLayout>} />
        <Route path="/admin/profile" element={<AdminLayout><AdminProfile /></AdminLayout>} />
        <Route path="/admin/contact-messages" element={<AdminLayout><AdminContactMessages /></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><AdminSiteSettings /></AdminLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
};
 
function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <SiteSettingsProvider>
          <Router>
            <AppShell />
          </Router>
        </SiteSettingsProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}
 
export default App;