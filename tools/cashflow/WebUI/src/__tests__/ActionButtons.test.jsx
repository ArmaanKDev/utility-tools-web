import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../appState/BillingContext', () => ({
    useBilling: vi.fn(),
}));

vi.mock('../appState/UploadSessionContext', () => ({
    useUploadSession: vi.fn(),
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (orig) => ({
    ...(await orig()),
    useNavigate: () => navigateMock,
}));

import { useBilling } from '../appState/BillingContext';
import { useUploadSession } from '../appState/UploadSessionContext';
import ActionButtons from '../components/homepage/ActionButtons';

function renderButtons(props = {}, billingOverrides = {}) {
    useBilling.mockReturnValue({
        hasPro: true,
        uploadCapReached: false,
        uploadCap: 10,
        uploadsToday: 0,
        uploadFilesPerAction: 5,
        ...billingOverrides,
    });
    useUploadSession.mockReturnValue({
        setError: vi.fn(),
        setSelectedFiles: vi.fn(),
        setStatus: vi.fn(),
    });
    const defaults = {
        pickFiles: vi.fn(),
        selectedFiles: [],
        loading: false,
        categorising: false,
        status: null,
        error: null,
        progress: 0,
        handleCategorisePress: vi.fn(),
        notYetCategorisedCount: 0,
        allTransactionsLoaded: true,
        handleLogout: vi.fn(),
        showGoToCharts: false,
        duplicateNotice: null,
        onDismissDuplicateNotice: vi.fn(),
    };
    return render(
        <MemoryRouter>
            <ActionButtons {...defaults} {...props} />
        </MemoryRouter>
    );
}

describe('ActionButtons interactions', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders Choose file button', () => {
        renderButtons();
        expect(screen.getByRole('button', { name: /choose csv or excel files/i })).toBeInTheDocument();
    });

    it('clicking Choose file calls pickFiles', () => {
        const pickFiles = vi.fn();
        renderButtons({ pickFiles });
        fireEvent.click(screen.getByRole('button', { name: /choose csv or excel files/i }));
        expect(pickFiles).toHaveBeenCalled();
    });

    it('shows Categorise button', () => {
        renderButtons();
        expect(screen.getByRole('button', { name: /automatically categoris/i })).toBeInTheDocument();
    });

    it('clicking Categorise calls handleCategorisePress', () => {
        const handleCategorisePress = vi.fn();
        renderButtons({
            selectedFiles: [new File([''], 'test.csv')],
            handleCategorisePress,
        });
        fireEvent.click(screen.getByRole('button', { name: /automatically categoris/i }));
        expect(handleCategorisePress).toHaveBeenCalled();
    });

    it('shows Go to Transactions button', () => {
        renderButtons({ allTransactionsLoaded: true });
        expect(screen.getByRole('button', { name: /go to transactions/i })).toBeInTheDocument();
    });

    it('clicking Go to Transactions navigates to /contents', () => {
        renderButtons({ allTransactionsLoaded: true });
        fireEvent.click(screen.getByRole('button', { name: /go to transactions/i }));
        expect(navigateMock).toHaveBeenCalledWith('/contents');
    });

    it('shows Back to Tools button', () => {
        renderButtons();
        expect(screen.getByRole('button', { name: /back to tools/i })).toBeInTheDocument();
    });

    it('shows upload cap reached warning when cap is reached', () => {
        renderButtons({}, { uploadCapReached: true, uploadCap: 3, uploadsToday: 3 });
        const els = screen.getAllByText(/cap|limit|reached/i);
        expect(els.length).toBeGreaterThan(0);
    });
});
