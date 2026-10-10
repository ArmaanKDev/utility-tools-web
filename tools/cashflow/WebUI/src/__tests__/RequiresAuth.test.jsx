import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../appState', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../appState';
import RequireAuth from '../components/RequiresAuth';

// jsdom doesn't allow spying on window.location.replace directly;
// delete and redefine the whole location object.
const originalLocation = window.location;

describe('RequireAuth', () => {
  beforeEach(() => {
    delete window.location;
    window.location = { replace: vi.fn(), reload: vi.fn() };
    // Clear sessionStorage bounce key before each test
    try { sessionStorage.removeItem('cashflow_login_bounce_at'); } catch {}
  });

  afterEach(() => {
    window.location = originalLocation;
    vi.clearAllMocks();
  });

  it('renders children when status is authenticated', () => {
    useAuth.mockReturnValue({ status: 'authenticated' });
    render(<RequireAuth><span>protected content</span></RequireAuth>);
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });

  it('renders children when status is checking (app shell stays visible while auth resolves)', () => {
    useAuth.mockReturnValue({ status: 'checking' });
    render(<RequireAuth><span>protected</span></RequireAuth>);
    // Per source: "While auth is still 'checking' the app renders normally"
    expect(screen.getByText('protected')).toBeInTheDocument();
  });

  it('redirects to login when unauthenticated and no recent bounce', () => {
    useAuth.mockReturnValue({ status: 'unauthenticated' });
    render(<RequireAuth><span>protected</span></RequireAuth>);
    expect(window.location.replace).toHaveBeenCalled();
    expect(screen.queryByText('protected')).not.toBeInTheDocument();
  });

  it('shows SessionProblem when unauthenticated and bounce is within window', () => {
    // Simulate a recent bounce
    try { sessionStorage.setItem('cashflow_login_bounce_at', String(Date.now())); } catch {}
    useAuth.mockReturnValue({ status: 'unauthenticated' });
    render(<RequireAuth><span>protected</span></RequireAuth>);
    expect(screen.getByText(/couldn't confirm your sign-in/i)).toBeInTheDocument();
    expect(screen.queryByText('protected')).not.toBeInTheDocument();
  });
});
