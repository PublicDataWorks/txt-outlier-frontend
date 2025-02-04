import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import PauseScheduleDialog from './PauseScheduleDialog';

// Mock the loading spinner component
vi.mock('./ui/loading-spinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe('PauseScheduleDialog', () => {
  const mockOnConfirm = vi.fn();

  it('renders pause schedule button initially', () => {
    render(
      <PauseScheduleDialog
        onConfirm={mockOnConfirm}
        currentDate={new Date()}
      />,
    );
    expect(screen.getByText('Pause schedule')).toBeInTheDocument();
  });

  it('opens dialog when pause schedule button is clicked', async () => {
    render(
      <PauseScheduleDialog
        onConfirm={mockOnConfirm}
        currentDate={new Date()}
      />,
    );

    fireEvent.click(screen.getByText('Pause schedule'));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'Pause batch schedule' }),
    ).toBeInTheDocument();
  });

  it('shows loading state while confirming', async () => {
    const onConfirmPromise = new Promise((resolve) => setTimeout(resolve, 3000));
    const mockOnConfirmWithLoading = vi
      .fn()
      .mockImplementation(() => onConfirmPromise);

    render(
      <PauseScheduleDialog
        onConfirm={mockOnConfirmWithLoading}
        currentDate={new Date()}
      />,
    );

    // Open dialog
    fireEvent.click(await screen.findByText('Pause schedule'));

    // Click confirm button in dialog
    fireEvent.click(
      await within(await screen.findByRole('dialog')).findByRole('button', {
        name: 'Pause batch schedule',
      }),
    );

    expect(await screen.findByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('closes dialog after successful confirmation', async () => {
    render(
      <PauseScheduleDialog
        onConfirm={mockOnConfirm}
        currentDate={new Date()}
      />,
    );

    // Open dialog
    fireEvent.click(screen.getByText('Pause schedule'));

    // Click confirm button in dialog
    fireEvent.click(
      await within(await screen.findByRole('dialog')).findByRole('button', {
        name: 'Pause batch schedule',
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
      <PauseScheduleDialog
        onConfirm={mockOnConfirm}
        currentDate={currentDate}
      />,
    );

    // Open dialog
    fireEvent.click(screen.getByText('Pause schedule'));

    // Select a different date
    fireEvent.click(screen.getByText(targetDate.getDate().toString()));

    // Click confirm button in dialog
    fireEvent.click(
      await within(await screen.findByRole('dialog')).findByRole('button', {
        name: 'Pause batch schedule',
      }),
    );

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalled();
      const expectedTimestamp = Math.floor(targetDate.getTime() / 1000);
      expect(mockOnConfirm).toHaveBeenCalledWith(expectedTimestamp);
    });
  });
});
