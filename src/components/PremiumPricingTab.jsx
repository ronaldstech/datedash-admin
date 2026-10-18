import { useEffect, useState } from 'react';
import { CreditCard, Save, Sparkles } from 'lucide-react';
import '../styles/premium-pricing.css';

const planNames = ['pro', 'premium', 'elite'];
const emptyPlan = { weekly: '', monthly: '' };
const emptyDraft = () => ({
  currency: 'USD',
  plans: Object.fromEntries(planNames.map((plan) => [plan, { ...emptyPlan }])),
  creditBundles: []
});

const draftFromConfig = (config) => {
  const draft = emptyDraft();
  if (!config) return draft;

  return {
    currency: config.currency || 'USD',
    plans: Object.fromEntries(planNames.map((plan) => [
      plan,
      { ...emptyPlan, ...(config.plans?.[plan] || {}) }
    ])),
    creditBundles: Array.isArray(config.creditBundles)
      ? config.creditBundles.map((bundle) => ({
          amount: bundle.amount ?? '',
          priceUsd: bundle.priceUsd ?? '',
          bonus: bundle.bonus ?? 0,
          popular: Boolean(bundle.popular)
        }))
      : []
  };
};

export default function PremiumPricingTab({ config, onSave, isLive }) {
  const [draft, setDraft] = useState(() => draftFromConfig(config));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setDraft(draftFromConfig(config));
  }, [config]);

  const updatePlan = (plan, period, value) => setDraft((previous) => ({
    ...previous,
    plans: { ...previous.plans, [plan]: { ...previous.plans[plan], [period]: value } }
  }));
  const updateBundle = (index, field, value) => setDraft((previous) => ({
    ...previous,
    creditBundles: previous.creditBundles.map((bundle, bundleIndex) =>
      bundleIndex === index ? { ...bundle, [field]: value } : bundle
    )
  }));
  const addBundle = () => setDraft((previous) => ({
    ...previous,
    creditBundles: [...previous.creditBundles, { amount: '', priceUsd: '', bonus: 0, popular: false }]
  }));
  const removeBundle = (index) => setDraft((previous) => ({
    ...previous,
    creditBundles: previous.creditBundles.filter((_, bundleIndex) => bundleIndex !== index)
  }));

  const save = async () => {
    const invalidPlan = Object.values(draft.plans).some((plan) =>
      ['weekly', 'monthly'].some((period) => plan[period] === '' || !Number.isFinite(Number(plan[period])) || Number(plan[period]) < 0)
    );
    const invalidBundle = draft.creditBundles.some((bundle) =>
      bundle.amount === '' || !Number.isFinite(Number(bundle.amount)) || Number(bundle.amount) <= 0 ||
      bundle.priceUsd === '' || !Number.isFinite(Number(bundle.priceUsd)) || Number(bundle.priceUsd) < 0 ||
      !Number.isFinite(Number(bundle.bonus)) || Number(bundle.bonus) < 0
    );
    if (invalidPlan || invalidBundle) {
      setMessage('Enter valid USD prices and Spark amounts. Prices and bonuses must be zero or higher.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const payload = {
        currency: 'USD',
        plans: Object.fromEntries(Object.entries(draft.plans).map(([plan, prices]) => [
          plan,
          { weekly: Number(prices.weekly), monthly: Number(prices.monthly) }
        ])),
        creditBundles: draft.creditBundles.map((bundle) => ({
          amount: Number(bundle.amount),
          priceUsd: Number(bundle.priceUsd),
          bonus: Number(bundle.bonus),
          popular: Boolean(bundle.popular)
        }))
      };
      await onSave(payload);
      setMessage(`Premium and Spark prices saved${isLive ? ' to Firebase' : ' locally'}.`);
    } catch (error) {
      setMessage(`Could not save pricing: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="premium-pricing-page">
      <header className="premium-pricing-hero">
        <div className="premium-pricing-icon"><CreditCard size={24} /></div>
        <div><span className="premium-pricing-kicker">SUBSCRIPTIONS & SPARKS</span><h2>Premium pricing</h2><p>Prices are loaded from the app pricing record and shared across countries.</p></div>
        <button className="premium-pricing-save" type="button" disabled={saving} onClick={save}><Save size={16} />{saving ? 'Saving…' : 'Save pricing'}</button>
      </header>
      {message && <div className="premium-pricing-message" role="status">{message}</div>}
      {!config && <div className="premium-pricing-message" role="status">No pricing record exists in the database yet. Enter prices and save to create it.</div>}
      <section className="premium-pricing-section">
        <div className="premium-section-heading"><div><h3>Subscription prices</h3><p>All prices are in USD and shared across countries.</p></div><span>USD $</span></div>
        <div className="premium-plan-pricing-grid">
          {Object.entries(draft.plans).map(([plan, prices]) => <article className="premium-plan-card" key={plan}><span className={`plan-${plan}`}>{plan}</span><div className="premium-plan-inputs">{['weekly', 'monthly'].map((period) => <label key={period}>{period}<div className="usd-input"><span>$</span><input aria-label={`${plan} ${period} price in USD`} type="number" min="0" step="0.01" value={prices[period]} onChange={(event) => updatePlan(plan, period, event.target.value)} /></div></label>)}</div></article>)}
        </div>
      </section>
      <section className="premium-pricing-section">
        <div className="premium-section-heading"><div><h3><Sparkles size={17} /> Spark bundles</h3><p>Bundle amounts, bonuses, and USD prices are loaded from the app pricing record.</p></div><span>{draft.creditBundles.length} bundles</span></div>
        <div className="spark-bundle-grid">{draft.creditBundles.map((bundle, index) => <article className="spark-bundle-card" key={`${bundle.amount}-${index}`}><strong>{Number(bundle.amount || 0).toLocaleString()} Sparks</strong><label>Bundle amount<input type="number" min="1" step="1" value={bundle.amount} onChange={(event) => updateBundle(index, 'amount', event.target.value)} /></label><label>Price in USD<div className="usd-input"><span>$</span><input type="number" min="0" step="0.01" value={bundle.priceUsd} onChange={(event) => updateBundle(index, 'priceUsd', event.target.value)} /></div></label><label>Bonus Sparks<input type="number" min="0" step="1" value={bundle.bonus} onChange={(event) => updateBundle(index, 'bonus', event.target.value)} /></label><label className="spark-popular-toggle"><input type="checkbox" checked={Boolean(bundle.popular)} onChange={(event) => updateBundle(index, 'popular', event.target.checked)} /> Mark as popular</label><button type="button" onClick={() => removeBundle(index)}>Remove bundle</button></article>)}</div>
        <button type="button" onClick={addBundle}>Add Spark bundle</button>
      </section>
      {!isLive && <p className="premium-pricing-offline">Firebase is not connected. Saves in this preview stay in the current session.</p>}
    </section>
  );
}
