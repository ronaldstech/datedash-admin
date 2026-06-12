import React from 'react';
import { Search, Menu } from 'lucide-react';

/**
 * Header component.
 * Props:
 * - activeTab: string identifier of current active tab
 * - isLive: boolean indicating if live Firebase is connected
 * - searchQuery: string for search inputs
 * - setSearchQuery: function to update search query
 * - setMobileMenuOpen: function to open mobile menu sidebar drawer
 */
export default function Header({ activeTab, isLive, searchQuery, setSearchQuery, setMobileMenuOpen }) {
  return (
    <header className="header">
      <button 
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>
      <div className="page-title">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {activeTab === 'overview' && 'Dashboard Overview'}
          {activeTab === 'users' && 'User Management'}
          {activeTab === 'verifications' && 'Verification Requests'}
          {activeTab === 'reports' && 'Moderation & Reports'}
          {activeTab === 'streams' && 'Live Streams'}
          {activeTab === 'bookings' && 'Date Bookings'}
          {activeTab === 'transactions' && 'Financial Transactions'}
          {activeTab === 'gifts' && 'Virtual Gifts Store'}
          {activeTab === 'settings' && 'System Settings'}
          
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: '99px',
              backgroundColor: isLive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: isLive ? 'var(--success)' : 'var(--warning)',
              border: isLive ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
              letterSpacing: '0.5px'
            }}
          >
            {isLive ? '● LIVE FIREBASE' : '● OFFLINE MOCK'}
          </span>
        </h1>
        <p>
          {activeTab === 'overview' && 'Real-time performance metrics and charts'}
          {activeTab === 'users' && 'Search, filter, edit status and access profiles'}
          {activeTab === 'verifications' && 'Compare profile avatars with user uploaded selfie verifications'}
          {activeTab === 'reports' && 'Handle reported users and suspicious activity'}
          {activeTab === 'streams' && 'Manage broadcaster channels and force-stop active streams'}
          {activeTab === 'bookings' && 'Audit date bookings schedule and force cancellation of disputes'}
          {activeTab === 'transactions' && 'View PayChangu, TNM Mpamba, and Airtel Money subscription and token logs'}
          {activeTab === 'gifts' && 'Edit virtual item configurations and coin inventory values'}
          {activeTab === 'settings' && 'Fine-tune matching algorithms, prices and controls'}
        </p>
      </div>

      <div className="header-actions">
        {activeTab === 'users' && (
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search user, email, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>
    </header>
  );
}
