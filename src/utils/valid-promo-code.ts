'use server'

import { getPromoCode } from "./env-util";
import { formatInTimeZone, toDate, toZonedTime } from 'date-fns-tz';

type Code = {
  code: string;
  duration: string;
  activationDate: string;
  timeZone: string
};

type Response = {
  validCode: boolean,
  msg: string
}

function parseDateInTimeZone(dateStr: string, timeZone: string): Date {
  const date = toDate(`${dateStr}T00:00:00Z`);
  return toZonedTime(date, timeZone);
}

function calculateExpirationDate(activationDate: Date, duration: string, timeZone: string): Date {
  const days = parseInt(duration.replace("d", ""), 10);
  const expirationDate = new Date(activationDate);
  expirationDate.setDate(expirationDate.getDate() + days);
  return toZonedTime(expirationDate, timeZone); // Converts the resulting date to the time zone code
}

/**
 * Check if the code is still active based on the days limit
 * @param code - The code to check
 * @returns boolean - true if active, false otherwise
 */
export async function isCodeActive(code: string): Promise<Response> {
  const codes: Code[] = getPromoCode();
  const codeData = codes.find(c => c.code === code);

  if (!codeData) {
    return {
      validCode: false,
      msg: 'Code not found'
    };
  }

  const activationDate = parseDateInTimeZone(codeData.activationDate, codeData.timeZone);
  const expirationDate = calculateExpirationDate(activationDate, codeData.duration, codeData.timeZone);

  const currentDateInZone = new Date(formatInTimeZone(new Date(), codeData.timeZone, 'yyyy-MM-dd HH:mm:ssXXX'));

  if (currentDateInZone < activationDate) {
    return {
      validCode: false,
      msg: 'Code is not active yet',
    };
  }

  const validDate = currentDateInZone <= expirationDate;

  return {
    validCode: validDate,
    msg: validDate ? 'Code is active' : 'Code has expired'
  }
}