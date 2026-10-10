import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { startTrial } from '../api';
import '../styles/LandingPricing.css';

const TRIAL_DAYS = 30;

const TIERS = [
    {
        id: 'pro',
        name: 'Pro',
        price: '£9.99',
        period: '/ month',
        yearlyHint: 'or £89.99 / year (save 25%)',
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

export default function PricingScreen() {
    const navigate = useNavigate();
    const { isLoggedIn, userRole, refreshUser } = useAuth();

    const billingData  = userRole?.billing;
    const activeTrial  = billingData?.active_trial;
    const currentTier  = billingData?.tier; // effective tier (trial tier if active)
    const [trialStates, setTrialStates] = useState({}); // tierId → 'loading' | 'success' | 'error'
    const [trialMsgs, setTrialMsgs] = useState({});     // tierId → message string

    async function handleStartTrial(tierId) {
        setTrialStates(s => ({ ...s, [tierId]: 'loading' }));
        setTrialMsgs(s => ({ ...s, [tierId]: '' }));
        try {
            await startTrial(tierId);
            setTrialStates(s => ({ ...s, [tierId]: 'success' }));
            setTrialMsgs(s => ({ ...s, [tierId]: 'Trial started! Your plan is now active.' }));
            refreshUser();
            try {
                const bc = new BroadcastChannel('utility-tools:billing');
                bc.postMessage({ type: 'billing-updated' });
                bc.close();
            } catch {}
        } catch (err) {
            setTrialStates(s => ({ ...s, [tierId]: 'error' }));
            setTrialMsgs(s => ({ ...s, [tierId]: err.message || 'Failed to start trial.' }));
        }
    }

    return (
        <div className="lp-pricing-page">
            <button className="lp-pricing-back" onClick={() => navigate(isLoggedIn ? '/' : '/login')}>
                ← {isLoggedIn ? 'Back to tools' : 'Sign in'}
            </button>

            <div className="lp-pricing-header">
                <h1>Plans &amp; pricing</h1>
                <p className="lp-pricing-subtitle">
                    Every plan starts with a {TRIAL_DAYS}-day free trial. No commitment until you're ready.
                </p>
            </div>

            <div className="lp-pricing-cards">
                {TIERS.map(t => {
                    const isActiveTier = currentTier === t.id;
                    const isTrialing   = isActiveTier && !!activeTrial;
                    const isPaidPlan   = isActiveTier && !activeTrial;
                    const isSwitching  = !!activeTrial && !isActiveTier;

                    return (
                    <div key={t.id} className={`lp-pricing-card${t.featured ? ' lp-pricing-card-featured' : ''}`}>
                        <div className="lp-pricing-card-header">
                            <span className="lp-pricing-tier-name">{t.name}</span>
                            <div className="lp-pricing-price">
                                <span className="lp-pricing-amount">{t.price}</span>
                                {t.period && <span className="lp-pricing-period">{t.period}</span>}
                            </div>
                            {t.yearlyHint && (
                                <span className="lp-pricing-yearly-hint">{t.yearlyHint}</span>
                            )}
                        </div>
                        <ul className="lp-pricing-features">
                            {t.features.map((f, i) => (
                                <li key={i} className="lp-pricing-feature">{f}</li>
                            ))}
                        </ul>
                        <div className="lp-pricing-cta">
                            {t.contactOnly ? (
                                <a
                                    className="lp-pricing-btn"
                                    href="mailto:support@utility-tools.app?subject=Enterprise enquiry"
                                >
                                    Contact us
                                </a>
                            ) : isTrialing ? (
                                <span className="lp-pricing-active-plan">
                                    Trial active — ends {new Date(activeTrial.ends_at).toLocaleDateString('en-GB')}
                                </span>
                            ) : isPaidPlan ? (
                                <span className="lp-pricing-active-plan">Your current plan</span>
                            ) : isLoggedIn ? (
                                <>
                                    <button
                                        className="lp-pricing-btn"
                                        onClick={() => handleStartTrial(t.id)}
                                        disabled={trialStates[t.id] === 'loading' || trialStates[t.id] === 'success'}
                                    >
                                        {trialStates[t.id] === 'loading' ? 'Switching…'
                                            : trialStates[t.id] === 'success' ? '✓ Plan updated!'
                                            : isSwitching ? `Switch to ${t.name} →`
                                            : `Start ${TRIAL_DAYS}-day free trial →`}
                                    </button>
                                    {trialMsgs[t.id] && (
                                        <p style={{ marginTop: 8, fontSize: 13, color: trialStates[t.id] === 'error' ? 'var(--error, #dc2626)' : 'var(--success, #16a34a)' }}>
                                            {trialMsgs[t.id]}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <button
                                    className="lp-pricing-btn"
                                    onClick={() => navigate('/signup')}
                                >
                                    Create account to start trial
                                </button>
                            )}
                        </div>
                    </div>
                    );
                })}
            </div>

            <p className="lp-pricing-footer-note">
                Already have an account?{' '}
                <button className="lp-pricing-link" onClick={() => navigate('/login')}>
                    Sign in
                </button>
                {' '}to start your trial from the app.
            </p>
        </div>
    );
}
