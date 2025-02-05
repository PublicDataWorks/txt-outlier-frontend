import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import BatchItem from './BatchItem';
import { formatToLocalTime } from '@/lib/date';

const broadcastMock = {
  id: 1,
  firstMessage: 'Hello, this is the first message.',
  secondMessage: 'This is a follow-up message.',
  runAt: 1619827200,
  totalFirstSent: 150,
  totalSecondSent: 75,
  successfullyDelivered: 140,
  failedDelivered: 10,
  totalUnsubscribed: 5,
};

describe('BatchItem', () => {
  it('renders with collapsed content initially', async () => {
    render(<BatchItem broadcast={broadcastMock} />);
    expect(
      screen.queryByText('Hello, this is the first message.'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('This is a follow-up message.'),
    ).not.toBeInTheDocument();
  });

  it('displays formatted date correctly', async () => {
    render(<BatchItem broadcast={broadcastMock} />);
    const formattedDate = formatToLocalTime(
      new Date(broadcastMock.runAt * 1000),
    );
    expect(await screen.findByText(formattedDate)).toBeInTheDocument();
  });

  it('toggles content visibility when clicked', async () => {
    render(<BatchItem broadcast={broadcastMock} />);
    const trigger = await screen.findByRole('button');

    expect(
      screen.queryByText('Hello, this is the first message.'),
    ).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(
      await screen.findByText('Hello, this is the first message.'),
    ).toBeVisible();
    expect(
      await screen.findByText('This is a follow-up message.'),
    ).toBeVisible();

    fireEvent.click(trigger);
    expect(
      screen.queryByText('Hello, this is the first message.'),
    ).not.toBeInTheDocument();
  });

  it('displays correct numbers for recipients, follow-ups, and unsubscribes', async () => {
    render(<BatchItem broadcast={broadcastMock} />);

    fireEvent.click(await screen.findByRole('button'));

    expect(await screen.findByText('Total recipients')).toBeInTheDocument();
    expect(
      await screen.findByText(broadcastMock.totalFirstSent.toString()),
    ).toBeInTheDocument();

    expect(await screen.findByText('Follow-up messages')).toBeInTheDocument();
    expect(
      await screen.findByText(broadcastMock.totalSecondSent.toString()),
    ).toBeInTheDocument();

    expect(await screen.findByText('Unsubscribes')).toBeInTheDocument();
    expect(
      await screen.findByText(broadcastMock.totalUnsubscribed.toString()),
    ).toBeInTheDocument();
  });
});
