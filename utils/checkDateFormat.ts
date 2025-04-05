/* eslint-disable @typescript-eslint/no-explicit-any */
import moment from 'moment';

export default function validateDateFormat(format: string, date: any, momentLib: typeof moment): void {
  if (!(date instanceof Date) && momentLib(date, format, true).format(format) !== date) {
    console.warn(`Wrong formatted date. Expected format: "${format}", received: "${date}"`);
  }
}