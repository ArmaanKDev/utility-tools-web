import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const getMeMock = vi.fn();
const loginMock = vi.fn();
const safeRedirectTargetMock = vi.fn().mockReturnValue(null);

vi.mock('../AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../api', () => ({
    login: (...args) => loginMock(...args),
    getMe: (...args) => getMeMock(...args),
    safeRedirectTarget: (...args) => safeRedirectTargetMock(...args),
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (orig) => ({
    ...(await orig()),
    useNavigate: () => navigateMock,
}));

import { useAuth } from '../AuthContext';
import LoginScreen from '../screens/LoginScreen';

function renderLogin() {
    getMeMock.mockRejectedValue(new Error('no session'));
    useAuth.mockReturnValue({
        isLoggedIn: false,
        isChecking: false,
        userRole: null,
        completeLogin: vi.fn(),
        logout: vi.fn(),
    });
    return render(
        <MemoryRouter initialEntries={['/login']}>
            <LoginScreen />
        </MemoryRouter>
    );
}

describe('LoginScreen interactions', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders identifier and password inputs after session check', async () => {
        renderLogin();
        expect(await screen.findByPlaceholderText(/email or username/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument();
    });

    it('renders a Sign in button', async () => {
        renderLogin();
        expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('submit button is not disabled initially', async () => {
        renderLogin();
        const btn = await screen.findByRole('button', { name: /sign in/i });
        expect(btn).not.toBeDisabled();
    });

    it('clicking Forgot password navigates to /forgot-password', async () => {
        renderLogin();
        await screen.findByPlaceholderText(/email or username/i);
        fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
        expect(navigateMock).toHaveBeenCalledWith('/forgot-password');
    });

    it('clicking Sign up navigates to /signup', async () => {
        renderLogin();
        await screen.findByPlaceholderText(/email or username/i);
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
        expect(navigateMock).toHaveBeenCalledWith('/signup');
    });

    it('clicking View plans navigates to /pricing', async () => {
        renderLogin();
        await screen.findByPlaceholderText(/email or username/i);
        fireEvent.click(screen.getByRole('button', { name: /view plans/i }));
        expect(navigateMock).toHaveBeenCalledWith('/pricing');
    });

    it('has Privacy and Terms links in the footer', async () => {
        renderLogin();
        await screen.findByPlaceholderText(/email or username/i);
        expect(screen.getByRole('link', { name: /^privacy$/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /^terms$/i })).toBeInTheDocument();
    });

    it('has Accessibility and Cookies links in the footer', async () => {
        renderLogin();
        await screen.findByPlaceholderText(/email or username/i);
        expect(screen.getByRole('link', { name: /^accessibility$/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /^cookies$/i })).toBeInTheDocument();
    });

    it('shows error when submitting with empty fields', async () => {
        renderLogin();
        await screen.findByPlaceholderText(/email or username/i);
        const form = document.querySelector('form');
        fireEvent.submit(form);
        await waitFor(() =>
            expect(screen.getByText(/please enter/i)).toBeInTheDocument()
        );
    });
});
