import { CalendarDays, MapPin, UserRound, Clock3, WalletCards, FileText, XCircle, CalendarCheck2, Hourglass, CheckCircle2 } from 'lucide-react';
import '../styles/meetups.css';

const statusOptions = ['all', 'pending', 'accepted', 'rejected', 'cancelled'];
const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { day: 'TBD', month: '', date: 'Schedule not set', time: '' };
  return {
    day: date.toLocaleDateString(undefined, { day: '2-digit' }),
    month: date.toLocaleDateString(undefined, { month: 'short' }),
    date: date.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }),
    time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  };
};

export default function BookingsTab({ bookingStatusFilter, setBookingStatusFilter, filteredBookings, bookings, handleUpdateBookingStatus }) {
  const counts = {
    all: bookings.length,
    pending: bookings.filter((booking) => booking.status === 'pending').length,
    accepted: bookings.filter((booking) => booking.status === 'accepted').length,
    rejected: bookings.filter((booking) => booking.status === 'rejected').length,
    cancelled: bookings.filter((booking) => booking.status === 'cancelled').length
  };
  const filters = [
    { id: 'all', label: 'All meetups', icon: CalendarDays },
    { id: 'pending', label: 'Pending', icon: Hourglass },
    { id: 'accepted', label: 'Accepted', icon: CheckCircle2 },
    { id: 'rejected', label: 'Declined', icon: XCircle },
    { id: 'cancelled', label: 'Cancelled', icon: XCircle }
  ];

  return (
    <div className="meetups-workspace">
      <section className="meetups-welcome">
        <div className="meetups-welcome-icon"><CalendarCheck2 size={19} /></div>
        <div><span className="meetups-kicker">COMMUNITY CONNECTIONS</span><h2>Meetup bookings</h2><p>Keep track of one-on-one plans and booking requests.</p></div>
        <div className="meetups-total"><strong>{counts.all.toLocaleString()}</strong><span>total requests</span></div>
      </section>

      <section className="meetups-stats">
        <div className="meetup-stat-total"><span>ALL REQUESTS</span><strong>{counts.all}</strong><small>Meetups on record</small></div>
        <div className="meetup-stat-pending"><span>NEEDS ATTENTION</span><strong>{counts.pending}</strong><small>Pending requests</small></div>
        <div className="meetup-stat-accepted"><span>CONFIRMED</span><strong>{counts.accepted}</strong><small>Accepted meetups</small></div>
      </section>

      <section className="meetups-list-section">
        <div className="meetups-list-heading"><div><span className="meetups-kicker">SCHEDULE</span><h3>Booking requests</h3></div><span>{filteredBookings.length} shown</span></div>
        <div className="meetups-filter-tabs" role="tablist" aria-label="Filter meetup bookings">
          {filters.map(({ id, label, icon: Icon }) => <button type="button" role="tab" aria-selected={bookingStatusFilter === id} className={bookingStatusFilter === id ? 'active' : ''} key={id} onClick={() => setBookingStatusFilter(id)}><Icon size={13} />{label}<span>{counts[id]}</span></button>)}
        </div>

        {filteredBookings.length ? <div className="meetups-list">{filteredBookings.map((booking) => {
          const date = formatDateTime(booking.dateTime);
          return <article className="meetup-card" key={booking.id}>
            <div className="meetup-date-tile"><strong>{date.day}</strong><span>{date.month}</span></div>
            <div className="meetup-main">
              <div className="meetup-card-top"><div><span className="meetup-card-label">MEETUP REQUEST</span><h4>{booking.senderName} <span>with</span> {booking.receiverName}</h4></div><span className={`meetup-status meetup-status-${booking.status || 'pending'}`}><i />{booking.status || 'pending'}</span></div>
              <div className="meetup-details"><span><CalendarDays size={13} />{date.date}</span>{date.time && <span><Clock3 size={13} />{date.time}</span>}<span><MapPin size={13} />{booking.location || 'Location not specified'}</span><span><WalletCards size={13} />{booking.rate || 'Rate not specified'}</span></div>
              {(booking.note || booking.senderNote) && <div className="meetup-note"><FileText size={13} /><p>{booking.note || booking.senderNote}</p></div>}
            </div>
            <div className="meetup-card-actions">
              <div className="meetup-participants"><UserRound size={13} /><span>{booking.senderId || 'Member'}<small>Booked by</small></span></div>
              {booking.status !== 'cancelled' && <button type="button" onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}><XCircle size={14} /> Cancel</button>}
            </div>
          </article>;
        })}</div> : <div className="meetups-empty"><div><CalendarDays size={22} /></div><h4>{counts.all ? 'No requests in this view' : 'No meetups yet'}</h4><p>{counts.all ? 'Choose another status filter to see more booking requests.' : 'New one-on-one meetup bookings will appear here.'}</p>{bookingStatusFilter !== 'all' && <button type="button" onClick={() => setBookingStatusFilter('all')}>Show all meetups</button>}</div>}
      </section>
    </div>
  );
}
