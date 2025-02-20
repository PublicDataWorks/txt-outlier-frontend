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

export function getESTorEDT() {
  const now = new Date();
  const year = now.getFullYear();

  // Calculate the start of daylight saving time: second Sunday in March
  const startDST = new Date(year, 2, 1); // March 1st
  const startDay = startDST.getDay();
  startDST.setDate(8 + (7 - startDay) % 7); // Move to second Sunday

  // Calculate the end of daylight saving time: first Sunday in November
  const endDST = new Date(year, 10, 1); // November 1st
  const endDay = endDST.getDay();
  endDST.setDate(1 + (7 - endDay) % 7); // Move to first Sunday

  if (now >= startDST && now < endDST) {
    return 'EDT';
  }

  return 'EST';
}
