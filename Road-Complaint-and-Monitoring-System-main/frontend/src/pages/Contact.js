import React, { useState } from 'react';
import { contactService } from '../services/api';
import { useSiteSettings } from '../context/SiteSettingsContext';

const Contact = () => {
  const { settings } = useSiteSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await contactService.sendMessage(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="page-header">
        <p className="dashboard-kicker">Contact center</p>
        <h1>Contact Us</h1>
        <p>Have questions? We'd love to hear from you</p>
      </div>

      <div className="contact-container contact-grid">
        <div className="contact-form-section">
          <h2>Send us a Message</h2>
          {submitted && <div className="alert alert-success">Message sent successfully!</div>}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className="contact-info-section">
          <h2>Contact Information</h2>
          <div className="contact-info">
            <h3>📧 Email</h3>
            <p><a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></p>
          </div>

          <div className="contact-info">
            <h3>📞 Phone</h3>
            <p><a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a></p>
            <p><a href={`tel:${settings.tollFree}`}>{settings.tollFree}</a></p>
          </div>

          <div className="contact-info">
            <h3>🏢 Address</h3>
            <p>{settings.address.split('\n').map((line, index) => (
              <React.Fragment key={line + index}>
                {line}
                {index < settings.address.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}</p>
          </div>

          <div className="contact-info">
            <h3>⏰ Office Hours</h3>
            <p>{settings.officeHours.split('\n').map((line, index) => (
              <React.Fragment key={line + index}>
                {line}
                {index < settings.officeHours.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
