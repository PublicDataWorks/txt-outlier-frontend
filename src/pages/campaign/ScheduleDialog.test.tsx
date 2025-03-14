import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { set } from 'date-fns';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';

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

// Mock date-fns isBefore function
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    isBefore: vi.fn().mockImplementation((date1) => {
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

  it('calls onSchedule with the correct date when scheduled', async () => {
});
});
