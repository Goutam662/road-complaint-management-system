import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/api';
import { validateForm } from '../utils/validators';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    village: '',
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

    const payload = {
      name: String(formData.name || '').trim(),
      mobile: String(formData.mobile || '').trim(),
      village: String(formData.village || '').trim(),
      email: String(formData.email || '').trim().toLowerCase(),
      password: String(formData.password || '')
    };

    const missingFields = Object.entries(payload)
      .filter(([key, value]) => key !== 'password' ? !value : !String(value).trim())
      .map(([key]) => key);

    if (missingFields.length > 0) {
      setServerError(`Please fill all required fields: ${missingFields.join(', ')}`);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      setServerError('Please enter a valid email address');
      return;
    }
    
    const rules = {
      name: { required: true, label: 'Full Name' },
      mobile: { required: true, type: 'phone', label: 'Mobile Number' },
      village: { required: true, label: 'Village / Area' },
      email: { required: true, type: 'email', label: 'Email' },
      password: { required: true, minLength: 6, label: 'Password' }
    };

    const { isValid, errors: validationErrors } = validateForm(payload, rules);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register(payload);
      if (response.token && response.user) {
        login(response.user, response.token);
        navigate('/dashboard');
      }
    } catch (error) {
      setServerError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Create Your Account</h1>
          <p>Join the citizen complaint system today</p>
        </div>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Mobile Number *</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                required
              />
              {errors.mobile && <span className="error">{errors.mobile}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Village / Area *</label>
            <input
              type="text"
              name="village"
              value={formData.village}
              onChange={handleChange}
              placeholder="Your village or area name"
              required
            />
            {errors.village && <span className="error">{errors.village}</span>}
          </div>

          <div className="form-group">
            <label>Email Address *</label>
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

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
