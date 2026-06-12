import React from 'react';

/**
 * UsersTab Component.
 * Props:
 * - userStatusFilter: string
 * - setUserStatusFilter: function
 * - userGenderFilter: string
 * - setUserGenderFilter: function
 * - userTierFilter: string
 * - setUserTierFilter: function
 * - filteredUsers: array of user objects
 * - setSelectedUser: function
 */
export default function UsersTab({
  userStatusFilter,
  setUserStatusFilter,
  userGenderFilter,
  setUserGenderFilter,
  userTierFilter,
  setUserTierFilter,
  filteredUsers,
  setSelectedUser
}) {
  return (
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
        </tbody>
      </table>
    </div>
  );
}
