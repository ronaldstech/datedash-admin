import { useEffect, useState } from 'react';
import { CreditCard, Save, Sparkles } from 'lucide-react';
import '../styles/premium-pricing.css';

const initialPlans = {
  pro: { weekly: 4.99, monthly: 9.99 },
  premium: { weekly: 6.99, monthly: 14.99 },
  elite: { weekly: 9.99, monthly: 29.99 }
};
const initialBundles = [
  { amount: 1000, priceUsd: 1, bonus: 0, popular: false },
  { amount: 3000, priceUsd: 3, bonus: 0, popular: true },
  { amount: 5000, priceUsd: 5, bonus: 0, popular: false },
  { amount: 10000, priceUsd: 10, bonus: 0, popular: false },
  { amount: 20000, priceUsd: 20, bonus: 0, popular: false },
  { amount: 50000, priceUsd: 50, bonus: 10000, popular: false }
];
const defaults = () => ({ currency: 'USD', plans: structuredClone(initialPlans), creditBundles: structuredClone(initialBundles) });

export default function PremiumPricingTab({ config, onSave, isLive }) {
  const [draft, setDraft] = useState(defaults);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fallback = defaults();
    setDraft({
      currency: 'USD',
      plans: Object.fromEntries(Object.keys(initialPlans).map((plan) => [plan, { ...fallback.plans[plan], ...(config?.plans?.[plan] || {}) }])),
      creditBundles: config?.creditBundles?.length ? config.creditBundles.map((bundle, index) => ({ ...fallback.creditBundles[index], ...bundle, priceUsd: bundle.priceUsd ?? Number(bundle.amount || 0) * 0.001 })) : fallback.creditBundles
    });
  }, [config]);

  const updatePlan = (plan, period, value) => setDraft((previous) => ({ ...previous, plans: { ...previous.plans, [plan]: { ...previous.plans[plan], [period]: value } } }));
  const updateBundle = (index, field, value) => setDraft((previous) => ({ ...previous, creditBundles: previous.creditBundles.map((bundle, bundleIndex) => bundleIndex === index ? { ...bundle, [field]: value } : bundle) }));

  const save = async () => {
    const invalidPlan = Object.values(draft.plans).some((plan) => ['weekly', 'monthly'].some((period) => !Number.isFinite(Number(plan[period])) || Number(plan[period]) < 0));
    const invalidBundle = draft.creditBundles.some((bundle) => !Number.isFinite(Number(bundle.amount)) || Number(bundle.amount) <= 0 || !Number.isFinite(Number(bundle.priceUsd)) || Number(bundle.priceUsd) < 0 || !Number.isFinite(Number(bundle.bonus)) || Number(bundle.bonus) < 0);
    if (invalidPlan || invalidBundle) {
      setMessage('Check all USD prices and Spark amounts. Values must be zero or higher.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        currency: 'USD',
        plans: Object.fromEntries(Object.entries(draft.plans).map(([plan, prices]) => [plan, { weekly: Number(prices.weekly), monthly: Number(prices.monthly) }])),
        creditBundles: draft.creditBundles.map((bundle) => ({ amount: Number(bundle.amount), priceUsd: Number(bundle.priceUsd), bonus: Number(bundle.bonus), popular: Boolean(bundle.popular) }))
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
        <div><span className="premium-pricing-kicker">SUBSCRIPTIONS & SPARKS</span><h2>Premium pricing</h2><p>Set one base price in US dollars. The app can convert it to each user’s local currency.</p></div>
        <button className="premium-pricing-save" type="button" disabled={saving} onClick={save}><Save size={16} />{saving ? 'Saving…' : 'Save pricing'}</button>
      </header>
      {message && <div className="premium-pricing-message" role="status">{message}</div>}
      <section className="premium-pricing-section">
        <div className="premium-section-heading"><div><h3>Subscription prices</h3><p>All prices are in USD and shared across countries.</p></div><span>USD $</span></div>
        <div className="premium-plan-pricing-grid">
          {Object.entries(draft.plans).map(([plan, prices]) => <article className="premium-plan-card" key={plan}><span className={`plan-${plan}`}>{plan}</span><div className="premium-plan-inputs">{['weekly', 'monthly'].map((period) => <label key={period}>{period}<div className="usd-input"><span>$</span><input aria-label={`${plan} ${period} price in USD`} type="number" min="0" step="0.01" value={prices[period]} onChange={(event) => updatePlan(plan, period, event.target.value)} /></div></label>)}</div></article>)}
        </div>
      </section>
      <section className="premium-pricing-section">
        <div className="premium-section-heading"><div><h3><Sparkles size={17} /> Spark bundles</h3><p>Set the USD price for each Spark package. Local currency conversion happens in the app.</p></div><span>{draft.creditBundles.length} bundles</span></div>
        <div className="spark-bundle-grid">{draft.creditBundles.map((bundle, index) => <article className="spark-bundle-card" key={index}><strong>{Number(bundle.amount || 0).toLocaleString()} Sparks</strong><label>Bundle amount<input type="number" min="1" step="1" value={bundle.amount} onChange={(event) => updateBundle(index, 'amount', event.target.value)} /></label><label>Price in USD<div className="usd-input"><span>$</span><input type="number" min="0" step="0.01" value={bundle.priceUsd} onChange={(event) => updateBundle(index, 'priceUsd', event.target.value)} /></div></label><label>Bonus Sparks<input type="number" min="0" step="1" value={bundle.bonus} onChange={(event) => updateBundle(index, 'bonus', event.target.value)} /></label><label className="spark-popular-toggle"><input type="checkbox" checked={Boolean(bundle.popular)} onChange={(event) => updateBundle(index, 'popular', event.target.checked)} /> Mark as popular</label></article>)}</div>
      </section>
      {!isLive && <p className="premium-pricing-offline">Firebase is not connected. Saves in this preview stay in the current session.</p>}
    </section>
  );
}
