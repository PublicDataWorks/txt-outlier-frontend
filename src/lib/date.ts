import { formatInTimeZone } from 'date-fns-tz';

export function formatDateTime(date: Date, userTimeZone: string) {
  return formatInTimeZone(date, userTimeZone, 'EEE MMM dd, h:mm a zzz');
}

export function formatToLocalTime(date: Date) {
  return formatDateTime(
    date,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
}

