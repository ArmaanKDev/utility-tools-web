import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const navigateMock = vi.fn();

vi.mock('../appState/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../appState/BillingContext', () => ({
    useBilling: vi.fn(),
}));

vi.mock('../api', () => ({
    startTrial: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, useNavigate: () => navigateMock };
});

import { useAuth } from '../appState/AuthContext';
import { useBilling } from '../appState/BillingContext';
import { startTrial } from '../api';
import PricingScreen from '../screens/PricingScreen';

function defaultBilling(overrides = {}) {
    return {
        billing: { card_last4: '4242' },
        hasPro: false,
        tier: null,
        activeTrial: null,
        stripeConfig: { stripe_enabled: true },
        stripeConfigLoading: false,
        ensureStripeConfig: vi.fn(),
        refresh: vi.fn().mockResolvedValue(undefined),
        ...overrides,
    };
}

// BroadcastChannel is not in jsdom — provide a minimal mock.
const bcPostMessage = vi.fn();
const bcClose       = vi.fn();
global.BroadcastChannel = vi.fn(() => ({ postMessage: bcPostMessage, close: bcClose }));

function renderPricing(billingOverrides = {}, initialPath = '/pricing') {
    useAuth.mockReturnValue({ isLoggedIn: true });
    useBilling.mockReturnValue(defaultBilling(billingOverrides));
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
                <Route path="/pricing" element={<PricingScreen />} />
                <Route path="/card-setup" element={<div data-testid="card-setup-page" />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('PricingScreen — trial start', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        startTrial.mockResolvedValue({});
    });

    it('renders tier cards', () => {
        renderPricing();
        expect(screen.getByText('Pro')).toBeInTheDocument();
        expect(screen.getByText('Pro+')).toBeInTheDocument();
        expect(screen.getByText('Business')).toBeInTheDocument();
    });

    it('shows trial buttons when stripe is enabled', () => {
        renderPricing();
        const btns = screen.getAllByText(/Start 30-day free trial/);
        expect(btns.length).toBeGreaterThan(0);
    });

    it('shows pending notice when stripe is disabled', () => {
        renderPricing({ stripeConfig: { stripe_enabled: false } });
        expect(screen.getAllByText(/setup in progress/).length).toBeGreaterThan(0);
    });

    it('shows success banner after successful trial start (no navigation away)', async () => {
        renderPricing();
        const btns = screen.getAllByText(/Start 30-day free trial/);
        fireEvent.click(btns[0]);
        await waitFor(() => expect(screen.getByText(/Trial started/)).toBeInTheDocument());
        expect(navigateMock).not.toHaveBeenCalled();
    });

    it('fires BroadcastChannel billing-updated after successful trial start', async () => {
        renderPricing();
        const btns = screen.getAllByText(/Start 30-day free trial/);
        fireEvent.click(btns[0]);
        await waitFor(() => expect(bcPostMessage).toHaveBeenCalledWith({ type: 'billing-updated' }));
    });

    it('success banner can be dismissed', async () => {
        renderPricing();
        const btns = screen.getAllByText(/Start 30-day free trial/);
        fireEvent.click(btns[0]);
        await waitFor(() => expect(screen.getByText(/Trial started/)).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
        expect(screen.queryByText(/Trial started/)).not.toBeInTheDocument();
    });

    it('navigates to card-setup with &from=landing when card required and from=landing set', async () => {
        renderPricing({ billing: { card_last4: null } }, '/pricing?from=landing');
        const btns = screen.getAllByText(/Start 30-day free trial/);
        fireEvent.click(btns[0]);
        await waitFor(() =>
            expect(navigateMock).toHaveBeenCalledWith(
                expect.stringContaining('from=landing')
            )
        );
    });

    it('navigates to card-setup WITHOUT &from=landing when not from landing', async () => {
        renderPricing({ billing: { card_last4: null } });
        const btns = screen.getAllByText(/Start 30-day free trial/);
        fireEvent.click(btns[0]);
        await waitFor(() => expect(navigateMock).toHaveBeenCalled());
        expect(navigateMock.mock.calls[0][0]).not.toContain('from=landing');
    });

    it('shows error message on trial failure', async () => {
        startTrial.mockRejectedValue({ message: 'Something went wrong', code: 'unknown' });
        renderPricing();
        const btns = screen.getAllByText(/Start 30-day free trial/);
        fireEvent.click(btns[0]);
        await waitFor(() => {
            const errors = screen.getAllByText('Something went wrong');
            expect(errors.length).toBeGreaterThan(0);
        });
    });

    it('shows cooldown message when trial_cooldown error returned', async () => {
        startTrial.mockRejectedValue({ code: 'trial_cooldown', cooldown_days_remaining: 14 });
        renderPricing();
        const btns = screen.getAllByText(/Start 30-day free trial/);
        fireEvent.click(btns[0]);
        await waitFor(() => {
            const msgs = screen.getAllByText(/14 days remaining/);
            expect(msgs.length).toBeGreaterThan(0);
        });
    });

    it('shows "Your current plan" label on active tier', () => {
        renderPricing({ hasPro: true, tier: 'pro', activeTrial: null });
        expect(screen.getByText('Your current plan')).toBeInTheDocument();
    });

    it('shows trial end date when trial is active', () => {
        const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        renderPricing({
            hasPro: true,
            tier: 'pro',
            activeTrial: { ends_at: future },
        });
        expect(screen.getByText(/Trial active/)).toBeInTheDocument();
    });
});

describe('PricingScreen — ?success=1 banner', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        bcPostMessage.mockReset();
    });

    it('shows success banner when ?success=1 is in URL', () => {
        renderPricing({}, '/pricing?success=1');
        expect(screen.getByText(/Plan activated successfully/)).toBeInTheDocument();
    });

    it('does NOT show success banner without ?success=1', () => {
        renderPricing();
        expect(screen.queryByText(/Plan activated/)).not.toBeInTheDocument();
    });

    it('shows "Back to tools" link when ?from=landing and ?success=1', () => {
        renderPricing({}, '/pricing?success=1&from=landing');
        expect(screen.getByRole('link', { name: /back to tools/i })).toBeInTheDocument();
    });

    it('"Back to tools" link points to landing home', () => {
        renderPricing({}, '/pricing?success=1&from=landing');
        const link = screen.getByRole('link', { name: /back to tools/i });
        expect(link.getAttribute('href')).toMatch(/localhost:5174|\/utility-tools\//);
    });

    it('does NOT show "Back to tools" without ?from=landing', () => {
        renderPricing({}, '/pricing?success=1');
        expect(screen.queryByRole('link', { name: /back to tools/i })).not.toBeInTheDocument();
    });

    it('banner is dismissed and "Back to tools" disappears on dismiss click', () => {
        renderPricing({}, '/pricing?success=1&from=landing');
        expect(screen.getByRole('link', { name: /back to tools/i })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
        expect(screen.queryByRole('link', { name: /back to tools/i })).not.toBeInTheDocument();
    });
});
