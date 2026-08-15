import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!formData.email || !formData.password) {
      setErrors({
        email: !formData.email ? 'Email is required' : '',
        password: !formData.password ? 'Password is required' : ''
      });
      return;
    }

    setLoading(true);
    try {
      // send email as identifier for backend
      const response = await authService.login({ identifier: formData.email, password: formData.password });
      login(response.user, response.token);
      navigate('/dashboard');
    } catch (error) {
      setServerError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-visual-panel">
          <span className="eyebrow">Citizen portal</span>
          <h2>Track road issues with confidence.</h2>
          <p>Log in to review submitted complaints, follow repair progress, and stay informed about local infrastructure updates.</p>
          <ul>
            <li>Real-time status tracking</li>
            <li>Photo-based complaint reporting</li>
            <li>Clear communication with local teams</li>
          </ul>
        </div>

        <div className="auth-container">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Access your complaint dashboard</p>
          </div>

          {serverError && <div className="alert alert-error">{serverError}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className={`form-group ${errors.email ? 'error' : ''}`}>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className={`form-group ${errors.password ? 'error' : ''}`}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            <p><Link to="/forgot-password">Forgot your password?</Link></p>
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
            <p><Link to="/admin/login">Admin? Login here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
