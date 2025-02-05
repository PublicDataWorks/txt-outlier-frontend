import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import PastBroadcastsSection from './PastBroadcastsSection';

import { usePastBroadcastsQuery } from '@/hooks/useBroadcastsQuery';
import { formatToLocalTime } from '@/lib/date';

vi.mock('@/hooks/useBroadcastsQuery', () => ({
  usePastBroadcastsQuery: vi.fn(),
}));

describe('PastBroadcastsSection', () => {
  it('renders error state', () => {
    (usePastBroadcastsQuery as any).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    render(<PastBroadcastsSection />);

    expect(
      screen.queryByRole('heading', { name: /Past broadcasts/i }),
    ).not.toBeInTheDocument();
  });

  it('renders past broadcasts and handles pagination', async () => {
    const mockData = {
      pages: [
        {
          past: [
            {
              id: 1,
              firstMessage: 'Message 1',
              secondMessage: 'Follow-up 1',
              runAt: 1619827200,
              totalFirstSent: 100,
              totalSecondSent: 50,
              successfullyDelivered: 95,
              failedDelivered: 5,
              totalUnsubscribed: 10,
            },
          ],
        },
        {
          past: [
            {
              id: 2,
              firstMessage: 'Message 2',
              secondMessage: 'Follow-up 2',
              runAt: 1639827200,
              totalFirstSent: 150,
              totalSecondSent: 75,
              successfullyDelivered: 140,
              failedDelivered: 10,
              totalUnsubscribed: 20,
            },
          ],
        },
      ],
    };
    const fetchNextPageMock = vi.fn();

    (usePastBroadcastsQuery as any).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
      fetchNextPage: fetchNextPageMock,
      hasNextPage: true,
      isFetchingNextPage: false,
    });

    render(<PastBroadcastsSection />);

    expect(
      screen.getByText(
        formatToLocalTime(new Date(mockData.pages[0].past[0].runAt * 1000)),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        formatToLocalTime(new Date(mockData.pages[1].past[0].runAt * 1000)),
      ),
    ).toBeInTheDocument();

    const showMoreButton = screen.getByRole('button', { name: /Show more/i });
    expect(showMoreButton).toBeInTheDocument();

    fireEvent.click(showMoreButton);
    expect(fetchNextPageMock).toHaveBeenCalled();
  });
});
