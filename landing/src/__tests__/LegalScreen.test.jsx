import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import LegalScreen from '../screens/LegalScreen';

function renderLegal(path, page) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path={path} element={<LegalScreen page={page} />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('LegalScreen', () => {
    it('renders Privacy Policy page', () => {
        renderLegal('/privacy', 'privacy');
        expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
        expect(screen.getByText(/What we collect/)).toBeInTheDocument();
    });

    it('renders Terms of Service page', () => {
        renderLegal('/terms', 'terms');
        expect(screen.getByText('Terms of Service')).toBeInTheDocument();
        expect(screen.getByText(/Acceptance/)).toBeInTheDocument();
    });

    it('renders Accessibility Statement page', () => {
        renderLegal('/accessibility', 'accessibility');
        expect(screen.getByText('Accessibility Statement')).toBeInTheDocument();
    });

    it('renders Cookie Policy page', () => {
        renderLegal('/cookies', 'cookies');
        expect(screen.getByText('Cookie Policy')).toBeInTheDocument();
        expect(screen.getByText(/httpOnly/)).toBeInTheDocument();
    });

    it('renders Data Security page', () => {
        renderLegal('/data-security', 'data-security');
        expect(screen.getByRole('heading', { name: 'Data Security' })).toBeInTheDocument();
        expect(screen.getByText(/AES-256-GCM/)).toBeInTheDocument();
    });

    it('shows "Page not found" for unknown page key', () => {
        renderLegal('/unknown', 'unknown-key');
        expect(screen.getByText(/Page not found/)).toBeInTheDocument();
    });

    it('renders cross-links to all legal pages', () => {
        renderLegal('/privacy', 'privacy');
        expect(screen.getByRole('link', { name: 'Privacy' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Terms' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Cookies' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Data Security' })).toBeInTheDocument();
    });

    it('renders a back button', () => {
        renderLegal('/privacy', 'privacy');
        expect(screen.getByText(/← Back/)).toBeInTheDocument();
    });
});
