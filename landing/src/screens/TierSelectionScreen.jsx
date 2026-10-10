import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startTrial } from '../api';
import '../styles/TierSelection.css';

const TRIAL_DAYS = 30;

const TIERS = [
    {
        id: 'pro',
        name: 'Pro',
        price: '£9.99',
        period: '/ month',
        featured: true,
        description: 'Full Cashflow access, transaction tracking & charts, auto-categorisation.',
    },
    {
        id: 'proplus',
        name: 'Pro+',
        price: '£14.99',
        period: '/ month',
        featured: false,
        description: 'Everything in Pro, plus priority support and early access to new tools.',
    },
    {
        id: 'business',
        name: 'Business',
        price: '£29.99',
        period: '/ month',
        featured: false,
        description: 'Team-ready access with higher limits and business features.',
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        featured: false,
        description: 'Bespoke access for organisations — contact us after signup.',
        contactOnly: true,
    },
];

const LANDING_HOME = import.meta.env.DEV
    ? 'http://localhost:5174'
    : '/utility-tools/';

export default function TierSelectionScreen() {
    const navigate  = useNavigate();
    const [loading, setLoading]   = useState(null);  // tier id currently loading
    const [error, setError]       = useState(null);

    async function handleSelect(tier) {
        if (loading) return;
        setError(null);
        setLoading(tier.id);
        try {
            await startTrial(tier.id);
            // Signal any open landing-page tabs that billing changed before leaving.
            try {
                const bc = new BroadcastChannel('utility-tools:billing');
                bc.postMessage({ type: 'billing-updated' });
                bc.close();
            } catch {}
            window.location.href = LANDING_HOME;
        } catch (e) {
            setError(e.message || 'Could not start trial — please try again.');
            setLoading(null);
        }
    }

    return (
        <div className="ts-page">
            <div className="ts-header">
                <h1 className="ts-title">Choose your plan</h1>
                <p className="ts-sub">
                    Start a {TRIAL_DAYS}-day free trial — no payment needed yet.
                    You can upgrade or cancel any time.
                </p>
            </div>

            {error && <p className="ts-error">{error}</p>}

            <div className="ts-cards">
                {TIERS.map(tier => (
                    <div
                        key={tier.id}
                        className={`ts-card${tier.featured ? ' ts-card--featured' : ''}`}
                    >
                        <div className="ts-card-header">
                            <span className="ts-tier-name">{tier.name}</span>
                            <div className="ts-price">
                                <span className="ts-amount">{tier.price}</span>
                                {tier.period && <span className="ts-period">{tier.period}</span>}
                            </div>
                        </div>
                        <p className="ts-desc">{tier.description}</p>
                        <button
                            className="ts-btn"
                            onClick={() => handleSelect(tier)}
                            disabled={!!loading}
                        >
                            {loading === tier.id
                                ? 'Starting…'
                                : tier.contactOnly
                                    ? `Start free trial`
                                    : `Start ${TRIAL_DAYS}-day free trial`}
                        </button>
                    </div>
                ))}
            </div>

            <p className="ts-note">
                Already have a plan?{' '}
                <button className="ts-link" onClick={() => navigate('/')}>
                    Go to tools
                </button>
            </p>
        </div>
    );
}
