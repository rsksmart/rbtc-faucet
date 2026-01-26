'use server'

import { loadFaucetHistory } from "@/app/lib/faucetHistory";
import { getServerEnv } from "@/constants";
const serverEnv = getServerEnv();
export type Code = {
  code: string;
  expirationDate: string; // Expected in "YYYY-MM-DD" format
  activationDate: string; // Expected in "YYYY-MM-DD" format
  maxDispensableRBTC: number
};

type Response = {
  validCode: boolean;
  msg: string;
};


/**
 * Check if the code is still active based on the start and end dates
 * @param code - The code to check
 * @returns Response - Object containing the validity of the code and a message
 */
export async function isCodeActive(code: string): Promise<Response> {
  const codes: Code[] = serverEnv.PROMO_CODE;
  const codeData = codes.find((c) => c.code === code);

  if (!codeData) {
    return {
      validCode: false,
      msg: "Code not found",
    };
  }

  if (!promoCodeHasRemainingRBTCAllowance(codeData)) {
    return {
      validCode: false,
      msg: "This promo code has reached its maximum usage limit and is no longer available.",
    };
  }

  const today = new Date().toISOString().split("T")[0]; // Format "YYYY-MM-DD"
  const { activationDate, expirationDate } = codeData;

  if (today < activationDate) {
    return {
      validCode: false,
      msg: "Code is not active yet",
    };
  }

  const validDate = today <= expirationDate;

  return {
    validCode: validDate,
    msg: validDate ? "Code is active" : "Code has expired",
  };
}

const promoCodeHasRemainingRBTCAllowance = (code: Code) => {
  const faucetHistory = loadFaucetHistory();
  const PROMO_VALUE_TO_DISPENSE = serverEnv.PROMO_VALUE_TO_DISPENSE;
  const usedCode = Object.keys(faucetHistory).filter((key) => faucetHistory[key].promoCode === code.code);
  const amountDispensed = usedCode.length * PROMO_VALUE_TO_DISPENSE;
  return amountDispensed < code.maxDispensableRBTC;
};