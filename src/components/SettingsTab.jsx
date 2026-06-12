import React from 'react';

/**
 * SettingsTab Component.
 * Props:
 * - settings: object containing global configurations
 * - setSettings: function to update settings state
 * - handleSaveSettings: function to save settings to Firestore/context
 */
export default function SettingsTab({ settings, setSettings, handleSaveSettings }) {
  return (
    <div className="settings-container">
      <div className="settings-section">
        <div className="settings-section-header">
          <h3 className="settings-section-title">Matching Algorithm Weighting</h3>
          <p className="settings-section-desc">Adjust how critical different filters are when recommending matches to users.</p>
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
              setSettings(prev => ({
                ...prev,
                matchAlgorithmWeightLocation: val,
                matchAlgorithmWeightBio: Math.round(remainder * 0.45),
                matchAlgorithmWeightInterests: Math.round(remainder * 0.55),
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
              setSettings(prev => ({
                ...prev,
                matchAlgorithmWeightInterests: val,
                matchAlgorithmWeightLocation: Math.round(remainder * 0.6),
                matchAlgorithmWeightBio: Math.round(remainder * 0.4),
              }));
            }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>Bio Similarity & Keywords Weight</span>
            <span className="form-label-value">{settings.matchAlgorithmWeightBio}%</span>
          </label>
          <input type="range" className="form-range" disabled value={settings.matchAlgorithmWeightBio} />
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <h3 className="settings-section-title">Subscription & Swipe Controls</h3>
          <p className="settings-section-desc">Set limits for free tier accounts and adjust subscription pricing models.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Daily Swipe Limit (Free Tier)</label>
            <input
              type="number"
              className="form-input"
              value={settings.swipeLimitFree}
              onChange={(e) => setSettings(prev => ({ ...prev, swipeLimitFree: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Premium Membership Monthly Price ($)</label>
            <input
              type="number"
              step="0.01"
              className="form-input"
              value={settings.premiumPriceMonthly}
              onChange={(e) => setSettings(prev => ({ ...prev, premiumPriceMonthly: parseFloat(e.target.value) || 0 }))}
            />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <h3 className="settings-section-title">Safety & Spam Regulations</h3>
          <p className="settings-section-desc">Global safety rules for profiles matching and AI automated bans.</p>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={settings.enableShadowBans}
              onChange={(e) => setSettings(prev => ({ ...prev, enableShadowBans: e.target.checked }))}
            />
            <span>Enable Shadow-Banning (Spam profiles match only with other spam accounts)</span>
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">Flag Moderation Level</label>
          <select
            className="form-input"
            value={settings.moderationStrictness}
            onChange={(e) => setSettings(prev => ({ ...prev, moderationStrictness: e.target.value }))}
          >
            <option value="relaxed">Relaxed (Reported accounts warned after 5 reports)</option>
            <option value="moderate">Moderate (Warned after 3 reports, shadow-ban checked)</option>
            <option value="strict">Strict (Immediate profile hidden on 2 flags pending review)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
        <button
          className="btn-primary"
          style={{ maxWidth: '200px' }}
          onClick={handleSaveSettings}
        >
          Save Configurations
        </button>
      </div>
    </div>
  );
}
