# RBTC Faucet Helm Chart

This Helm chart deploys the RBTC Faucet application on a Kubernetes cluster.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- PV provisioner support in the underlying infrastructure (if using persistent volumes)

## Installing the Chart

### Production Deployment

```bash
# Create secrets first
kubectl create secret generic rbtc-faucet-secrets \
  --from-literal=SECRET_VERIFY_CAPTCHA='your-captcha-secret' \
  --from-literal=NEXT_PUBLIC_SITE_KEY_CAPTCHA='your-site-key' \
  --from-literal=FAUCET_ADDRESS='your-faucet-address' \
  --from-literal=FAUCET_PRIVATE_KEY='your-private-key'

# Install the chart
helm install rbtc-faucet ./helm
```

### Development Deployment

```bash
# Create development secrets
kubectl create secret generic rbtc-faucet-dev-secrets \
  --from-literal=SECRET_VERIFY_CAPTCHA='dev-captcha-secret' \
  --from-literal=NEXT_PUBLIC_SITE_KEY_CAPTCHA='dev-site-key' \
  --from-literal=FAUCET_ADDRESS='dev-faucet-address' \
  --from-literal=FAUCET_PRIVATE_KEY='dev-private-key'

# Install with development values
helm install rbtc-faucet-dev ./helm -f ./helm/values-dev.yaml
```

## Uninstalling the Chart

```bash
helm uninstall rbtc-faucet
```

## Configuration

The following table lists the configurable parameters and their default values.

### Common Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `2` (prod), `1` (dev) |
| `image.repository` | Image repository | `rbtc-faucet` |
| `image.tag` | Image tag | `2.3.1` (prod), `dev` (dev) |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` (prod), `Always` (dev) |

### Service Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `service.type` | Kubernetes service type | `ClusterIP` (prod), `NodePort` (dev) |
| `service.port` | Service port | `80` |
| `service.targetPort` | Container port | `3000` |

### Ingress Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.className` | Ingress class name | `nginx` |
| `ingress.hosts` | Ingress hosts | See values files |
| `ingress.tls` | Ingress TLS configuration | See values files |

### Environment Variables

| Parameter | Description | Default (Prod) | Default (Dev) |
|-----------|-------------|----------------|---------------|
| `env.RSK_NODE` | RSK node URL | mainnet | testnet |
| `env.VALUE_TO_DISPENSE` | Amount to dispense | `0.000001` | `0.001` |
| `env.FILTER_BY_IP` | Filter by IP | `true` | `false` |
| `env.TIMER_LIMIT` | Timer limit (ms) | `180000` | `60000` |

### Resources

| Parameter | Description | Default (Prod) | Default (Dev) |
|-----------|-------------|----------------|---------------|
| `resources.requests.cpu` | CPU request | `250m` | `100m` |
| `resources.requests.memory` | Memory request | `256Mi` | `128Mi` |
| `resources.limits.cpu` | CPU limit | `500m` | `300m` |
| `resources.limits.memory` | Memory limit | `512Mi` | `384Mi` |

## Secrets Management

The chart expects secrets to be created separately. You can either:

1. Create a Kubernetes secret manually (as shown above)
2. Use Sealed Secrets
3. Use External Secrets Operator
4. Use your cloud provider's secret management (AWS Secrets Manager, Azure Key Vault, etc.)

Required secret keys:
- `SECRET_VERIFY_CAPTCHA`: Google reCAPTCHA secret
- `NEXT_PUBLIC_SITE_KEY_CAPTCHA`: Google reCAPTCHA site key
- `FAUCET_ADDRESS`: Ethereum/RSK address of the faucet wallet
- `FAUCET_PRIVATE_KEY`: Private key of the faucet wallet

## Upgrading

```bash
# Production
helm upgrade rbtc-faucet ./helm

# Development
helm upgrade rbtc-faucet-dev ./helm -f ./helm/values-dev.yaml
```

## Testing the Deployment

```bash
# Check the deployment status
helm status rbtc-faucet

# Get pods
kubectl get pods -l app.kubernetes.io/name=rbtc-faucet

# View logs
kubectl logs -l app.kubernetes.io/name=rbtc-faucet --tail=100

# Port forward for local testing
kubectl port-forward svc/rbtc-faucet 8080:80
```

## Autoscaling

To enable autoscaling in production:

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
```

## Troubleshooting

### Pods are not starting

Check the logs:
```bash
kubectl logs -l app.kubernetes.io/name=rbtc-faucet
kubectl describe pod -l app.kubernetes.io/name=rbtc-faucet
```

### Secrets not found

Make sure the secret exists:
```bash
kubectl get secret rbtc-faucet-secrets
kubectl describe secret rbtc-faucet-secrets
```

### Ingress not working

Check ingress status:
```bash
kubectl get ingress
kubectl describe ingress rbtc-faucet
```

## Support

For issues and questions, please visit the [GitHub repository](https://github.com/rsksmart/rbtc-faucet).
