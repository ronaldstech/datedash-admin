import React from 'react';

/**
 * TransactionsTab Component.
 * Props:
 * - transactions: array of transaction objects
 */
export default function TransactionsTab({ transactions }) {
  return (
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
          {transactions.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                No payment transactions have been logged.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
