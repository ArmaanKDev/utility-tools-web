import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const getMeMock = vi.fn();

vi.mock('../api', () => ({
    getMe: (...args) => getMeMock(...args),
    safeRedirectTarget: vi.fn().mockReturnValue(null),
}));

import App from '../App';

function renderApp(billingData = { tier: 'pro', active_trial: null }) {
    getMeMock.mockResolvedValue({
        username: 'alice',
        display_name: 'Alice',
        role: 'user',
        billing: billingData,
    });
    return render(<App />);
}

describe('LandingPage — tool cards', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders the Cashflow tool card', async () => {
        renderApp();
        expect(await screen.findByText('Cashflow')).toBeInTheDocument();
    });

    it('shows Coming soon badge on non-live tools', async () => {
        renderApp();
        await screen.findByText('Cashflow');
        const badges = screen.getAllByText('Coming soon');
        expect(badges.length).toBeGreaterThanOrEqual(1);
    });

    it('renders footer with legal links', async () => {
        renderApp();
        await screen.findByText('Cashflow');
        expect(screen.getByRole('link', { name: /plans.*pricing|pricing/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /^privacy$/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /^terms$/i })).toBeInTheDocument();
    });

    it('shows Upgrade to access on locked live tools when no subscription', async () => {
        renderApp({ tier: null, active_trial: null });
        await screen.findByText('Cashflow');
        expect(screen.getByText(/upgrade to access/i)).toBeInTheDocument();
    });

    it('live tool card is a link when user has pro access', async () => {
        renderApp({ tier: 'pro', active_trial: null });
        await screen.findByText('Cashflow');
        const cashflowLink = screen.getByRole('link', { name: /cashflow/i });
        expect(cashflowLink).toBeInTheDocument();
    });
});
