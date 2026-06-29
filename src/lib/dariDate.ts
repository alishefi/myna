// Afghan Dari date formatting for plain Gregorian timestamps (history rows,
// "this week" strips, etc.) that should read in Dari without switching the
// underlying calendar system to Jalali (unlike the full Calendar screen).
// Weekday names are calendar-agnostic (Saturday is "شنبه" whether you're
// counting in Gregorian or Jalali), so they're reused as-is from jalali.ts.
import { jalaliWeekdayShortDa, jalaliWeekdayFullDa } from "./jalali"

const GREGORIAN_MONTHS_DA = [
  "جنوری",
  "فبروری",
  "مارچ",
  "اپریل",
  "می",
  "جون",
  "جولای",
  "اگست",
  "سپتمبر",
  "اکتوبر",
  "نومبر",
  "دسمبر",
]

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function toDate(date: Date | number): Date {
  return date instanceof Date ? date : new Date(date)
}

export function weekdayShortDa(date: Date | number): string {
  const d = toDate(date)
  return jalaliWeekdayShortDa[(d.getDay() + 1) % 7]
}

export function weekdayFullDa(date: Date | number): string {
  const d = toDate(date)
  return jalaliWeekdayFullDa[(d.getDay() + 1) % 7]
}

export function monthShortDa(date: Date | number): string {
  return GREGORIAN_MONTHS_DA[toDate(date).getMonth()]
}

export function formatMonthDayDa(date: Date | number): string {
  const d = toDate(date)
  return `${monthShortDa(d)} ${d.getDate()}`
}

export function formatMonthDayYearDa(date: Date | number): string {
  const d = toDate(date)
  return `${monthShortDa(d)} ${d.getDate()}, ${d.getFullYear()}`
}

export function formatHistoryTimestampDa(date: Date | number): string {
  const d = toDate(date)
  return `${weekdayShortDa(d)}، ${monthShortDa(d)} ${d.getDate()} · ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}
