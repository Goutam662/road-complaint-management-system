import React, { createContext, useState, useEffect } from 'react';

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('admin');
    
    if (adminToken && adminData) {
      try {
        setAdmin(JSON.parse(adminData));
        setIsAdminAuthenticated(true);
      } catch (err) {
        console.error('Error parsing admin data:', err);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
      }
    }
    setLoading(false);
  }, []);

  const adminLogin = (adminData, token) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('admin', JSON.stringify(adminData));
    setAdmin(adminData);
    setIsAdminAuthenticated(true);
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    setAdmin(null);
    setIsAdminAuthenticated(false);
  };

  const updateAdminProfile = (updatedAdmin) => {
    localStorage.setItem('admin', JSON.stringify(updatedAdmin));
    setAdmin(updatedAdmin);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, isAdminAuthenticated, loading, adminLogin, adminLogout, updateAdminProfile }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

