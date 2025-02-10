import { describe, it, expect } from 'vitest';

import { getSendNowError } from '@/lib/send-now-error';

describe('getSendNowError', () => {
  it('should return internal server error message for error code "0"', () => {
    const result = getSendNowError('0');
    expect(result).toBe('Internal Server Error, could not broadcast. Please contact admin.');
  });

  it('should return pending broadcast message for error code "1"', () => {
    const result = getSendNowError('1');
    expect(result).toBe(
      'There is already a pending broadcast scheduled to run within the next 30 minutes. ' +
      'Please wait until until it finished or edit broadcast time.'
    );
  });

  it('should return broadcast in progress message for error code "2"', () => {
    const result = getSendNowError('2');
    expect(result).toBe('There is already a broadcast in progress, please wait.');
  });

  it('should return default error message for unknown error code', () => {
    const result = getSendNowError('999');
    expect(result).toBe('An unexpected error occurred, please contact admin.');
  });

  it('should return default error message for empty error code', () => {
    const result = getSendNowError('');
    expect(result).toBe('An unexpected error occurred, please contact admin.');
  });
});
