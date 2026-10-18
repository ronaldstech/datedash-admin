import { useEffect, useState } from 'react';
import { CreditCard, Save, Sparkles, Zap, Heart, Crown, Plus, Trash2, Flame } from 'lucide-react';
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

  const planDetails = {
    pro: { title: 'Pro', description: 'A little more room to connect.', icon: Zap },
    premium: { title: 'Premium', description: 'More ways to find your person.', icon: Heart },
    elite: { title: 'Elite', description: 'The complete Snellum experience.', icon: Crown }
  };

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
        <div className="premium-pricing-hero-copy"><span className="premium-pricing-kicker">COMMERCE SETTINGS</span><h2>Premium pricing</h2><p>Set the shared USD prices for subscriptions and Spark bundles.</p><span className="premium-base-currency"><span className="currency-live-dot" /> BASE CURRENCY <strong>USD · $</strong></span></div>
        <button className="premium-pricing-save" type="button" disabled={saving} onClick={save}><Save size={16} />{saving ? 'Saving…' : 'Save pricing'}</button>
      </header>
      {message && <div className="premium-pricing-message" role="status">{message}</div>}
      {!config && <div className="premium-pricing-message" role="status">No pricing record exists in the database yet. Enter prices and save to create it.</div>}
      <section className="premium-pricing-section">
        <div className="premium-section-heading"><div><span className="premium-section-eyebrow">01 / MEMBERSHIPS</span><h3>Subscription plans</h3><p>One base price per billing cycle. The app converts prices to local currencies.</p></div><span className="pricing-section-count">3 PLANS</span></div>
        <div className="premium-plan-pricing-grid">
          {Object.entries(draft.plans).map(([plan, prices]) => { const details = planDetails[plan]; const PlanIcon = details.icon; return <article className={`premium-plan-card plan-card-${plan}`} key={plan}><div className="plan-card-top"><div className="plan-card-icon"><PlanIcon size={18} /></div><span className={`plan-${plan}`}>{details.title}</span><span className="plan-card-tier">TIER</span></div><p className="plan-card-description">{details.description}</p><div className="premium-plan-inputs">{['weekly', 'monthly'].map((period) => <label key={period}><span>{period} billing</span><div className="usd-input"><span>$</span><input aria-label={`${plan} ${period} price in USD`} type="number" min="0" step="0.01" value={prices[period]} onChange={(event) => updatePlan(plan, period, event.target.value)} /></div></label>)}</div></article>; })}
        </div>
      </section>
      <section className="premium-pricing-section">
        <div className="premium-section-heading"><div><span className="premium-section-eyebrow">02 / VIRTUAL CURRENCY</span><h3>Spark bundles</h3><p>Customize package size, USD price, and any bonus Sparks.</p></div><span className="pricing-section-count">{draft.creditBundles.length} BUNDLES</span></div>
        {draft.creditBundles.length > 0 ? <div className="spark-bundle-grid">{draft.creditBundles.map((bundle, index) => <article className="spark-bundle-card" key={index}><div className="bundle-card-top"><div className="bundle-spark-icon"><Sparkles size={18} /></div><div className="bundle-title"><strong>{Number(bundle.amount || 0).toLocaleString()} <span>Sparks</span></strong><small>Bundle {String(index + 1).padStart(2, '0')}</small></div>{bundle.popular && <span className="bundle-popular"><Flame size={12} /> Popular</span>}</div><label>Bundle amount<input aria-label={`Bundle ${index + 1} Spark amount`} type="number" min="1" step="1" value={bundle.amount} onChange={(event) => updateBundle(index, 'amount', event.target.value)} /></label><label>Price in USD<div className="usd-input"><span>$</span><input aria-label={`Bundle ${index + 1} USD price`} type="number" min="0" step="0.01" value={bundle.priceUsd} onChange={(event) => updateBundle(index, 'priceUsd', event.target.value)} /></div></label><div className="bundle-footer"><label>Bonus Sparks<input aria-label={`Bundle ${index + 1} bonus Sparks`} type="number" min="0" step="1" value={bundle.bonus} onChange={(event) => updateBundle(index, 'bonus', event.target.value)} /></label><label className="spark-popular-toggle"><input type="checkbox" checked={Boolean(bundle.popular)} onChange={(event) => updateBundle(index, 'popular', event.target.checked)} /> Popular</label></div><button className="bundle-remove" type="button" onClick={() => removeBundle(index)}><Trash2 size={14} /> Remove bundle</button></article>)}</div> : <div className="spark-bundle-empty"><Sparkles size={22} /><strong>No Spark bundles yet</strong><span>Add a bundle to offer Sparks for purchase.</span></div>}
        <button className="bundle-add-button" type="button" onClick={addBundle}><Plus size={16} /> Add Spark bundle</button>
      </section>
      {!isLive && <p className="premium-pricing-offline">Firebase is not connected. Saves in this preview stay in the current session.</p>}
    </section>
  );
}
