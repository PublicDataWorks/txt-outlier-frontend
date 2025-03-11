import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { SendNowDialog } from './SendNowDialog';

const mockToast = vi.fn();

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('SendNowDialog', () => {
  const defaultProps = {
    onSend: vi.fn(),
    recipientCount: 1000,
    messagePreview: 'Hello, this is a test message',
    segmentDescription: 'All subscribers',
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the send now button correctly', () => {
    render(<SendNowDialog {...defaultProps} />);

    // Check that the button is rendered with correct text and icon
    const sendNowButton = screen.getByRole('button', { name: /send now/i });
    expect(sendNowButton).toBeInTheDocument();
    expect(sendNowButton).not.toBeDisabled();
  });

  it('renders in disabled state correctly', () => {
    render(<SendNowDialog {...defaultProps} disabled={true} />);

    // Check that the button is disabled
    const sendNowButton = screen.getByRole('button', { name: /send now/i });
    expect(sendNowButton).toBeDisabled();
  });

  it('opens the dialog when the send now button is clicked', async () => {
    render(<SendNowDialog {...defaultProps} />);

    // Dialog content should not be visible initially
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click the send now button
    await userEvent.click(screen.getByRole('button', { name: /send now/i }));

    // Dialog should now be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirm Broadcast')).toBeInTheDocument();
  });

  it('displays the correct recipient count and message preview', async () => {
    render(<SendNowDialog {...defaultProps} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /send now/i }));

    // Check that the dialog shows the correct recipient count
    expect(screen.getByText(/1,000 recipients/i)).toBeInTheDocument();

    // Check that the message preview is displayed
    expect(
      screen.getByText('Hello, this is a test message'),
    ).toBeInTheDocument();

    // Check that the segment description is displayed
    expect(screen.getByText('All subscribers')).toBeInTheDocument();
  });

  it('displays "calculating..." when recipientCount is undefined', async () => {
    render(<SendNowDialog {...defaultProps} recipientCount={undefined} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /send now/i }));

    // Check that it shows "calculating..." for the recipient count
    expect(screen.getByText(/calculating... recipients/i)).toBeInTheDocument();
  });

  it('displays the follow-up message when provided', async () => {
    render(
      <SendNowDialog
        {...defaultProps}
        followUpMessagePreview="This is a follow-up message"
      />,
    );

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /send now/i }));

    // Check that both messages are displayed
    expect(screen.getByText('First Message:')).toBeInTheDocument();
    expect(
      screen.getByText('Hello, this is a test message'),
    ).toBeInTheDocument();

    expect(screen.getByText('Follow-up Message:')).toBeInTheDocument();
    expect(screen.getByText('This is a follow-up message')).toBeInTheDocument();
  });

  it('does not display the follow-up message section when not provided', async () => {
    render(<SendNowDialog {...defaultProps} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /send now/i }));

    // Check that only the first message is displayed
    expect(screen.getByText('First Message:')).toBeInTheDocument();
    expect(screen.queryByText('Follow-up Message:')).not.toBeInTheDocument();
  });

  it('calls onSend when the send now button in the dialog is clicked', async () => {
    const mockOnSend = vi.fn();

    render(<SendNowDialog {...defaultProps} onSend={mockOnSend} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /send now/i }));

    // Click the send now button in the dialog
    await userEvent.click(screen.getByRole('button', { name: /^send now$/i }));

    // Check that onSend was called
    expect(mockOnSend).toHaveBeenCalledTimes(1);

    // Check that a toast notification was shown
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Broadcast Sent',
      description: 'Your message has been sent to 1,000 recipients.',
    });
  });

  it('closes the dialog when the send now button in the dialog is clicked', async () => {
    render(<SendNowDialog {...defaultProps} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /send now/i }));

    // Dialog should be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Click the send now button in the dialog
    await userEvent.click(screen.getByRole('button', { name: /^send now$/i }));

    // Dialog should be closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the dialog when the cancel button is clicked', async () => {
    render(<SendNowDialog {...defaultProps} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /send now/i }));

    // Dialog should be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Click the cancel button
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Dialog should be closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not call onSend when the cancel button is clicked', async () => {
    const mockOnSend = vi.fn();
    render(<SendNowDialog {...defaultProps} onSend={mockOnSend} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /send now/i }));

    // Click the cancel button
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Check that onSend was not called
    expect(mockOnSend).not.toHaveBeenCalled();
  });
});
