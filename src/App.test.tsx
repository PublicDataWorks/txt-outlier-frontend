import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import App from './App';

describe('Root app', () => {
  it('should show button', async () => {
    render(<App />);

    expect(await screen.findByRole('button')).toBeInTheDocument();
  });
});
