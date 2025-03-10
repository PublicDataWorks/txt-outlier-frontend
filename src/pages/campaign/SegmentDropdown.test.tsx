import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import SegmentDropdown from './SegmentDropdown';

// Mock the DatePicker component as it's complex and has its own tests
vi.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({ value, onChange, disabled }: any) => (
    <button
      onClick={() => onChange(new Date('2023-03-15'))}
      disabled={disabled}
      data-testid="date-picker"
    >
      {value ? value.toLocaleDateString() : 'Select date'}
    </button>
  ),
}));

describe('SegmentDropdown', () => {
  const mockSegments = [
    { id: 'seg1', name: 'Active Users' },
    { id: 'seg2', name: 'New Users' },
    { id: 'seg3', name: 'Power Users' },
  ];

  const defaultProps = {
    segment: '',
    timeframe: undefined,
    onChange: vi.fn(),
    segments: mockSegments,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default empty state', () => {
    render(<SegmentDropdown {...defaultProps} />);

    // Segment dropdown should show placeholder
    expect(screen.getByRole('combobox')).toHaveTextContent('Select segment...');

    // Date picker should be disabled initially
    expect(screen.getByTestId('date-picker')).toBeDisabled();

    // Timeframe text should not be visible
    expect(
      screen.queryByText(/Added to segment since/),
    ).not.toBeInTheDocument();
  });

  it('renders with selected segment', () => {
    const props = {
      ...defaultProps,
      segment: 'seg1',
    };

    render(<SegmentDropdown {...props} />);

    // Segment dropdown should show selected segment name
    expect(screen.getByRole('combobox')).toHaveTextContent('Active Users');

    // Date picker should be enabled when segment is selected
    expect(screen.getByTestId('date-picker')).not.toBeDisabled();
  });

  it('renders with selected segment and timeframe', () => {
    const timeframe = new Date('2023-03-10');
    const props = {
      ...defaultProps,
      segment: 'seg1',
      timeframe,
    };

    render(<SegmentDropdown {...props} />);

    // Segment dropdown should show selected segment name
    expect(screen.getByRole('combobox')).toHaveTextContent('Active Users');

    // Date picker should be enabled and show the date
    const datePicker = screen.getByTestId('date-picker');
    expect(datePicker).not.toBeDisabled();
    expect(datePicker).toHaveTextContent('3/10/2023');

    // Timeframe text should be visible
    expect(
      screen.getByText(
        `Added to segment since ${timeframe.toLocaleDateString()}`,
      ),
    ).toBeInTheDocument();
  });

  it('renders in disabled state', () => {
    const props = {
      ...defaultProps,
      segment: 'seg1',
      disabled: true,
    };

    render(<SegmentDropdown {...props} />);

    // Both dropdown and date picker should be disabled
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByTestId('date-picker')).toBeDisabled();
  });

  it('handles unknown segment ID gracefully', () => {
    const props = {
      ...defaultProps,
      segment: 'unknown-id',
    };

    render(<SegmentDropdown {...props} />);

    // Should show "Unknown segment" for unrecognized segment ID
    expect(screen.getByRole('combobox')).toHaveTextContent('Unknown segment');
  });

  it('opens dropdown when clicked', async () => {
    render(<SegmentDropdown {...defaultProps} />);

    // Dropdown content should not be visible initially
    expect(
      screen.queryByPlaceholderText('Search segment...'),
    ).not.toBeInTheDocument();

    // Click to open dropdown
    await userEvent.click(screen.getByRole('combobox'));

    // Dropdown content should now be visible
    expect(
      screen.getByPlaceholderText('Search segment...'),
    ).toBeInTheDocument();

    // All segments should be listed
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('New Users')).toBeInTheDocument();
    expect(screen.getByText('Power Users')).toBeInTheDocument();
  });

  it('selects a segment when clicked', async () => {
    const onChange = vi.fn();
    render(<SegmentDropdown {...defaultProps} onChange={onChange} />);

    // Open dropdown
    await userEvent.click(screen.getByRole('combobox'));

    // Click on a segment
    await userEvent.click(screen.getByText('New Users'));

    // onChange should be called with segment ID and current timeframe
    expect(onChange).toHaveBeenCalledWith('seg2', undefined);
  });

  it('filters segments when searching', async () => {
    render(<SegmentDropdown {...defaultProps} />);

    // Open dropdown
    await userEvent.click(screen.getByRole('combobox'));

    // Type in search box
    const searchInput = screen.getByPlaceholderText('Search segment...');
    await userEvent.type(searchInput, 'Power');

    // Only matching segment should be visible
    expect(screen.getByText('Power Users')).toBeInTheDocument();
    expect(screen.queryByText('Active Users')).not.toBeInTheDocument();
    expect(screen.queryByText('New Users')).not.toBeInTheDocument();
  });

  it('shows empty state when no segments match search', async () => {
    render(<SegmentDropdown {...defaultProps} />);

    // Open dropdown
    await userEvent.click(screen.getByRole('combobox'));

    // Type in search box
    const searchInput = screen.getByPlaceholderText('Search segment...');
    await userEvent.type(searchInput, 'NonExistent');

    // Empty state should be shown
    expect(screen.getByText('No segment found.')).toBeInTheDocument();
  });

  it('changes timeframe when date picker is used', async () => {
    const onChange = vi.fn();
    const props = {
      ...defaultProps,
      segment: 'seg1',
      onChange,
    };

    render(<SegmentDropdown {...props} />);

    // Click date picker (our mock will set date to 2023-03-15)
    await userEvent.click(screen.getByTestId('date-picker'));

    // onChange should be called with current segment and new date
    expect(onChange).toHaveBeenCalledWith('seg1', new Date('2023-03-15'));
  });

  it('displays correct timeframe text', () => {
    const timeframe = new Date('2023-04-20');
    const props = {
      ...defaultProps,
      segment: 'seg3',
      timeframe,
    };

    render(<SegmentDropdown {...props} />);

    // Should show formatted timeframe text
    expect(
      screen.getByText(
        `Added to segment since ${timeframe.toLocaleDateString()}`,
      ),
    ).toBeInTheDocument();
  });

  it('does not show timeframe text when timeframe is undefined', () => {
    const props = {
      ...defaultProps,
      segment: 'seg3',
      timeframe: undefined,
    };

    render(<SegmentDropdown {...props} />);

    // Should not show timeframe text
    expect(
      screen.queryByText(/Added to segment since/),
    ).not.toBeInTheDocument();
  });
});
