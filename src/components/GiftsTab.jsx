import { useEffect, useState } from 'react';
import { Gift, Save, Sparkles } from 'lucide-react';
import '../styles/gifts.css';

const referenceGifts = [
  { id: 'rose', icon: '🌹', name: 'Rose', cost: 50, color: '#ef4444' },
  { id: 'heart', icon: '❤️', name: 'Heart', cost: 100, color: '#ec4899' },
  { id: 'chocolate', icon: '🍫', name: 'Chocolate', cost: 250, color: '#92400e' },
  { id: 'teddy', icon: '🧸', name: 'Teddy Bear', cost: 500, color: '#f97316' },
  { id: 'champagne', icon: '🥂', name: 'Champagne', cost: 1000, color: '#f59e0b' },
  { id: 'ring', icon: '💍', name: 'Diamond Ring', cost: 5000, color: '#06b6d4' }
];

export default function GiftsTab({ gifts, onSaveGift, isLive }) {
  const configuredById = new Map(gifts.map((gift) => [gift.id, gift]));
  const sourceGifts = [
    ...referenceGifts.map((gift) => ({ ...gift, ...(configuredById.get(gift.id) || {}) })),
    ...gifts.filter((gift) => !referenceGifts.some((reference) => reference.id === gift.id))
  ];
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => setDrafts(Object.fromEntries(sourceGifts.map((gift) => [gift.id, { ...gift }]))), [gifts]);

  const updateDraft = (id, field, value) => {
    setDrafts((previous) => ({ ...previous, [id]: { ...previous[id], [field]: value } }));
    setMessage('');
  };

  const saveGift = async (id) => {
    const gift = drafts[id];
    if (!gift?.name.trim() || !gift.icon.trim() || !Number.isFinite(Number(gift.cost)) || Number(gift.cost) < 0) {
      setMessage('Enter a name, icon, and a non-negative cost before saving.');
      return;
    }
    setSavingId(id);
    setMessage('');
    try {
      await onSaveGift({ ...gift, name: gift.name.trim(), cost: Number(gift.cost) });
      setMessage(`${gift.name} saved${isLive ? ' to Firebase' : ' locally'}.`);
    } catch (error) {
      setMessage(`Could not save ${gift.name}: ${error.message}`);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="gifts-admin">
      <div className="gifts-intro">
        <div className="gifts-intro-icon"><Gift size={24} /></div>
        <div>
          <span className="gifts-kicker"><Sparkles size={13} /> GIFT CATALOG</span>
          <h2>Manage virtual gifts</h2>
          <p>Change the gift label, icon, credit cost, and display color used in the app.</p>
        </div>
        <span className="gifts-count">{sourceGifts.length} gifts</span>
      </div>

      {message && <div className="gifts-message" role="status">{message}</div>}

      <div className="gifts-grid">
        {sourceGifts.map((gift) => {
          const draft = drafts[gift.id] || gift;
          return (
            <article className="gift-edit-card" key={gift.id}>
              <div className="gift-card-heading">
                <div className="gift-preview" style={{ '--gift-color': draft.color || '#ec4899' }}>{draft.icon || '🎁'}</div>
                <div><span className="gift-document-id">/{gift.id}</span><h3>{draft.name || 'Unnamed gift'}</h3></div>
              </div>
              <label className="gift-field">Gift name<input value={draft.name} onChange={(event) => updateDraft(gift.id, 'name', event.target.value)} /></label>
              <div className="gift-fields-row">
                <label className="gift-field">Icon / emoji<input value={draft.icon} onChange={(event) => updateDraft(gift.id, 'icon', event.target.value)} maxLength={8} /></label>
                <label className="gift-field">Credit cost<input type="number" min="0" step="1" value={draft.cost} onChange={(event) => updateDraft(gift.id, 'cost', event.target.value)} /></label>
              </div>
              <label className="gift-field gift-color-field">Display color<input type="color" value={draft.color || '#ec4899'} onChange={(event) => updateDraft(gift.id, 'color', event.target.value)} /><span>{draft.color || '#ec4899'}</span></label>
              <button className="gift-save-button" type="button" disabled={savingId === gift.id} onClick={() => saveGift(gift.id)}>
                <Save size={15} /> {savingId === gift.id ? 'Saving…' : 'Save gift'}
              </button>
            </article>
          );
        })}
      </div>
      {!isLive && <p className="gifts-preview-note">Firebase is not connected. Saves in this preview stay in the current session.</p>}
    </section>
  );
}
