import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RoleBadge from '../components/RoleBadge';

// Mock ProfilePopup since it's not under test
vi.mock('../components/ProfilePopup', () => ({
  default: ({ onClose }) => <div data-testid="profile-popup"><button onClick={onClose}>Close</button></div>,
}));

// Mock useAuth from appState
vi.mock('../appState', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../appState';

describe('RoleBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when userRole is null (not logged in)', () => {
    useAuth.mockReturnValue({ userRole: null });
    const { container } = render(<RoleBadge />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a labeled button for owner role (elevated level)', () => {
    useAuth.mockReturnValue({ userRole: { role: 'owner', level: 1 } });
    render(<RoleBadge />);
    expect(screen.getByRole('button', { name: /owner/i })).toBeInTheDocument();
  });

  it('renders a labeled button for admin role (elevated level)', () => {
    useAuth.mockReturnValue({ userRole: { role: 'admin', level: 1 } });
    render(<RoleBadge />);
    expect(screen.getByRole('button', { name: /admin/i })).toBeInTheDocument();
  });

  it('renders an avatar button (no text label) for non-elevated role', () => {
    useAuth.mockReturnValue({ userRole: { role: 'user', level: 0 } });
    render(<RoleBadge />);
    // Should render the Profile button but without the role name as text
    const btn = screen.getByTitle('Profile');
    expect(btn).toBeInTheDocument();
    expect(btn).not.toHaveTextContent('user');
  });

  it('opens ProfilePopup when button is clicked', () => {
    useAuth.mockReturnValue({ userRole: { role: 'owner', level: 2 } });
    render(<RoleBadge />);
    fireEvent.click(screen.getByTitle('Profile'));
    expect(screen.getByTestId('profile-popup')).toBeInTheDocument();
  });

  it('closes ProfilePopup when onClose is called', () => {
    useAuth.mockReturnValue({ userRole: { role: 'owner', level: 2 } });
    render(<RoleBadge />);
    fireEvent.click(screen.getByTitle('Profile'));
    expect(screen.getByTestId('profile-popup')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('profile-popup')).not.toBeInTheDocument();
  });
});
