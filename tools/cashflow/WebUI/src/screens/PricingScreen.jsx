import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBilling } from '../appState/BillingContext';
import { useAuth } from '../appState/AuthContext';
import { startTrial } from '../api';
import '../styles/billing.css';

const TRIAL_DAYS = 30;

const TIERS = [
    {
        id: 'pro',
        name: 'Pro',
        price: '£9.99',
        period: '/ month',
        yearlyHint: 'or £89.99 / year (save 25%)',
        badge: null,
        featured: true,
        features: [
            'Full Cashflow access',
            'Transaction tracking & charts',
            'Auto-categorisation',
            'Data persists across sessions',
            'Cancel anytime',
        ],
    },
    {
        id: 'proplus',
        name: 'Pro+',
        price: '£14.99',
        period: '/ month',
        yearlyHint: 'or £134.99 / year (save 25%)',
        badge: null,
        featured: false,
        features: [
            'Everything in Pro',
            'Priority support',
            'Early access to new tools',
            'Advanced export options',
            'Cancel anytime',
        ],
    },
    {
        id: 'business',
        name: 'Business',
        price: '£29.99',
        period: '/ month',
        yearlyHint: 'or £269.99 / year (save 25%)',
        badge: null,
        featured: false,
        features: [
            'Everything in Pro+',
            'Up to 5 team members',
            'Higher upload limits',
            'Usage analytics',
            'Cancel anytime',
        ],
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        yearlyHint: null,
        badge: null,
        featured: false,
        features: [
            'Everything in Business',
            'Unlimited team members',
            'Dedicated support',
            'Custom integrations',
            'Bespoke SLA',
        ],
        contactOnly: true,
    },
];

const LANDING_HOME = import.meta.env.DEV ? 'http://localhost:5174' : '/utility-tools/';

