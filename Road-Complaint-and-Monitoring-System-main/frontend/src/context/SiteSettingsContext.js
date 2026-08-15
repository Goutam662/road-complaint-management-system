import React, { createContext, useContext, useMemo, useState } from 'react';
import roadBrokenImg from '../assets/icons/roadbroken.png';
import heroImageDefault from '../assets/icons/Screenshot_2025-12-26_213013.png';

const STORAGE_KEY = 'roadComplaintSiteSettings';

const defaultHomeCards = [
  {
    title: 'Trusted by communities',
    text: 'Designed for citizens and authorities to collaborate on road safety and maintenance workflows.'
  },
  {
    title: 'Verified reporting',
    text: 'Capture photos, location data, and issue details to help responders act quickly and accurately.'
  },
  {
    title: 'Clear status updates',
    text: 'Track complaint progress from submission to resolution with transparent status notifications.'
  },
  {
    title: 'Data-driven action',
    text: 'Use complaint insights and reports to prioritize repairs and improve resource allocation.'
  }
];

const defaultHowItWorks = [
  { title: '1. Register or login', text: 'Create your account to begin logging road issues in your area.' },
  { title: '2. Submit complaint', text: 'Provide location details, upload evidence, and describe the problem clearly.' },
  { title: '3. Monitor status', text: 'Receive updates and follow the progress until the issue is resolved.' },
  { title: '4. Confirm resolution', text: 'Verify that repairs are complete and help maintain accountability.' }
];

const defaultBenefits = [
  { title: 'Fast reporting', text: 'Submit road complaints in seconds with photos and location details.' },
  { title: 'Transparent tracking', text: 'Follow progress with clear status updates and timestamps.' },
  { title: 'Community impact', text: 'Empower your village to participate in safer, better roads.' },
  { title: 'Responsive workflow', text: 'Support administrators with structured complaint management.' },
  { title: 'Data insights', text: 'Improve planning with complaint analytics and reporting.' },
  { title: 'Trusted process', text: 'Built for government use with accountability and verification features.' }
];

export const defaultSiteSettings = {
  siteName: 'National Road Complaint Portal',
  siteTagline: 'Ministry of Road Transport & Highways | Government of India',
  logoImage: '',
  homeImage: heroImageDefault,
  heroTitle: 'Improve Roads Faster with Trusted Citizen Reporting',
  heroSubtitle: 'Submit issues, upload evidence, and monitor resolutions from a secure national portal built for transparency and accountability.',
  heroDescription: 'Designed to help citizens, local departments, and administrators work together to keep roads safe and service requests moving.',
  primaryColor: '#0f3d84',
  secondaryColor: '#2a8f6f',
  accentColor: '#ffc107',
  headerBackground: '#04275c',
  homeSectionTitle: 'A professional platform for faster, clearer road maintenance.',
  homeSectionSubtitle: 'Why choose this portal',
  homeCards: defaultHomeCards,
  howItWorks: defaultHowItWorks,
  benefits: defaultBenefits,
  contactEmail: 'support@roadcomplaintsystem.gov.in',
  contactPhone: '+91-11-23059088',
  tollFree: '1800-11-6374 (Toll Free)',
  address: 'Ministry of Road Transport & Highways\nGovernment of India\nNew Delhi',
  officeHours: 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 9:00 AM - 1:00 PM\nSunday & Holidays: Closed',
  footerText: 'Ministry of Road Transport & Highways',
  logoFallback: roadBrokenImg,
};

const readStoredSettings = () => {
  if (typeof window === 'undefined') return defaultSiteSettings;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultSiteSettings;

    const parsed = JSON.parse(saved);
    return { ...defaultSiteSettings, ...parsed };
  } catch (error) {
    console.error('Failed to parse site settings', error);
    return defaultSiteSettings;
  }
};

const SiteSettingsContext = createContext(null);

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(readStoredSettings);

  const updateSettings = (nextSettings) => {
    const merged = { ...defaultSiteSettings, ...nextSettings };
    setSettings(merged);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
  };

  const resetSettings = () => {
    setSettings(defaultSiteSettings);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const value = useMemo(() => ({ settings, updateSettings, resetSettings }), [settings]);

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};
