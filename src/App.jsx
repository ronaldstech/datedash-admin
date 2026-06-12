import { useState, useMemo } from 'react';
import {
  Heart,
  Users,
  CheckCircle,
  AlertTriangle,
  Settings as SettingsIcon,
  Search,
  ShieldAlert,
  DollarSign,
  TrendingUp,
  UserCheck,
  UserX,
  Activity,
  X,
  Sparkles,
  Filter,
  Clock,
  Ban,
  MessageSquare
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import {
  initialStats,
  initialUsers,
  initialVerifications,
  initialReports,
  initialSettings
} from './data/dashboardData';

function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('overview');

  // Application Data States
  const [stats, setStats] = useState(initialStats);
  const [users, setUsers] = useState(initialUsers);
  const [verifications, setVerifications] = useState(initialVerifications);
  const [reports, setReports] = useState(initialReports);
  const [settings, setSettings] = useState(initialSettings);

  // Modals & Selections
  const [selectedUser, setSelectedUser] = useState(null);

  // Users Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userGenderFilter, setUserGenderFilter] = useState('all');
  const [userTierFilter, setUserTierFilter] = useState('all');

  // Counts for Sidebar Badges
  const pendingVerificationsCount = useMemo(() => verifications.length, [verifications]);
  const pendingReportsCount = useMemo(() => reports.filter(r => r.status === 'pending').length, [reports]);

  // Handle Profile Verification Actions
  const handleVerification = (id, userId, approve) => {
    // Update verification list
    setVerifications(prev => prev.filter(v => v.id !== id));
    
    // Update user status
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return { ...user, verificationStatus: approve ? 'verified' : 'unverified' };
      }
      return user;
    }));

    // Update stats
    if (approve) {
      setStats(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + 1
      }));
    }
  };

  // Handle User Moderation Actions (from User grid or Report list)
  const handleUserStatusChange = (userId, newStatus) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return { ...user, status: newStatus };
      }
      return user;
    }));

    // If active user gets banned, update active stat
    if (newStatus === 'banned') {
      setStats(prev => ({
        ...prev,
        activeUsers: Math.max(0, prev.activeUsers - 1)
      }));
    }

    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(prev => ({ ...prev, status: newStatus }));
    }
  };

  // Toggle user subscription level
  const handleTogglePremium = (userId) => {
    let premiumAdded = false;
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        premiumAdded = !user.isPremium;
        return { ...user, isPremium: !user.isPremium };
      }
      return user;
    }));

    setStats(prev => ({
      ...prev,
      premiumUsers: prev.premiumUsers + (premiumAdded ? 1 : -1)
    }));

    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(prev => ({ ...prev, isPremium: !prev.isPremium }));
    }
  };

  // Handle Report Actions (Dismiss, Warn, Ban)
  const handleReportAction = (reportId, reportedUserId, action) => {
    // Resolve report
    setReports(prev => prev.filter(r => r.id !== reportId));

    if (action === 'warn') {
      handleUserStatusChange(reportedUserId, 'warned');
    } else if (action === 'ban') {
      handleUserStatusChange(reportedUserId, 'banned');
    }
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = userStatusFilter === 'all' || user.status === userStatusFilter;
      const matchesGender = userGenderFilter === 'all' || user.gender === userGenderFilter;
      const matchesTier = userTierFilter === 'all' || 
                         (userTierFilter === 'premium' ? user.isPremium : !user.isPremium);

      return matchesSearch && matchesStatus && matchesGender && matchesTier;
    });
  }, [users, searchQuery, userStatusFilter, userGenderFilter, userTierFilter]);

  // Statistics Summary
  const kpiData = [
    {
      title: "Total Registered Users",
      value: users.length * 1000 + 4250, // Styled base
      icon: <Users size={20} />,
      trend: stats.growthRate,
      colorClass: "pink"
    },
    {
      title: "Daily Active Users",
      value: stats.activeUsers,
      icon: <Activity size={20} />,
      trend: stats.activeRate,
      colorClass: "purple"
    },
    {
      title: "Total Matches Formed",
      value: stats.matchesCount.toLocaleString(),
      icon: <Heart size={20} />,
      trend: stats.matchRate,
      colorClass: "pink"
    },
    {
      title: "Monthly Revenue",
      value: `$${stats.revenueMonthly.toLocaleString()}`,
      icon: <DollarSign size={20} />,
      trend: stats.revenueRate,
      colorClass: "green"
    }
  ];

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
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

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header">
          <div className="page-title">
            <h1>
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'verifications' && 'Verification Requests'}
              {activeTab === 'reports' && 'Moderation & Reports'}
              {activeTab === 'settings' && 'System Settings'}
            </h1>
            <p>
              {activeTab === 'overview' && 'Real-time performance metrics and charts'}
              {activeTab === 'users' && 'Search, filter, edit status and access profiles'}
              {activeTab === 'verifications' && 'Compare profile avatars with user uploaded selfie verifications'}
              {activeTab === 'reports' && 'Handle reported users and suspicious activity'}
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

        <section className="content-body">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {/* KPIs Grid */}
              <div className="stats-grid">
                {kpiData.map((kpi, idx) => (
                  <div className="stat-card" key={idx}>
                    <div className="stat-header">
                      <span className="stat-title">{kpi.title}</span>
                      <div className={`stat-icon-container ${kpi.colorClass}`}>
                        {kpi.icon}
                      </div>
                    </div>
                    <span className="stat-value">{kpi.value}</span>
                    <div className="stat-footer">
                      <span className="trend-up">{kpi.trend}</span>
                      <span className="trend-label">vs last week</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recharts Analytics */}
              <div className="charts-grid">
                <div className="chart-card">
                  <div className="chart-header">
                    <span className="chart-title">Daily Active Users & Match Rate (Weekly)</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Live Sync Enabled</span>
                  </div>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <AreaChart data={stats.dailyActiveTrend}>
                        <defs>
                          <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="matchGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="day" stroke="var(--text-secondary)" />
                        <YAxis stroke="var(--text-secondary)" />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'white' }} />
                        <Area type="monotone" dataKey="active" stroke="var(--secondary)" fillOpacity={1} fill="url(#activeGrad)" name="Active Sessions" />
                        <Area type="monotone" dataKey="matches" stroke="var(--primary)" fillOpacity={1} fill="url(#matchGrad)" name="Matches Made" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="chart-card">
                  <div className="chart-header">
                    <span className="chart-title">Monthly Signups</span>
                  </div>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={stats.registrationsTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="month" stroke="var(--text-secondary)" />
                        <YAxis stroke="var(--text-secondary)" />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'white' }} />
                        <Legend />
                        <Bar dataKey="free" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Free Users" />
                        <Bar dataKey="premium" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Premium Tier" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Quick Info & Distribution */}
              <div className="charts-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
                <div className="chart-card">
                  <div className="chart-header">
                    <span className="chart-title">Gender Distribution</span>
                  </div>
                  <div style={{ width: '100%', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={stats.genderDistribution}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.genderDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px', fontSize: '13px' }}>
                    {stats.genderDistribution.map((entry, i) => (
                      <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: entry.color }}></span>
                        {entry.name} ({Math.round(entry.value / 142.5)}%)
                      </span>
                    ))}
                  </div>
                </div>

                <div className="chart-card">
                  <div className="chart-header">
                    <span className="chart-title">Platform Guidelines & System Warnings</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--warning)' }}>
                      <AlertTriangle size={24} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Unverified Match Rate is Increasing</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Profiles matching without face verification has increased by 14% this week. We recommend requiring verification for premium badges in settings.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--secondary)' }}>
                      <Sparkles size={24} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Algorithm Balancing Successful</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>The location weighting factor has improved overall swipe satisfaction score from 3.8 to 4.2 stars based on user reports.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: USER DIRECTORY */}
          {activeTab === 'users' && (
            <div className="table-card">
              <div className="table-controls">
                <div className="table-filters">
                  <select
                    className="filter-select"
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="warned">Warned</option>
                    <option value="banned">Banned</option>
                  </select>

                  <select
                    className="filter-select"
                    value={userGenderFilter}
                    onChange={(e) => setUserGenderFilter(e.target.value)}
                  >
                    <option value="all">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                  </select>

                  <select
                    className="filter-select"
                    value={userTierFilter}
                    onChange={(e) => setUserTierFilter(e.target.value)}
                  >
                    <option value="all">All Tiers</option>
                    <option value="premium">Premium Only</option>
                    <option value="free">Free Only</option>
                  </select>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Showing {filteredUsers.length} of {users.length} users
                </div>
              </div>

              <table className="custom-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Gender & Age</th>
                    <th>Location</th>
                    <th>Membership</th>
                    <th>Verification</th>
                    <th>Account Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <img src={user.avatar} alt={user.name} className="user-table-avatar" />
                          <div className="user-name-wrapper">
                            <span className="user-table-name">{user.name}</span>
                            <span className="user-table-email">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{user.gender}, {user.age}</td>
                      <td>{user.location}</td>
                      <td>
                        <span className={`status-badge ${user.isPremium ? 'premium' : 'standard'}`}>
                          {user.isPremium ? 'Premium' : 'Standard'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.verificationStatus}`}>
                          {user.verificationStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.status}`}>
                          {user.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="action-btn-secondary"
                          style={{ display: 'inline-flex', padding: '6px 12px' }}
                          onClick={() => setSelectedUser(user)}
                        >
                          Review Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        No users match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: VERIFICATION QUEUE */}
          {activeTab === 'verifications' && (
            <div>
              {verifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                  <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: '16px' }} />
                  <h2>All Caught Up!</h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>There are no profile verification requests currently pending approval.</p>
                </div>
              ) : (
                <div className="queue-grid">
                  {verifications.map((req) => (
                    <div className="queue-card" key={req.id}>
                      <div className="queue-card-header">
                        <div className="queue-card-user">
                          <img src={req.userAvatar} alt={req.userName} className="queue-card-avatar" />
                          <div className="queue-card-meta">
                            <h3>{req.userName}</h3>
                            <span>Submitted: {new Date(req.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className="status-badge pending">Pending</span>
                      </div>

                      <div className="queue-comparison">
                        <div className="comparison-box">
                          <span>Profile Picture</span>
                          <img src={req.userAvatar} alt="Profile" className="comparison-img" />
                        </div>
                        <div className="comparison-box">
                          <span>Verification Selfie</span>
                          <img src={req.verificationPhoto} alt="Verification Selfie" className="comparison-img" />
                        </div>
                      </div>

                      <div className="queue-actions">
                        <button
                          className="btn-reject"
                          onClick={() => handleVerification(req.id, req.userId, false)}
                        >
                          <UserX size={16} />
                          Reject / Reject Tag
                        </button>
                        <button
                          className="btn-approve"
                          onClick={() => handleVerification(req.id, req.userId, true)}
                        >
                          <UserCheck size={16} />
                          Verify Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ABUSE REPORTS */}
          {activeTab === 'reports' && (
            <div>
              {reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                  <ShieldAlert size={48} style={{ color: 'var(--success)', marginBottom: '16px' }} />
                  <h2>Safety Clean</h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>No user-reported profiles or harassment flags in the queue.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {reports.map((report) => (
                    <div className="queue-card" key={report.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.2fr', gap: '24px', alignItems: 'stretch' }}>
                      
                      {/* Left: User Reported Info */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>REPORTED PROFILE</span>
                          <div className="queue-card-user" style={{ marginTop: '6px' }}>
                            <img src={report.reportedAvatar} alt={report.reportedName} className="queue-card-avatar" />
                            <div>
                              <h3 style={{ fontSize: '15px' }}>{report.reportedName}</h3>
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ID: {report.reportedId}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ marginTop: '8px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>FILED BY</span>
                          <p style={{ fontSize: '13px', fontWeight: 500, marginTop: '2px' }}>{report.reporterName} (ID: {report.reporterId})</p>
                        </div>
                      </div>

                      {/* Center: Report Reason & Chat Snippet */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                        <div className="report-reason">
                          <strong>Reason:</strong> {report.reason}
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{report.details}</p>
                        </div>

                        {report.chatSnippet && (
                          <div className="chat-log">
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                              <MessageSquare size={12} /> CHAT LOG EVIDENCE
                            </span>
                            {report.chatSnippet.split('\n').map((line, key) => (
                              <div key={key} className="chat-bubble">
                                {line}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Moderation Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '24px' }}>
                        <button
                          className="btn-approve"
                          onClick={() => handleReportAction(report.id, report.reportedId, 'dismiss')}
                        >
                          Dismiss Flag
                        </button>
                        <button
                          className="btn-reject" // yellow outline style
                          style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', borderColor: 'rgba(245, 158, 11, 0.25)' }}
                          onClick={() => handleReportAction(report.id, report.reportedId, 'warn')}
                        >
                          <AlertTriangle size={14} />
                          Issue Warning
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleReportAction(report.id, report.reportedId, 'ban')}
                        >
                          <Ban size={14} />
                          Ban User Account
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: APP CONFIG / SETTINGS */}
          {activeTab === 'settings' && (
            <div className="settings-container">
              {/* Algorithm Configuration */}
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

              {/* Swipe & Pricing Rules */}
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

              {/* Safety Regulations */}
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
                  onClick={() => alert("Settings saved to app context (Simulated)")}
                >
                  Save Configurations
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* USER DETAILS MODAL */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details: {selectedUser.id}</h3>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="user-profile-summary">
                <img src={selectedUser.avatar} alt={selectedUser.name} className="user-profile-avatar" />
                <div className="user-profile-details">
                  <h4>{selectedUser.name}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{selectedUser.email}</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <span className={`status-badge ${selectedUser.isPremium ? 'premium' : 'standard'}`}>
                      {selectedUser.isPremium ? 'Premium Tier' : 'Standard Tier'}
                    </span>
                    <span className={`status-badge ${selectedUser.verificationStatus}`}>
                      {selectedUser.verificationStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="user-profile-info-grid">
                <div className="info-item">
                  <span className="info-label">Gender / Age</span>
                  <span className="info-val">{selectedUser.gender}, {selectedUser.age} years old</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Location</span>
                  <span className="info-val">{selectedUser.location}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Joined Date</span>
                  <span className="info-val">{selectedUser.joinedDate}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status Flag</span>
                  <span className={`status-badge ${selectedUser.status}`} style={{ width: 'fit-content' }}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              <div className="info-item" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span className="info-label">Bio Details</span>
                <p style={{ fontSize: '14px', background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  "{selectedUser.bio || 'No bio provided.'}"
                </p>
              </div>

              <div className="info-item" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span className="info-label">Moderation History</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: selectedUser.reportedCount > 2 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                  <AlertTriangle size={16} />
                  <span>Reported {selectedUser.reportedCount} times by other matches.</span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="action-btn-secondary"
                style={{ flexGrow: 1, justifyContent: 'center' }}
                onClick={() => handleTogglePremium(selectedUser.id)}
              >
                {selectedUser.isPremium ? 'Downgrade to Standard' : 'Promote to Premium'}
              </button>

              {selectedUser.status !== 'active' && (
                <button
                  className="btn-approve"
                  style={{ flexGrow: 1, padding: '10px' }}
                  onClick={() => handleUserStatusChange(selectedUser.id, 'active')}
                >
                  Unban/Restore
                </button>
              )}

              {selectedUser.status === 'active' && (
                <>
                  <button
                    className="btn-reject"
                    style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', borderColor: 'rgba(245, 158, 11, 0.25)', flexGrow: 1 }}
                    onClick={() => handleUserStatusChange(selectedUser.id, 'warned')}
                  >
                    Warn User
                  </button>
                  <button
                    className="btn-danger"
                    style={{ flexGrow: 1 }}
                    onClick={() => handleUserStatusChange(selectedUser.id, 'banned')}
                  >
                    Ban User
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
