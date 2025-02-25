import { describe, it, expect, vi } from 'vitest';

import { formatDateTime, getESTorEDT } from '@/lib/date';

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

    // In JST (UTC+9), 15:30 UTC = 12:30 AM GMT+9
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

  it('should format date correctly for Saigon timezone', () => {
    const testDate = new Date('2023-12-25T15:30:00Z');
    const result = formatDateTime(testDate, 'Asia/Saigon');

    // In (UTC+7), 15:30 UTC = 22:30 GMT+7 (same day)
    expect(result).toBe('Mon Dec 25, 10:30 PM GMT+7');
  });
});

describe('getESTorEDT', () => {
  it('should return EDT during daylight saving time', () => {
    // Freeze time to a date during daylight saving time
    const marchDate = new Date('2023-06-15T12:00:00Z'); // June 15, 2023, is during EDT
    vi.setSystemTime(marchDate);

    const result = getESTorEDT();
    expect(result).toBe('EDT');

    // Restore the system time
    vi.useRealTimers();
  });

  it('should return EST outside of daylight saving time', () => {
    // Freeze time to a date outside of daylight saving time
    const decemberDate = new Date('2023-12-15T12:00:00Z'); // December 15, 2023, is during EST
    vi.setSystemTime(decemberDate);

    const result = getESTorEDT();
    expect(result).toBe('EST');

    // Restore the system time
    vi.useRealTimers();
  });

  it('should return EDT on the day daylight saving time starts', () => {
    // Freeze time to the exact moment of DST start
    const dstStart = new Date('2023-03-12T07:00:00Z'); // DST starts on March 12, 2023, 2:00 AM local time
    vi.setSystemTime(dstStart);

    const result = getESTorEDT();
    expect(result).toBe('EDT');

    // Restore the system time
    vi.useRealTimers();
  });

  it('should return EST on the day daylight saving time ends', () => {
    // Freeze time to the exact moment of DST end
    const dstEnd = new Date('2023-11-05T06:00:00Z'); // DST ends on November 5, 2023, 2:00 AM local time
    vi.setSystemTime(dstEnd);

    const result = getESTorEDT();
    expect(result).toBe('EST');

    // Restore the system time
    vi.useRealTimers();
  });
});
