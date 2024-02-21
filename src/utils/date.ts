import { differenceInMinutes, addMinutes } from 'date-fns'
import { format } from 'date-fns-tz'

const formatFn = (unixTimestamp: number): string => {
  const date = new Date(unixTimestamp * 1000)
  return format(date, 'EEE MMM d, h:mm a zzz')
}

const formatDate = (date: Date): string => format(date, 'yyyy/MM/dd')

const diffInMinutes = (runAt: number) => {
  const runAtDate = new Date(runAt * 1000)
  const now = new Date()
  return differenceInMinutes(runAtDate, now)
}

const advance = (noMinutes: number) => {
  const date = addMinutes(new Date(), noMinutes)
  return format(date, 'EEE MMM d, h:mm a z')
}

export default {
  format: formatFn,
  diffInMinutes,
  advance,
  formatDate
}
