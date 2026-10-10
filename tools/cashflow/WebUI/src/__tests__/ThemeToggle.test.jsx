import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock theme module so DOM manipulation is predictable
vi.mock('../theme', () => ({
  getTheme: vi.fn(() => 'light'),
  toggleTheme: vi.fn(() => 'dark'),
}));

import { getTheme, toggleTheme } from '../theme';
import ThemeToggle from '../components/ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTheme.mockReturnValue('light');
    toggleTheme.mockReturnValue('dark');
  });

  it('renders without crashing', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows moon emoji when theme is light', () => {
    getTheme.mockReturnValue('light');
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toHaveTextContent('🌙');
  });

  it('shows sun emoji when theme is dark', () => {
    getTheme.mockReturnValue('dark');
    toggleTheme.mockReturnValue('light');
    render(<ThemeToggle />);
    // Component initializes with getTheme() === 'dark', so dark=true → shows sun
    expect(screen.getByRole('button')).toHaveTextContent('☀️');
  });

  it('calls toggleTheme and switches icon on click', () => {
    getTheme.mockReturnValue('light');
    toggleTheme.mockReturnValue('dark');
    render(<ThemeToggle />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('🌙');
    fireEvent.click(btn);
    expect(toggleTheme).toHaveBeenCalledTimes(1);
    // After click, dark=true so shows sun
    expect(btn).toHaveTextContent('☀️');
  });

  it('has an accessible title describing the next action', () => {
    getTheme.mockReturnValue('light');
    render(<ThemeToggle />);
    expect(screen.getByTitle(/switch to dark mode/i)).toBeInTheDocument();
  });
});
