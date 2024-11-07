'use server'

import { getPromoCode } from "./env-util";
import { formatInTimeZone } from 'date-fns-tz';

type Code = {
  code: string;
  expirationDate: string;
  activationDate: string;
  timeZone: string;
};

type Response = {
  validCode: boolean,
  msg: string
}

function parseDateInTimeZone(dateStr: string, timeZone: string): Date {
  const formattedDateStr = formatInTimeZone(`${dateStr}T00:00:00`, timeZone, 'yyyy-MM-dd HH:mm:ssXXX');
  return new Date(formattedDateStr);
}

function parseDateInTimeZoneEnd(dateStr: string, timeZone: string): Date {
  const formattedDateStr = formatInTimeZone(`${dateStr}T23:59:59.999`, timeZone, 'yyyy-MM-dd HH:mm:ssXXX');
  return new Date(formattedDateStr);
}

function getCurrentDateInZone(timeZone: string): Date {
  const formattedDateStr = formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd HH:mm:ssXXX');
  return new Date(formattedDateStr);
}

/**
 * Check if the code is still active based on the start and end dates
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
  const expirationDate = parseDateInTimeZoneEnd(codeData.expirationDate, codeData.timeZone);

  const currentDateInZone = getCurrentDateInZone(codeData.timeZone);

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
  };
}
