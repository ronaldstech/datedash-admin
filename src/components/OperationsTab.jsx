import React from 'react';
import { Radio, Calendar, Receipt, Gift } from 'lucide-react';

/**
 * OperationsTab Component.
 * Props:
 * - opsSubTab: string ('streams', 'bookings', 'transactions', 'gifts')
 * - setOpsSubTab: function
 * - activeStreams: array of stream objects
 * - bookings: array of booking objects
 * - transactions: array of transaction objects
 * - gifts: array of gift objects
 * - bookingStatusFilter: string
 * - setBookingStatusFilter: function
 * - filteredBookings: array of filtered booking objects
 * - handleTerminateStream: function (streamId)
 * - handleUpdateBookingStatus: function (bookingId, newStatus)
 * - handleUpdateGiftCost: function (giftId, newCost)
 */
export default function OperationsTab({
  opsSubTab,
  setOpsSubTab,
  activeStreams,
  bookings,
  transactions,
  gifts,
  bookingStatusFilter,
  setBookingStatusFilter,
  filteredBookings,
  handleTerminateStream,
  handleUpdateBookingStatus,
  handleUpdateGiftCost
}) {
  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button onClick={() => setOpsSubTab('streams')} className={`action-btn-secondary ${opsSubTab === 'streams' ? 'active' : ''}`} style={{ background: opsSubTab === 'streams' ? 'var(--primary-glow)' : 'transparent', color: opsSubTab === 'streams' ? 'var(--primary)' : 'var(--text-secondary)', borderColor: opsSubTab === 'streams' ? 'var(--primary)' : 'transparent' }}>
          <Radio size={16} /> Live Streams ({activeStreams.length})
        </button>
        <button onClick={() => setOpsSubTab('bookings')} className={`action-btn-secondary ${opsSubTab === 'bookings' ? 'active' : ''}`} style={{ background: opsSubTab === 'bookings' ? 'var(--primary-glow)' : 'transparent', color: opsSubTab === 'bookings' ? 'var(--primary)' : 'var(--text-secondary)', borderColor: opsSubTab === 'bookings' ? 'var(--primary)' : 'transparent' }}>
          <Calendar size={16} /> Date Bookings ({bookings.length})
        </button>
        <button onClick={() => setOpsSubTab('transactions')} className={`action-btn-secondary ${opsSubTab === 'transactions' ? 'active' : ''}`} style={{ background: opsSubTab === 'transactions' ? 'var(--primary-glow)' : 'transparent', color: opsSubTab === 'transactions' ? 'var(--primary)' : 'var(--text-secondary)', borderColor: opsSubTab === 'transactions' ? 'var(--primary)' : 'transparent' }}>
          <Receipt size={16} /> Transactions ({transactions.length})
        </button>
        <button onClick={() => setOpsSubTab('gifts')} className={`action-btn-secondary ${opsSubTab === 'gifts' ? 'active' : ''}`} style={{ background: opsSubTab === 'gifts' ? 'var(--primary-glow)' : 'transparent', color: opsSubTab === 'gifts' ? 'var(--primary)' : 'var(--text-secondary)', borderColor: opsSubTab === 'gifts' ? 'var(--primary)' : 'transparent' }}>
          <Gift size={16} /> Virtual Gifts Store ({gifts.length})
        </button>
      </div>

      {/* Sub tab: Live Streams */}
      {opsSubTab === 'streams' && (
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
      )}

      {/* Sub tab: Date Bookings */}
      {opsSubTab === 'bookings' && (
        <div className="table-card">
          <div className="table-controls">
            <select className="filter-select" value={bookingStatusFilter} onChange={(e) => setBookingStatusFilter(e.target.value)}>
              <option value="all">All Dates</option>
              <option value="pending">Pending Requests</option>
              <option value="accepted">Accepted Dates</option>
              <option value="rejected">Rejected Dates</option>
              <option value="cancelled">Cancelled Dates</option>
            </select>
          </div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Booked By</th>
                <th>Dating Host</th>
                <th>Schedule Date</th>
                <th>Location</th>
                <th>Stated Rate</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(b => (
                <tr key={b.id}>
                  <td>{b.senderName}</td>
                  <td>{b.receiverName}</td>
                  <td>{new Date(b.dateTime).toLocaleString()}</td>
                  <td>{b.location}</td>
                  <td>{b.rate}</td>
                  <td>
                    <span className={`status-badge ${b.status === 'accepted' ? 'active' : (b.status === 'pending' ? 'pending' : 'banned')}`}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {b.status !== 'cancelled' && (
                      <button className="btn-reject" style={{ display: 'inline-flex', padding: '6px 12px' }} onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}>
                        Cancel Booking
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sub tab: Transactions */}
      {opsSubTab === 'transactions' && (
        <div className="table-card">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Tx Ref</th>
                <th>User ID</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Details</th>
                <th>Operator</th>
                <th>Date & Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{t.txRef}</td>
                  <td>{t.uid}</td>
                  <td style={{ fontWeight: 600, color: t.status === 'success' ? 'var(--success)' : 'var(--text-primary)' }}>
                    ${t.amount.toFixed(2)}
                  </td>
                  <td>{t.type}</td>
                  <td>{t.plan ? `Plan: ${t.plan}` : `${t.creditAmount} credits`}</td>
                  <td>{t.operator}</td>
                  <td>{new Date(t.timestamp).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${t.status === 'success' ? 'active' : (t.status === 'pending' ? 'pending' : 'banned')}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sub tab: Virtual Gifts Store */}
      {opsSubTab === 'gifts' && (
        <div className="queue-grid">
          {gifts.map(g => (
            <div className="queue-card" key={g.id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
              <span style={{ fontSize: '48px', backgroundColor: 'var(--bg-tertiary)', width: '70px', height: '70px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyHeight: 'center', justifyContent: 'center' }}>
                {g.icon}
              </span>
              <div style={{ flexGrow: 1 }}>
                <h3 style={{ fontSize: '16px' }}>{g.name} Gift</h3>
                <div className="form-group" style={{ marginTop: '8px', marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>Inventory Cost (Credits)</label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                    value={g.cost}
                    onChange={(e) => handleUpdateGiftCost(g.id, parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
