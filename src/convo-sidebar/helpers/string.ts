const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export { EMAIL_REGEX, capitalize }
