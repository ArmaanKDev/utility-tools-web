import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../appState/AuthContext';

// Mock bootstrapSession and isAuthFailure from api
vi.mock('../api', () => ({
  bootstrapSession: vi.fn(),
  isAuthFailure: vi.fn(() => false),
}));

import { bootstrapSession } from '../api';

// Helper component to expose context values
function Consumer() {
  const ctx = useAuth();
  return (
    <div>
      <span data-testid="status">{ctx.status}</span>
      <span data-testid="isLoggedIn">{String(ctx.isLoggedIn)}</span>
      <span data-testid="isChecking">{String(ctx.isChecking)}</span>
      <span data-testid="userRole">{ctx.userRole ? JSON.stringify(ctx.userRole) : 'null'}</span>
    </div>
  );
}

describe('AuthContext / AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts in checking state', () => {
    // bootstrapSession never resolves during this test
    bootstrapSession.mockReturnValue(new Promise(() => {}));
    render(<AuthProvider><Consumer /></AuthProvider>);
    expect(screen.getByTestId('status').textContent).toBe('checking');
    expect(screen.getByTestId('isChecking').textContent).toBe('true');
    expect(screen.getByTestId('isLoggedIn').textContent).toBe('false');
  });

  it('becomes authenticated after bootstrapSession resolves', async () => {
    const roleData = { role: 'user', level: 0 };
    bootstrapSession.mockResolvedValue(roleData);
    render(<AuthProvider><Consumer /></AuthProvider>);

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('authenticated');
    });
    expect(screen.getByTestId('isLoggedIn').textContent).toBe('true');
    expect(screen.getByTestId('userRole').textContent).toContain('"role":"user"');
  });

  it('becomes unauthenticated on definitive auth failure (401)', async () => {
    const { isAuthFailure } = await import('../api');
    isAuthFailure.mockReturnValue(true);
    const err = { status: 401 };
    bootstrapSession.mockRejectedValue(err);

    render(<AuthProvider><Consumer /></AuthProvider>);

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('unauthenticated');
    });
    expect(screen.getByTestId('isLoggedIn').textContent).toBe('false');
  });

  it('exposes completeLogin that sets status to authenticated', async () => {
    bootstrapSession.mockReturnValue(new Promise(() => {})); // never resolves

    function LoginTrigger() {
      const { completeLogin, status } = useAuth();
      return (
        <div>
          <span data-testid="status">{status}</span>
          <button onClick={() => completeLogin({ role: 'owner', level: 2 })}>Login</button>
        </div>
      );
    }

    const { getByRole, getByTestId } = render(
      <AuthProvider><LoginTrigger /></AuthProvider>
    );

    expect(getByTestId('status').textContent).toBe('checking');
    await act(async () => {
      getByRole('button', { name: 'Login' }).click();
    });
    expect(getByTestId('status').textContent).toBe('authenticated');
  });

  it('context shape has expected keys', async () => {
    bootstrapSession.mockResolvedValue({ role: 'user', level: 0 });

    function Inspector() {
      const ctx = useAuth();
      const keys = Object.keys(ctx).sort().join(',');
      return <span data-testid="keys">{keys}</span>;
    }

    render(<AuthProvider><Inspector /></AuthProvider>);

    await waitFor(() => {
      const keys = screen.getByTestId('keys').textContent;
      expect(keys).toContain('completeLogin');
      expect(keys).toContain('endSession');
      expect(keys).toContain('isChecking');
      expect(keys).toContain('isLoggedIn');
      expect(keys).toContain('status');
      expect(keys).toContain('userRole');
    });
  });
});
