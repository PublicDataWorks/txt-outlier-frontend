import { describe, it, expect } from 'vitest';

import { formatDateTime } from '@/lib/date';

describe('formatDateTime', () => {
  it('should format date correctly for EST timezone', () => {
    const testDate = new Date('2023-12-25T15:30:00Z'); // Monday, December 25, 2023, 15:30 UTC
    const result = formatDateTime(testDate, 'America/New_York');

    // In EST (UTC-5), 15:30 UTC = 10:30 EST
    expect(result).toBe('Mon Dec 25, 10:30 AM EST');
  });

  it('should format date correctly for PST timezone', () => {
    const testDate = new Date('2023-12-25T15:30:00Z');
    const result = formatDateTime(testDate, 'America/Los_Angeles');

    // In PST (UTC-8), 15:30 UTC = 7:30 PST
    expect(result).toBe('Mon Dec 25, 7:30 AM PST');
  });

  it('should format date correctly for JST timezone', () => {
    const testDate = new Date('2023-12-25T15:30:00Z');
    const result = formatDateTime(testDate, 'Asia/Tokyo');

    // In JST (UTC+9), 15:30 UTC = 00:30 JST (next day)
    expect(result).toBe('Tue Dec 26, 12:30 AM GMT+9');
  });

  it('should handle PM times correctly', () => {
    const testDate = new Date('2023-12-25T23:30:00Z');
    const result = formatDateTime(testDate, 'America/New_York');

    // In EST, 23:30 UTC = 18:30 EST
    expect(result).toBe('Mon Dec 25, 6:30 PM EST');
  });

  it('should handle date transition at timezone boundary', () => {
    const testDate = new Date('2023-12-25T04:30:00Z');
    const result = formatDateTime(testDate, 'Asia/Tokyo');

    // In JST, 04:30 UTC = 13:30 JST
    expect(result).toBe('Mon Dec 25, 1:30 PM GMT+9');
  });
});
