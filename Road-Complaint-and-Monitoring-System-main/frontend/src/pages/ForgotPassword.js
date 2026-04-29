import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      setMessage({ 
        type: 'success', 
        text: 'Password reset link sent to your email. Please check your inbox.' 
      });
      setEmail('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to send reset link' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p>Reset your account password</p>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              required
            />
            <p className="help-text">We'll send you a link to reset your password.</p>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-footer">
          <p><a href="/login">Back to Login</a></p>
          <p>Don't have an account? <a href="/register">Register here</a></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
