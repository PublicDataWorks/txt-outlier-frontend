import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import { AxiosError } from 'axios';
import { describe, it, expect, vi } from 'vitest';

import { SendNowDialog } from './SendNowDialog';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the loading spinner component
vi.mock('./ui/loading-spinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe('SendNowDialog', () => {
  it('renders send now button initially', () => {
    render(<SendNowDialog sendNow={vi.fn()} />);
    expect(screen.getByText('Send now')).toBeInTheDocument();
  });

  it('opens dialog when send now button is clicked', async () => {
    render(<SendNowDialog sendNow={vi.fn()} />);

    fireEvent.click(screen.getByText('Send now'));

    expect(
      await screen.findByText(
        'Conversation starters will be sent to all recipients.',
      ),
    ).toBeInTheDocument();
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('shows loading state while sending', async () => {
    const mockSendNow = vi
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

    render(<SendNowDialog sendNow={mockSendNow} />);

    // Open dialog
    fireEvent.click(await screen.findByText('Send now'));

    // Click send button in dialog
    fireEvent.click(
      await within(await screen.findByRole('dialog')).findByRole('button', {
        name: 'Send now',
      }),
    );

    expect(await screen.findByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('closes dialog after successful send', async () => {
    const mockSendNow = vi.fn().mockResolvedValue(undefined);

    render(<SendNowDialog sendNow={mockSendNow} />);

    // Open dialog
    fireEvent.click(screen.getByText('Send now'));

    // Click send button in dialog
    fireEvent.click(
      await within(await screen.findByRole('dialog')).findByRole('button', {
        name: 'Send now',
      }),
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('handles axios error with error code', async () => {
    const mockError = new AxiosError();
    mockError.response = {
      data: { message: '1' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as any,
    };

    const mockSendNow = vi.fn().mockRejectedValue(mockError);

    render(<SendNowDialog sendNow={mockSendNow} />);

    // Open dialog
    fireEvent.click(screen.getByText('Send now'));

    // Click send button in dialog
    fireEvent.click(
      await within(await screen.findByRole('dialog')).findByRole('button', {
        name: 'Send now',
      }),
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  it('handles non-axios errors', async () => {
    const mockSendNow = vi.fn().mockRejectedValue(new Error('Generic error'));

    render(<SendNowDialog sendNow={mockSendNow} />);

    // Open dialog
    fireEvent.click(screen.getByText('Send now'));

    // Click send button in dialog
    fireEvent.click(
      await within(await screen.findByRole('dialog')).findByRole('button', {
        name: 'Send now',
      }),
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  it('closes dialog when cancel button is clicked', async () => {
    render(<SendNowDialog sendNow={vi.fn()} />);

    // Open dialog
    fireEvent.click(screen.getByText('Send now'));

    // Click cancel button
    fireEvent.click(
      await within(await screen.findByRole('dialog')).findByRole('button', {
        name: 'Cancel',
      }),
    );

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });
});
