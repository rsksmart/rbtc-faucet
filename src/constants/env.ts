export function getServerEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('Server env is not available in the browser');
  }

  let promoCode: Array<{
    code: string; activationDate: string; expirationDate: string; maxDispensableRBTC: number;
  }> = [];
  try {
    promoCode = JSON.parse(process.env.PROMO_CODE || '[]');
  } catch {
    promoCode = [];
  }

  return {
    RSK_NODE: process.env.RSK_NODE as string,
    GOOGLE_CAPTCHA_URL: process.env.GOOGLE_CAPTCHA_URL as string,
    SECRET_VERIFY_CAPTCHA: process.env.SECRET_VERIFY_CAPTCHA as string,
    FAUCET_ADDRESS: process.env.FAUCET_ADDRESS as string,
    FAUCET_PRIVATE_KEY: process.env.FAUCET_PRIVATE_KEY as string,
    GAS_PRICE: Number(process.env.GAS_PRICE),
    GAS_LIMIT: Number(process.env.GAS_LIMIT),
    VALUE_TO_DISPENSE: Number(process.env.VALUE_TO_DISPENSE),
    PROMO_VALUE_TO_DISPENSE: Number(process.env.PROMO_VALUE_TO_DISPENSE),
    FILTER_BY_IP: process.env.FILTER_BY_IP === 'true',
    FILTER_BY_BALANCE: process.env.FILTER_BY_BALANCE === 'true',
    MAX_RECEIVER_BALANCE: Number(process.env.MAX_RECEIVER_BALANCE ?? '0.1'),
    TIMER_LIMIT: Number(process.env.TIMER_LIMIT),
    PROMO_CODE: promoCode,
  };
}

export function getPublicEnv() {
  return {
    SITE_KEY_CAPTCHA: process.env.NEXT_PUBLIC_SITE_KEY_CAPTCHA as string,
    TAG_MANAGER_ID: process.env.NEXT_PUBLIC_TAG_MANAGER_ID as string,
  };
}
