import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../api', () => ({
    signup: vi.fn(),
    safeRedirectTarget: vi.fn().mockReturnValue(null),
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (orig) => ({
    ...(await orig()),
    useNavigate: () => navigateMock,
}));

import { useAuth } from '../AuthContext';
import { signup } from '../api';
import SignupScreen from '../screens/SignupScreen';

function renderSignup() {
    useAuth.mockReturnValue({
        isLoggedIn: false,
        completeLogin: vi.fn(),
    });
    return render(
        <MemoryRouter>
            <SignupScreen />
        </MemoryRouter>
    );
}

describe('SignupScreen interactions', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders username, email, password, confirm-password fields', () => {
        renderSignup();
        expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        const pwInputs = document.querySelectorAll('input[type="password"]');
        expect(pwInputs.length).toBeGreaterThanOrEqual(2);
    });

    it('renders Create Account submit button', () => {
        renderSignup();
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('shows validation error for empty fields', async () => {
        renderSignup();
        fireEvent.submit(document.querySelector('form'));
        await waitFor(() =>
            expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument()
        );
    });

    it('shows error when passwords do not match', async () => {
        renderSignup();
        fireEvent.change(screen.getByPlaceholderText(/^username/i), { target: { value: 'alice' } });
        const [pw, cpw] = document.querySelectorAll('input[type="password"]');
        fireEvent.change(pw, { target: { value: 'Password1!' } });
        fireEvent.change(cpw, { target: { value: 'Different1!' } });
        fireEvent.submit(document.querySelector('form'));
        await waitFor(() =>
            expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
        );
    });

    it('calls signup API on valid submit', async () => {
        signup.mockResolvedValue({});
        renderSignup();
        fireEvent.change(screen.getByPlaceholderText(/^username/i), { target: { value: 'alice' } });
        const [pw, cpw] = document.querySelectorAll('input[type="password"]');
        fireEvent.change(pw, { target: { value: 'Password1!' } });
        fireEvent.change(cpw, { target: { value: 'Password1!' } });
        fireEvent.submit(document.querySelector('form'));
        await waitFor(() => expect(signup).toHaveBeenCalled());
    });

    it('navigates to / after successful signup', async () => {
        signup.mockResolvedValue({});
        renderSignup();
        fireEvent.change(screen.getByPlaceholderText(/^username/i), { target: { value: 'alice' } });
        const [pw, cpw] = document.querySelectorAll('input[type="password"]');
        fireEvent.change(pw, { target: { value: 'Password1!' } });
        fireEvent.change(cpw, { target: { value: 'Password1!' } });
        fireEvent.submit(document.querySelector('form'));
        await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/'));
    });

    it('shows API error message on failure', async () => {
        signup.mockRejectedValue(new Error('Username taken'));
        renderSignup();
        fireEvent.change(screen.getByPlaceholderText(/^username/i), { target: { value: 'alice' } });
        const [pw, cpw] = document.querySelectorAll('input[type="password"]');
        fireEvent.change(pw, { target: { value: 'Password1!' } });
        fireEvent.change(cpw, { target: { value: 'Password1!' } });
        fireEvent.submit(document.querySelector('form'));
        await waitFor(() =>
            expect(screen.getByText('Username taken')).toBeInTheDocument()
        );
    });

    it('has a button to navigate to login page', () => {
        renderSignup();
        expect(screen.getByRole('button', { name: /already have an account|sign in/i })).toBeInTheDocument();
    });

    it('has legal footer links', () => {
        renderSignup();
        expect(screen.getByRole('link', { name: /privacy/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /terms/i })).toBeInTheDocument();
    });
});
