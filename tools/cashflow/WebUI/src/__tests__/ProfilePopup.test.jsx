import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../appState', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../appState/BillingContext', () => ({
    useBilling: vi.fn(),
}));

vi.mock('../customHooks/homescreen/useLogout', () => ({
    goBackToTools: vi.fn(),
}));

import { useAuth } from '../appState';
import { useBilling } from '../appState/BillingContext';
import { goBackToTools } from '../customHooks/homescreen/useLogout';
import ProfilePopup from '../components/ProfilePopup';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (orig) => ({
    ...(await orig()),
    useNavigate: () => navigateMock,
}));

function renderPopup(overrides = {}) {
    useAuth.mockReturnValue({
        userRole: {
            username: 'alice',
            display_name: 'Alice',
            email: 'alice@example.com',
            email_verified: true,
            role: 'user',
            permissions: [],
            ...overrides.userRole,
        },
    });
    useBilling.mockReturnValue({
        billing: null,
        tier: null,
        hasPro: false,
        activeTrial: null,
        ...overrides.billing,
    });
    const onClose = vi.fn();
    render(
        <MemoryRouter>
            <ProfilePopup onClose={onClose} />
        </MemoryRouter>
    );
    return { onClose };
}

describe('ProfilePopup interactions', () => {
    beforeEach(() => vi.clearAllMocks());

    it('shows the user display name', () => {
        renderPopup();
        expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('shows verified email badge', () => {
        renderPopup();
        expect(screen.getByText(/verified/i)).toBeInTheDocument();
    });

    it('Back to Tools button calls goBackToTools and onClose', () => {
        const { onClose } = renderPopup();
        const btn = screen.getByRole('button', { name: /back to tools/i });
        fireEvent.click(btn);
        expect(goBackToTools).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });

    it('Edit Profile button navigates to /profile and calls onClose', () => {
        const { onClose } = renderPopup();
        const btn = screen.getByRole('button', { name: /edit profile/i });
        fireEvent.click(btn);
        expect(navigateMock).toHaveBeenCalledWith('/profile');
        expect(onClose).toHaveBeenCalled();
    });

    it('shows Admin Panel link for admin users', () => {
        renderPopup({ userRole: { role: 'owner', permissions: [] } });
        expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument();
    });

    it('does NOT show Admin Panel link for regular users', () => {
        renderPopup();
        expect(screen.queryByRole('link', { name: /admin/i })).not.toBeInTheDocument();
    });

    it('closes when clicking outside the popup', () => {
        const { onClose } = renderPopup();
        fireEvent.mouseDown(document.body);
        expect(onClose).toHaveBeenCalled();
    });
});
