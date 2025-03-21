import { UseMutationResult } from '@tanstack/react-query';
import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { SettingsModal } from './SettingsModal';

import { BroadcastSettings } from '@/apis/settings';
import { useSettingsMutation } from '@/hooks/useSettings';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the settings query and mutation hooks
vi.mock('@/hooks/useSettings', () => ({
  useSettingsQuery: vi.fn().mockReturnValue({
    data: {
      schedule: {
        sun: null,
        mon: null,
        tue: '09:00',
        wed: null,
        thu: null,
        fri: null,
        sat: null,
      },
      batchSize: 500,
    },
    isLoading: false,
  }),
  useSettingsMutation: vi.fn().mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

describe('SettingsModal', () => {
  it('renders settings button initially', async () => {
    render(<SettingsModal />);
    expect(await screen.findByRole('button', { name: /settings/i })).toBeInTheDocument();
  });

  it('opens dialog when settings button is clicked', async () => {
    render(<SettingsModal />);
    const settingsButton = await screen.findByRole('button', { name: /settings/i });
    await userEvent.click(settingsButton);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('renders the form with default settings', async () => {
    render(<SettingsModal />);
    const settingsButton = await screen.findByRole('button', { name: /settings/i });
    await userEvent.click(settingsButton);

    expect(await screen.findByText('Broadcast Settings')).toBeInTheDocument();
    expect(await screen.findByLabelText('Batch Size')).toHaveValue(500);
    expect(await screen.findByRole('button', { name: /tu/i })).toHaveAttribute('data-state', 'on');
  });

  it('allows toggling days and setting times', async () => {
    render(<SettingsModal />);
    const settingsButton = await screen.findByRole('button', { name: /settings/i });
    await userEvent.click(settingsButton);

    // Find the toggle button for Sunday using a more specific selector
    const sundayToggle = await screen.findByRole('button', { name: /su/i, pressed: false });
    await userEvent.click(sundayToggle);
    expect(sundayToggle).toHaveAttribute('data-state', 'on');

    // Show Sunday Time select
    const sundayDropdown = await screen.findByRole('combobox', { name: 'Su' });
    expect(sundayDropdown).toBeInTheDocument();
  });

  it('validates batch size input', async () => {
    render(<SettingsModal />);
    const settingsButton = await screen.findByRole('button', { name: /settings/i });
    await userEvent.click(settingsButton);

    const batchSizeInput = await screen.findByLabelText('Batch Size');
    await userEvent.clear(batchSizeInput);
    await userEvent.type(batchSizeInput, '50');
    const submitButton = await screen.findByRole('button', { name: 'Save changes' });

    // Try to submit the form
    await userEvent.click(submitButton);

    // Check if the input is invalid
    expect(batchSizeInput).toBeInvalid();
  });

  it('submits the form and calls updateSettings', async () => {
    const updateSettings = vi.fn();
    const mockMutationResult: Partial<UseMutationResult<BroadcastSettings, Error, BroadcastSettings, unknown>> = {
      mutate: updateSettings,
      isPending: false,
      data: undefined,
      error: null,
      variables: undefined,
      isError: false,
      isSuccess: false,
    };

    vi.mocked(useSettingsMutation).mockReturnValue(mockMutationResult as UseMutationResult<BroadcastSettings, Error, BroadcastSettings, unknown>);

    render(<SettingsModal />);
    const settingsButton = await screen.findByRole('button', { name: /settings/i });
    await userEvent.click(settingsButton);

    const saveButton = await screen.findByRole('button', { name: /save changes/i });
    await userEvent.click(saveButton);

    const expectedData = {
      schedule: {
        sun: null,
        mon: null,
        tue: '09:00',
        wed: null,
        thu: null,
        fri: null,
        sat: null,
      },
      batchSize: 500,
    };

    await waitFor(() => {
      expect(updateSettings).toHaveBeenCalledWith(expectedData, expect.any(Object));
    });

  });

  it('closes dialog when cancel button is clicked', async () => {
    render(<SettingsModal />);
    const settingsButton = await screen.findByRole('button', { name: /settings/i });
    await userEvent.click(settingsButton);

    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
