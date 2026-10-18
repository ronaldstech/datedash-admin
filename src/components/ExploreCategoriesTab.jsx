import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Compass, Eye, EyeOff, Image, Pencil, Search, Users, X, Save, Sparkles } from 'lucide-react';
import '../styles/explore-categories.css';

export default function ExploreCategoriesTab({ categories, users, onSaveCategory, onReorderCategory }) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const categoryCounts = useMemo(() => {
    const result = new Map();
    categories.forEach((category) => result.set(category.key, users.filter((user) => user.lookingFor?.includes(category.key)).length));
    return result;
  }, [categories, users]);
  const filteredCategories = categories.filter((category) => `${category.title} ${category.subtitle} ${category.key}`.toLowerCase().includes(search.trim().toLowerCase()));
  const enabledCount = categories.filter((category) => category.enabled !== false).length;
  const totalTaggedUsers = users.filter((user) => (user.lookingFor || []).length > 0).length;

  const save = async (category) => {
    setSaving(true);
    setSaveError('');
    try {
      await onSaveCategory(category);
      setEditing(null);
    } catch (error) {
      setSaveError(error.message || 'Could not save this category.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="explore-admin">
      <section className="explore-admin-hero">
        <div className="explore-hero-icon"><Compass size={21} /></div><div><span className="explore-kicker">DISCOVERY EXPERIENCE</span><h2>Explore categories</h2><p>Shape the first impression people get when they browse the community.</p></div>
        <div className="explore-hero-stat"><strong>{enabledCount}<small>/{categories.length}</small></strong><span>visible categories</span></div>
      </section>

      <section className="explore-admin-metrics"><div><span>CATEGORIES</span><strong>{categories.length}</strong><small>Profile goals available</small></div><div><span>VISIBLE</span><strong>{enabledCount}</strong><small>Shown in Explore</small></div><div><span>COMMUNITY</span><strong>{totalTaggedUsers.toLocaleString()}</strong><small>Members with a goal set</small></div></section>

      <section className="explore-category-section">
        <header className="explore-category-header"><div><span className="explore-kicker">EXPLORE GRID</span><h3>Category cards</h3><p>Edit the display name, supporting line, photo and accent color.</p></div><label className="explore-search"><Search size={15} /><input type="search" placeholder="Find a category" value={search} onChange={(event) => setSearch(event.target.value)} /></label></header>
        <div className="explore-category-grid">{filteredCategories.map((category) => {
          const visibleIndex = categories.findIndex((item) => item.key === category.key);
          return <article className={`explore-category-card ${category.enabled === false ? 'is-disabled' : ''}`} key={category.key}>
            <div className="explore-category-photo" style={{ backgroundImage: `linear-gradient(180deg,rgba(8,7,12,.06),rgba(8,7,12,.8)),url("${category.photo}")` }}>
              <span className="explore-order">{String(category.order + 1).padStart(2, '0')}</span><span className={`explore-visible-badge ${category.enabled === false ? 'off' : ''}`}>{category.enabled === false ? <><EyeOff size={11} /> Hidden</> : <><Eye size={11} /> Visible</>}</span>
              <span className="explore-accent-dot" style={{ backgroundColor: category.accent }} />
              <div className="explore-photo-caption"><strong>{category.title}</strong><span>{category.subtitle}</span></div>
            </div>
            <div className="explore-category-info"><div className="explore-member-count"><Users size={14} /><strong>{(categoryCounts.get(category.key) || 0).toLocaleString()}</strong><span>members</span></div><code>{category.key}</code></div>
            <div className="explore-category-actions"><button type="button" onClick={() => setEditing({ ...category })}><Pencil size={13} /> Edit card</button><button type="button" title="Move up" disabled={visibleIndex === 0} onClick={() => onReorderCategory(category.key, -1)}><ArrowUp size={14} /></button><button type="button" title="Move down" disabled={visibleIndex === categories.length - 1} onClick={() => onReorderCategory(category.key, 1)}><ArrowDown size={14} /></button><button type="button" className={category.enabled === false ? 'show-category' : 'hide-category'} title={category.enabled === false ? 'Show in Explore' : 'Hide from Explore'} onClick={() => save({ ...category, enabled: category.enabled === false })}>{category.enabled === false ? <Eye size={14} /> : <EyeOff size={14} />}</button></div>
          </article>;
        })}</div>
        {!filteredCategories.length && <div className="explore-categories-empty"><Search size={20} /><p>No categories match “{search}”.</p></div>}
        <p className="explore-category-note"><Sparkles size={13} /> Category keys are kept fixed so existing member preferences continue to match these cards.</p>
      </section>

      {editing && <div className="modal-overlay" onClick={() => !saving && setEditing(null)}><div className="modal-content explore-category-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><span className="explore-kicker">EDIT CATEGORY CARD</span><h3>{editing.title}</h3></div><button type="button" className="modal-close" onClick={() => setEditing(null)} aria-label="Close"><X size={17} /></button></div>
        <form className="modal-body explore-category-form" onSubmit={(event) => { event.preventDefault(); save(editing); }}>
          <label><span>Display title</span><input required maxLength={40} value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} /></label>
          <label><span>Subtitle</span><input required maxLength={60} value={editing.subtitle} onChange={(event) => setEditing({ ...editing, subtitle: event.target.value })} /></label>
          <label className="explore-photo-field"><span><Image size={13} /> Photo URL</span><input required type="url" value={editing.photo} onChange={(event) => setEditing({ ...editing, photo: event.target.value })} /></label>
          <label className="explore-color-field"><span>Accent color</span><div><input type="color" value={editing.accent || '#f5b94c'} onChange={(event) => setEditing({ ...editing, accent: event.target.value })} /><code>{editing.accent}</code></div></label>
          {saveError && <p className="explore-save-error">{saveError}</p>}
          <div className="explore-form-actions"><button type="button" className="action-btn-secondary" disabled={saving} onClick={() => setEditing(null)}>Cancel</button><button type="submit" className="btn-primary" disabled={saving}><Save size={14} />{saving ? 'Saving…' : 'Save category'}</button></div>
        </form>
      </div></div>}
    </div>
  );
}
