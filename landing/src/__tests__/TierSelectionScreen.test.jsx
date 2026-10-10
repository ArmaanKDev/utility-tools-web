import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api', () => ({
    startTrial: vi.fn(),
}));

vi.mock('react-router-dom', async (orig) => ({
    ...(await orig()),
    useNavigate: () => vi.fn(),
}));

const bcPostMessage = vi.fn();
const bcClose       = vi.fn();
global.BroadcastChannel = vi.fn(() => ({ postMessage: bcPostMessage, close: bcClose }));

import { startTrial } from '../api';
import TierSelectionScreen from '../screens/TierSelectionScreen';

function renderTierSelect() {
    return render(
        <MemoryRouter>
            <TierSelectionScreen />
        </MemoryRouter>
    );
}

describe('TierSelectionScreen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        bcPostMessage.mockReset();
        bcClose.mockReset();
        // Reset window.location.href tracking
        delete window.location;
        window.location = { href: '' };
    });

    it('renders all four tier cards', () => {
        renderTierSelect();
        expect(screen.getByText('Pro')).toBeInTheDocument();
        expect(screen.getByText('Pro+')).toBeInTheDocument();
        expect(screen.getByText('Business')).toBeInTheDocument();
        expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });

    it('renders a trial start button for each tier', () => {
        renderTierSelect();
        const btns = screen.getAllByText(/Start 30-day free trial|Start free trial/);
        expect(btns.length).toBe(4);
    });

    it('shows loading state while trial is starting', async () => {
        startTrial.mockReturnValue(new Promise(() => {})); // never resolves
        renderTierSelect();
        fireEvent.click(screen.getAllByText(/Start 30-day free trial/)[0]);
        await waitFor(() =>
            expect(screen.getByText('Starting…')).toBeInTheDocument()
        );
    });

    it('disables other buttons while one tier is loading', async () => {
        startTrial.mockReturnValue(new Promise(() => {}));
        renderTierSelect();
        fireEvent.click(screen.getAllByText(/Start 30-day free trial/)[0]);
        await waitFor(() => {
            const btns = screen.getAllByRole('button');
            const disabled = btns.filter(b => b.disabled);
            expect(disabled.length).toBeGreaterThan(0);
        });
    });

    it('fires BroadcastChannel billing-updated on successful trial start', async () => {
        startTrial.mockResolvedValue({});
        renderTierSelect();
        fireEvent.click(screen.getAllByText(/Start 30-day free trial/)[0]);
        await waitFor(() =>
            expect(bcPostMessage).toHaveBeenCalledWith({ type: 'billing-updated' })
        );
    });

    it('redirects to landing home after successful trial start', async () => {
        startTrial.mockResolvedValue({});
        renderTierSelect();
        fireEvent.click(screen.getAllByText(/Start 30-day free trial/)[0]);
        await waitFor(() =>
            expect(window.location.href).toMatch(/localhost:5174|\/utility-tools\//)
        );
    });

    it('does NOT redirect to Cashflow after trial start', async () => {
        startTrial.mockResolvedValue({});
        renderTierSelect();
        fireEvent.click(screen.getAllByText(/Start 30-day free trial/)[0]);
        await waitFor(() => expect(window.location.href).not.toBe(''));
        expect(window.location.href).not.toContain('localhost:5173');
        expect(window.location.href).not.toContain('cashflow/');
    });

    it('shows error message when startTrial fails', async () => {
        startTrial.mockRejectedValue(new Error('Payment required'));
        renderTierSelect();
        fireEvent.click(screen.getAllByText(/Start 30-day free trial/)[0]);
        await waitFor(() =>
            expect(screen.getByText('Payment required')).toBeInTheDocument()
        );
    });

    it('re-enables buttons after a failed trial start', async () => {
        startTrial.mockRejectedValue(new Error('Oops'));
        renderTierSelect();
        fireEvent.click(screen.getAllByText(/Start 30-day free trial/)[0]);
        await waitFor(() => expect(screen.getByText('Oops')).toBeInTheDocument());
        const btns = screen.getAllByRole('button').filter(b => !b.disabled);
        expect(btns.length).toBeGreaterThan(0);
    });

    it('does NOT fire BroadcastChannel on failed trial start', async () => {
        startTrial.mockRejectedValue(new Error('Fail'));
        renderTierSelect();
        fireEvent.click(screen.getAllByText(/Start 30-day free trial/)[0]);
        await waitFor(() => expect(screen.getByText('Fail')).toBeInTheDocument());
        expect(bcPostMessage).not.toHaveBeenCalled();
    });
});
