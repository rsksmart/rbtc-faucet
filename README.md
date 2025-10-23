[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/rsksmart/rbtc-faucet/badge)](https://scorecard.dev/viewer/?uri=github.com/rsksmart/rbtc-faucet)
[![CodeQL](https://github.com/rsksmart/rbtc-faucet/workflows/CodeQL/badge.svg)](https://github.com/rsksmart/rbtc-faucet/actions?query=workflow%3ACodeQL)
<img src="rootstock-logo.png" alt="RSK Logo" style="width:100%; height: auto;" />

# RBTC Faucet

A Next.js application that dispenses test RBTC tokens on the Rootstock Testnet. Users can request test tokens through a web interface with reCAPTCHA protection and optional promo code functionality.

## Setup

### Prerequisites

- Node.js 18+ 
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
TIMER_LIMIT=180000

# Promo Codes (JSON array format)
PROMO_CODE=[{"code":"TEST1","activationDate":"2025-01-01","expirationDate":"2025-12-31","maxDispensableRBTC":1}]
```

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