export default function PricingScreen() {
    const navigate    = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { isLoggedIn } = useAuth();
    const { billing, hasPro, tier: currentTier, activeTrial, stripeConfig, stripeConfigLoading, ensureStripeConfig, refresh } = useBilling();

    const fromLanding = searchParams.get('from') === 'landing';

    const [loadingTier, setLoadingTier]   = useState(null);
    const [error, setError]               = useState(null);
    const [successMsg, setSuccessMsg]     = useState(
        searchParams.get('success') === '1' ? 'Plan activated successfully!' : null
    );

    // Clear ?success=1 from the URL — keep ?from=landing so the banner can show "Back to tools".
    useEffect(() => {
        if (searchParams.get('success') === '1') {
            const keep = {};
            if (searchParams.get('from')) keep.from = searchParams.get('from');
            setSearchParams(keep, { replace: true });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { ensureStripeConfig(); }, [ensureStripeConfig]);

    const stripeEnabled = stripeConfig?.stripe_enabled ?? false;
    const cardOnFile    = !!billing?.card_last4;
    const cardRequired  = stripeEnabled;

    async function handleStartTrial(tierId) {
        if (!isLoggedIn) { navigate('/'); return; }
        setError(null);

        if (cardRequired && !cardOnFile) {
            navigate(`/card-setup?next=start-trial&tier=${tierId}${fromLanding ? '&from=landing' : ''}`);
            return;
        }

        setLoadingTier(tierId);
        try {
            await startTrial('cashflow', tierId);
            await refresh();
            // Signal the landing page (same origin in prod) to refresh auth state
            // so the Cashflow tool card unlocks without requiring a full navigate.
            try {
                const bc = new BroadcastChannel('utility-tools:billing');
                bc.postMessage({ type: 'billing-updated' });
                bc.close();
            } catch {}
            setSuccessMsg('Trial started! Your plan is now active.');
        } catch (err) {
            if (err?.code === 'card_required') {
                navigate(`/card-setup?next=start-trial&tier=${tierId}`);
                return;
            }
            if (err?.code === 'trial_cooldown') {
                setError(`Trial cooldown active — ${err.cooldown_days_remaining ?? 'some'} days remaining before you can start another trial.`);
                return;
            }
            setError(err?.message || 'Could not start trial. Please try again.');
        } finally {
            setLoadingTier(null);
        }
    }

    return (
        <div className="pricing-page">
            {successMsg && (
                <div className="pricing-trial-success">
                    <span>✓ {successMsg}</span>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        {fromLanding && (
                            <a href={LANDING_HOME} className="btn-primary" style={{ flexShrink: 0 }}>Back to tools</a>
                        )}
                        <button className="btn-secondary" style={{ flexShrink: 0 }} onClick={() => setSuccessMsg(null)}>Dismiss</button>
                    </div>
                </div>
            )}
            <div className="pricing-header">
                <h1>Simple, transparent pricing</h1>
                <p className="pricing-subtitle">
                    Every plan starts with a {TRIAL_DAYS}-day free trial. No commitment until you're ready.
                </p>
            </div>

            <div className="pricing-cards pricing-cards-4">
                {TIERS.map(t => {
                    const isCurrentTier = currentTier === t.id && hasPro && !activeTrial;
                    const isTrialing    = !!activeTrial && currentTier === t.id;
                    const anyLoading    = loadingTier !== null || stripeConfigLoading;

                    return (
                        <div key={t.id} className={`pricing-card${t.featured ? ' pricing-card-featured' : ''}`}>
                            {t.badge && <div className="pricing-card-badge">{t.badge}</div>}
                            <div className="pricing-card-header">
                                <span className="pricing-tier-name">{t.name}</span>
                                <div className="pricing-price">
                                    <span className="pricing-amount">{t.price}</span>
                                    {t.period && <span className="pricing-period">{t.period}</span>}
                                </div>
                                {t.yearlyHint && (
                                    <span className="pricing-yearly-hint">{t.yearlyHint}</span>
                                )}
                            </div>
                            <ul className="pricing-features">
                                {t.features.map((f, i) => (
                                    <li key={i} className="pricing-feature">{f}</li>
                                ))}
                            </ul>

                            <div className="pricing-cta">
                                {isTrialing ? (
                                    <span className="pricing-current-plan">
                                        Trial active — ends {new Date(activeTrial.ends_at).toLocaleDateString()}
                                    </span>
                                ) : isCurrentTier ? (
                                    <span className="pricing-current-plan">Your current plan</span>
                                ) : t.contactOnly ? (
                                    <a
                                        className="btn-primary pricing-trial-btn"
                                        href="mailto:support@utility-tools.app?subject=Enterprise enquiry"
                                    >
                                        Contact us
                                    </a>
                                ) : activeTrial ? (
                                    // Trial active on a different tier — allow switching
                                    <>
                                        <button
                                            className="btn-primary pricing-trial-btn"
                                            onClick={() => handleStartTrial(t.id)}
                                            disabled={anyLoading}
                                        >
                                            {loadingTier === t.id ? 'Switching…' : `Switch to ${t.name}`}
                                        </button>
                                        {error && loadingTier === t.id && <p className="pricing-error">{error}</p>}
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="btn-primary pricing-trial-btn"
                                            onClick={stripeEnabled ? () => handleStartTrial(t.id) : undefined}
                                            disabled={anyLoading || !stripeEnabled}
                                            title={!stripeEnabled ? 'Payment system setup in progress' : undefined}
                                        >
                                            {loadingTier === t.id
                                                ? 'Starting…'
                                                : `Start ${TRIAL_DAYS}-day free trial`}
                                        </button>
                                        {!stripeEnabled && (
                                            <p className="pricing-pending-notice">
                                                ⏳ Payment system setup in progress — check back soon.
                                            </p>
                                        )}
                                        {stripeEnabled && cardRequired && !cardOnFile && (
                                            <p className="pricing-card-hint">
                                                A card is required to start — you won't be charged during the trial.
                                            </p>
                                        )}
                                        {error && <p className="pricing-error">{error}</p>}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
