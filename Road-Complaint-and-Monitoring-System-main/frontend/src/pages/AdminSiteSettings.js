import React, { useState, useEffect } from 'react';
import { useSiteSettings, defaultSiteSettings } from '../context/SiteSettingsContext';

const toJsonText = (value) => JSON.stringify(value || [], null, 2);

const AdminSiteSettings = () => {
  const { settings, updateSettings, resetSettings } = useSiteSettings();
  const [formData, setFormData] = useState({
    ...settings,
    homeCards: toJsonText(settings.homeCards),
    howItWorks: toJsonText(settings.howItWorks),
    benefits: toJsonText(settings.benefits),
  });

  useEffect(() => {
    setFormData({
      ...settings,
      homeCards: toJsonText(settings.homeCards),
      howItWorks: toJsonText(settings.howItWorks),
      benefits: toJsonText(settings.benefits),
    });
  }, [settings]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const parseArrayJson = (value, fallback) => {
    if (!value) return fallback;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (error) {
      return fallback;
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextSettings = {
      ...formData,
      homeCards: parseArrayJson(formData.homeCards, defaultSiteSettings.homeCards),
      howItWorks: parseArrayJson(formData.howItWorks, defaultSiteSettings.howItWorks),
      benefits: parseArrayJson(formData.benefits, defaultSiteSettings.benefits),
    };

    updateSettings(nextSettings);
    alert('Website settings saved successfully.');
  };

  const handleReset = () => {
    resetSettings();
    alert('Website settings restored to default values.');
  };

  return (
    <div className="admin-dashboard">
      <div className="top-card">
        <div className="top-text">
          <h1>Website Settings</h1>
          <p>Control the branding and homepage content for the public portal.</p>
        </div>
      </div>

      <div className="settings-panel">
        <div className="settings-overview">
          <div className="settings-overview-card">
            <h4>Branding</h4>
            <strong>{formData.siteName || 'Portal Name'}</strong>
          </div>
          <div className="settings-overview-card">
            <h4>Homepage</h4>
            <strong>{formData.heroTitle ? 'Configured' : 'Default'}</strong>
          </div>
          <div className="settings-overview-card">
            <h4>Contacts</h4>
            <strong>{formData.contactEmail || 'Email not set'}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="settings-grid">
            <div className="settings-block">
              <h3>Branding</h3>
              <div className="form-group">
                <label>Website name</label>
                <input name="siteName" value={formData.siteName || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Tagline</label>
                <input name="siteTagline" value={formData.siteTagline || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Logo image URL</label>
                <input name="logoImage" value={formData.logoImage || ''} onChange={handleChange} placeholder="https://example.com/logo.png" />
              </div>
              <div className="form-group">
                <label>Home page image URL</label>
                <input name="homeImage" value={formData.homeImage || ''} onChange={handleChange} placeholder="https://example.com/home.jpg" />
              </div>
            </div>

            <div className="settings-block">
              <h3>Theme Colors</h3>
              <div className="form-group">
                <label>Primary color</label>
                <input type="color" name="primaryColor" value={formData.primaryColor || '#0f3d84'} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Secondary color</label>
                <input type="color" name="secondaryColor" value={formData.secondaryColor || '#2a8f6f'} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Accent color</label>
                <input type="color" name="accentColor" value={formData.accentColor || '#ffc107'} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Header/nav background</label>
                <input type="color" name="headerBackground" value={formData.headerBackground || '#04275c'} onChange={handleChange} />
              </div>
            </div>

            <div className="settings-block">
              <h3>Hero Section</h3>
              <div className="form-group">
                <label>Hero title</label>
                <input name="heroTitle" value={formData.heroTitle || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Hero subtitle</label>
                <textarea name="heroSubtitle" value={formData.heroSubtitle || ''} onChange={handleChange} rows="3" />
              </div>
              <div className="form-group">
                <label>Hero description</label>
                <textarea name="heroDescription" value={formData.heroDescription || ''} onChange={handleChange} rows="3" />
              </div>
              <div className="form-group">
                <label>Why choose title</label>
                <input name="homeSectionTitle" value={formData.homeSectionTitle || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Why choose label</label>
                <input name="homeSectionSubtitle" value={formData.homeSectionSubtitle || ''} onChange={handleChange} />
              </div>
            </div>

            <div className="settings-block">
              <h3>Homepage Cards JSON</h3>
              <div className="form-group">
                <textarea name="homeCards" value={formData.homeCards || ''} onChange={handleChange} rows="8" />
              </div>
            </div>

            <div className="settings-block">
              <h3>How It Works JSON</h3>
              <div className="form-group">
                <textarea name="howItWorks" value={formData.howItWorks || ''} onChange={handleChange} rows="8" />
              </div>
            </div>

            <div className="settings-block">
              <h3>Benefits JSON</h3>
              <div className="form-group">
                <textarea name="benefits" value={formData.benefits || ''} onChange={handleChange} rows="8" />
              </div>
            </div>

            <div className="settings-block">
              <h3>Contact Details</h3>
              <div className="form-group">
                <label>Email</label>
                <input name="contactEmail" value={formData.contactEmail || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="contactPhone" value={formData.contactPhone || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Toll free</label>
                <input name="tollFree" value={formData.tollFree || ''} onChange={handleChange} />
              </div>
            </div>

            <div className="settings-block">
              <h3>Footer and Address</h3>
              <div className="form-group">
                <label>Address</label>
                <textarea name="address" value={formData.address || ''} onChange={handleChange} rows="4" />
              </div>
              <div className="form-group">
                <label>Office hours</label>
                <textarea name="officeHours" value={formData.officeHours || ''} onChange={handleChange} rows="4" />
              </div>
              <div className="form-group">
                <label>Footer label</label>
                <input name="footerText" value={formData.footerText || ''} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="settings-actions">
            <button type="submit" className="btn btn-primary">Save Settings</button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>Reset Default</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSiteSettings;
