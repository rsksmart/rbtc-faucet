# Quick Start Guide - Deploy Without External Secrets

Since the External Secrets Operator is not installed, follow these steps to deploy using regular Kubernetes secrets.

## Option 1: Interactive Script (Recommended)

```bash
cd helm
./create-secret.sh
```

This will prompt you for all required secret values and create the secret.

## Option 2: One-liner Command

```bash
kubectl create secret generic rbtcfaucet-env-secrets \
  --namespace rbtcfaucet-dev \
  --from-literal=REDIS_PASSWORD='your-redis-password' \
  --from-literal=API_KEY='your-api-key' \
  --from-literal=SECRET_VERIFY_CAPTCHA='your-captcha-secret' \
  --from-literal=NEXT_PUBLIC_SITE_KEY_CAPTCHA='your-site-key' \
  --from-literal=FAUCET_ADDRESS='your-faucet-address' \
  --from-literal=FAUCET_PRIVATE_KEY='your-private-key'
```

Replace the values with your actual secrets.

## Option 3: From AWS Secrets Manager (if available)

If you have the secrets in AWS Secrets Manager:

```bash
# Fetch secret from AWS Secrets Manager
SECRET_JSON=$(aws secretsmanager get-secret-value \
  --secret-id rbtcfaucet-dev \
  --region us-east-1 \
  --query SecretString \
  --output text)

# Create Kubernetes secret from JSON
kubectl create secret generic rbtcfaucet-env-secrets \
  --namespace rbtcfaucet-dev \
  --from-literal=REDIS_PASSWORD=$(echo $SECRET_JSON | jq -r '.REDIS_PASSWORD') \
  --from-literal=API_KEY=$(echo $SECRET_JSON | jq -r '.API_KEY') \
  # Add more as needed...
```

## Deploy the Application

Once the secret is created:

```bash
# Install
helm install rbtcfaucet ./helm \
  --namespace rbtcfaucet-dev \
  --create-namespace \
  --wait \
  --timeout 10m

# Or upgrade if already installed
helm upgrade rbtcfaucet ./helm \
  --namespace rbtcfaucet-dev \
  --wait \
  --timeout 10m
```

## Verify Deployment

```bash
# Check pods
kubectl get pods -n rbtcfaucet-dev

# Check deployment status
kubectl rollout status deployment/rbtcfaucet -n rbtcfaucet-dev

# View logs
kubectl logs -l app.kubernetes.io/name=rbtcfaucet -n rbtcfaucet-dev --tail=50

# Get service URL (LoadBalancer)
kubectl get svc rbtcfaucet -n rbtcfaucet-dev
```

## Troubleshooting

### Secret not found error
If you see `secret "rbtcfaucet-env-secrets" not found`, create it using one of the options above.

### Check if secret exists
```bash
kubectl get secret rbtcfaucet-env-secrets -n rbtcfaucet-dev
```

### View secret keys (not values)
```bash
kubectl get secret rbtcfaucet-env-secrets -n rbtcfaucet-dev -o jsonpath='{.data}' | jq 'keys'
```

### Delete and recreate secret
```bash
kubectl delete secret rbtcfaucet-env-secrets -n rbtcfaucet-dev
# Then run create-secret.sh or the kubectl create command again
```

## Enable External Secrets Later (Optional)

If you want to use AWS Secrets Manager integration:

1. Install External Secrets Operator:
   ```bash
   helm repo add external-secrets https://charts.external-secrets.io
   helm install external-secrets external-secrets/external-secrets \
     -n external-secrets \
     --create-namespace
   ```

2. Configure IRSA for the external-secrets service account

3. Update values.yaml:
   ```yaml
   externalSecrets:
     enabled: true
   ```

4. Delete the manually created secret:
   ```bash
   kubectl delete secret rbtcfaucet-env-secrets -n rbtcfaucet-dev
   ```

5. Upgrade the Helm release:
   ```bash
   helm upgrade rbtcfaucet ./helm -n rbtcfaucet-dev
   ```

The ExternalSecret resource will now sync secrets from AWS Secrets Manager.

---

## Minimal Example for Testing

For quick testing, you can use placeholder values:

```bash
kubectl create namespace rbtcfaucet-dev

kubectl create secret generic rbtcfaucet-env-secrets \
  --namespace rbtcfaucet-dev \
  --from-literal=REDIS_PASSWORD='test123' \
  --from-literal=API_KEY='test-api-key'

helm install rbtcfaucet ./helm \
  --namespace rbtcfaucet-dev \
  --wait \
  --timeout 10m
```

⚠️ **Warning**: Don't use placeholder values in production!
