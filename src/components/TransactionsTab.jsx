import { useMemo, useState } from 'react';
import { Receipt, Search, ArrowDownLeft, Clock3, CircleDollarSign, ChevronLeft, ChevronRight, CreditCard, UserRound } from 'lucide-react';
import '../styles/transactions.css';

const PAGE_SIZE = 12;
const isSuccessful = (status) => ['success', 'successful', 'completed', 'paid'].includes(String(status || '').toLowerCase());
const transactionTime = (transaction) => {
  const value = new Date(transaction.timestamp).getTime();
  return Number.isNaN(value) ? 0 : value;
};
const money = (value) => `$${(Number(value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function TransactionsTab({ transactions, users = [] }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const usersById = useMemo(() => {
    const map = new Map();
    users.forEach((user) => {
      [user.id, user.authUid, user.email].filter(Boolean).forEach((key) => map.set(String(key).toLowerCase(), user));
    });
    return map;
  }, [users]);
  const enrichedTransactions = useMemo(() => transactions.map((transaction) => {
    const user = usersById.get(String(transaction.uid || '').toLowerCase());
    return { ...transaction, userName: user?.name || transaction.userName || 'Unknown user', userAvatar: user?.avatar || null, linkedUser: Boolean(user) };
  }), [transactions, usersById]);
  const types = useMemo(() => [...new Set(transactions.map((transaction) => transaction.type).filter(Boolean))].sort(), [transactions]);
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return enrichedTransactions.filter((transaction) => {
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'success' ? isSuccessful(transaction.status) : String(transaction.status).toLowerCase() === statusFilter);
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
      const matchesSearch = !search || [transaction.txRef, transaction.userName, transaction.uid, transaction.email, transaction.operator, transaction.type, transaction.plan].join(' ').toLowerCase().includes(search);
      return matchesStatus && matchesType && matchesSearch;
    }).sort((a, b) => transactionTime(b) - transactionTime(a));
  }, [enrichedTransactions, query, statusFilter, typeFilter]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const successfulTransactions = transactions.filter((transaction) => isSuccessful(transaction.status));
  const totalRevenue = successfulTransactions.reduce((total, transaction) => total + (Number(transaction.amount) || 0), 0);
  const pendingCount = transactions.filter((transaction) => String(transaction.status).toLowerCase() === 'pending').length;

  const setFilter = (setter, value) => { setter(value); setPage(1); };
  const showingStart = filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const showingEnd = Math.min(page * PAGE_SIZE, filtered.length);

  return (
    <div className="transactions-workspace">
      <section className="transactions-hero"><div className="transactions-hero-mark"><Receipt size={19} /></div><div><span className="transactions-kicker">PAYMENTS & ACTIVITY</span><h2>Transactions</h2><p>A clear view of purchases, subscriptions and account activity.</p></div><div className="transactions-hero-count"><strong>{transactions.length.toLocaleString()}</strong><span>records</span></div></section>

      <section className="transactions-metrics">
        <div><span>SUCCESSFUL VOLUME</span><strong>{money(totalRevenue)}</strong><small>Completed payments</small><CircleDollarSign size={18} /></div>
        <div><span>TRANSACTIONS</span><strong>{transactions.length.toLocaleString()}</strong><small>All recorded activity</small><Receipt size={18} /></div>
        <div><span>PENDING</span><strong>{pendingCount.toLocaleString()}</strong><small>Awaiting confirmation</small><Clock3 size={18} /></div>
      </section>

      <section className="transactions-panel">
        <div className="transactions-panel-heading"><div><span className="transactions-kicker">LEDGER</span><h3>Recent activity</h3></div><span>{filtered.length.toLocaleString()} results</span></div>
        <div className="transactions-toolbar">
          <label className="transactions-search"><Search size={15} /><input type="search" placeholder="Search username, reference, or provider" value={query} onChange={(event) => setFilter(setQuery, event.target.value)} /></label>
          <select value={statusFilter} onChange={(event) => setFilter(setStatusFilter, event.target.value)} aria-label="Filter by status"><option value="all">All statuses</option><option value="success">Successful</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="cancelled">Cancelled</option></select>
          <select value={typeFilter} onChange={(event) => setFilter(setTypeFilter, event.target.value)} aria-label="Filter by transaction type"><option value="all">All types</option>{types.map((type) => <option key={type} value={type}>{type}</option>)}</select>
        </div>

        {pageItems.length ? <div className="transactions-table-scroll"><table className="custom-table transactions-table"><thead><tr><th>Transaction</th><th>Account</th><th>Amount</th><th>Product</th><th>Payment channel</th><th>Date</th><th>Status</th></tr></thead><tbody>
          {pageItems.map((transaction) => {
            const success = isSuccessful(transaction.status);
            const time = transactionTime(transaction);
            const details = transaction.plan ? transaction.plan : transaction.creditAmount ? `${transaction.creditAmount} credits` : transaction.type;
            const avatarInitial = transaction.userName === 'Unknown user' ? '?' : transaction.userName.trim().charAt(0).toUpperCase();
            return <tr key={transaction.id}>
              <td><div className="transaction-reference"><span><ArrowDownLeft size={13} /></span><div><strong>{transaction.txRef || 'No reference'}</strong><small>{transaction.type || 'Transaction'}</small></div></div></td>
              <td><div className="transaction-user">{transaction.userAvatar ? <img src={transaction.userAvatar} alt="" /> : <span className="transaction-user-initial">{avatarInitial}</span>}<div><strong>{transaction.userName}</strong>{!transaction.linkedUser && transaction.uid && <small>ID: {transaction.uid}</small>}</div></div></td>
              <td><strong className={`transaction-amount ${success ? 'positive' : ''}`}>{money(transaction.amount)}</strong></td>
              <td><span className="transaction-product"><CreditCard size={12} />{details}</span></td>
              <td><span className="transaction-operator">{transaction.operator || 'Unknown provider'}</span></td>
              <td><span className="transaction-date">{time ? new Date(time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date unavailable'}</span><small className="transaction-time">{time ? new Date(time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''}</small></td>
              <td><span className={`transaction-status transaction-status-${String(transaction.status || 'unknown').toLowerCase()}`}><i />{transaction.status || 'unknown'}</span></td>
            </tr>;
          })}
        </tbody></table></div> : <div className="transactions-empty"><div><UserRound size={21} /></div><h4>{transactions.length ? 'No matching transactions' : 'No transactions recorded'}</h4><p>{transactions.length ? 'Try adjusting your search or filters.' : 'Payment activity will appear here when it is recorded.'}</p>{transactions.length > 0 && (query || statusFilter !== 'all' || typeFilter !== 'all') && <button onClick={() => { setQuery(''); setStatusFilter('all'); setTypeFilter('all'); }}>Clear filters</button>}</div>}

        {filtered.length > 0 && <footer className="transactions-pagination"><span>Showing <strong>{showingStart}–{showingEnd}</strong> of <strong>{filtered.length.toLocaleString()}</strong></span><div><button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={15} /></button><span>Page <strong>{page}</strong> of <strong>{pageCount}</strong></span><button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}><ChevronRight size={15} /></button></div></footer>}
      </section>
    </div>
  );
}
