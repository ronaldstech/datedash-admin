import { useEffect, useMemo, useState } from 'react';
import { ShieldAlert, MessageSquare, AlertTriangle, Ban, Search, ChevronLeft, ChevronRight, Clock3, UserRound, Check, SlidersHorizontal } from 'lucide-react';
import '../styles/reports.css';

const PAGE_SIZE = 10;
const reportDate = (report) => {
  const value = new Date(report.date || report.timestamp || 0).getTime();
  return Number.isFinite(value) ? value : 0;
};

export default function ReportsTab({ reports, handleReportAction }) {
  const [query, setQuery] = useState('');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState({});
  const reasons = useMemo(() => [...new Set(reports.map((report) => report.reason).filter(Boolean))].sort(), [reports]);
  const filteredReports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesReason = reasonFilter === 'all' || report.reason === reasonFilter;
      const searchable = [report.reportedName, report.reportedId, report.reporterName, report.reporterId, report.reason, report.details, report.chatSnippet].join(' ').toLowerCase();
      return matchesReason && (!normalizedQuery || searchable.includes(normalizedQuery));
    }).sort((a, b) => sortOrder === 'newest' ? reportDate(b) - reportDate(a) : reportDate(a) - reportDate(b));
  }, [reports, query, reasonFilter, sortOrder]);
  const pageCount = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
  const pageReports = filteredReports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [query, reasonFilter, sortOrder]);
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);

  const toggleEvidence = (id) => setExpanded((previous) => ({ ...previous, [id]: !previous[id] }));
  const startIndex = filteredReports.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const endIndex = Math.min(page * PAGE_SIZE, filteredReports.length);

  return (
    <div className="reports-workspace">
      <section className="reports-intro">
        <div className="reports-intro-icon"><ShieldAlert size={19} /></div>
        <div><span className="reports-kicker">TRUST & SAFETY</span><h2>Abuse reports</h2><p>Review community flags and take action on reported accounts.</p></div>
        <div className="reports-queue-total"><strong>{reports.length.toLocaleString()}</strong><span>in queue</span></div>
      </section>

      <section className="reports-toolbar" aria-label="Filter reports">
        <label className="reports-search"><Search size={16} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people, reasons, or evidence…" /></label>
        <div className="reports-filter"><SlidersHorizontal size={14} /><select value={reasonFilter} onChange={(event) => setReasonFilter(event.target.value)} aria-label="Filter by reason"><option value="all">All reasons</option>{reasons.map((reason) => <option key={reason} value={reason}>{reason}</option>)}</select></div>
        <select className="reports-sort" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} aria-label="Sort reports"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select>
        <span className="reports-results">{filteredReports.length.toLocaleString()} results</span>
      </section>

      {reports.length === 0 ? (
        <div className="reports-empty"><div className="reports-empty-icon"><Check size={24} /></div><h3>Queue is clear</h3><p>There are no user reports waiting for review.</p></div>
      ) : filteredReports.length === 0 ? (
        <div className="reports-empty"><div className="reports-empty-icon"><Search size={22} /></div><h3>No matching reports</h3><p>Try a different search term or reason filter.</p><button type="button" onClick={() => { setQuery(''); setReasonFilter('all'); }}>Clear filters</button></div>
      ) : (
        <>
          <div className="reports-list">
            {pageReports.map((report) => {
              const hasEvidence = Boolean(report.details || report.chatSnippet);
              const isExpanded = Boolean(expanded[report.id]);
              return <article className="report-row" key={report.id}>
                <div className="report-row-topline"><span className="report-flag"><ShieldAlert size={12} /> Community flag</span><span className="report-time"><Clock3 size={12} />{reportDate(report) ? new Date(reportDate(report)).toLocaleString() : 'Date unavailable'}</span></div>
                <div className="report-row-main">
                  <div className="report-person reported-person"><span className="report-field-label">REPORTED ACCOUNT</span><div className="report-person-content"><img src={report.reportedAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'} alt="" /><div><strong>{report.reportedName || 'Unknown user'}</strong><span>{report.reportedId || 'No account ID'}</span></div></div></div>
                  <div className="report-issue"><span className="report-field-label">REASON</span><span className="report-reason-tag">{report.reason || 'Unspecified'}</span>{report.details && <p>{report.details}</p>}</div>
                  <div className="report-person reporter-person"><span className="report-field-label">REPORTED BY</span><div className="report-reporter-name"><UserRound size={14} /><strong>{report.reporterName || 'Unknown reporter'}</strong></div><span className="reporter-id">{report.reporterId || 'No account ID'}</span></div>
                  <div className="report-row-actions"><button type="button" className="report-action-dismiss" onClick={() => handleReportAction(report.id, report.reportedId, 'dismiss')}>Dismiss</button><button type="button" className="report-action-warn" title="Issue warning" onClick={() => handleReportAction(report.id, report.reportedId, 'warn')}><AlertTriangle size={14} /><span>Warn</span></button><button type="button" className="report-action-ban" title="Ban account" onClick={() => handleReportAction(report.id, report.reportedId, 'ban')}><Ban size={14} /><span>Ban</span></button></div>
                </div>
                {hasEvidence && <div className="report-evidence-wrap"><button type="button" className={`report-evidence-toggle ${isExpanded ? 'open' : ''}`} onClick={() => toggleEvidence(report.id)}><MessageSquare size={13} />{report.chatSnippet ? 'View chat evidence' : 'View report details'}<span>{isExpanded ? '−' : '+'}</span></button>{isExpanded && <div className="report-evidence-content">{report.details && <p>{report.details}</p>}{report.chatSnippet && <div className="report-chat-evidence">{report.chatSnippet.split('\n').filter(Boolean).map((line, index) => <div key={index} className="report-chat-line">{line}</div>)}</div>}</div>}</div>}
              </article>;
            })}
          </div>
          <footer className="reports-pagination"><span>Showing <strong>{startIndex}–{endIndex}</strong> of <strong>{filteredReports.length.toLocaleString()}</strong> reports</span><div><button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={16} /></button><span>Page <strong>{page}</strong> of <strong>{pageCount}</strong></span><button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}><ChevronRight size={16} /></button></div></footer>
        </>
      )}
    </div>
  );
}
