// src/components/ScheduleDialog.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { set } from 'date-fns';

import { ScheduleDialog } from './ScheduleDialog';

// Mock the FutureDatePicker component
vi.mock('@/components/ui/future-date-picker', () => ({
  FutureDatePicker: ({ value, onChange }: any) => (
    <div data-testid="future-date-picker">
      <button
        onClick={() => onChange(new Date('2025-03-15'))}
        data-testid="select-date-button"
      >
        Select Date
      </button>
      <span data-testid="selected-date">
        {value ? value.toISOString().split('T')[0] : 'No date selected'}
      </span>
    </div>
  ),
}));

// Mock browser APIs not available in JSDOM
beforeAll(() => {
  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Mock scrollIntoView
  Element.prototype.scrollIntoView = vi.fn();
});

// Mock date-fns isBefore function
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    isBefore: vi.fn().mockImplementation((date1, date2) => {
      // For testing, we'll consider dates before 2025-01-01 as "before now"
      return date1 < new Date('2025-01-01');
    }),
  };
});

describe('ScheduleDialog', () => {
  // Create a fixed "now" date for consistent testing
  const mockNow = new Date('2024-12-15T12:00:00Z');

  beforeAll(() => {
    // Mock Date.now to return a fixed date
    vi.spyOn(Date, 'now').mockImplementation(() => mockNow.getTime());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the schedule button correctly', () => {
    render(<ScheduleDialog onSchedule={vi.fn()} />);

    // Check that the button is rendered with correct text and icon
    const scheduleButton = screen.getByRole('button', { name: /schedule/i });
    expect(scheduleButton).toBeInTheDocument();
    expect(scheduleButton).not.toBeDisabled();
  });

  it('renders in disabled state correctly', () => {
    render(<ScheduleDialog onSchedule={vi.fn()} disabled={true} />);

    // Check that the button is disabled
    const scheduleButton = screen.getByRole('button', { name: /schedule/i });
    expect(scheduleButton).toBeDisabled();
  });

  it('opens the dialog when the schedule button is clicked', async () => {
    render(<ScheduleDialog onSchedule={vi.fn()} />);

    // Dialog content should not be visible initially
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click the schedule button
    await userEvent.click(screen.getByRole('button', { name: /schedule/i }));

    // Dialog should now be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Schedule Broadcast')).toBeInTheDocument();
  });

  it('shows all time selection options', async () => {
    render(<ScheduleDialog onSchedule={vi.fn()} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /schedule/i }));

    // Check for date picker
    expect(screen.getByTestId('future-date-picker')).toBeInTheDocument();

    // Check for hour, minute, and period selects
    expect(screen.getByRole('combobox', { name: /hour/i })).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /minute/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /am\/pm/i }),
    ).toBeInTheDocument();

    // Schedule button should be disabled initially (no selections made)
    expect(screen.getByRole('button', { name: /^schedule$/i })).toBeDisabled();
  });

  it('allows selecting a date', async () => {
    render(<ScheduleDialog onSchedule={vi.fn()} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /schedule/i }));

    // Select a date using our mock
    await userEvent.click(screen.getByTestId('select-date-button'));

    // Check that the date was selected
    expect(screen.getByTestId('selected-date')).toHaveTextContent('2025-03-15');
  });

  it('allows selecting hour, minute, and period', async () => {
    render(<ScheduleDialog onSchedule={vi.fn()} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /schedule/i }));

    // Select a date first
    await userEvent.click(screen.getByTestId('select-date-button'));

    // Open hour dropdown and select a value
    await userEvent.click(screen.getByRole('combobox', { name: /hour/i }));
    await userEvent.click(screen.getByRole('option', { name: '10' }));

    // Open minute dropdown and select a value
    await userEvent.click(screen.getByRole('combobox', { name: /minute/i }));
    await userEvent.click(screen.getByRole('option', { name: '30' }));

    // Open period dropdown and select PM
    await userEvent.click(screen.getByRole('combobox', { name: /am\/pm/i }));
    await userEvent.click(screen.getByRole('option', { name: 'PM' }));

    // Schedule button should now be enabled
    expect(
      screen.getByRole('button', { name: /^schedule$/i }),
    ).not.toBeDisabled();
  });

  it('calls onSchedule with the correct date when scheduled', async () => {
    const onSchedule = vi.fn();
    render(<ScheduleDialog onSchedule={onSchedule} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /schedule/i }));

    // Select a date
    await userEvent.click(screen.getByTestId('select-date-button'));

    // Select hour, minute, and period
    await userEvent.click(screen.getByRole('combobox', { name: /hour/i }));
    await userEvent.click(screen.getByRole('option', { name: '10' }));

    await userEvent.click(screen.getByRole('combobox', { name: /minute/i }));
    await userEvent.click(screen.getByRole('option', { name: '30' }));

    await userEvent.click(screen.getByRole('combobox', { name: /am\/pm/i }));
    await userEvent.click(screen.getByRole('option', { name: 'PM' }));

    // Click the schedule button
    await userEvent.click(screen.getByRole('button', { name: /^schedule$/i }));

    // onSchedule should be called with the correct date
    expect(onSchedule).toHaveBeenCalledTimes(1);

    // The expected date should be 2025-03-15 at 22:30:00
    const expectedDate = set(new Date('2025-03-15'), {
      hours: 22,
      minutes: 30,
      seconds: 0,
      milliseconds: 0,
    });

    // Check that the date passed to onSchedule matches our expected date
    const actualDate = onSchedule.mock.calls[0][0];
    expect(actualDate.getFullYear()).toBe(expectedDate.getFullYear());
    expect(actualDate.getMonth()).toBe(expectedDate.getMonth());
    expect(actualDate.getDate()).toBe(expectedDate.getDate());
    expect(actualDate.getHours()).toBe(expectedDate.getHours());
    expect(actualDate.getMinutes()).toBe(expectedDate.getMinutes());
    expect(actualDate.getSeconds()).toBe(expectedDate.getSeconds());
  });

  it('handles 12 AM correctly', async () => {
    const onSchedule = vi.fn();
    render(<ScheduleDialog onSchedule={onSchedule} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /schedule/i }));

    // Select a date
    await userEvent.click(screen.getByTestId('select-date-button'));

    // Select 12 hour, 00 minute, and AM
    await userEvent.click(screen.getByRole('combobox', { name: /hour/i }));
    await userEvent.click(screen.getByRole('option', { name: '12' }));

    await userEvent.click(screen.getByRole('combobox', { name: /minute/i }));
    await userEvent.click(screen.getByRole('option', { name: '00' }));

    await userEvent.click(screen.getByRole('combobox', { name: /am\/pm/i }));
    await userEvent.click(screen.getByRole('option', { name: 'AM' }));

    // Click the schedule button
    await userEvent.click(screen.getByRole('button', { name: /^schedule$/i }));

    // onSchedule should be called with the correct date
    expect(onSchedule).toHaveBeenCalledTimes(1);

    // The expected date should be 2025-03-15 at 00:00:00 (midnight)
    const expectedDate = set(new Date('2025-03-15'), {
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    // Check that the date passed to onSchedule matches our expected date
    const actualDate = onSchedule.mock.calls[0][0];
    expect(actualDate.getHours()).toBe(expectedDate.getHours());
    expect(actualDate.getMinutes()).toBe(expectedDate.getMinutes());
  });

  it('handles 12 PM correctly', async () => {
    const onSchedule = vi.fn();
    render(<ScheduleDialog onSchedule={onSchedule} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /schedule/i }));

    // Select a date
    await userEvent.click(screen.getByTestId('select-date-button'));

    // Select 12 hour, 00 minute, and PM
    await userEvent.click(screen.getByRole('combobox', { name: /hour/i }));
    await userEvent.click(screen.getByRole('option', { name: '12' }));

    await userEvent.click(screen.getByRole('combobox', { name: /minute/i }));
    await userEvent.click(screen.getByRole('option', { name: '00' }));

    await userEvent.click(screen.getByRole('combobox', { name: /am\/pm/i }));
    await userEvent.click(screen.getByRole('option', { name: 'PM' }));

    // Click the schedule button
    await userEvent.click(screen.getByRole('button', { name: /^schedule$/i }));

    // onSchedule should be called with the correct date
    expect(onSchedule).toHaveBeenCalledTimes(1);

    // The expected date should be 2025-03-15 at 12:00:00 (noon)
    const expectedDate = set(new Date('2025-03-15'), {
      hours: 12,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    // Check that the date passed to onSchedule matches our expected date
    const actualDate = onSchedule.mock.calls[0][0];
    expect(actualDate.getHours()).toBe(expectedDate.getHours());
    expect(actualDate.getMinutes()).toBe(expectedDate.getMinutes());
  });

  it('shows error when selected time is in the past', async () => {
    // Mock isBefore to return true (indicating past date)
    const { isBefore } = await import('date-fns');
    (isBefore as any).mockReturnValueOnce(true);

    const onSchedule = vi.fn();
    render(<ScheduleDialog onSchedule={onSchedule} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /schedule/i }));

    // Select a date
    await userEvent.click(screen.getByTestId('select-date-button'));

    // Select hour, minute, and period
    await userEvent.click(screen.getByRole('combobox', { name: /hour/i }));
    await userEvent.click(screen.getByRole('option', { name: '10' }));

    await userEvent.click(screen.getByRole('combobox', { name: /minute/i }));
    await userEvent.click(screen.getByRole('option', { name: '30' }));

    // Click the schedule button
    await userEvent.click(screen.getByRole('button', { name: /^schedule$/i }));

    // Should show error message
    expect(
      screen.getByText('Please select a time in the future'),
    ).toBeInTheDocument();

    // onSchedule should not be called
    expect(onSchedule).not.toHaveBeenCalled();
  });

  it('closes dialog when scheduled successfully', async () => {
    render(<ScheduleDialog onSchedule={vi.fn()} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /schedule/i }));

    // Select a date
    await userEvent.click(screen.getByTestId('select-date-button'));

    // Select hour, minute, and period
    await userEvent.click(screen.getByRole('combobox', { name: /hour/i }));
    await userEvent.click(screen.getByRole('option', { name: '10' }));

    await userEvent.click(screen.getByRole('combobox', { name: /minute/i }));
    await userEvent.click(screen.getByRole('option', { name: '30' }));

    // Click the schedule button
    await userEvent.click(screen.getByRole('button', { name: /^schedule$/i }));

    // Dialog should be closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
