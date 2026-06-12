import React from 'react';
import { CheckCircle, UserX, UserCheck } from 'lucide-react';

/**
 * VerificationsTab Component.
 * Props:
 * - users: Array of all user objects
 * - handleVerification: Function to approve or reject a user (userId, approve)
 */
export default function VerificationsTab({ users, handleVerification }) {
  const pendingUsers = users.filter((u) => u.verificationStatus === 'pending');

  if (pendingUsers.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
        <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: '16px' }} />
        <h2>All Caught Up!</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>There are no profile verification requests currently pending approval.</p>
      </div>
    );
  }

  return (
    <div className="queue-grid">
      {pendingUsers.map((req) => (
        <div className="queue-card" key={req.id}>
          <div className="queue-card-header">
            <div className="queue-card-user">
              <img src={req.avatar} alt={req.name} className="queue-card-avatar" />
              <div className="queue-card-meta">
                <h3>{req.name}</h3>
                <span>ID: {req.id}</span>
              </div>
            </div>
            <span className="status-badge pending">Pending Approval</span>
          </div>

          <div className="queue-comparison">
            <div className="comparison-box">
              <span>Profile Picture</span>
              <img src={req.avatar} alt="Profile" className="comparison-img" />
            </div>
            <div className="comparison-box">
              <span>Uploaded Verification Image</span>
              <img
                src={req.nationalIdUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop'}
                alt="Verification ID/Selfie"
                className="comparison-img"
              />
            </div>
          </div>

          <div className="queue-actions">
            <button
              className="btn-reject"
              onClick={() => handleVerification(req.id, false)}
            >
              <UserX size={16} />
              Reject
            </button>
            <button
              className="btn-approve"
              onClick={() => handleVerification(req.id, true)}
            >
              <UserCheck size={16} />
              Verify Profile
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
