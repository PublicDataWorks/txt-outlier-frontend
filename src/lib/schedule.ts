import { Schedule } from '@/components/SettingsModal';

type DateDate = {
    time: string | null,
    weekday: string,
}

const weekdays = {
    'sun': 0,
    'mon': 1,
    'tue': 2,
    'wed': 3,
    'thu': 4,
    'fri': 5,
    'sat': 6
} as const;

function dayToOffset(day: string): number {
    return weekdays[day as keyof typeof weekdays];
}

const convertToLocalTime = (time: string | null, dayOffset: number, timeZone: string): DateDate | null => {
    if (!time) return null;

    const [hours, minutes] = time.split(':').map(Number);

    const now = new Date();

    const currentDayOfWeek = now.getUTCDay();
    const daysToTargetDay = (currentDayOfWeek + 7 - dayOffset) % 7;

    const targetDate = new Date(now);
    targetDate.setUTCDate(now.getUTCDate() - daysToTargetDay);
    targetDate.setUTCHours(hours, minutes, 0, 0);

    const getTimeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone,
    };
    const getWeekdayOptions: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        timeZone,
    };

    return {
        time: new Intl.DateTimeFormat('en-US', getTimeOptions).format(targetDate),
        weekday: new Intl.DateTimeFormat('en-US', getWeekdayOptions).format(targetDate).toLowerCase(),
    };
};

export function convertScheduleToLocal(schedule: Schedule, timeZone: string): Schedule {
    const newSchedule: Schedule = {};

    Object.entries(schedule).forEach(([weekday, time]) => {
        const newDate = convertToLocalTime(time, dayToOffset(weekday), timeZone);
        if (newDate !== null) {
            // TODO: If there's already another value on this cell, it should be a sign of a corrupted data
            newSchedule[newDate.weekday] = newDate.time;
        }
    });

    for (const weekday of ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']) {
        if (!(weekday in newSchedule)) {
            newSchedule[weekday] = null;
        }
    }


    return newSchedule;
}

