import { useBilling } from '../appState/BillingContext';
import { useAuth } from '../appState/AuthContext';
import { useEffect } from 'react';

const LANDING_ORIGIN = import.meta.env.DEV
    ? 'http://localhost:5174'
    : window.location.origin;

const LANDING_PRICING = import.meta.env.DEV
    ? 'http://localhost:5174/pricing'
    : `${LANDING_ORIGIN}/utility-tools/pricing`;

const LANDING_AUTH = import.meta.env.DEV
    ? 'http://localhost:5174/login'
    : `${LANDING_ORIGIN}/utility-tools/login`;

/**
 * Wraps any tool screen that requires an active plan or trial.
 *
 * - Not logged in              → redirect to landing auth page
 * - Logged in, no plan/trial   → redirect to landing pricing page
 * - Logged in, has access      → render children normally
 *
 * The cashflow tool card on the landing page also shows a greyed-out
 * "Upgrade to access" state when the user has no active plan/trial.
 * That is handled in landing/src/App.jsx (ToolCard).
 */
export default function ToolGate({ children }) {
    const { isChecking, isLoggedIn } = useAuth();
    const { billing, hasPro }        = useBilling();

    useEffect(() => {
        if (isChecking || billing === null) return;

        if (!isLoggedIn) {
            // Not authenticated — send to landing auth
            window.location.replace(LANDING_AUTH); // safe: known first-party origin
        } else if (!hasPro) {
            // Authenticated but no plan/trial — send to landing pricing
            window.location.replace(LANDING_PRICING); // safe: known first-party origin
        }
    }, [isChecking, isLoggedIn, billing, hasPro]);

    // While auth/billing is still resolving, render nothing (avoid flash)
    if (isChecking || billing === null) return null;

    // No access — render nothing while the redirect fires
    if (!isLoggedIn || !hasPro) return null;

    return children;
}
