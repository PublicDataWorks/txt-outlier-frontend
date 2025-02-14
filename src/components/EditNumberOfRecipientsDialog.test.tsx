import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import EditNumberOfRecipientsDialog from './EditNumberOfRecipientsDialog';

import { useToast } from '@/hooks/use-toast';

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(() => ({
      id: '1',
      dismiss: vi.fn(),
      update: vi.fn()
    })),
    dismiss: vi.fn(),
    toasts: []
  }))
}));
describe('EditNumberOfRecipientsDialog', () => {
  const defaultProps = {
    title: 'Edit Recipients',
    noRecipients: 50,
    onSave: vi.fn()
  };

  it('renders initial number of recipients', () => {
    render(<EditNumberOfRecipientsDialog {...defaultProps} />);
    expect(screen.getByText('50 recipients')).toBeInTheDocument();
  });

  it('opens dialog when trigger is clicked', async () => {
    render(<EditNumberOfRecipientsDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('50 recipients'));

    const dialog = await screen.findByRole('dialog');
    const withinDialog = within(dialog);

    expect(withinDialog.getByRole('heading', {
      name: 'Edit Recipients'
    })).toBeInTheDocument();

    expect(withinDialog.getByText(
      'Set the number of recipients for the next batch.'
    )).toBeInTheDocument();

    expect(withinDialog.getByText('Recipients')).toBeInTheDocument();
    expect(withinDialog.getByRole('spinbutton')).toBeInTheDocument();
    expect(withinDialog.getByRole('button', {
      name: 'Cancel'
    })).toBeInTheDocument();
    expect(withinDialog.getByRole('button', {
      name: 'Save changes'
    })).toBeInTheDocument();
  });

  it('shows validation error for invalid input', async () => {
    render(<EditNumberOfRecipientsDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('50 recipients'));

    const dialog = await screen.findByRole('dialog');
    const withinDialog = within(dialog);

    const input = withinDialog.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.blur(input);

    const submitButton = withinDialog.getByRole('button', {
      name: 'Save changes'
    });
    fireEvent.click(submitButton);

    expect(await withinDialog.findByText('Recipient count must be at least 1'))
      .toBeInTheDocument();
  });

  it('shows validation error for exceeding maximum', async () => {
    render(<EditNumberOfRecipientsDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('50 recipients'));

    const dialog = await screen.findByRole('dialog');
    const withinDialog = within(dialog);

    const input = withinDialog.getByRole('spinbutton');
    expect(input).toHaveValue(50);

    fireEvent.change(input, { target: { value: '200000' } });
    fireEvent.blur(input);

    const submitButton = withinDialog.getByRole('button', {
      name: 'Save changes'
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(withinDialog.getByText('Recipient count cannot exceed 100,000'))
        .toBeInTheDocument();
    });

    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it('calls onSave with new value when form is submitted', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<EditNumberOfRecipientsDialog {...defaultProps} onSave={onSave} />);
    fireEvent.click(screen.getByText('50 recipients'));

    const dialog = await screen.findByRole('dialog');
    const withinDialog = within(dialog);

    const input = withinDialog.getByRole('spinbutton');
    expect(input).toHaveValue(50);

    fireEvent.change(input, { target: { value: '75' } });
    expect(input).toHaveValue(75);

    const submitButton = withinDialog.getByRole('button', {
      name: 'Save changes'
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(75);
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('shows error toast when save fails', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('Save failed'));
    const toastFn = vi.fn();

    vi.mocked(useToast).mockImplementation(() => ({
      toast: toastFn,
      dismiss: vi.fn(),
      toasts: []
    }));

    render(<EditNumberOfRecipientsDialog {...defaultProps} onSave={onSave} />);

    fireEvent.click(screen.getByText('50 recipients'));

    const dialog = await screen.findByRole('dialog');
    const withinDialog = within(dialog);

    const submitButton = withinDialog.getByRole('button', {
      name: 'Save changes'
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Could not update recipient count. Please try again!'
      });
    });

    expect(dialog).toBeInTheDocument();
  });

  it('closes dialog when cancel is clicked', async () => {
    render(<EditNumberOfRecipientsDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('50 recipients'));

    const dialog = await screen.findByRole('dialog');
    const cancelButton = within(dialog).getByRole('button', {
      name: 'Cancel'
    });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
