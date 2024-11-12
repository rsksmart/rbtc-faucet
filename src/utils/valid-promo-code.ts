import { getPromoCode } from "./env-util";

type Code = {
  code: string;
  expirationDate: string; // Expected in "YYYY-MM-DD" format
  activationDate: string; // Expected in "YYYY-MM-DD" format
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
export function isCodeActive(code: string): Response {
  const codes: Code[] = getPromoCode();
  const codeData = codes.find((c) => c.code === code);

  if (!codeData) {
    return {
      validCode: false,
      msg: "Code not found",
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
