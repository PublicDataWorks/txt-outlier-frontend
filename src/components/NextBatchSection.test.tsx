import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import NextBatchSection from './NextBatchSection';

import { useBroadcastsQuery } from '@/hooks/useBroadcastsQuery';

// Mock the hooks and components
vi.mock('@/hooks/useBroadcastsQuery');
vi.mock('@/components/BroadcastCard', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="broadcast-card">{children}</div>
  ),
}));

// Mock the date formatter
vi.mock('@/lib/date', () => ({
  formatDateTime: vi.fn().mockReturnValue('Mocked DateTime'),
}));

describe('NextBatchSection', () => {
  const mockBroadcastData = {
    upcoming: {
      runAt: 1706000000,
      noRecipients: 100,
      firstMessage: 'First test message',
      secondMessage: 'Second test message',
    },
  };

  it('renders loading skeleton when data is loading', () => {
    vi.mocked(useBroadcastsQuery).mockReturnValue({
      isLoading: true,
      data: null,
    } as any);

    render(<NextBatchSection />);

    expect(screen.getByTestId('broadcast-card')).toBeInTheDocument();
    expect(screen.getAllByRole('status')).toHaveLength(3); // Three skeletons
  });

  it('renders broadcast information when data is loaded', () => {
    vi.mocked(useBroadcastsQuery).mockReturnValue({
      isLoading: false,
      data: mockBroadcastData,
    } as any);

    render(<NextBatchSection />);

    // Check if scheduled time is rendered
    expect(screen.getByText(/Scheduled for/)).toBeInTheDocument();

    // Check if recipients count is rendered
    expect(screen.getByText('100 recipients')).toBeInTheDocument();

    // Check if buttons are rendered
    expect(screen.getByText('Reschedule')).toBeInTheDocument();
    expect(screen.getByText('Send now')).toBeInTheDocument();

    // Check if messages are rendered
    expect(screen.getByText('First test message')).toBeInTheDocument();
    expect(screen.getByText('Second test message')).toBeInTheDocument();
  });

  it('displays correct message labels', () => {
    vi.mocked(useBroadcastsQuery).mockReturnValue({
      isLoading: false,
      data: mockBroadcastData,
    } as any);

    render(<NextBatchSection />);

    expect(
      screen.getByText('Conversation starter message'),
    ).toBeInTheDocument();
    expect(screen.getByText('Follow-up message')).toBeInTheDocument();
  });
});
