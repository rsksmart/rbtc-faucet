import { getPromoCode } from "./env-util";
import { formatInTimeZone } from 'date-fns-tz';

type Code = {
  code: string;
  expirationDate: string;
  activationDate: string;
};

type Response = {
  validCode: boolean,
  msg: string
}

function parseDateInTimeZone(dateStr: string): Date {
  const formattedDateStr = formatInTimeZone(`${dateStr}T00:00:00`, 'UTC', 'yyyy-MM-dd HH:mm:ssXXX');
  return new Date(formattedDateStr);
}

function parseDateInTimeZoneEnd(dateStr: string): Date {
  const formattedDateStr = formatInTimeZone(`${dateStr}T23:59:59.999`, 'UTC', 'yyyy-MM-dd HH:mm:ssXXX');
  return new Date(formattedDateStr);
}

function getCurrentDateInZone(): Date {
  const formattedDateStr = formatInTimeZone(new Date(), 'UTC', 'yyyy-MM-dd HH:mm:ssXXX');
  return new Date(formattedDateStr);
}

/**
 * Check if the code is still active based on the start and end dates
 * @param code - The code to check
 * @returns boolean - true if active, false otherwise
 */
export function isCodeActive(code: string): Response {
  const codes: Code[] = getPromoCode();
  const codeData = codes.find(c => c.code === code);

  if (!codeData) {
    return {
      validCode: false,
      msg: 'Code not found'
    };
  }

  const activationDate = parseDateInTimeZone(codeData.activationDate);
  const expirationDate = parseDateInTimeZoneEnd(codeData.expirationDate);

  const currentDateInZone = getCurrentDateInZone();

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
