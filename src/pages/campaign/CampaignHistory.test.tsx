import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import CampaignHistory from './CampaignHistory';

import { usePastCampaigns } from '@/hooks/useCampaign';
import { useSegments } from '@/hooks/useSegments';
import { formatToLocalTime } from '@/lib/date';

// Mock the hooks
vi.mock('@/hooks/useCampaign', () => ({
  usePastCampaigns: vi.fn(),
}));

vi.mock('@/hooks/useSegments', () => ({
  useSegments: vi.fn(),
}));

describe('CampaignHistory', () => {
  const mockCampaigns = [
    {
      id: 1,
      title: 'Past Campaign 1',
      firstMessage: 'Hello world',
      secondMessage: 'Follow up message',
      runAt: 1677609600, // March 1, 2023
      delay: 3600, // 60 minutes
      recipientCount: 1000,
      segments: {
        included: [{ id: 'seg1' }]
      }
    },
    {
      id: 2,
      title: 'Past Campaign 2',
      firstMessage: 'Another message',
      secondMessage: null,
      runAt: 1677696000, // March 2, 2023
      delay: 0,
      recipientCount: 500,
      segments: {
        included: [{ id: 'seg2' }]
      }
    },
    {
      id: 3,
      title: null, // Testing untitled campaign
      firstMessage: 'Third message',
      secondMessage: 'Third follow up',
      runAt: 1677782400, // March 3, 2023
      delay: 1800, // 30 minutes
      recipientCount: 2500,
      segments: {
        included: [[{ id: 'seg1' }, { id: 'seg3' }]]
      }
    }
  ];

  const mockSegments = [
    { id: 'seg1', name: 'Active Users' },
    { id: 'seg2', name: 'New Users' },
    { id: 'seg3', name: 'Power Users' }
  ];

  const mockPagination = {
    page: 1,
    limit: 10,
    totalItems: 25,
    totalPages: 3
  };

  it('renders loading state correctly', () => {
    (usePastCampaigns as any).mockReturnValue({
      campaigns: [],
      isLoading: true,
      isFetchingNextPage: false,
      isError: false,
      error: null,
      hasNextPage: false,
      loadMore: vi.fn(),
      pagination: null
    });
    
    (useSegments as any).mockReturnValue({
      data: []
    });

    const { container } = render(<CampaignHistory />);
    
    expect(screen.getByText('Past Campaigns')).toBeInTheDocument();
    
    // Looking for skeleton elements with the animate-pulse class
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders error state correctly', () => {
    const errorMessage = 'Failed to fetch campaigns';
    
    (usePastCampaigns as any).mockReturnValue({
      campaigns: [],
      isLoading: false,
      isFetchingNextPage: false,
      isError: true,
      error: { message: errorMessage },
      hasNextPage: false,
      loadMore: vi.fn(),
      pagination: null
    });
    
    (useSegments as any).mockReturnValue({
      data: []
    });

    render(<CampaignHistory />);
    
    expect(screen.getByText('Past Campaigns')).toBeInTheDocument();
    expect(screen.getByText(`Error loading campaigns: ${errorMessage}`)).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    (usePastCampaigns as any).mockReturnValue({
      campaigns: [],
      isLoading: false,
      isFetchingNextPage: false,
      isError: false,
      error: null,
      hasNextPage: false,
      loadMore: vi.fn(),
      pagination: { totalItems: 0 }
    });
    
    (useSegments as any).mockReturnValue({
      data: []
    });

    render(<CampaignHistory />);
    
    expect(screen.getByText('Past Campaigns (0)')).toBeInTheDocument();
    expect(screen.getByText('No past campaigns found')).toBeInTheDocument();
  });

  it('renders campaigns correctly with pagination info', () => {
    (usePastCampaigns as any).mockReturnValue({
      campaigns: mockCampaigns,
      isLoading: false,
      isFetchingNextPage: false,
      isError: false,
      error: null,
      hasNextPage: true,
      loadMore: vi.fn(),
      pagination: mockPagination
    });
    
    (useSegments as any).mockReturnValue({
      data: mockSegments
    });

    render(<CampaignHistory />);
    
    // Check for title with pagination info
    expect(screen.getByText('Past Campaigns (25)')).toBeInTheDocument();
    
    // Check for all campaign titles
    expect(screen.getByText('Past Campaign 1')).toBeInTheDocument();
    expect(screen.getByText('Past Campaign 2')).toBeInTheDocument();
    expect(screen.getByText('Untitled Campaign')).toBeInTheDocument(); // For campaign with null title
    
    // Check for formatted dates
    const date1 = formatToLocalTime(new Date(mockCampaigns[0].runAt * 1000));
    expect(screen.getByText(date1)).toBeInTheDocument();
    
    // Check for segment names
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('New Users')).toBeInTheDocument();
    
    // Check for recipient counts
    expect(screen.getByText(/~1,000/)).toBeInTheDocument();
    expect(screen.getByText(/~500/)).toBeInTheDocument();
    expect(screen.getByText(/~2,500/)).toBeInTheDocument();
    
    // Check for Load More button
    expect(screen.getByText('Load More')).toBeInTheDocument();
  });

  it('expands campaign details when clicked', () => {
    (usePastCampaigns as any).mockReturnValue({
      campaigns: mockCampaigns,
      isLoading: false,
      isFetchingNextPage: false,
      isError: false,
      error: null,
      hasNextPage: true,
      loadMore: vi.fn(),
      pagination: mockPagination
    });
    
    (useSegments as any).mockReturnValue({
      data: mockSegments
    });

    render(<CampaignHistory />);
    
    // Initially, message details should not be visible
    expect(screen.queryByText('Message:')).not.toBeInTheDocument();
    
    // Click on first campaign
    fireEvent.click(screen.getByText('Past Campaign 1'));
    
    // Message details should now be visible
    expect(screen.getByText('Message:')).toBeInTheDocument();
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('Follow-up Message:')).toBeInTheDocument();
    expect(screen.getByText('Follow up message')).toBeInTheDocument();
  });

  it('collapses campaign details when clicked again', () => {
    (usePastCampaigns as any).mockReturnValue({
      campaigns: mockCampaigns,
      isLoading: false,
      isFetchingNextPage: false,
      isError: false,
      error: null,
      hasNextPage: true,
      loadMore: vi.fn(),
      pagination: mockPagination
    });
    
    (useSegments as any).mockReturnValue({
      data: mockSegments
    });

    render(<CampaignHistory />);
    
    // First expand
    fireEvent.click(screen.getByText('Past Campaign 1'));
    expect(screen.getByText('Message:')).toBeInTheDocument();
    
    // Then collapse
    fireEvent.click(screen.getByText('Past Campaign 1'));
    
    // Message details should be hidden again
    expect(screen.queryByText('Message:')).not.toBeInTheDocument();
  });

  it('handles campaigns without follow-up messages correctly', () => {
    (usePastCampaigns as any).mockReturnValue({
      campaigns: [mockCampaigns[1]], // Only the campaign without a follow-up
      isLoading: false,
      isFetchingNextPage: false,
      isError: false,
      error: null,
      hasNextPage: false,
      loadMore: vi.fn(),
      pagination: { totalItems: 1 }
    });
    
    (useSegments as any).mockReturnValue({
      data: mockSegments
    });

    render(<CampaignHistory />);
    
    // Expand the campaign
    fireEvent.click(screen.getByText('Past Campaign 2'));
    
    // Should show message field
    expect(screen.getByText('Message:')).toBeInTheDocument();
    expect(screen.getByText('Another message')).toBeInTheDocument();
    
    // Should NOT show follow-up field
    expect(screen.queryByText('Follow-up Message:')).not.toBeInTheDocument();
  });

  it('loads more campaigns when Load More button is clicked', () => {
    const loadMoreMock = vi.fn();
    
    (usePastCampaigns as any).mockReturnValue({
      campaigns: mockCampaigns,
      isLoading: false,
      isFetchingNextPage: false,
      isError: false,
      error: null,
      hasNextPage: true,
      loadMore: loadMoreMock,
      pagination: mockPagination
    });
    
    (useSegments as any).mockReturnValue({
      data: mockSegments
    });

    render(<CampaignHistory />);
    
    // Click Load More button
    fireEvent.click(screen.getByText('Load More'));
    
    // Should call loadMore function
    expect(loadMoreMock).toHaveBeenCalled();
  });

  it('shows loading state when fetching next page', () => {
    (usePastCampaigns as any).mockReturnValue({
      campaigns: mockCampaigns,
      isLoading: false,
      isFetchingNextPage: true, // Loading next page
      isError: false,
      error: null,
      hasNextPage: true,
      loadMore: vi.fn(),
      pagination: mockPagination
    });
    
    (useSegments as any).mockReturnValue({
      data: mockSegments
    });

    render(<CampaignHistory />);
    
    // Should show loading text on button
    expect(screen.getByText('Loading more...')).toBeInTheDocument();
    
    // Button should be disabled
    const loadMoreButton = screen.getByText('Loading more...');
    expect(loadMoreButton).toHaveAttribute('disabled');
  });

  it('handles different segment data structures correctly', () => {
    const complexSegmentCampaign = {
      id: 4,
      title: 'Complex Segments',
      firstMessage: 'Complex segments message',
      secondMessage: null,
      runAt: 1677868800, // March 4, 2023
      delay: 0,
      recipientCount: 5000,
      segments: {
        included: [
          [{ id: 'seg1' }], 
          { id: 'seg2' }, 
          [{ id: 'seg3' }, { id: 'nonexistent' }]
        ]
      }
    };
    
    (usePastCampaigns as any).mockReturnValue({
      campaigns: [complexSegmentCampaign],
      isLoading: false,
      isFetchingNextPage: false,
      isError: false,
      error: null,
      hasNextPage: false,
      loadMore: vi.fn(),
      pagination: { totalItems: 1 }
    });
    
    (useSegments as any).mockReturnValue({
      data: mockSegments
    });

    render(<CampaignHistory />);
    
    // Should show all segment names correctly, including the ID for nonexistent segment
    expect(screen.getByText('Active Users, New Users, Power Users, nonexistent')).toBeInTheDocument();
  });
});
