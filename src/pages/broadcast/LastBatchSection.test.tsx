import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import LastBatchSection from './LastBatchSection';

import { useBroadcastsQuery } from '@/hooks/useBroadcastsQuery';
import { formatDateTime } from '@/lib/date';

vi.mock('@/hooks/useBroadcastsQuery', () => ({
  useBroadcastsQuery: vi.fn(),
}));

describe('LastBatchSection', () => {
  it('renders loading state', async () => {
    (useBroadcastsQuery as any).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    });

    render(<LastBatchSection />);

    expect(await screen.findByText(/Last batch/i)).toBeInTheDocument();
    expect(await screen.findByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders error state (returns null)', () => {
    (useBroadcastsQuery as any).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    });

    const { container } = render(<LastBatchSection />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders last batch data correctly', async () => {
    const mockData = {
      past: [
        {
          id: 1,
          firstMessage: 'Message 1',
          secondMessage: 'Follow-up 1',
          runAt: 1619827200,
          totalFirstSent: 100,
          totalSecondSent: 50,
          totalReplies: 15,
          failedDelivered: 5,
          totalUnsubscribed: 10,
        },
      ],
    };

    (useBroadcastsQuery as any).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    render(<LastBatchSection />);

    // Check title
    expect(await screen.findByText(/Last batch/i)).toBeInTheDocument();

    // Check date
    const dateString = formatDateTime(
      new Date(mockData.past[0].runAt * 1000),
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
    expect(await screen.findByText(`Sent on ${dateString}`)).toBeInTheDocument();

    // Check message counts
    expect(await screen.findByText('Conversation starters sent')).toBeInTheDocument();
    expect(await screen.findByText('100')).toBeInTheDocument();
    expect(await screen.findByText('Follow-up messages sent')).toBeInTheDocument();
    expect(await screen.findByText('50')).toBeInTheDocument();

    expect(await screen.findByText('Responded')).toBeInTheDocument();
    expect(await screen.findByText('15')).toBeInTheDocument();
    expect(await screen.findByText('Failed to deliver')).toBeInTheDocument();
    expect(await screen.findByText('5')).toBeInTheDocument();
    expect(await screen.findByText('Unsubscribes')).toBeInTheDocument();
    expect(await screen.findByText('10')).toBeInTheDocument();
  });

  it('formats large numbers with commas', async () => {
    const mockData = {
      past: [
        {
          id: 1,
          runAt: 1619827200,
          totalFirstSent: 1000000,
          totalSecondSent: 500000,
          totalReplies: 150000,
          failedDelivered: 50000,
          totalUnsubscribed: 10000,
        },
      ],
    };

    (useBroadcastsQuery as any).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    render(<LastBatchSection />);

    expect(await screen.findByText('1,000,000')).toBeInTheDocument();
    expect(await screen.findByText('500,000')).toBeInTheDocument();
    expect(await screen.findByText('150,000')).toBeInTheDocument();
    expect(await screen.findByText('50,000')).toBeInTheDocument();
    expect(await screen.findByText('10,000')).toBeInTheDocument();
  });
});
