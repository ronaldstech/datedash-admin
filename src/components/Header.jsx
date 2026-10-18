import { Search, Menu, Sun, Moon, LogOut, Cloud, CloudOff, X } from 'lucide-react';

const pageDetails = {
  overview: ['Dashboard Overview', 'A live snapshot of your Snellum community'],
  users: ['User Management', 'Search profiles and manage account access'],
  verifications: ['Verification Requests', 'Review profile identity submissions'],
  reports: ['Moderation & Reports', 'Review reports and keep the community safe'],
  exploreCategories: ['Explore Categories', 'Manage the interests users browse'],
  bookings: ['Meetups', 'Review one-to-one meetup requests'],
  events: ['Events & Applicants', 'Manage events and attendee applications'],
  transactions: ['Financial Transactions', 'Review payments, subscriptions, and credits'],
  gifts: ['Virtual Gifts Store', 'Manage gift values and presentation'],
  premiumPricing: ['Premium Pricing', 'Manage shared USD plans and Spark bundles'],
  settings: ['App Configuration', 'Manage discovery, moderation, and appearance']
};

export default function Header({ activeTab, isLive, searchQuery, setSearchQuery, setMobileMenuOpen, theme = 'dark', toggleTheme, onLogout }) {
  const [title, description] = pageDetails[activeTab] || pageDetails.overview;

  return (
    <header className="header admin-header">
      <button type="button" className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation menu">
        <Menu size={19} />
      </button>

      <div className="page-title admin-page-title">
        <span className="admin-header-context">SNELLUM <span>/</span> ADMIN</span>
        <div className="admin-title-row">
          <h1>{title}</h1>
          <span className={`connection-status ${isLive ? 'connected' : 'offline'}`} title={isLive ? 'Connected to Firebase' : 'Firebase is not configured'}>
            {isLive ? <Cloud size={13} /> : <CloudOff size={13} />}
            <span>{isLive ? 'Live' : 'Preview'}</span>
          </span>
        </div>
        <p>{description}</p>
      </div>

      <div className="header-actions admin-header-actions">
        {activeTab === 'users' && <label className="search-bar admin-header-search"><Search size={16} className="search-icon" /><input type="search" aria-label="Search users" placeholder="Search users…" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />{searchQuery && <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setSearchQuery('')}><X size={14} /></button>}</label>}
        <span className="header-actions-divider" aria-hidden="true" />
        <button type="button" className="theme-toggle-btn admin-header-action" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`} aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}<span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
        {onLogout && <button type="button" className="logout-btn-header admin-header-action" onClick={onLogout} title="Sign out" aria-label="Sign out"><LogOut size={15} /><span>Sign out</span></button>}
      </div>
    </header>
  );
}
