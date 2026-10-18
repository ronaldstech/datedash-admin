import { useMemo, useState } from 'react';
import { Plus, Users, Pencil, Trash2, X, Check, CalendarDays, MapPin, Ticket, Sparkles, Clock, Search } from 'lucide-react';
import '../styles/events-admin.css';

const blankEvent = { title: '', subtitle: '', description: '', category: 'Mixer', city: '', venue: '', date: '', price: '', isFree: true, capacity: '', image: '', status: 'published' };

export default function EventsTab({ events, applications, onSaveEvent, onDeleteEvent, onApplicationStatus }) {
  const [editing, setEditing] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeView, setActiveView] = useState('events');
  const [applicantQuery, setApplicantQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const selectedEvent = events.find((event) => event.id === selectedEventId);
  const pendingCount = applications.filter((application) => (application.status || 'pending') === 'pending').length;
  const visibleApplications = useMemo(() => applications.filter((application) =>
    (selectedEventId === 'all' || application.eventId === selectedEventId) &&
    (statusFilter === 'all' || (application.status || 'pending') === statusFilter) &&
    (!applicantQuery.trim() || [application.name, application.fullName, application.email, application.phone, application.userId, application.eventTitle].join(' ').toLowerCase().includes(applicantQuery.trim().toLowerCase()))
  ), [applications, selectedEventId, statusFilter, applicantQuery]);
  const applicationsForEvent = applications.filter((application) => selectedEventId === 'all' || application.eventId === selectedEventId);
  const applicationStatusCounts = {
    all: applicationsForEvent.length,
    pending: applicationsForEvent.filter((application) => (application.status || 'pending') === 'pending').length,
    accepted: applicationsForEvent.filter((application) => application.status === 'accepted').length,
    rejected: applicationsForEvent.filter((application) => application.status === 'rejected').length
  };

  const save = async (event) => {
    setSaving(true);
    try {
      await onSaveEvent(event);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="event-admin-page">
      <section className="event-admin-hero">
        <div className="event-admin-hero-copy">
          <span className="event-admin-kicker"><Sparkles size={13} /> S N E L L U M&nbsp; / &nbsp;COMMUNITY</span>
          <h2>Make room for <em>real</em> connection.</h2>
          <p>Curate the mixers, meetups and moments where your community meets in person.</p>
        </div>
        <div className="event-admin-hero-action">
          <div className="event-admin-total"><strong>{events.length.toString().padStart(2, '0')}</strong><span>curated events</span></div>
          <button className="event-create-btn" type="button" onClick={() => setEditing({ ...blankEvent })}><Plus size={16} /> Create event</button>
        </div>
        <div className="event-admin-orbit" aria-hidden="true" />
      </section>

      <section className="event-admin-summary">
        <div><span>EVENTS</span><strong>{events.length}</strong><small>On your calendar</small></div>
        <div><span>APPLICANTS</span><strong>{applications.length}</strong><small>Across all events</small></div>
        <div><span>NEEDS REVIEW</span><strong>{pendingCount}</strong><small>Waiting for a decision</small></div>
      </section>

      <div className="event-admin-tabs" role="tablist" aria-label="Events workspace">
        <button type="button" role="tab" aria-selected={activeView === 'events'} className={activeView === 'events' ? 'active' : ''} onClick={() => setActiveView('events')}>
          <CalendarDays size={15} /> Events <span>{events.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={activeView === 'applicants'} className={activeView === 'applicants' ? 'active' : ''} onClick={() => setActiveView('applicants')}>
          <Users size={15} /> Applicants <span>{applications.length}</span>
          {pendingCount > 0 && <i>{pendingCount} pending</i>}
        </button>
      </div>

      {activeView === 'events' && <section className="event-admin-list-section">
        <div className="event-admin-section-head"><div><span className="event-admin-overline">THE LINEUP</span><h3>Your events</h3></div><span className="event-admin-count">{events.length} total</span></div>
        {events.length ? <div className="event-admin-grid">{events.map((event) => {
              const applicantCount = applications.filter((application) => application.eventId === event.id).length;
          const isFreeEvent = event.isFree === true || !event.price || String(event.price).trim().toLowerCase() === 'free';
          const date = event.date && new Date(event.date);
          return <article className="event-admin-card" key={event.id}>
            <div className="event-admin-cover" style={event.image ? { backgroundImage: `linear-gradient(180deg, rgba(9,7,15,.04) 25%, rgba(9,7,15,.8) 100%), url("${event.image}")` } : undefined}>
              <span className="event-admin-category"><Sparkles size={11} /> {event.category || 'Community event'}</span>
              <span className={`event-admin-status ${event.status === 'published' ? 'is-published' : ''}`}>{event.status || 'published'}</span>
              {date && <div className="event-admin-date-tile"><strong>{date.toLocaleDateString(undefined, { day: '2-digit' })}</strong><span>{date.toLocaleDateString(undefined, { month: 'short' })}</span></div>}
              {!event.image && <div className="event-cover-placeholder"><Sparkles size={32} /></div>}
            </div>
            <div className="event-admin-card-body">
              <h4>{event.title || 'Untitled event'}</h4><p className="event-admin-subtitle">{event.subtitle || event.description || 'A chance to meet someone new.'}</p>
              <div className="event-admin-meta"><span><Clock size={13} />{date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time TBD'}</span><span><MapPin size={13} />{[event.venue, event.city].filter(Boolean).join(', ') || 'Location TBD'}</span></div>
              <div className="event-admin-card-bottom"><span className="event-applicant-link" role="button" tabIndex={0} onClick={() => { setSelectedEventId(event.id); setActiveView('applicants'); }} onKeyDown={(e) => e.key === 'Enter' && (setSelectedEventId(event.id), setActiveView('applicants'))}><Users size={14} /> {applicantCount} applicants</span><span className={`event-admin-price ${isFreeEvent ? 'is-free' : ''}`}><Ticket size={13} />{isFreeEvent ? 'Free' : event.price}</span></div>
              <div className="event-admin-card-actions"><button onClick={() => { setSelectedEventId(event.id); setActiveView('applicants'); }}><Users size={14} /> Applicants</button><button onClick={() => setEditing({ ...blankEvent, ...event, isFree: event.isFree ?? (!event.price || String(event.price).trim().toLowerCase() === 'free'), date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '' })}><Pencil size={14} /> Edit</button><button className="event-delete-action" title="Delete event" onClick={() => { if (window.confirm(`Delete “${event.title}”? Applications will be kept for review.`)) onDeleteEvent(event.id); }}><Trash2 size={14} /></button></div>
            </div>
          </article>;
        })}</div> : <div className="event-admin-empty"><div><CalendarDays size={22} /></div><h4>Your next great meetup starts here.</h4><p>Create an event to start collecting applications from the community.</p><button className="event-create-btn" onClick={() => setEditing({ ...blankEvent })}><Plus size={15} /> Create your first event</button></div>}
      </section>}

      {activeView === 'applicants' && <div className="table-card applicants-table-card">
        <div className="applicant-screen-heading"><div className="applicant-screen-icon"><Users size={19} /></div><div><span className="event-admin-overline">EVENT REGISTRATIONS</span><h3>Applicants {selectedEvent && <span>for {selectedEvent.title}</span>}</h3><p>Review attendee details and manage each application.</p></div><strong>{applicationsForEvent.length}<small>applications</small></strong></div>
        <div className="table-controls event-applicant-controls" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <label className="applicant-search"><Search size={15} /><input type="search" value={applicantQuery} onChange={(event) => setApplicantQuery(event.target.value)} placeholder="Search by name or contact" /></label>
          <select className="filter-select" value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
            <option value="all">All events</option>{events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
          </select>
          <div className="applicant-status-pills" aria-label="Filter applicants by status">
            {[['all', 'All', applicationStatusCounts.all], ['pending', 'Pending', applicationStatusCounts.pending], ['accepted', 'Accepted', applicationStatusCounts.accepted], ['rejected', 'Declined', applicationStatusCounts.rejected]].map(([value, label, count]) => <button type="button" key={value} className={statusFilter === value ? 'active' : ''} onClick={() => setStatusFilter(value)}>{label}<span>{count}</span></button>)}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}><table className="custom-table" style={{ minWidth: 700 }}>
          <thead><tr><th>Applicant</th><th>Contact</th><th>Event</th><th>Applied</th><th>Status</th><th style={{ textAlign: 'right' }}>Review</th></tr></thead>
          <tbody>
            {visibleApplications.map((application) => (
              <tr key={application.id}>
                <td><div className="applicant-table-person"><span>{(application.name || application.fullName || '?').trim().charAt(0).toUpperCase()}</span><div><strong>{application.name || application.fullName || 'Unnamed applicant'}</strong><small>{application.userId || 'Community applicant'}</small></div></div></td>
                <td>{application.email || application.phone || 'No contact'}</td>
                <td>{events.find((event) => event.id === application.eventId)?.title || application.eventTitle || 'Event removed'}</td>
                <td>{application.createdAt ? new Date(application.createdAt).toLocaleDateString() : '—'}</td>
                <td><span className={`status-badge ${application.status === 'accepted' ? 'active' : application.status === 'rejected' ? 'banned' : 'pending'}`}>{application.status || 'pending'}</span></td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {application.status !== 'accepted' && <button className="applicant-row-accept" title="Accept applicant" onClick={() => onApplicationStatus(application.id, 'accepted')}><Check size={13} /> Accept</button>}{' '}
                  {application.status !== 'rejected' && <button className="applicant-row-decline" title="Decline applicant" onClick={() => onApplicationStatus(application.id, 'rejected')}><X size={13} /> Decline</button>}
                </td>
              </tr>
            ))}
            {!visibleApplications.length && <tr><td colSpan="6" style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>No applications match these filters.</td></tr>}
          </tbody>
        </table></div>
      </div>}

      {editing && <div className="modal-overlay" onClick={() => setEditing(null)}><div className="modal-content" style={{ maxWidth: 680, width: '94%' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h3>{editing.id ? 'Edit event' : 'Create event'}</h3><button className="modal-close" onClick={() => setEditing(null)} aria-label="Close"><X size={18} /></button></div>
        <form className="modal-body" onSubmit={(e) => { e.preventDefault(); save(editing); }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {[
            ['title', 'Event title', true], ['subtitle', 'Short summary'], ['category', 'Category'], ['city', 'City'], ['venue', 'Venue'], ['date', 'Date and time', true, 'datetime-local'], ['capacity', 'Capacity', false, 'number'], ['image', 'Image URL'],
          ].map(([key, label, required, type = 'text']) => <label key={key} className="form-group" style={{ display: 'grid', gap: 6, gridColumn: key === 'title' || key === 'subtitle' || key === 'image' ? '1 / -1' : undefined }}><span>{label}{required ? ' *' : ''}</span><input className="search-filter-input" type={type} required={required} min={type === 'number' ? 1 : undefined} value={editing[key] ?? ''} onChange={(e) => setEditing({ ...editing, [key]: e.target.value })} /></label>)}
          <fieldset className="event-pricing-fieldset"><legend>Admission</legend><div className="event-pricing-options"><button type="button" className={editing.isFree ? 'selected' : ''} onClick={() => setEditing({ ...editing, isFree: true, price: 'Free' })}><span className="event-pricing-radio" />Free event<small>No ticket charge</small></button><button type="button" className={!editing.isFree ? 'selected' : ''} onClick={() => setEditing({ ...editing, isFree: false, price: editing.price === 'Free' ? '' : editing.price })}><span className="event-pricing-radio" />Paid event<small>Set an admission price</small></button></div>{!editing.isFree && <label className="event-price-input"><span>Ticket price *</span><input className="search-filter-input" required type="text" placeholder="e.g. MWK 15,000" value={editing.price === 'Free' ? '' : editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} /></label>}</fieldset>
          <label className="form-group" style={{ display: 'grid', gap: 6 }}><span>Status</span><select className="filter-select" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}><option value="published">Published</option><option value="draft">Draft</option><option value="cancelled">Cancelled</option></select></label>
          <label className="form-group" style={{ display: 'grid', gap: 6, gridColumn: '1 / -1' }}><span>Description</span><textarea className="search-filter-input" rows="4" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></label>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 10 }}><button type="button" className="action-btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : editing.id ? 'Save changes' : 'Create event'}</button></div>
        </form>
      </div></div>}
    </div>
  );
}
