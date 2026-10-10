import { useState, useEffect } from 'react';

const CONSENT_KEY = 'cashflow_cookie_consent';

export function hasAnalyticsConsent() {
    try {
        const v = localStorage.getItem(CONSENT_KEY);
        if (!v) return false;
        return JSON.parse(v).analytics === true;
    } catch {
        return false;
    }
}

export default function CookieConsentBanner() {
    const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!posthogKey) return;
        try {
            const existing = localStorage.getItem(CONSENT_KEY);
            if (!existing) setVisible(true);
        } catch {
            // localStorage unavailable — don't show banner
        }
    }, [posthogKey]);

    if (!visible) return null;

    const choose = (analytics) => {
        try {
            localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics, functional: true }));
        } catch {}
        setVisible(false);
    };

    return (
        <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
            background: 'var(--bg-elevated, #fff)', color: 'var(--text-primary, #1a1a1a)',
            borderTop: '1px solid var(--border, #e5e7eb)',
            boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
            padding: '12px 24px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
            fontSize: '14px'
        }}>
            <span>We use analytics to improve the app. No personal data is shared.</span>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button onClick={() => choose(false)} style={{
                    padding: '6px 14px', fontSize: '13px', cursor: 'pointer',
                    background: 'none', border: '1px solid var(--border, #e5e7eb)',
                    borderRadius: '6px', color: 'var(--text-secondary, #666)'
                }}>Decline</button>
                <button onClick={() => choose(true)} style={{
                    padding: '6px 14px', fontSize: '13px', cursor: 'pointer',
                    background: 'var(--accent, #2563eb)', border: 'none',
                    borderRadius: '6px', color: '#fff', fontWeight: 500
                }}>Accept</button>
            </div>
        </div>
    );
}
