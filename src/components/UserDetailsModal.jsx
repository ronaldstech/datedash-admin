import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

/**
 * UserDetailsModal Component.
 * Props:
 * - selectedUser: Object containing target user details
 * - setSelectedUser: Function to toggle modal visibility / clear selection
 * - handleTogglePremium: Function (userId)
 * - handleUserStatusChange: Function (userId, newStatus)
 */
export default function UserDetailsModal({
  selectedUser,
  setSelectedUser,
  handleTogglePremium,
  handleUserStatusChange
}) {
  if (!selectedUser) return null;

  return (
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
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Contact: {selectedUser.email}</p>
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
  );
}
