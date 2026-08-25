#!/usr/bin/env bash
# One-time GCP bootstrap for Apps: Artifact Registry, deploy SA, GitHub WIF.
# Laptop `firebase deploy` is not the documented path. CI uses this WIF.
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-apps-athreya-codes}"
REGION="${REGION:-us-central1}"
GITHUB_ORG="${GITHUB_ORG:-athreyacodes}"
GITHUB_REPO="${GITHUB_REPO:-apps}"
POOL_ID="${POOL_ID:-github}"
PROVIDER_ID="${PROVIDER_ID:-github-actions}"
SA_ID="${SA_ID:-github-apps-deploy}"
AR_REPO="${AR_REPO:-apps}"

if ! command -v gcloud >/dev/null; then
  echo "gcloud is required. Install Google Cloud SDK, then: gcloud auth login && gcloud auth application-default login" >&2
  exit 1
fi

PROJECT_NUMBER="$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')"
SA_EMAIL="${SA_ID}@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud config set project "${PROJECT_ID}"

gcloud services enable \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  cloudresourcemanager.googleapis.com \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  firebase.googleapis.com \
  firebasehosting.googleapis.com \
  --project="${PROJECT_ID}"

if ! gcloud artifacts repositories describe "${AR_REPO}" --location="${REGION}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud artifacts repositories create "${AR_REPO}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="Apps Cloud Run images" \
    --project="${PROJECT_ID}"
fi

if ! gcloud iam service-accounts describe "${SA_EMAIL}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud iam service-accounts create "${SA_ID}" \
    --display-name="GitHub Actions Apps deploy" \
    --project="${PROJECT_ID}"
fi

for role in \
  roles/run.admin \
  roles/iam.serviceAccountUser \
  roles/artifactregistry.writer \
  roles/firebasehosting.admin \
  roles/firebase.admin; do
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="${role}" \
    --condition=None \
    --quiet >/dev/null
done

if ! gcloud iam workload-identity-pools describe "${POOL_ID}" --location=global --project="${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create "${POOL_ID}" \
    --location=global \
    --display-name="GitHub" \
    --project="${PROJECT_ID}"
fi

if ! gcloud iam workload-identity-pools providers describe "${PROVIDER_ID}" \
  --workload-identity-pool="${POOL_ID}" \
  --location=global \
  --project="${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers create-oidc "${PROVIDER_ID}" \
    --location=global \
    --workload-identity-pool="${POOL_ID}" \
    --display-name="GitHub Actions" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
    --attribute-condition="assertion.repository_owner == '${GITHUB_ORG}'" \
    --project="${PROJECT_ID}"
fi

gcloud iam service-accounts add-iam-policy-binding "${SA_EMAIL}" \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${GITHUB_ORG}/${GITHUB_REPO}"

WIF_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"

echo
echo "Set these on the GitHub environment 'production' for ${GITHUB_ORG}/${GITHUB_REPO}:"
echo "  WIF_PROVIDER=${WIF_PROVIDER}"
echo "  WIF_SERVICE_ACCOUNT=${SA_EMAIL}"
echo
echo "gh variable set WIF_PROVIDER --body '${WIF_PROVIDER}' --repo ${GITHUB_ORG}/${GITHUB_REPO}"
echo "gh variable set WIF_SERVICE_ACCOUNT --body '${SA_EMAIL}' --repo ${GITHUB_ORG}/${GITHUB_REPO}"
echo "gh api --method PUT repos/${GITHUB_ORG}/${GITHUB_REPO}/environments/production"
