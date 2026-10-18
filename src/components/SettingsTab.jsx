import { useEffect, useState } from 'react';
import { Activity, Check, Moon, Palette, Save, ShieldCheck, Sliders, Sun, Users, Zap } from 'lucide-react';
import '../styles/app-config.css';

const sections = [
  { id: 'appearance', label: 'Appearance', description: 'Dashboard look and feel', icon: Palette },
  { id: 'algorithm', label: 'Matching & Discovery', description: 'Discovery rules and match weights', icon: Sliders },
  { id: 'safety', label: 'Safety', description: 'Moderation and account protection', icon: ShieldCheck }
];

export default function SettingsTab({ settings, setSettings, handleSaveSettings, theme = 'dark', setTheme, isLive, activeSubTab: controlledSubTab, setActiveSubTab: setControlledSubTab }) {
  const [internalSubTab, setInternalSubTab] = useState('appearance');
  const activeSubTab = controlledSubTab ?? internalSubTab;
  const setActiveSubTab = setControlledSubTab || setInternalSubTab;
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');

  useEffect(() => {
    if (!savedNotice) return undefined;
    const timeout = setTimeout(() => setSavedNotice(''), 3000);
    return () => clearTimeout(timeout);
  }, [savedNotice]);

  const update = (key, value) => setSettings((previous) => ({ ...previous, [key]: value }));
  const save = async () => {
    if (settings.swipeLimitFree === '' || Number(settings.swipeLimitFree) < 0 || settings.minAgeLimit === '' || Number(settings.minAgeLimit) < 18 || Number(settings.minAgeLimit) > 99) {
      setSavedNotice('Enter a valid swipe limit and minimum age (18–99).');
      return;
    }
    setSaving(true);
    setSavedNotice('');
    try {
      await handleSaveSettings(settings);
      setSavedNotice(isLive ? 'Configuration saved successfully.' : 'Configuration saved for this session.');
    } catch (error) {
      setSavedNotice(`Save failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const adjustWeight = (key, value) => {
    const location = key === 'matchAlgorithmWeightLocation' ? value : settings.matchAlgorithmWeightLocation;
    const interests = key === 'matchAlgorithmWeightInterests' ? value : settings.matchAlgorithmWeightInterests;
    const bio = Math.max(0, 100 - location - interests);
    setSettings((previous) => ({ ...previous, matchAlgorithmWeightLocation: location, matchAlgorithmWeightInterests: interests, matchAlgorithmWeightBio: bio }));
  };

  return (
    <div className="app-config-page">
      <section className="app-config-hero">
        <div className="app-config-hero-icon"><Sliders size={22} /></div>
        <div><span className="app-config-eyebrow">SYSTEM CONTROL</span><h2>App configuration</h2><p>Manage discovery behavior, moderation, and the admin dashboard experience.</p></div>
        <div className="app-config-live"><span /> GLOBAL SETTINGS</div>
      </section>

      <div className="app-config-layout">
        <nav className="app-config-nav" aria-label="App configuration sections">
          {sections.map(({ id, label, description, icon: Icon }) => <button type="button" key={id} onClick={() => setActiveSubTab(id)} className={`app-config-nav-item ${activeSubTab === id ? 'active' : ''}`}><span className="app-config-nav-icon"><Icon size={17} /></span><span className="app-config-nav-copy"><strong>{label}</strong><small>{description}</small></span><span className="app-config-nav-arrow">›</span></button>)}
        </nav>

        <div className="app-config-content">
          {activeSubTab === 'appearance' && <section className="config-panel">
            <div className="config-panel-heading"><div className="config-panel-icon rose"><Palette size={18} /></div><div><h3>Dashboard appearance</h3><p>Choose the theme used across this admin dashboard.</p></div></div>
            <div className="config-theme-options">
              {[{ id: 'dark', title: 'Dark theme', description: 'A focused, low-light workspace', icon: Moon }, { id: 'light', title: 'Light theme', description: 'A bright, high-contrast workspace', icon: Sun }].map(({ id, title, description, icon: Icon }) => <button type="button" key={id} className={`config-theme-card ${theme === id ? 'selected' : ''}`} onClick={() => setTheme?.(id)}><span className={`config-theme-preview ${id}`}><Icon size={20} /></span><span className="config-theme-copy"><strong>{title}</strong><small>{description}</small></span>{theme === id && <span className="config-selected-check"><Check size={14} /></span>}</button>)}
            </div>
            <p className="config-inline-note">Your appearance preference is saved on this device.</p>
          </section>}

          {activeSubTab === 'algorithm' && <>
            <section className="config-panel">
              <div className="config-panel-heading"><div className="config-panel-icon violet"><Activity size={18} /></div><div><h3>Match ranking</h3><p>Set how much each signal contributes to profile recommendations.</p></div><span className="config-total-badge">{Number(settings.matchAlgorithmWeightLocation || 0) + Number(settings.matchAlgorithmWeightInterests || 0) + Number(settings.matchAlgorithmWeightBio || 0)}% total</span></div>
              <div className="config-weight-list">
                {[{ key: 'matchAlgorithmWeightLocation', label: 'Location proximity', detail: 'Prioritize profiles nearby', value: Number(settings.matchAlgorithmWeightLocation || 0), color: 'pink' }, { key: 'matchAlgorithmWeightInterests', label: 'Shared interests', detail: 'Prioritize common interests', value: Number(settings.matchAlgorithmWeightInterests || 0), color: 'violet' }, { key: 'matchAlgorithmWeightBio', label: 'Bio similarity', detail: 'Calculated from remaining weight', value: Number(settings.matchAlgorithmWeightBio || 0), color: 'gold', disabled: true }].map((item) => <label className="config-weight-row" key={item.key}><span className={`config-weight-mark ${item.color}`} /><span className="config-weight-info"><strong>{item.label}</strong><small>{item.detail}</small></span><input type="range" min="0" max={item.key === 'matchAlgorithmWeightInterests' ? 100 - Number(settings.matchAlgorithmWeightLocation || 0) : 100} value={item.value} disabled={item.disabled} onChange={(event) => adjustWeight(item.key, Number(event.target.value))} /><span className="config-weight-value">{item.value}%</span></label>)}
              </div>
            </section>
            <section className="config-panel">
              <div className="config-panel-heading"><div className="config-panel-icon gold"><Zap size={18} /></div><div><h3>Free discovery limits</h3><p>Set baseline access for users without a paid subscription.</p></div></div>
              <div className="config-limit-grid"><label className="config-number-field"><span>Daily swipe limit</span><small>Free profile likes per day</small><div className="config-number-control"><input type="number" min="0" step="1" value={settings.swipeLimitFree ?? 50} onChange={(event) => update('swipeLimitFree', event.target.value === '' ? '' : Number(event.target.value))} /><span>swipes / day</span></div></label><label className="config-number-field"><span>Minimum age</span><small>Youngest age allowed in discovery</small><div className="config-number-control"><input type="number" min="18" max="99" step="1" value={settings.minAgeLimit ?? 18} onChange={(event) => update('minAgeLimit', event.target.value === '' ? '' : Number(event.target.value))} /><span>years</span></div></label></div>
            </section>
          </>}

          {activeSubTab === 'safety' && <section className="config-panel">
            <div className="config-panel-heading"><div className="config-panel-icon rose"><ShieldCheck size={18} /></div><div><h3>Safety & moderation</h3><p>Set account protection and report review behavior.</p></div></div>
            <label className="config-toggle-row"><span className="config-toggle-icon"><ShieldCheck size={17} /></span><span className="config-toggle-copy"><strong>Shadow ban suspected spam</strong><small>Limit the visibility of accounts flagged as spam while they are reviewed.</small></span><input type="checkbox" checked={Boolean(settings.enableShadowBans)} onChange={(event) => update('enableShadowBans', event.target.checked)} /><span className="config-switch" /></label>
            <label className="config-select-field"><span>Report moderation level</span><small>Choose how quickly repeated reports trigger restrictions.</small><select value={settings.moderationStrictness || 'moderate'} onChange={(event) => update('moderationStrictness', event.target.value)}><option value="relaxed">Relaxed · Review after repeated reports</option><option value="moderate">Moderate · Review after several reports</option><option value="strict">Strict · Restrict after multiple reports</option></select></label>
          </section>}

          <footer className="app-config-savebar"><div className="app-config-save-status">{savedNotice ? <><Check size={15} />{savedNotice}</> : <><Users size={15} />{isLive ? 'Changes apply to global app settings.' : 'Preview mode · Changes stay in this session.'}</>}</div><button type="button" className="app-config-save-button" onClick={save} disabled={saving}><Save size={16} />{saving ? 'Saving…' : 'Save configuration'}</button></footer>
        </div>
      </div>
    </div>
  );
}
