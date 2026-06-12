import React from 'react';

/**
 * StreamsTab Component.
 * Props:
 * - activeStreams: array of stream objects
 * - handleTerminateStream: function (streamId)
 */
export default function StreamsTab({ activeStreams, handleTerminateStream }) {
  return (
    <div className="table-card">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Broadcaster</th>
            <th>Stream Title</th>
            <th>Viewer Count</th>
            <th>Time Started</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {activeStreams.map(s => (
            <tr key={s.id}>
              <td>
                <div className="user-cell">
                  <img src={s.broadcasterPhoto} className="user-table-avatar" alt="" />
                  <div className="user-name-wrapper">
                    <span className="user-table-name">{s.broadcasterName}</span>
                    <span className="user-table-email">ID: {s.broadcasterId}</span>
                  </div>
                </div>
              </td>
              <td style={{ fontWeight: 500 }}>"{s.title}"</td>
              <td>
                <span className="status-badge premium" style={{ display: 'inline-flex', gap: '4px' }}>
                  ● {s.viewerCount} watching
                </span>
              </td>
              <td>{new Date(s.startedAt).toLocaleTimeString()}</td>
              <td style={{ textAlign: 'right' }}>
                <button className="btn-reject" style={{ display: 'inline-flex', padding: '6px 12px' }} onClick={() => handleTerminateStream(s.id)}>
                  Force Stop
                </button>
              </td>
            </tr>
          ))}
          {activeStreams.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                No channels are currently broadcasting live.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
