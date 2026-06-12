import React from 'react';
import { Heart, Users, Activity, CheckCircle, ShieldAlert, Radio, Settings as SettingsIcon } from 'lucide-react';

/**
 * Sidebar navigation component.
 * Props:
 * - activeTab: current active tab identifier
 * - setActiveTab: function to switch tabs
 * - pendingVerificationsCount: number of users pending verification
 * - pendingReportsCount: number of pending abuse reports
 */
export default function Sidebar({ activeTab, setActiveTab, pendingVerificationsCount, pendingReportsCount }) {
  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">
          <Heart size={22} fill="white" />
        </div>
        <span className="logo-text">DateDash</span>
        <span className="logo-tag">ADMIN</span>
      </div>

      <ul className="nav-links">
        <li>
          <button
            onClick={() => setActiveTab('overview')}
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <Activity size={18} />
            Overview
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveTab('users')}
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
          >
            <Users size={18} />
            User Directory
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveTab('verifications')}
            className={`nav-link ${activeTab === 'verifications' ? 'active' : ''}`}
          >
            <CheckCircle size={18} />
            Verifications
            {pendingVerificationsCount > 0 && (
              <span className="nav-link-badge secondary-badge">{pendingVerificationsCount}</span>
            )}
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveTab('reports')}
            className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
          >
            <ShieldAlert size={18} />
            Abuse Reports
            {pendingReportsCount > 0 && (
              <span className="nav-link-badge">{pendingReportsCount}</span>
            )}
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveTab('operations')}
            className={`nav-link ${activeTab === 'operations' ? 'active' : ''}`}
          >
            <Radio size={18} />
            Operations Hub
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveTab('settings')}
            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <SettingsIcon size={18} />
            App Config
          </button>
        </li>
      </ul>

      <div className="sidebar-footer">
        <div className="admin-profile">
          <img
            src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop"
            alt="Admin Avatar"
            className="admin-avatar"
          />
          <div className="admin-info">
            <h4>Sarah Jenkins</h4>
            <p>Lead Moderator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
