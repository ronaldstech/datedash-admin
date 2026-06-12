import React from 'react';
import { ShieldAlert, MessageSquare, AlertTriangle, Ban } from 'lucide-react';

/**
 * ReportsTab Component.
 * Props:
 * - reports: Array of report objects
 * - handleReportAction: Function (reportId, reportedUserId, action)
 */
export default function ReportsTab({ reports, handleReportAction }) {
  if (reports.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
        <ShieldAlert size={48} style={{ color: 'var(--success)', marginBottom: '16px' }} />
        <h2>Safety Clean</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>No user-reported profiles or harassment flags in the queue.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {reports.map((report) => (
        <div className="queue-card" key={report.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.2fr', gap: '24px', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>REPORTED PROFILE</span>
              <div className="queue-card-user" style={{ marginTop: '6px' }}>
                <img src={report.reportedAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'} alt={report.reportedName} className="queue-card-avatar" />
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '24px' }}>
            <button
              className="btn-approve"
              onClick={() => handleReportAction(report.id, report.reportedId, 'dismiss')}
            >
              Dismiss Flag
            </button>
            <button
              className="btn-reject"
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
  );
}
