import { format } from 'date-fns'

function formatUnixTimestamp(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000)
  return format(date, 'MMM d, yyyy')
}

export {
  // eslint-disable-next-line import/prefer-default-export
  formatUnixTimestamp
}
