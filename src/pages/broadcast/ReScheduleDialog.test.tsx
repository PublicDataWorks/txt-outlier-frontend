import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import { act } from 'react';
import { describe, it, expect, vi } from 'vitest';

import ReScheduleDialog from './ReScheduleDialog';

// Mock the loading spinner component
vi.mock('@/components/ui/loading-spinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe('PauseScheduleDialog', () => {
  const mockOnConfirm = vi.fn();

  it('renders pause schedule button initially', () => {
    render(
      <ReScheduleDialog
        onConfirm={mockOnConfirm}
        currentDate={new Date()}
      />,
    );
    expect(screen.getByText('Reschedule')).toBeInTheDocument();
  });

  it('opens dialog when pause schedule button is clicked', async () => {
    render(
      <ReScheduleDialog
        onConfirm={mockOnConfirm}
        currentDate={new Date()}
      />,
    );

    fireEvent.click(screen.getByText('Reschedule'));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'Reschedule' }),
    ).toBeInTheDocument();
  });

  it('shows loading state while confirming', async () => {
    const onConfirmPromise = new Promise((resolve) =>
      setTimeout(resolve, 3000),
    );
    const mockOnConfirmWithLoading = vi
      .fn()
      .mockImplementation(() => onConfirmPromise);

    render(
      <ReScheduleDialog
        onConfirm={mockOnConfirmWithLoading}
        currentDate={new Date()}
      />,
    );

    // Open dialog
    fireEvent.click(await screen.findByText('Reschedule'));

    // Click confirm button in dialog
    fireEvent.click(
      await within(await screen.findByRole('dialog')).findByRole('button', {
        name: 'Reschedule',
      }),
    );

    expect(await screen.findByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('closes dialog after successful confirmation', async () => {
    render(
      <ReScheduleDialog
        onConfirm={mockOnConfirm}
        currentDate={new Date()}
      />,
    );

    // Open dialog
    fireEvent.click(screen.getByText('Reschedule'));

    // Click confirm button in dialog
    fireEvent.click(
      await within(await screen.findByRole('dialog')).findByRole('button', {
        name: 'Reschedule',
      }),
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('calls onConfirm with the correct timestamp', async () => {
    const currentDate = new Date();
    const targetDate = new Date(currentDate);
    targetDate.setDate(currentDate.getDate() + 1); // Select the next day

    render(
      <ReScheduleDialog
        onConfirm={mockOnConfirm}
        currentDate={currentDate}
      />,
    );

    // Open dialog
    fireEvent.click(screen.getByText('Reschedule'));

    // Select a different date
    fireEvent.click(screen.getByText(targetDate.getDate().toString()));

    // Click confirm button in dialog
    fireEvent.click(
      await within(await screen.findByRole('dialog')).findByRole('button', {
        name: 'Reschedule',
      }),
    );

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalled();
      const expectedTimestamp = Math.floor(targetDate.getTime() / 1000);
      expect(mockOnConfirm).toHaveBeenCalledWith(expectedTimestamp);
    });
  });

  it('handles errors gracefully', async () => {
    const mockOnConfirmWithError = vi
      .fn()
      .mockRejectedValue(new Error('Failed to pause'));
    render(
      <ReScheduleDialog
        onConfirm={mockOnConfirmWithError}
        currentDate={new Date()}
      />,
    );
    fireEvent.click(screen.getByText('Reschedule'));

    await act(async () =>
      fireEvent.click(
        await within(await screen.findByRole('dialog')).findByRole('button', {
          name: 'Reschedule',
        }),
      ),
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument(); // Dialog should remain open
  });
});
