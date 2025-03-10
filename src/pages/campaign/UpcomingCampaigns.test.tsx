import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import UpcomingCampaigns from './UpcomingCampaigns';

import { useUpcomingCampaigns } from '@/hooks/useCampaign';
import { useSegments } from '@/hooks/useSegments';
import { formatToLocalTime } from '@/lib/date';

// Mock the hooks
vi.mock('@/hooks/useCampaign', () => ({
  useUpcomingCampaigns: vi.fn(),
}));

vi.mock('@/hooks/useSegments', () => ({
  useSegments: vi.fn(),
}));

describe('UpcomingCampaigns', () => {
  const mockCampaigns = [
    {
      id: 1,
      title: 'Test Campaign 1',
      firstMessage: 'Hello world',
      secondMessage: 'Follow up message',
      runAt: 1677609600, // March 1, 2023
      delay: 3600, // 60 minutes
      recipientCount: 1000,
      segments: {
        included: [{ id: 'seg1' }],
      },
    },
    {
      id: 2,
      title: 'Test Campaign 2',
      firstMessage: 'Another message',
      secondMessage: null,
      runAt: 1677696000, // March 2, 2023
      delay: 0,
      recipientCount: 500,
      segments: {
        included: [{ id: 'seg2' }],
      },
    },
    {
      id: 3,
      title: 'Test Campaign 3',
      firstMessage: 'Third message',
      secondMessage: 'Third follow up',
      runAt: 1677782400, // March 3, 2023
      delay: 1800, // 30 minutes
      recipientCount: 2500,
      segments: {
        included: [[{ id: 'seg1' }, { id: 'seg3' }]],
      },
    },
    {
      id: 4,
      title: 'Test Campaign 4',
      firstMessage: 'Fourth message',
      secondMessage: 'Fourth follow up',
      runAt: 1677868800, // March 4, 2023
      delay: 7200, // 120 minutes
      recipientCount: 3000,
      segments: {},
    },
  ];

  const mockSegments = [
    { id: 'seg1', name: 'Active Users' },
    { id: 'seg2', name: 'New Users' },
    { id: 'seg3', name: 'Power Users' },
  ];

  it('renders loading state correctly', () => {
    (useUpcomingCampaigns as any).mockReturnValue({
      isPending: true,
      isError: false,
      data: undefined,
      error: null,
    });

    (useSegments as any).mockReturnValue({
      data: [],
    });

    render(<UpcomingCampaigns />);

    expect(screen.getByText('Upcoming Campaigns')).toBeInTheDocument();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders error state correctly', () => {
    const errorMessage = 'Failed to fetch campaigns';

    (useUpcomingCampaigns as any).mockReturnValue({
      isPending: false,
      isError: true,
      data: undefined,
      error: { message: errorMessage },
    });

    (useSegments as any).mockReturnValue({
      data: [],
    });

    render(<UpcomingCampaigns />);

    expect(screen.getByText('Upcoming Campaigns')).toBeInTheDocument();
    expect(
      screen.getByText(`Error loading campaigns: ${errorMessage}`),
    ).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    (useUpcomingCampaigns as any).mockReturnValue({
      isPending: false,
      isError: false,
      data: [],
      error: null,
    });

    (useSegments as any).mockReturnValue({
      data: [],
    });

    render(<UpcomingCampaigns />);

    expect(screen.getByText('Upcoming Campaigns (0)')).toBeInTheDocument();
    expect(
      screen.getByText('No upcoming campaigns scheduled'),
    ).toBeInTheDocument();
  });

  it('renders campaigns correctly and shows only first 3 by default', () => {
    (useUpcomingCampaigns as any).mockReturnValue({
      isPending: false,
      isError: false,
      data: mockCampaigns,
      error: null,
    });

    (useSegments as any).mockReturnValue({
      data: mockSegments,
    });

    render(<UpcomingCampaigns />);

    expect(screen.getByText('Upcoming Campaigns (4)')).toBeInTheDocument();

    // Should show only first 3 campaigns by title
    expect(screen.getByText('Test Campaign 1')).toBeInTheDocument();
    expect(screen.getByText('Test Campaign 2')).toBeInTheDocument();
    expect(screen.getByText('Test Campaign 3')).toBeInTheDocument();
    expect(screen.queryByText('Test Campaign 4')).not.toBeInTheDocument();

    // Check for formatted dates (we're using the actual formatter function)
    const date1 = formatToLocalTime(new Date(mockCampaigns[0].runAt * 1000));
    expect(screen.getByText(date1)).toBeInTheDocument();

    // Should show "Show more" button
    expect(screen.getByText('Show 1 More')).toBeInTheDocument();
  });

  it('expands to show all campaigns when "Show More" is clicked', () => {
    (useUpcomingCampaigns as any).mockReturnValue({
      isPending: false,
      isError: false,
      data: mockCampaigns,
      error: null,
    });

    (useSegments as any).mockReturnValue({
      data: mockSegments,
    });

    render(<UpcomingCampaigns />);

    // Click "Show More" button
    fireEvent.click(screen.getByText('Show 1 More'));

    // Should now show all campaigns
    expect(screen.getByText('Test Campaign 1')).toBeInTheDocument();
    expect(screen.getByText('Test Campaign 2')).toBeInTheDocument();
    expect(screen.getByText('Test Campaign 3')).toBeInTheDocument();
    expect(screen.getByText('Test Campaign 4')).toBeInTheDocument();

    // Button should change to "Show Less"
    expect(screen.getByText('Show Less')).toBeInTheDocument();
  });

  it('collapses back to show only 3 campaigns when "Show Less" is clicked', () => {
    (useUpcomingCampaigns as any).mockReturnValue({
      isPending: false,
      isError: false,
      data: mockCampaigns,
      error: null,
    });

    (useSegments as any).mockReturnValue({
      data: mockSegments,
    });

    render(<UpcomingCampaigns />);

    // First expand
    fireEvent.click(screen.getByText('Show 1 More'));
    expect(screen.getByText('Test Campaign 4')).toBeInTheDocument();

    // Then collapse
    fireEvent.click(screen.getByText('Show Less'));

    // Should hide the fourth campaign
    expect(screen.queryByText('Test Campaign 4')).not.toBeInTheDocument();

    // Should show "Show more" button again
    expect(screen.getByText('Show 1 More')).toBeInTheDocument();
  });

  it('expands campaign details when a campaign is clicked', () => {
    (useUpcomingCampaigns as any).mockReturnValue({
      isPending: false,
      isError: false,
      data: mockCampaigns,
      error: null,
    });

    (useSegments as any).mockReturnValue({
      data: mockSegments,
    });

    render(<UpcomingCampaigns />);

    // Campaign details should be hidden initially
    expect(screen.queryByLabelText('Campaign Title')).not.toBeInTheDocument();

    // Click on first campaign
    fireEvent.click(screen.getByText('Test Campaign 1'));

    // Campaign details should now be visible
    expect(screen.getByLabelText('Campaign Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Campaign Date and Time')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
    expect(screen.getByLabelText('Follow-up Message')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Follow-up Delay (minutes)'),
    ).toBeInTheDocument();

    // Check if campaign data is displayed correctly
    const messageTextarea = screen.getByLabelText(
      'Message',
    ) as HTMLTextAreaElement;
    expect(messageTextarea.value).toBe('Hello world');

    const followupTextarea = screen.getByLabelText(
      'Follow-up Message',
    ) as HTMLTextAreaElement;
    expect(followupTextarea.value).toBe('Follow up message');

    const delayInput = screen.getByLabelText(
      'Follow-up Delay (minutes)',
    ) as HTMLInputElement;
    expect(delayInput.value).toBe('60'); // 3600 seconds = 60 minutes
  });

  it('collapses campaign details when an expanded campaign is clicked again', () => {
    (useUpcomingCampaigns as any).mockReturnValue({
      isPending: false,
      isError: false,
      data: mockCampaigns,
      error: null,
    });

    (useSegments as any).mockReturnValue({
      data: mockSegments,
    });

    render(<UpcomingCampaigns />);

    // First expand
    fireEvent.click(screen.getByText('Test Campaign 1'));
    expect(screen.getByLabelText('Campaign Title')).toBeInTheDocument();

    // Then collapse
    fireEvent.click(screen.getByText('Test Campaign 1'));

    // Campaign details should be hidden again
    expect(screen.queryByLabelText('Campaign Title')).not.toBeInTheDocument();
  });

  it('correctly displays segment names when available', () => {
    (useUpcomingCampaigns as any).mockReturnValue({
      isPending: false,
      isError: false,
      data: mockCampaigns,
      error: null,
    });

    (useSegments as any).mockReturnValue({
      data: mockSegments,
    });

    render(<UpcomingCampaigns />);

    // Campaign 1 has segment "Active Users"
    expect(screen.getByText('Active Users')).toBeInTheDocument();

    // Campaign 2 has segment "New Users"
    expect(screen.getByText('New Users')).toBeInTheDocument();
  });

  it('handles campaigns without a follow-up message correctly', () => {
    (useUpcomingCampaigns as any).mockReturnValue({
      isPending: false,
      isError: false,
      data: [mockCampaigns[1]], // Only the campaign without a follow-up
      error: null,
    });

    (useSegments as any).mockReturnValue({
      data: mockSegments,
    });

    render(<UpcomingCampaigns />);

    // Expand the campaign
    fireEvent.click(screen.getByText('Test Campaign 2'));

    // Should show message field
    expect(screen.getByLabelText('Message')).toBeInTheDocument();

    // Should NOT show follow-up fields
    expect(
      screen.queryByLabelText('Follow-up Message'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Follow-up Delay (minutes)'),
    ).not.toBeInTheDocument();
  });
});
