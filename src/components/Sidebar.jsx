import { Heart, Users, Activity, CheckCircle, ShieldAlert, Radio, Settings as SettingsIcon, Calendar, Receipt, Gift, X } from 'lucide-react';

/**
 * Sidebar navigation component.
 * Props:
 * - activeTab: current active tab identifier
 * - setActiveTab: function to switch tabs
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
  pendingVerificationsCount,
  pendingReportsCount,
  activeStreamsCount = 0,
  bookingsCount = 0,
  mobileMenuOpen,
  setMobileMenuOpen
}) {
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
          <div className="logo-icon">
            <Heart size={22} fill="white" />
          </div>
          <span className="logo-text">DateDash</span>
          <span className="logo-tag">ADMIN</span>
          <button 
            className="mobile-menu-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
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
    </>
  );
}
