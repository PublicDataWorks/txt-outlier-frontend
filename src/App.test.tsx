import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import App from './App';

import NextBatchSection from '@/components/NextBatchSection';

// Mock the components and dependencies
vi.mock('@/components/NextBatchSection', () => ({
  default: vi.fn(() => (
    <div data-testid="next-batch-section">NextBatchSection</div>
  )),
}));

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className: string;
  }) => (
    <div data-testid="scroll-area" className={className}>
      {children}
    </div>
  ),
}));

vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: vi.fn(() => null),
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
  });

  it('renders with correct className on ScrollArea', () => {
    render(<App />);
    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toHaveClass(
      'h-screen w-full border-l bg-background dark:bg-[#242424] dark:border-l-neutral-800 dark',
    );
  });

  it('renders NextBatchSection component', () => {
    render(<App />);
    expect(screen.getByTestId('next-batch-section')).toBeInTheDocument();
    expect(NextBatchSection).toHaveBeenCalled();
  });

  it('wraps content in QueryClientProvider', () => {
    const { container } = render(<App />);
    // Check if QueryClientProvider is present by verifying its child components are rendered
    expect(container.firstChild).toBeTruthy();
    expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
  });

  it('applies correct spacing to content wrapper', () => {
    render(<App />);
    const contentWrapper = screen
      .getByTestId('scroll-area')
      .querySelector('.space-y-6.p-4');
    expect(contentWrapper).toBeInTheDocument();
  });
});
