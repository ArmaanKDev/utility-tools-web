import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../appState/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../appState/BillingContext', () => ({
  useBilling: vi.fn(),
}));

import { useAuth } from '../appState/AuthContext';
import { useBilling } from '../appState/BillingContext';
import ToolGate from '../components/ToolGate';

// jsdom doesn't allow spying on window.location.replace directly
const originalLocation = window.location;

describe('ToolGate', () => {
  beforeEach(() => {
    delete window.location;
    window.location = { replace: vi.fn() };
  });

  afterEach(() => {
    window.location = originalLocation;
    vi.clearAllMocks();
  });

  it('renders nothing while auth/billing is still checking', () => {
    useAuth.mockReturnValue({ isChecking: true, isLoggedIn: false });
    useBilling.mockReturnValue({ billing: null, hasPro: false });
    const { container } = render(<ToolGate><span>content</span></ToolGate>);
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('renders children when logged in and has pro access', () => {
    useAuth.mockReturnValue({ isChecking: false, isLoggedIn: true });
    useBilling.mockReturnValue({ billing: { plan: 'pro' }, hasPro: true });
    render(<ToolGate><span>protected content</span></ToolGate>);
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });

  it('renders nothing and redirects when not logged in', () => {
    useAuth.mockReturnValue({ isChecking: false, isLoggedIn: false });
    useBilling.mockReturnValue({ billing: {}, hasPro: false });
    render(<ToolGate><span>protected</span></ToolGate>);
    expect(screen.queryByText('protected')).not.toBeInTheDocument();
    expect(window.location.replace).toHaveBeenCalled();
  });

  it('renders nothing and redirects to pricing when logged in but no pro', () => {
    useAuth.mockReturnValue({ isChecking: false, isLoggedIn: true });
    useBilling.mockReturnValue({ billing: { plan: null }, hasPro: false });
    render(<ToolGate><span>protected</span></ToolGate>);
    expect(screen.queryByText('protected')).not.toBeInTheDocument();
    expect(window.location.replace).toHaveBeenCalled();
  });
});
