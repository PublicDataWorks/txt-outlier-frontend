import { formatInTimeZone } from 'date-fns-tz';

export function formatDateTime(date: Date, userTimeZone: string) {
  return formatInTimeZone(date, userTimeZone, 'EEE MMM dd, h:mm a zzz');
}

export function formatToLocalTime(date: Date) {
  return formatDateTime(
    date,
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
}

export function convertFromET(time: string, userTimeZone: string): string {
  // Parse the ET time and convert it to the user's timezone
  const [hours, minutes] = time.split(':');
  const date = new Date();
  date.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10));

  const userTime = formatInTimeZone(date, userTimeZone, 'HH:mm');
  return `${userTime} ${formatInTimeZone(date, userTimeZone, 'zzz')}`;
}

export function convertToET(time: string): string {
  // Remove timezone suffix if present
  const timeOnly = time.split(' ')[0];
  return `${timeOnly} ET`;
}
