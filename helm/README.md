# RBTC Faucet Helm Chart

This Helm chart deploys the RBTC Faucet application to Kubernetes.

## Prerequisites

- Kubernetes cluster (EKS)
- Helm 3.x
- kubectl configured
- AWS credentials (via aws-vault)

## Chart Structure

```
helm-chart/
├── Chart.yaml                          # Chart metadata
├── values.yaml                         # Default values
├── values-dev.yaml                     # Environment-specific overrides
└── templates/
    ├── _helpers.tpl                    # Template helpers
    ├── deployment.yaml                 # Main application deployment
    ├── service.yaml                    # Service definition
    ├── ingress.yaml                    # ALB Ingress configuration
    ├── hpa.yaml                        # Horizontal Pod Autoscaler
    ├── external-secret.yaml            # External Secrets configuration
    ├── external-dns-rbac.yaml          # External DNS RBAC
    └── external-dns-deployment.yaml    # External DNS deployment
```

## Installation

### First-time installation

```bash
# Using the access-cluster.sh script
./access-cluster.sh install

# Or directly with Helm
aws-vault exec as-demos -- helm install rbtcfaucet ./helm-chart/ \
  --namespace rbtcfaucet-dev \
  --create-namespace \
  --wait
```

### Upgrade existing deployment

```bash
# Using the access-cluster.sh script
./access-cluster.sh update

# Or directly with Helm
aws-vault exec as-demos -- helm upgrade rbtcfaucet ./helm-chart/ \
  --namespace rbtcfaucet-dev \
  --wait
```

### Uninstall

```bash
# Using the access-cluster.sh script
./access-cluster.sh uninstall

# Or directly with Helm
aws-vault exec as-demos -- helm uninstall rbtcfaucet \
  --namespace rbtcfaucet-dev
```

## Configuration

### Key Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `namespace` | Kubernetes namespace | `rbtcfaucet-dev` |
| `image.repository` | Container image repository | `666927241564.dkr.ecr.us-east-1.amazonaws.com/rbtcfaucet-dev` |
| `image.tag` | Container image tag | `latest` |
| `replicaCount` | Number of replicas | `1` |
| `service.type` | Service type | `LoadBalancer` |
| `ingress.enabled` | Enable ingress | `true` |
| `autoscaling.enabled` | Enable HPA | `true` |
| `autoscaling.minReplicas` | Minimum replicas | `1` |
| `autoscaling.maxReplicas` | Maximum replicas | `5` |
| `externalSecrets.enabled` | Enable External Secrets | `true` |
| `externalDns.enabled` | Enable External DNS | `true` |

### Environment-specific Values

You can override values using environment-specific files:

```bash
# Install with dev values
helm install rbtcfaucet ./helm-chart/ \
  -f helm-chart/values-dev.yaml \
  --namespace rbtcfaucet-dev

# Or set individual values
helm install rbtcfaucet ./helm-chart/ \
  --set image.tag=v1.2.3 \
  --set replicaCount=3 \
  --namespace rbtcfaucet-dev
```

## Checking Status

```bash
# Check Helm release
helm list -n rbtcfaucet-dev

# Get release status
helm status rbtcfaucet -n rbtcfaucet-dev

# View deployed manifests
helm get manifest rbtcfaucet -n rbtcfaucet-dev

# Check all resources
./access-cluster.sh check
```

## Rollback

```bash
# View release history
helm history rbtcfaucet -n rbtcfaucet-dev

# Rollback to previous version
helm rollback rbtcfaucet -n rbtcfaucet-dev

# Rollback to specific revision
helm rollback rbtcfaucet 1 -n rbtcfaucet-dev
```

## Template Validation

```bash
# Validate templates locally
helm template rbtcfaucet ./helm-chart/ \
  --namespace rbtcfaucet-dev \
  --debug

# Dry-run installation
helm install rbtcfaucet ./helm-chart/ \
  --namespace rbtcfaucet-dev \
  --dry-run \
  --debug
```

## Components

### Main Application
- **Container**: RBTC Faucet application (port 3000)
- **Redis**: Redis sidecar container (port 6379)
- **Resources**: CPU requests/limits configured
- **Security**: Non-root user, security contexts applied

### Networking
- **Service**: LoadBalancer with SSL termination
- **Ingress**: ALB Ingress with WAF rules
- **External DNS**: Automatic DNS management

### Secrets Management
- **External Secrets**: AWS Secrets Manager integration
- **Secrets**: REDIS_PASSWORD, API_KEY

### Autoscaling
- **HPA**: CPU-based autoscaling (70% threshold)
- **Min/Max**: 1-5 replicas

## Troubleshooting

### View logs
```bash
./access-cluster.sh logs <pod-name>
```

### Describe resources
```bash
./access-cluster.sh describe <pod-name>
```

### Check External Secrets
```bash
./access-cluster.sh secrets
```

### Debug Helm issues
```bash
# Check rendered templates
helm template rbtcfaucet ./helm-chart/ --debug

# Verify values
helm get values rbtcfaucet -n rbtcfaucet-dev

# Check all resources created by this release
helm get manifest rbtcfaucet -n rbtcfaucet-dev
```

## Migration from kubectl to Helm

If you're migrating from the previous kubectl-based deployment:

1. **Backup current deployment** (optional):
   ```bash
   kubectl get all -n rbtcfaucet-dev -o yaml > backup.yaml
   ```

2. **Uninstall old resources** (optional, Helm can manage existing resources):
   ```bash
   kubectl delete deployment rbtcfaucet -n rbtcfaucet-dev
   kubectl delete service rbtcfaucet -n rbtcfaucet-dev
   # etc...
   ```

3. **Install with Helm**:
   ```bash
   ./access-cluster.sh install
   ```

Note: Helm will manage all resources going forward. External Secrets and other existing resources will be adopted by Helm.

## secrets
🔍 To view secret keys (without values):
kubectl get secret rbtcfaucet-env-secrets -n rbtcfaucet-dev -o jsonpath='{.data}' | jq 'keys'