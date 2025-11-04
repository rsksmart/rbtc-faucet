// src/env.ts
import Joi from 'joi';
import { isValidAddress } from '@rsksmart/rsk-utils';

// 1) Server schema
const serverSchema = Joi.object({
  RSK_NODE: Joi.string()
    .uri()
    .required(),
  GOOGLE_CAPTCHA_URL: Joi.string()
    .uri()
    .required(),
  SECRET_VERIFY_CAPTCHA: Joi.string()
    .required(),
  FAUCET_ADDRESS: Joi.string()
    .custom((v, h) => {
    if (!isValidAddress(v, 'rsk')) return h.error('any.invalid');
      return v;
    }).required()
    .messages({ 'any.invalid': 'FAUCET_ADDRESS must be a valid address' }),

  FAUCET_PRIVATE_KEY: Joi.string()
    .required(),

  GAS_PRICE: Joi.number()
    .positive()
    .required(),

  GAS_LIMIT: Joi.number().positive().required(),
  VALUE_TO_DISPENSE: Joi.number().positive().required(),
  PROMO_VALUE_TO_DISPENSE: Joi.number().positive().required(),
  FILTER_BY_IP: Joi.boolean().default(false),
  TIMER_LIMIT: Joi.number().positive().required(),

  // PROMO_CODE can come as string JSON or array
  PROMO_CODE: Joi.alternatives().try(
    Joi.string().custom((v, h) => {
      try { return JSON.parse(v || '[]'); } catch { return h.error('any.invalid'); }
    }),
    Joi.array().items(Joi.object({
      code: Joi.string().required(),
      activationDate: Joi.string().required(),
      expirationDate: Joi.string().required(),
      maxDispensableRBTC: Joi.number().positive().required(),
    }))
  ).default([]),
}).unknown(true);

// 2) Public schema
const publicSchema = Joi.object({
  SITE_KEY_CAPTCHA: Joi.string().required(),
  TAG_MANAGER_ID: Joi.string().required(),
}).unknown(true);

// 3) Validation with automatic conversion
function validateEnv<T>(schema: Joi.ObjectSchema, env: any): T {
  const { error, value } =  schema.validate(env, { abortEarly: false, convert: true });
  if (error) {
    const details = error.details.map(d => `• ${d.message}`).join('\n');
    throw new Error(`❌ Invalid env:\n${details}`);
  }
  return value as T;
}

// 4) Access helpers (avoid using secrets in client)
export function getServerEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('Server env is not available in the browser');
  }
  return validateEnv<{
    RSK_NODE: string;
    GOOGLE_CAPTCHA_URL: string;
    SECRET_VERIFY_CAPTCHA: string;
    FAUCET_ADDRESS: string;
    FAUCET_PRIVATE_KEY: string;
    GAS_PRICE: number;
    GAS_LIMIT: number;
    VALUE_TO_DISPENSE: number;
    PROMO_VALUE_TO_DISPENSE: number;
    FILTER_BY_IP: boolean;
    TIMER_LIMIT: number;
    PROMO_CODE: Array<{
      code: string; activationDate: string; expirationDate: string; maxDispensableRBTC: number;
    }>;
  }>(serverSchema, process.env);
}

export function getPublicEnv() {
  const SITE_KEY_CAPTCHA = process.env.NEXT_PUBLIC_SITE_KEY_CAPTCHA;
  const TAG_MANAGER_ID = process.env.NEXT_PUBLIC_TAG_MANAGER_ID;
  return validateEnv<{
    SITE_KEY_CAPTCHA: string;
    TAG_MANAGER_ID: string;
  }>(publicSchema, { SITE_KEY_CAPTCHA, TAG_MANAGER_ID });
}
