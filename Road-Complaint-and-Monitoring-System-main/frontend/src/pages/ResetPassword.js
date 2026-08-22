import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/api';
 
const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
 
    if (!token) {
      setMessage({ type: 'error', text: 'Reset link is missing or invalid. Please request a new one.' });
      return;
    }
 
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
 
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
 
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setMessage({
        type: 'success',
        text: 'Password reset successfully. Redirecting to login...'
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to reset password. The link may have expired.'
      });
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>Choose a new password for your account</p>
        </div>
 
        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}
 
        {!token && (
          <div className="alert alert-error">
            No reset token found. Please use the link sent to your email, or{' '}
            <Link to="/forgot-password">request a new reset link</Link>.
          </div>
        )}
 
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>New Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>
 
          <div className="form-group">
            <label>Confirm New Password *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
            />
          </div>
 
          <button type="submit" disabled={loading || !token} className="btn btn-primary">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
 
        <div className="auth-footer">
          <p><Link to="/login">Back to Login</Link></p>
        </div>
      </div>
    </div>
  );
};
 
export default ResetPassword;