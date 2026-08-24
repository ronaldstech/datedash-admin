import { useState } from 'react';
import {
  Globe,
  Languages,
  Plus,
  X,
  Search,
  RotateCcw,
  Sparkles,
  Save,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { initialSettings } from '../data/dashboardData';

/**
 * SettingsTab Component.
 * Props:
 * - settings: object containing global configurations
 * - setSettings: function to update settings state
 * - handleSaveSettings: function to save settings to Firestore/context
 */
export default function SettingsTab({ settings, setSettings, handleSaveSettings }) {
  const [newCountry, setNewCountry] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  const countries = settings.countries || [];
  const languages = settings.languages || [];

  // Filtered lists for search UI
  const filteredCountries = countries.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase().trim())
  );

  const filteredLanguages = languages.filter((l) =>
    l.toLowerCase().includes(languageSearch.toLowerCase().trim())
  );

  // Handlers for Countries
  const handleAddCountry = (e) => {
    if (e) e.preventDefault();
    const trimmed = newCountry.trim();
    if (!trimmed) return;

    if (countries.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert(`"${trimmed}" is already in the active countries list.`);
      return;
    }

    const updated = [...countries, trimmed].sort();
    setSettings((prev) => ({ ...prev, countries: updated }));
    setNewCountry('');
  };

  const handleRemoveCountry = (countryToRemove) => {
    const updated = countries.filter((c) => c !== countryToRemove);
    setSettings((prev) => ({ ...prev, countries: updated }));
  };

  const handleResetCountries = () => {
    if (window.confirm('Reset countries list to default set?')) {
      setSettings((prev) => ({ ...prev, countries: initialSettings.countries }));
    }
  };

  // Handlers for Languages
  const handleAddLanguage = (e) => {
    if (e) e.preventDefault();
    const trimmed = newLanguage.trim();
    if (!trimmed) return;

    if (languages.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
      alert(`"${trimmed}" is already in the active languages list.`);
      return;
    }

    const updated = [...languages, trimmed].sort();
    setSettings((prev) => ({ ...prev, languages: updated }));
    setNewLanguage('');
  };

  const handleRemoveLanguage = (languageToRemove) => {
    const updated = languages.filter((l) => l !== languageToRemove);
    setSettings((prev) => ({ ...prev, languages: updated }));
  };

  const handleResetLanguages = () => {
    if (window.confirm('Reset languages list to default set?')) {
      setSettings((prev) => ({ ...prev, languages: initialSettings.languages }));
    }
  };

  const onSave = async () => {
    await handleSaveSettings(settings);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="settings-container">
      {/* Top Banner Notice */}
      <div className="settings-sync-banner">
        <div className="sync-banner-info">
          <Sparkles size={20} className="sync-banner-icon" />
          <div>
            <h4>Live App Synchronization</h4>
            <p>
              Changes to countries and languages directly populate the Flutter app live video chat filters
              (stored in <code>app_settings/video_chat</code> in Firestore).
            </p>
          </div>
        </div>
        {savedNotice && (
          <div className="saved-badge-pop">
            <CheckCircle2 size={16} /> Synced to Firebase!
          </div>
        )}
      </div>

      {/* 1. Countries Management Section */}
      <div className="settings-section">
        <div className="settings-section-header flex-between">
          <div>
            <div className="section-title-with-icon">
              <Globe size={20} className="title-icon icon-rose" />
              <h3 className="settings-section-title">Global Matchmaking Countries</h3>
              <span className="count-pill">{countries.length} Active</span>
            </div>
            <p className="settings-section-desc">
              Manage allowed partner countries for live video matching and user profile locations.
            </p>
          </div>
          <button
            type="button"
            className="btn-icon-subtle"
            onClick={handleResetCountries}
            title="Reset to Default Countries"
          >
            <RotateCcw size={15} /> Reset
          </button>
        </div>

        {/* Add Country Form & Search Bar */}
        <div className="management-controls-grid">
          <form onSubmit={handleAddCountry} className="add-item-bar">
            <input
              type="text"
              className="form-input add-item-input"
              placeholder="Add new country (e.g., Zambia, Norway)..."
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
            />
            <button type="submit" className="btn-add-item">
              <Plus size={16} /> Add Country
            </button>
          </form>

          <div className="search-filter-box">
            <Search size={16} className="search-filter-icon" />
            <input
              type="text"
              className="search-filter-input"
              placeholder="Filter countries below..."
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
            />
            {countrySearch && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setCountrySearch('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Chips Container */}
        <div className="chips-wrapper">
          {filteredCountries.length === 0 ? (
            <div className="empty-chips-notice">
              No countries match "{countrySearch}". Type above to add it!
            </div>
          ) : (
            filteredCountries.map((country) => (
              <div key={country} className="item-chip country-chip">
                <Globe size={13} className="chip-icon" />
                <span className="chip-label">{country}</span>
                <button
                  type="button"
                  className="chip-remove-btn"
                  onClick={() => handleRemoveCountry(country)}
                  title={`Remove ${country}`}
                >
                  <X size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Languages Management Section */}
      <div className="settings-section">
        <div className="settings-section-header flex-between">
          <div>
            <div className="section-title-with-icon">
              <Languages size={20} className="title-icon icon-purple" />
              <h3 className="settings-section-title">Supported Partner Languages</h3>
              <span className="count-pill purple-pill">{languages.length} Active</span>
            </div>
            <p className="settings-section-desc">
              Manage languages available for live stream preferences and profile settings.
            </p>
          </div>
          <button
            type="button"
            className="btn-icon-subtle"
            onClick={handleResetLanguages}
            title="Reset to Default Languages"
          >
            <RotateCcw size={15} /> Reset
          </button>
        </div>

        {/* Add Language Form & Search Bar */}
        <div className="management-controls-grid">
          <form onSubmit={handleAddLanguage} className="add-item-bar">
            <input
              type="text"
              className="form-input add-item-input"
              placeholder="Add new language (e.g., Swahili, Arabic, German)..."
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
            />
            <button type="submit" className="btn-add-item purple-btn">
              <Plus size={16} /> Add Language
            </button>
          </form>

          <div className="search-filter-box">
            <Search size={16} className="search-filter-icon" />
            <input
              type="text"
              className="search-filter-input"
              placeholder="Filter languages below..."
              value={languageSearch}
              onChange={(e) => setLanguageSearch(e.target.value)}
            />
            {languageSearch && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setLanguageSearch('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Chips Container */}
        <div className="chips-wrapper">
          {filteredLanguages.length === 0 ? (
            <div className="empty-chips-notice">
              No languages match "{languageSearch}". Type above to add it!
            </div>
          ) : (
            filteredLanguages.map((language) => (
              <div key={language} className="item-chip language-chip">
                <Languages size={13} className="chip-icon" />
                <span className="chip-label">{language}</span>
                <button
                  type="button"
                  className="chip-remove-btn"
                  onClick={() => handleRemoveLanguage(language)}
                  title={`Remove ${language}`}
                >
                  <X size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Matching Algorithm Weighting */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="section-title-with-icon">
            <Sliders size={20} className="title-icon icon-rose" />
            <h3 className="settings-section-title">Matching Algorithm Weighting</h3>
          </div>
          <p className="settings-section-desc">
            Adjust how critical different filters are when recommending matches to users.
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>Location Proximity Weight</span>
            <span className="form-label-value">{settings.matchAlgorithmWeightLocation}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            className="form-range"
            value={settings.matchAlgorithmWeightLocation}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              const remainder = 100 - val;
              setSettings((prev) => ({
                ...prev,
                matchAlgorithmWeightLocation: val,
                matchAlgorithmWeightBio: Math.round(remainder * 0.45),
                matchAlgorithmWeightInterests: Math.round(remainder * 0.55)
              }));
            }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>Shared Interests Weight</span>
            <span className="form-label-value">{settings.matchAlgorithmWeightInterests}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            className="form-range"
            value={settings.matchAlgorithmWeightInterests}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              const remainder = 100 - val;
              setSettings((prev) => ({
                ...prev,
                matchAlgorithmWeightInterests: val,
                matchAlgorithmWeightLocation: Math.round(remainder * 0.6),
                matchAlgorithmWeightBio: Math.round(remainder * 0.4)
              }));
            }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>Bio Similarity & Keywords Weight</span>
            <span className="form-label-value">{settings.matchAlgorithmWeightBio}%</span>
          </label>
          <input
            type="range"
            className="form-range"
            disabled
            value={settings.matchAlgorithmWeightBio}
          />
        </div>
      </div>

      {/* 4. Subscription & Swipe Controls */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="section-title-with-icon">
            <CreditCard size={20} className="title-icon icon-purple" />
            <h3 className="settings-section-title">Subscription & Swipe Controls</h3>
          </div>
          <p className="settings-section-desc">
            Set limits for free tier accounts and adjust subscription pricing models.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Daily Swipe Limit (Free Tier)</label>
            <input
              type="number"
              className="form-input"
              value={settings.swipeLimitFree}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, swipeLimitFree: parseInt(e.target.value) || 0 }))
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Premium Membership Monthly Price ($)</label>
            <input
              type="number"
              step="0.01"
              className="form-input"
              value={settings.premiumPriceMonthly}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  premiumPriceMonthly: parseFloat(e.target.value) || 0
                }))
              }
            />
          </div>
        </div>
      </div>

      {/* 5. Safety & Spam Regulations */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="section-title-with-icon">
            <ShieldCheck size={20} className="title-icon icon-rose" />
            <h3 className="settings-section-title">Safety & Spam Regulations</h3>
          </div>
          <p className="settings-section-desc">
            Global safety rules for profiles matching and automated bans.
          </p>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={settings.enableShadowBans}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, enableShadowBans: e.target.checked }))
              }
            />
            <span>Enable Shadow-Banning (Spam profiles match only with other spam accounts)</span>
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">Flag Moderation Level</label>
          <select
            className="form-input"
            value={settings.moderationStrictness}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, moderationStrictness: e.target.value }))
            }
          >
            <option value="relaxed">Relaxed (Reported accounts warned after 5 reports)</option>
            <option value="moderate">Moderate (Warned after 3 reports, shadow-ban checked)</option>
            <option value="strict">Strict (Immediate profile hidden on 2 flags pending review)</option>
          </select>
        </div>
      </div>

      {/* Floating Save Actions Bar */}
      <div className="settings-save-actions">
        <p className="save-actions-hint">
          Click below to publish configuration updates live to Firebase Firestore.
        </p>
        <button type="button" className="btn-primary flex-center-gap" onClick={onSave}>
          <Save size={18} /> Save & Sync Configurations
        </button>
      </div>
    </div>
  );
}
