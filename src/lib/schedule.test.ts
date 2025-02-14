import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { convertScheduleToLocal } from './schedule';

import { Schedule } from '@/components/SettingsModal';

describe('Schedule Conversion Functions', () => {
    describe('convertScheduleToLocal', () => {
        it('should convert UTC times to local times correctly', () => {
            const schedule: Schedule = {
                mon: '10:30',
                tue: null,
                wed: '11:15',
                thu: null,
                fri: null,
                sat: '09:00',
                sun: '10:00',
            };
            const timeZone = 'Asia/Saigon';

            const localSchedule = convertScheduleToLocal(schedule, timeZone);

            const expectedLocalSchedule: Schedule = {
                mon: '17:30',
                tue: null,
                wed: '18:15',
                thu: null,
                fri: null,
                sat: '16:00',
                sun: '17:00',
            };

            expect(localSchedule).toEqual(expectedLocalSchedule);
        });

        it('should take into account for shifting in day', () => {
            const schedule: Schedule = {
                mon: '21:30',
                tue: null,
                wed: null,
                thu: null,
                fri: null,
                sat: null,
                sun: '22:15',
            };
            const timeZone = 'Asia/Saigon';

            const localSchedule = convertScheduleToLocal(schedule, timeZone);

            const expectedLocalSchedule: Schedule = {
                mon: '05:15',
                tue: '04:30',
                wed: null,
                thu: null,
                fri: null,
                sat: null,
                sun: null,
            };

            expect(localSchedule).toEqual(expectedLocalSchedule);
        });

        it('should fill up shifted day with null values', () => {
            const schedule: Schedule = {
                mon: '21:30',
                tue: null,
                wed: null,
                thu: null,
                fri: null,
                sat: null,
                sun: null,
            };
            const timeZone = 'Asia/Saigon';

            const localSchedule = convertScheduleToLocal(schedule, timeZone);

            const expectedLocalSchedule: Schedule = {
                mon: null,
                tue: '04:30',
                wed: null,
                thu: null,
                fri: null,
                sat: null,
                sun: null,
            };

            expect(localSchedule).toEqual(expectedLocalSchedule);
        });

        describe('DST in America/New_York', () => {
            describe('During standard time', () => {
                beforeEach(() => {
                    // Set system time to January 15, 2024 (during standard time)
                    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
                });

                afterEach(() => {
                    vi.useRealTimers();
                });

                it('should convert UTC times to EST (UTC-5) correctly', () => {
                    const schedule: Schedule = {
                        mon: '10:00',
                        tue: '12:30',
                        wed: '15:45',
                        thu: null,
                        fri: '23:15',
                        sat: null,
                        sun: '22:30',
                    };
                    const timeZone = 'America/New_York';

                    const localSchedule = convertScheduleToLocal(schedule, timeZone);

                    const expectedLocalSchedule: Schedule = {
                        mon: '05:00',
                        tue: '07:30',
                        wed: '10:45',
                        thu: null,
                        fri: '18:15',
                        sat: null,
                        sun: '17:30',
                    };

                    expect(localSchedule).toEqual(expectedLocalSchedule);
                });

                it('should handle day shifting during standard time', () => {
                    const schedule: Schedule = {
                        mon: '02:00',
                        tue: null,
                        wed: '01:30',
                        thu: null,
                        fri: null,
                        sat: null,
                        sun: '03:15',
                    };
                    const timeZone = 'America/New_York';

                    const localSchedule = convertScheduleToLocal(schedule, timeZone);

                    const expectedLocalSchedule: Schedule = {
                        mon: null,
                        tue: '20:30',
                        wed: null,
                        thu: null,
                        fri: null,
                        sat: '22:15',
                        sun: '21:00',
                    };

                    expect(localSchedule).toEqual(expectedLocalSchedule);
                });
            });

            describe('During the time when DST is activated', () => {
                beforeEach(() => {
                    // Set system time to July 15, 2024 (during DST)
                    vi.setSystemTime(new Date('2024-07-15T12:00:00Z'));
                });

                afterEach(() => {
                    vi.useRealTimers();
                });

                it('should convert UTC times to EDT (UTC-4) correctly', () => {
                    const schedule: Schedule = {
                        mon: '10:00',
                        tue: '12:30',
                        wed: '15:45',
                        thu: null,
                        fri: '23:15',
                        sat: null,
                        sun: '22:30',
                    };
                    const timeZone = 'America/New_York';

                    const localSchedule = convertScheduleToLocal(schedule, timeZone);

                    const expectedLocalSchedule: Schedule = {
                        mon: '06:00',
                        tue: '08:30',
                        wed: '11:45',
                        thu: null,
                        fri: '19:15',
                        sat: null,
                        sun: '18:30',
                    };

                    expect(localSchedule).toEqual(expectedLocalSchedule);
                });

                it('should handle day shifting during DST', () => {
                    const schedule: Schedule = {
                        mon: '02:00',
                        tue: null,
                        wed: '01:30',
                        thu: null,
                        fri: null,
                        sat: null,
                        sun: '03:15',
                    };
                    const timeZone = 'America/New_York';

                    const localSchedule = convertScheduleToLocal(schedule, timeZone);

                    const expectedLocalSchedule: Schedule = {
                        mon: null,
                        tue: '21:30',
                        wed: null,
                        thu: null,
                        fri: null,
                        sat: '23:15',
                        sun: '22:00',
                    };

                    expect(localSchedule).toEqual(expectedLocalSchedule);
                });
            });
        });

        describe("Collapsed data from the backend", () => {
            describe("Data translated to the same day twice", () => {
               it('chooses the latter value', () => {
                   const schedule: Schedule = {
                       mon: '22:30', // translated into tuesday 5:30
                       tue: '10:00', // translated into tuesday 17:00
                       wed: null,
                       thu: null,
                       fri: null,
                       sat: null,
                       sun: null,
                   };
                   const timeZone = 'Asia/Saigon';

                   const localSchedule = convertScheduleToLocal(schedule, timeZone);

                   const expectedLocalSchedule: Schedule = {
                       mon: null,
                       tue: '17:00', // Chose the latter value
                       wed: null,
                       thu: null,
                       fri: null,
                       sat: null,
                       sun: null,
                   };

                   expect(localSchedule).toEqual(expectedLocalSchedule);
               })
            })
        })
    });
});
