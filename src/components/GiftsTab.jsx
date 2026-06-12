import React from 'react';

/**
 * GiftsTab Component.
 * Props:
 * - gifts: array of gift objects
 * - handleUpdateGiftCost: function (giftId, newCost)
 */
export default function GiftsTab({ gifts, handleUpdateGiftCost }) {
  return (
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
  );
}
