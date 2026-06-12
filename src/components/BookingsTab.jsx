import React from 'react';

/**
 * BookingsTab Component.
 * Props:
 * - bookingStatusFilter: string
 * - setBookingStatusFilter: function
 * - filteredBookings: array of booking objects
 * - handleUpdateBookingStatus: function (bookingId, newStatus)
 */
export default function BookingsTab({
  bookingStatusFilter,
  setBookingStatusFilter,
  filteredBookings,
  handleUpdateBookingStatus
}) {
  return (
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
          {filteredBookings.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                No date bookings matched the selected status filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
