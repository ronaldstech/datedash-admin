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
  LogOut,
  ChevronDown,
  Palette,
  Globe,
  Sliders,
  CreditCard,
  ShieldCheck
} from 'lucide-react';

/**
 * Sidebar navigation component.
 * Props:
 * - activeTab, setActiveTab
 * - activeSettingsSubTab, setActiveSettingsSubTab
 * - pendingVerificationsCount, pendingReportsCount
 * - activeStreamsCount, bookingsCount
 * - mobileMenuOpen, setMobileMenuOpen
 * - currentAdmin, onLogout
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
    { id: 'appearance', label: 'Theme & Style',          icon: Palette },
    { id: 'localization', label: 'Countries & Languages', icon: Globe },
    { id: 'algorithm', label: 'Match Algorithm',          icon: Sliders },
    { id: 'monetization', label: 'Pricing & Limits',      icon: CreditCard },
    { id: 'safety', label: 'Safety & Moderation',         icon: ShieldCheck }
  ];

  const handleSettingsClick = () => {
    setActiveTab('settings');
    setSettingsExpanded((prev) => (activeTab === 'settings' ? !prev : true));
  };

  const handleSubMenuClick = (subId) => {
    setActiveTab('settings');
    if (setActiveSettingsSubTab) setActiveSettingsSubTab(subId);
  };

  const NavItem = ({ id, label, icon: Icon, badge, badgeVariant = 'primary' }) => {
    const isActive = activeTab === id;
    return (
      <li>
        <button
          onClick={() => setActiveTab(id)}
          className={`nav-link ${isActive ? 'active' : ''}`}
          title={label}
        >
          <span className={`nav-icon-wrap ${isActive ? 'active' : ''}`}>
            <Icon size={16} />
          </span>
          <span className="nav-label">{label}</span>
          {badge > 0 && (
            <span className={`nav-badge ${badgeVariant === 'warn' ? 'nav-badge-warn' : badgeVariant === 'soft' ? 'nav-badge-soft' : ''}`}>
              {badge}
            </span>
          )}
        </button>
      </li>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>

        {/* ── Admin Identity Card ── */}
        <div className="sidebar-identity-card">
          <div className="identity-avatar-wrap">
            <img
              src={currentAdmin?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop'}
              alt="Admin"
              className="identity-avatar"
            />
            <span className="identity-online-dot" />
          </div>
          <div className="identity-info">
            <span className="identity-name">{currentAdmin?.name || 'Administrator'}</span>
            <span className="identity-role">{currentAdmin?.role || 'Admin Portal'}</span>
          </div>
          {onLogout && (
            <button className="identity-logout-btn" onClick={onLogout} title="Sign out" aria-label="Sign out">
              <LogOut size={14} />
            </button>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="sidebar-nav">

          {/* Section: Analytics */}
          <div className="nav-section">
            <span className="nav-section-label">Analytics</span>
            <ul>
              <NavItem id="overview" label="Overview"       icon={Activity} />
            </ul>
          </div>

          {/* Section: Community */}
          <div className="nav-section">
            <span className="nav-section-label">Community</span>
            <ul>
              <NavItem id="users"         label="User Directory"  icon={Users} />
              <NavItem id="verifications" label="Verifications"   icon={CheckCircle} badge={pendingVerificationsCount} badgeVariant="soft" />
              <NavItem id="reports"       label="Abuse Reports"   icon={ShieldAlert}  badge={pendingReportsCount}       badgeVariant="warn" />
              <NavItem id="streams"       label="Live Streams"    icon={Radio}        badge={activeStreamsCount}         badgeVariant="soft" />
            </ul>
          </div>

          {/* Section: Commerce */}
          <div className="nav-section">
            <span className="nav-section-label">Commerce</span>
            <ul>
              <NavItem id="bookings"     label="Date Bookings"  icon={Calendar} badge={bookingsCount} badgeVariant="soft" />
              <NavItem id="transactions" label="Transactions"   icon={Receipt} />
              <NavItem id="gifts"        label="Virtual Gifts"  icon={Gift} />
            </ul>
          </div>

          {/* Section: System */}
          <div className="nav-section">
            <span className="nav-section-label">System</span>
            <ul>
              {/* App Config with collapsible submenu */}
              <li className="nav-item-group">
                <button
                  onClick={handleSettingsClick}
                  className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                  title="App Config"
                >
                  <span className={`nav-icon-wrap ${activeTab === 'settings' ? 'active' : ''}`}>
                    <SettingsIcon size={16} />
                  </span>
                  <span className="nav-label">App Config</span>
                  <ChevronDown
                    size={14}
                    className={`nav-link-chevron ${settingsExpanded && activeTab === 'settings' ? 'open' : ''}`}
                  />
                </button>

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
                          <SubIcon size={13} />
                          <span>{sub.label}</span>
                          {isSubActive && <span className="submenu-active-dot" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </li>
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
}
