import { describe, it, expect } from 'vitest';

import { convertScheduleSettingsToBackend, convertScheduleSettingsToFrontend } from './broadcast-settings';

describe('convertScheduleSettingsToFrontend', () => {
  it('converts the data correctly with null fields have enabled set to false and default time set to 9:00', () => {
    const backendData = {
      schedule: {
        mon: null,
        tue: '9:00',
        wed: '12:00',
        thu: '15:00',
        fri: '9:00',
        sat: null,
        sun: null,
      },
      batchSize: 200
    };

    expect(convertScheduleSettingsToFrontend(backendData)).toEqual({
      schedule: {
        Su: { enabled: false, time: '9:00' },
        Mo: { enabled: false, time: '9:00' },
        Tu: { enabled: true, time: '9:00' },
        We: { enabled: true, time: '12:00' },
        Th: { enabled: true, time: '15:00' },
        Fr: { enabled: true, time: '9:00' },
        Sa: { enabled: false, time: '9:00' },
      },
      batchSize: 200
    });
  });
});


describe('convertScheduleSettingsToBackeend', () => {
  it('converts the data correctly with enabled falsed field converted to nulls', () => {
    const frontendData = {
      schedule: {
        Su: { enabled: false, time: '9:00' },
        Mo: { enabled: false, time: '9:00' },
        Tu: { enabled: true, time: '9:00' },
        We: { enabled: true, time: '12:00' },
        Th: { enabled: true, time: '15:00' },
        Fr: { enabled: true, time: '9:00' },
        Sa: { enabled: false, time: '9:00' },
      },
      batchSize: 200
    };

    expect(convertScheduleSettingsToBackend(frontendData)).toEqual(
      {
        schedule: {
          mon: null,
          tue: '9:00',
          wed: '12:00',
          thu: '15:00',
          fri: '9:00',
          sat: null,
          sun: null,
        },
        batchSize: 200
      });
  });
});

