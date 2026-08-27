import { useState } from 'react';
import {
  Users,
  Activity,
  CheckCircle,
  ShieldAlert,
  Radio,
  Settings as SettingsIcon,
  Calendar,
  Receipt,
  Gift,
  X,
  ChevronDown,
  Palette,
  Globe,
  Sliders,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import logo from '../assets/logo.png';

/**
 * Sidebar navigation component.
 * Props:
 * - activeTab: current active tab identifier
 * - setActiveTab: function to switch tabs
 * - activeSettingsSubTab: current sub-tab inside settings
 * - setActiveSettingsSubTab: function to change sub-tab
 * - pendingVerificationsCount: number of users pending verification
 * - pendingReportsCount: number of pending abuse reports
 * - activeStreamsCount: number of active live streams
 * - bookingsCount: number of total date bookings
 * - mobileMenuOpen: boolean
 * - setMobileMenuOpen: function to close/open menu
 */
export default function Sidebar({
  activeTab,
  setActiveTab,
  activeSettingsSubTab = 'appearance',
  setActiveSettingsSubTab,
  pendingVerificationsCount,
  pendingReportsCount,
  activeStreamsCount = 0,
  bookingsCount = 0,
  mobileMenuOpen,
  setMobileMenuOpen,
  currentAdmin,
  onLogout
}) {
  const [settingsExpanded, setSettingsExpanded] = useState(true);

  const settingsSubMenuItems = [
    { id: 'appearance', label: 'Theme & Style', icon: Palette },
    { id: 'localization', label: 'Countries & Languages', icon: Globe },
    { id: 'algorithm', label: 'Match Algorithm', icon: Sliders },
    { id: 'monetization', label: 'Pricing & Limits', icon: CreditCard },
    { id: 'safety', label: 'Safety & Moderation', icon: ShieldCheck }
  ];

  const handleSettingsClick = () => {
    setActiveTab('settings');
    setSettingsExpanded((prev) => (activeTab === 'settings' ? !prev : true));
  };

  const handleSubMenuClick = (subId) => {
    setActiveTab('settings');
    if (setActiveSettingsSubTab) {
      setActiveSettingsSubTab(subId);
    }
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="logo-container">
          <img src={logo} alt="DateDash Admin Logo" className="logo-img" />
          <button
            className="mobile-menu-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Admin profile at the top below logo */}
        <div className="sidebar-admin-header">
          <img
            src={
              currentAdmin?.avatar ||
              'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop'
            }
            alt="Admin Avatar"
            className="admin-avatar"
          />
          <div className="admin-info" style={{ overflow: 'hidden', flex: 1 }}>
            <h4 style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {currentAdmin?.name || 'Administrator'}
            </h4>
            <p style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {currentAdmin?.role || currentAdmin?.email || 'Admin Portal'}
            </p>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              style={{ padding: '6px', borderRadius: '8px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center' }}
              title="Log Out"
              aria-label="Log Out"
            >
              <X size={15} />
            </button>
          )}
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
              onClick={() => setActiveTab('streams')}
              className={`nav-link ${activeTab === 'streams' ? 'active' : ''}`}
            >
              <Radio size={18} />
              Live Streams
              {activeStreamsCount > 0 && (
                <span className="nav-link-badge secondary-badge">{activeStreamsCount}</span>
              )}
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
            >
              <Calendar size={18} />
              Date Bookings
              {bookingsCount > 0 && (
                <span className="nav-link-badge secondary-badge" style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' }}>{bookingsCount}</span>
              )}
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`nav-link ${activeTab === 'transactions' ? 'active' : ''}`}
            >
              <Receipt size={18} />
              Transactions
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('gifts')}
              className={`nav-link ${activeTab === 'gifts' ? 'active' : ''}`}
            >
              <Gift size={18} />
              Virtual Gifts
            </button>
          </li>

          {/* App Config with Submenu below */}
          <li className="nav-item-group">
            <button
              onClick={handleSettingsClick}
              className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <SettingsIcon size={18} />
              <span>App Config</span>
              <ChevronDown
                size={16}
                className={`nav-link-chevron ${settingsExpanded && activeTab === 'settings' ? 'open' : ''}`}
              />
            </button>

            {/* Sub-menu below App Config */}
            {settingsExpanded && (
              <div className="sidebar-submenu">
                {settingsSubMenuItems.map((sub) => {
                  const SubIcon = sub.icon;
                  const isSubActive = activeTab === 'settings' && activeSettingsSubTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSubMenuClick(sub.id)}
                      className={`sidebar-submenu-btn ${isSubActive ? 'active' : ''}`}
                    >
                      <SubIcon size={14} />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </li>
        </ul>

      </aside>
    </>
  );
}
