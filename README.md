[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/rsksmart/rbtc-faucet/badge)](https://scorecard.dev/viewer/?uri=github.com/rsksmart/rbtc-faucet)
[![CodeQL](https://github.com/rsksmart/rbtc-faucet/workflows/CodeQL/badge.svg)](https://github.com/rsksmart/rbtc-faucet/actions?query=workflow%3ACodeQL)
<img src="rootstock-logo.png" alt="RSK Logo" style="width:100%; height: auto;" />

# RBTC Faucet

A Next.js application that dispenses test RBTC tokens on the Rootstock Testnet. Users can request test tokens through a web interface with reCAPTCHA protection and optional promo code functionality.

## Setup

### Prerequisites

- Node.js 25
- npm or yarn

### Environment Configuration

1. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

2. Configure the following environment variables in your `.env` file:

```env
# RSK Blockchain Configuration
RSK_NODE=https://public-node.testnet.rsk.co
FAUCET_ADDRESS=
FAUCET_PRIVATE_KEY=your_private_key_here

# Gas Configuration
GAS_PRICE=60000000
GAS_LIMIT=800000

# Dispense Values (in RBTC)
VALUE_TO_DISPENSE=0.0005
PROMO_VALUE_TO_DISPENSE=0.05

# Google reCAPTCHA Configuration
GOOGLE_CAPTCHA_URL=https://www.google.com/recaptcha/api/siteverify
SECRET_VERIFY_CAPTCHA=your_recaptcha_secret_key
NEXT_PUBLIC_SITE_KEY_CAPTCHA=your_recaptcha_site_key

# Google Tag Manager
NEXT_PUBLIC_TAG_MANAGER_ID=GTM-XXXXXXX

# Security & Rate Limiting
FILTER_BY_IP=true
FILTER_BY_BALANCE=false
MAX_RECEIVER_BALANCE=0.1
TIMER_LIMIT=180000

# Promo Codes (JSON array format)
PROMO_CODE=[{"code":"TEST1","activationDate":"2025-01-01","expirationDate":"2025-12-31","maxDispensableRBTC":1}]
```

### Dispense Limits

The faucet enforces several independent checks before sending test RBTC. Each can be toggled or configured via environment variables.

| Limit | Env variable(s) | Default | Behavior |
|---|---|---|---|
| Per IP | `FILTER_BY_IP` | `false` | Rejects if the same IP already requested within `TIMER_LIMIT` |
| Per address | `TIMER_LIMIT` | `180000` ms (3 min) | Rejects if the recipient address already received tokens within the timer window |
| Recipient balance | `FILTER_BY_BALANCE`, `MAX_RECEIVER_BALANCE` | disabled, `0.1` RBTC | When enabled, rejects if the recipient already holds more than `MAX_RECEIVER_BALANCE` tRBTC |
| Faucet balance | — | — | Rejects if the faucet wallet has less than 0.1 tRBTC |
| Captcha | — | — | Rejects if reCAPTCHA verification fails |

`TIMER_LIMIT` applies to the per-address check. The faucet history is also reset daily at midnight (Pacific time).

### Promo Code Bypasses

When a user submits a valid promo code, some limits are relaxed:

| Limit | Bypassed with promo code? |
|---|---|
| Per IP (`FILTER_BY_IP`) | Yes |
| Recipient balance (`FILTER_BY_BALANCE`) | Yes |
| Per address (`TIMER_LIMIT`) | No — the same address still cannot receive again within the timer window |
| Captcha | No |
| Faucet balance | No |

Promo codes have their own rules: the code must exist in `PROMO_CODE`, be within its activation/expiration dates, and not exceed its `maxDispensableRBTC` budget. Promo dispenses use `PROMO_VALUE_TO_DISPENSE` instead of `VALUE_TO_DISPENSE`.

### Required Setup Steps

1. **RSK Node**: Set `RSK_NODE` to your RSK Testnet node URL
2. **Faucet Wallet**: Configure `FAUCET_ADDRESS` and `FAUCET_PRIVATE_KEY` with a funded wallet
3. **reCAPTCHA**: Create a [Google reCAPTCHA project](https://www.google.com/recaptcha/admin) and add your keys
4. **Promo Codes** (optional): Configure promo codes as JSON array with the following format:
   ```json
   [
     {
       "code": "PROMO1",
       "activationDate": "2025-01-01", 
       "expirationDate": "2025-12-31",
       "maxDispensableRBTC": 1
     }
   ]
   ```

## Development Mode

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Production Mode

### Using npm

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm run prod
```

### Using Docker

1. Build the Docker image:
```bash
docker build -t rbtc-faucet .
```

2. Run the container:
```bash
docker run -d --name rbtc-faucet -p 3000:3000 --env-file .env rbtc-faucet
```

The application will be available at `http://localhost:3000`

## Additional Commands

- **Linting**: `npm run lint`
- **Start**: `npm start` (for production after build)