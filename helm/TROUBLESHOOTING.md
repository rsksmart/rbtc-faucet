# Helm Deployment Troubleshooting Guide

## Recent Fixes Applied

### 1. Main Application Deployment Issues
**Problem**: Deployment was failing without proper health checks and environment configuration.

**Fixed**:
- ✅ Added `livenessProbe` and `readinessProbe` with appropriate delays
- ✅ Added required environment variables (NODE_ENV, PORT)
- ✅ Configured proper startup delays (60s for liveness, 30s for readiness)

### 2. External DNS Deployment Issues
**Removed: External DNS is no longer managed by this chart.**

### 3. External Secrets Configuration
**Problem**: External Secrets templates were missing entirely.

**Fixed**:
- ✅ Created `external-secret.yaml` template
- ✅ Created `secret-store.yaml` template
- ✅ Configured AWS Secrets Manager integration
- ✅ Updated values.yaml with proper external secrets configuration

## Pre-Deployment Checklist

Before deploying, ensure:

1. **AWS Secrets Manager Secret Exists**
   ```bash
   aws secretsmanager get-secret-value \
     --secret-id rbtcfaucet-dev \
     --region us-east-1
   ```

   The secret should contain all required keys:
   - `REDIS_PASSWORD`
   - `API_KEY`
   - Any other application-specific secrets

2. **External Secrets Operator is Installed**
   ```bash
   kubectl get pods -n external-secrets
   ```

   If not installed:
   ```bash
   helm repo add external-secrets https://charts.external-secrets.io
   helm install external-secrets \
     external-secrets/external-secrets \
     -n external-secrets \
     --create-namespace
   ```

3. **IAM Roles for Service Accounts (IRSA) Configured**
  - The `external-secrets-sa` service account needs IAM permissions to read from Secrets Manager

4. **ECR Image is Available**
   ```bash
   aws ecr describe-images \
     --repository-name rbtcfaucet-dev \
     --region us-east-1 \
     --image-ids imageTag=latest
   ```

## Common Deployment Issues

### Issue: "ImagePullBackOff"
**Cause**: Cannot pull image from ECR

**Solutions**:
1. Verify ECR repository exists and image is pushed
2. Check if the EKS node role has ECR permissions
3. Verify the image tag is correct in values.yaml

```bash
# Check pod events
kubectl describe pod <pod-name> -n rbtcfaucet-dev

# Verify image exists
aws ecr describe-images --repository-name rbtcfaucet-dev --region us-east-1
```

### Issue: "CrashLoopBackOff"
**Cause**: Application is crashing on startup

**Solutions**:
1. Check if secrets are properly loaded
2. Verify environment variables are correct
3. Check application logs

```bash
# View logs
kubectl logs <pod-name> -n rbtcfaucet-dev -c rbtcfaucet

# Check if secrets exist
kubectl get secret rbtcfaucet-env-secrets -n rbtcfaucet-dev
kubectl describe secret rbtcfaucet-env-secrets -n rbtcfaucet-dev

# Verify external secret is syncing
kubectl get externalsecret -n rbtcfaucet-dev
kubectl describe externalsecret rbtcfaucet-env-secrets -n rbtcfaucet-dev
```

### Issue: External Secrets Not Syncing
**Cause**: External Secrets Operator cannot access AWS Secrets Manager

**Solutions**:
1. Verify the SecretStore is created and healthy
2. Check IRSA configuration
3. Verify AWS Secrets Manager secret exists

```bash
# Check SecretStore
kubectl get secretstore -n rbtcfaucet-dev
kubectl describe secretstore aws-secrets-manager -n rbtcfaucet-dev

# Check ExternalSecret status
kubectl get externalsecret -n rbtcfaucet-dev -o yaml

# Verify service account annotations
kubectl get sa external-secrets-sa -n rbtcfaucet-dev -o yaml
```

### Issue: External DNS Not Creating Records
**Removed: External DNS is no longer managed by this chart.**

### Issue: Health Check Failures
**Cause**: Application is not responding to health check probes

**Solutions**:
1. Verify the application is listening on port 3000
2. Check if the application responds to GET / requests
3. Increase initialDelaySeconds if the app takes longer to start

```bash
# Port forward to test locally
kubectl port-forward <pod-name> 3000:3000 -n rbtcfaucet-dev

# Test health endpoint
curl http://localhost:3000/

# Check pod events
kubectl describe pod <pod-name> -n rbtcfaucet-dev | grep -A 10 Events
```

## Deployment Commands

### Install
```bash
helm install rbtcfaucet ./helm \
  --namespace rbtcfaucet-dev \
  --create-namespace \
  --wait \
  --timeout 10m
```

### Upgrade
```bash
helm upgrade rbtcfaucet ./helm \
  --namespace rbtcfaucet-dev \
  --wait \
  --timeout 10m
```

### Upgrade with Longer Timeout
If deployments are slow to become ready:
```bash
helm upgrade rbtcfaucet ./helm \
  --namespace rbtcfaucet-dev \
  --wait \
  --timeout 15m
```

### Debug Install
```bash
helm install rbtcfaucet ./helm \
  --namespace rbtcfaucet-dev \
  --create-namespace \
  --dry-run \
  --debug
```

### Rollback
```bash
# View history
helm history rbtcfaucet -n rbtcfaucet-dev

# Rollback to previous version
helm rollback rbtcfaucet -n rbtcfaucet-dev

# Rollback to specific revision
helm rollback rbtcfaucet 1 -n rbtcfaucet-dev
```

## Monitoring Deployment Status

```bash
# Watch all resources
watch kubectl get all -n rbtcfaucet-dev

# Check deployment rollout status
kubectl rollout status deployment/rbtcfaucet -n rbtcfaucet-dev
  # (external-dns rollout command removed)

# Check HPA status
kubectl get hpa -n rbtcfaucet-dev

# Check ingress status
kubectl get ingress -n rbtcfaucet-dev

# View recent events
kubectl get events -n rbtcfaucet-dev --sort-by='.lastTimestamp'
```

## Values Override for Testing

For testing with reduced requirements:

```yaml
# values-test.yaml
autoscaling:
  enabled: false

replicaCount: 1

externalSecrets:
  enabled: false  # Use manual secret instead

  # (externalDns: removed)
  enabled: false  # Skip DNS management for testing
```

Deploy with test values:
```bash
helm upgrade rbtcfaucet ./helm \
  -f helm/values.yaml \
  -f values-test.yaml \
  --namespace rbtcfaucet-dev
```

## Additional Resources

- [External Secrets Operator Docs](https://external-secrets.io/)
  # (External DNS Documentation removed)
- [Helm Documentation](https://helm.sh/docs/)
- [AWS EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
