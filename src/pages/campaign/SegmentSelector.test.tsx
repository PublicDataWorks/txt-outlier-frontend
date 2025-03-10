// src/components/SegmentSelector.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeAll } from 'vitest';

import { SegmentSelector, SegmentGroup } from './SegmentSelector';

import { useSegments } from '@/hooks/useSegments';

// Mock the useSegments hook
vi.mock('@/hooks/useSegments', () => ({
  useSegments: vi.fn(),
}));

// Mock the SegmentDropdown component
vi.mock('./SegmentDropdown', () => ({
  default: ({ segment, timeframe, onChange, segments, disabled }: any) => (
    <div data-testid="segment-dropdown" className="segment-dropdown">
      <select
        value={segment}
        onChange={(e) => onChange(e.target.value, timeframe)}
        disabled={disabled}
        data-testid="segment-select"
      >
        <option value="">Select segment...</option>
        {segments.map((s: any) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <button
        onClick={() => onChange(segment, new Date('2023-03-15'))}
        disabled={disabled || !segment}
        data-testid="date-button"
      >
        {timeframe ? timeframe.toLocaleDateString() : 'Set date'}
      </button>
      <div data-testid="segment-info">
        {segment ? `Selected: ${segment}` : 'None selected'}
        {timeframe ? ` since ${timeframe.toLocaleDateString()}` : ''}
      </div>
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

describe('SegmentSelector', () => {
  const mockSegments = [
    { id: 'seg1', name: 'Active Users' },
    { id: 'seg2', name: 'New Users' },
    { id: 'seg3', name: 'Power Users' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    (useSegments as any).mockReturnValue({
      data: mockSegments,
      isLoading: false,
    });
  });

  it('renders loading state', () => {
    (useSegments as any).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { container } = render(
      <SegmentSelector includeGroups={[]} onChange={vi.fn()} />,
    );

    // Should show skeleton loader
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();

    // Add button should not be visible during loading
    expect(screen.queryByText('Add Segment')).not.toBeInTheDocument();
  });

  it('renders empty state with add button', () => {
    render(<SegmentSelector includeGroups={[]} onChange={vi.fn()} />);

    // Should show add button with default label
    const addButton = screen.getByText('Add Segment');
    expect(addButton).toBeInTheDocument();

    // No segment groups should be visible
    expect(screen.queryByTestId('segment-dropdown')).not.toBeInTheDocument();
  });

  it('renders with custom add button labels', () => {
    render(
      <SegmentSelector
        includeGroups={[]}
        onChange={vi.fn()}
        addButtonLabel="Custom Add Label"
        addAnotherButtonLabel="Custom Add Another Label"
      />,
    );

    // Should show add button with custom label
    const addButton = screen.getByText('Custom Add Label');
    expect(addButton).toBeInTheDocument();
  });

  it('adds a segment group when add button is clicked', async () => {
    const onChange = vi.fn();
    render(<SegmentSelector includeGroups={[]} onChange={onChange} />);

    // Click add button
    await userEvent.click(screen.getByText('Add Segment'));

    // onChange should be called with a new empty group
    expect(onChange).toHaveBeenCalledWith([
      { base: { segment: '', timeframe: undefined }, filters: [] },
    ]);
  });

  it('renders existing segment groups', () => {
    const includeGroups: SegmentGroup[] = [
      {
        base: { segment: 'seg1', timeframe: new Date('2023-01-01') },
        filters: [],
      },
    ];

    render(
      <SegmentSelector includeGroups={includeGroups} onChange={vi.fn()} />,
    );

    // Should render one segment dropdown
    const dropdowns = screen.getAllByTestId('segment-dropdown');
    expect(dropdowns).toHaveLength(1);

    // Should show selected segment info
    expect(screen.getByText(/Selected: seg1/)).toBeInTheDocument();

    // Add button should show "Add Another Segment" text
    expect(screen.getByText('Add Another Segment')).toBeInTheDocument();
  });

  it('updates a segment group when dropdown selection changes', async () => {
    const onChange = vi.fn();
    const includeGroups: SegmentGroup[] = [
      {
        base: { segment: 'seg1', timeframe: undefined },
        filters: [],
      },
    ];

    render(
      <SegmentSelector includeGroups={includeGroups} onChange={onChange} />,
    );

    // Change segment selection
    const select = screen.getByTestId('segment-select');
    fireEvent.change(select, { target: { value: 'seg2' } });

    // onChange should be called with updated segment
    expect(onChange).toHaveBeenCalledWith([
      {
        base: { segment: 'seg2', timeframe: undefined },
        filters: [],
      },
    ]);
  });

  it('updates a segment group when date is selected', async () => {
    const onChange = vi.fn();
    const includeGroups: SegmentGroup[] = [
      {
        base: { segment: 'seg1', timeframe: undefined },
        filters: [],
      },
    ];

    render(
      <SegmentSelector includeGroups={includeGroups} onChange={onChange} />,
    );

    // Click date button (our mock will set date to 2023-03-15)
    await userEvent.click(screen.getByTestId('date-button'));

    // onChange should be called with updated timeframe
    expect(onChange).toHaveBeenCalledWith([
      {
        base: { segment: 'seg1', timeframe: new Date('2023-03-15') },
        filters: [],
      },
    ]);
  });

  it('removes a segment group when remove button is clicked', async () => {
    const onChange = vi.fn();
    const includeGroups: SegmentGroup[] = [
      {
        base: { segment: 'seg1', timeframe: undefined },
        filters: [],
      },
      {
        base: { segment: 'seg2', timeframe: undefined },
        filters: [],
      },
    ];

    render(
      <SegmentSelector includeGroups={includeGroups} onChange={onChange} />,
    );

    // Find remove buttons (X icons) - should be on the second group
    const removeButtons = screen.getAllByRole('button', { name: '' }); // X icon buttons typically have no accessible name

    // Click the first remove button (for the second group)
    await userEvent.click(removeButtons[0]);

    // onChange should be called with the first group only
    expect(onChange).toHaveBeenCalledWith([
      {
        base: { segment: 'seg1', timeframe: undefined },
        filters: [],
      },
    ]);
  });

  it('adds a filter when Add Filter button is clicked', async () => {
    const onChange = vi.fn();
    const includeGroups: SegmentGroup[] = [
      {
        base: { segment: 'seg1', timeframe: undefined },
        filters: [],
      },
    ];

    render(
      <SegmentSelector includeGroups={includeGroups} onChange={onChange} />,
    );

    // Click Add Filter button
    await userEvent.click(screen.getByText('Add Filter'));

    // onChange should be called with a new filter added
    expect(onChange).toHaveBeenCalledWith([
      {
        base: { segment: 'seg1', timeframe: undefined },
        filters: [{ segment: '', timeframe: undefined }],
      },
    ]);
  });

  it('updates a filter when filter dropdown selection changes', async () => {
    const onChange = vi.fn();
    const includeGroups: SegmentGroup[] = [
      {
        base: { segment: 'seg1', timeframe: undefined },
        filters: [{ segment: '', timeframe: undefined }],
      },
    ];

    render(
      <SegmentSelector includeGroups={includeGroups} onChange={onChange} />,
    );

    // Find all segment selects (should be two - one for base, one for filter)
    const selects = screen.getAllByTestId('segment-select');

    // Change the second select (filter)
    fireEvent.change(selects[1], { target: { value: 'seg3' } });

    // onChange should be called with updated filter
    expect(onChange).toHaveBeenCalledWith([
      {
        base: { segment: 'seg1', timeframe: undefined },
        filters: [{ segment: 'seg3', timeframe: undefined }],
      },
    ]);
  });

  it('removes a filter when filter remove button is clicked', async () => {
    const onChange = vi.fn();
    const includeGroups: SegmentGroup[] = [
      {
        base: { segment: 'seg1', timeframe: undefined },
        filters: [
          { segment: 'seg2', timeframe: undefined },
          { segment: 'seg3', timeframe: undefined },
        ],
      },
    ];

    render(
      <SegmentSelector includeGroups={includeGroups} onChange={onChange} />,
    );

    // Find all remove buttons (X icons)
    const removeButtons = screen.getAllByRole('button', { name: '' });

    expect(removeButtons.length).toBeGreaterThanOrEqual(2);

    // Click the second remove button (first filter)
    await userEvent.click(removeButtons[1]);

    expect(onChange).toHaveBeenCalledWith([
      {
        base: { segment: 'seg1', timeframe: undefined },
        filters: [{ segment: 'seg2', timeframe: undefined }],
      },
    ]);
  });

  it('handles allowEmptyGroups prop correctly', () => {
    const includeGroups: SegmentGroup[] = [
      {
        base: { segment: 'seg1', timeframe: undefined },
        filters: [],
      },
    ];

    // Render with allowEmptyGroups=true
    const { rerender } = render(
      <SegmentSelector
        includeGroups={includeGroups}
        onChange={vi.fn()}
        allowEmptyGroups={true}
      />,
    );

    // Should show remove button for the first group
    const removeButtons = screen.getAllByRole('button', { name: '' });
    expect(removeButtons.length).toBeGreaterThanOrEqual(1);

    // Re-render with allowEmptyGroups=false
    rerender(
      <SegmentSelector
        includeGroups={includeGroups}
        onChange={vi.fn()}
        allowEmptyGroups={false}
      />,
    );

    // Should not show remove button for the first group if it's the only one
    const singleGroupRemoveButtons = screen
      .queryAllByRole('button', { name: '' })
      .filter(
        (btn) => btn.closest('[data-testid="segment-dropdown"]') === null,
      );

    expect(singleGroupRemoveButtons.length).toBe(0);
  });

  it('handles multiple segment groups with filters', () => {
    const onChange = vi.fn();
    const includeGroups: SegmentGroup[] = [
      {
        base: { segment: 'seg1', timeframe: undefined },
        filters: [{ segment: 'seg2', timeframe: undefined }],
      },
      {
        base: { segment: 'seg3', timeframe: undefined },
        filters: [],
      },
    ];

    render(
      <SegmentSelector includeGroups={includeGroups} onChange={onChange} />,
    );

    // Should render 3 segment dropdowns (2 base + 1 filter)
    const dropdowns = screen.getAllByTestId('segment-dropdown');
    expect(dropdowns).toHaveLength(3);

    // Should render 2 Add Filter buttons (one for each group)
    const addFilterButtons = screen.getAllByText('Add Filter');
    expect(addFilterButtons).toHaveLength(2);
  });
});
