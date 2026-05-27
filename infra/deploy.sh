#!/usr/bin/env bash
# Usage: ./infra/deploy.sh <account-id> <region> [environment]
set -euo pipefail

ACCOUNT_ID="${1:?'account-id required'}"
REGION="${2:?'region required'}"
ENV="${3:-production}"
IMAGE_TAG="${GITHUB_SHA:-latest}"

# CloudFormation service role — has all infra permissions.
# The github-actions-deploy role only needs cloudformation:Deploy + iam:PassRole to this ARN.
CFN_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/cfn-deploy-role"

deploy_stack() {
  local stack_name="$1"
  local template="$2"
  shift 2
  local params=("$@")

  echo ""
  echo "==> Deploying stack: ${stack_name}"

  aws cloudformation deploy \
    --stack-name "${stack_name}" \
    --template-file "${template}" \
    --parameter-overrides "${params[@]}" \
    --capabilities CAPABILITY_NAMED_IAM \
    --role-arn "${CFN_ROLE_ARN}" \
    --region "${REGION}" \
    --no-fail-on-empty-changeset

  echo "    Done: ${stack_name}"
}

# 1. VPC (shared networking — deploy once, rarely changes)
deploy_stack "${ENV}-vpc" infra/vpc.yml \
  "EnvironmentName=${ENV}"

# 2. Cluster (shared infra — ECS cluster, ALB, IAM roles)
deploy_stack "${ENV}-cluster" infra/cluster.yml \
  "EnvironmentName=${ENV}"

# 3. RDS (PostgreSQL — takes ~10 min on first deploy)
deploy_stack "${ENV}-rds" infra/rds.yml \
  "EnvironmentName=${ENV}"

# 4. Build and push images to ECR
echo ""
echo "==> Authenticating with ECR"
aws ecr get-login-password --region "${REGION}" \
  | docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

for SERVICE in users-service orders-service; do
  echo "==> Building and pushing ${SERVICE}:${IMAGE_TAG}"
  docker build \
    -t "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${SERVICE}:${IMAGE_TAG}" \
    "services/${SERVICE}"
  docker push "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${SERVICE}:${IMAGE_TAG}"
done

# 5. Services (deploy independently — each gets its own stack)
deploy_stack "${ENV}-users-service" services/users-service/infra/users-service.yml \
  "EnvironmentName=${ENV}" \
  "AccountId=${ACCOUNT_ID}" \
  "Region=${REGION}" \
  "ImageTag=${IMAGE_TAG}"

deploy_stack "${ENV}-orders-service" services/orders-service/infra/orders-service.yml \
  "EnvironmentName=${ENV}" \
  "AccountId=${ACCOUNT_ID}" \
  "Region=${REGION}" \
  "ImageTag=${IMAGE_TAG}"

# 6. Print the ALB URL
ALB_DNS=$(aws cloudformation describe-stacks \
  --stack-name "${ENV}-cluster" \
  --region "${REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='ALBDnsName'].OutputValue" \
  --output text)

echo ""
echo "====================================="
echo "Deployed successfully!"
echo "ALB URL: http://${ALB_DNS}"
echo "  GET http://${ALB_DNS}/api/v1/users"
echo "  GET http://${ALB_DNS}/api/v1/orders"
echo "====================================="
