#!/bin/bash

# Script to create Kubernetes secret for rbtcfaucet
# This is needed when externalSecrets.enabled = false

set -e

NAMESPACE=${NAMESPACE:-rbtcfaucet-dev}
SECRET_NAME="rbtcfaucet-env-secrets"

echo "Creating secret: $SECRET_NAME in namespace: $NAMESPACE"

# Check if secret already exists
if kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" &> /dev/null; then
    echo "Secret $SECRET_NAME already exists in namespace $NAMESPACE"
    read -p "Do you want to delete and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl delete secret "$SECRET_NAME" -n "$NAMESPACE"
        echo "Deleted existing secret"
    else
        echo "Keeping existing secret. Exiting."
        exit 0
    fi
fi

# Create namespace if it doesn't exist
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# Prompt for secret values or use environment variables
read -p "Enter REDIS_PASSWORD (or press Enter to use env var): " REDIS_PASSWORD_INPUT
REDIS_PASSWORD=${REDIS_PASSWORD_INPUT:-${REDIS_PASSWORD:-changeme}}

read -p "Enter API_KEY (or press Enter to use env var): " API_KEY_INPUT
API_KEY=${API_KEY_INPUT:-${API_KEY:-your-api-key}}

# Optional: Add more secrets as needed
read -p "Enter SECRET_VERIFY_CAPTCHA (optional, press Enter to skip): " SECRET_VERIFY_CAPTCHA
read -p "Enter NEXT_PUBLIC_SITE_KEY_CAPTCHA (optional, press Enter to skip): " NEXT_PUBLIC_SITE_KEY_CAPTCHA
read -p "Enter FAUCET_ADDRESS (optional, press Enter to skip): " FAUCET_ADDRESS
read -p "Enter FAUCET_PRIVATE_KEY (optional, press Enter to skip): " FAUCET_PRIVATE_KEY

# Build the kubectl command
CMD="kubectl create secret generic $SECRET_NAME -n $NAMESPACE"
CMD="$CMD --from-literal=REDIS_PASSWORD='$REDIS_PASSWORD'"
CMD="$CMD --from-literal=API_KEY='$API_KEY'"

if [ -n "$SECRET_VERIFY_CAPTCHA" ]; then
    CMD="$CMD --from-literal=SECRET_VERIFY_CAPTCHA='$SECRET_VERIFY_CAPTCHA'"
fi

if [ -n "$NEXT_PUBLIC_SITE_KEY_CAPTCHA" ]; then
    CMD="$CMD --from-literal=NEXT_PUBLIC_SITE_KEY_CAPTCHA='$NEXT_PUBLIC_SITE_KEY_CAPTCHA'"
fi

if [ -n "$FAUCET_ADDRESS" ]; then
    CMD="$CMD --from-literal=FAUCET_ADDRESS='$FAUCET_ADDRESS'"
fi

if [ -n "$FAUCET_PRIVATE_KEY" ]; then
    CMD="$CMD --from-literal=FAUCET_PRIVATE_KEY='$FAUCET_PRIVATE_KEY'"
fi

# Execute the command
echo "Creating secret..."
eval "$CMD"

echo "✅ Secret $SECRET_NAME created successfully in namespace $NAMESPACE"

# Verify the secret
echo ""
echo "Verifying secret keys (values are hidden):"
kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath='{.data}' | jq 'keys'
