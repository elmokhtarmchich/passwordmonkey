#!/usr/bin/env bash
# PasswordMonkey — n8n bootstrap for an Oracle Cloud Always Free VM (Ubuntu 22.04+).
# Idempotent: safe to re-run. Requires sudo. Deploys to /opt/passwordmonkey-n8n.
set -euo pipefail

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="/opt/passwordmonkey-n8n"
ENV_FILE="${DEPLOY_DIR}/.env"

if [[ "${EUID}" -ne 0 ]]; then
  echo "ERROR: run with sudo: sudo ./setup-vm.sh" >&2
  exit 1
fi

echo "==> Installing Docker (includes the compose plugin)"
if ! command -v docker >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y ca-certificates curl
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

echo "==> Deploying kit to ${DEPLOY_DIR}"
mkdir -p "${DEPLOY_DIR}"
install -m 0640 "${KIT_DIR}/docker-compose.yml" "${DEPLOY_DIR}/docker-compose.yml"

if [[ ! -f "${ENV_FILE}" ]]; then
  install -m 0640 "${KIT_DIR}/.env.example" "${ENV_FILE}"
  KEY="$(openssl rand -base64 32)"
  sed -i "s|^N8N_ENCRYPTION_KEY=.*|N8N_ENCRYPTION_KEY=${KEY}|" "${ENV_FILE}"
  echo "    Generated a fresh N8N_ENCRYPTION_KEY into ${ENV_FILE}"
else
  echo "    Existing .env kept (never delete it: a new key makes every stored credential undecryptable)"
fi

if grep -q "CHANGE_ME" "${ENV_FILE}"; then
  echo "ERROR: N8N_ENCRYPTION_KEY is still the placeholder — regenerate it." >&2
  exit 1
fi

echo "==> Starting n8n (bound to 127.0.0.1:5678 only)"
docker compose --project-directory "${DEPLOY_DIR}" up -d
docker compose --project-directory "${DEPLOY_DIR}" ps

PUBLIC_IP="$(curl -fsS --max-time 5 http://169.254.169.254/opc/v1/instance/ 2>/dev/null \
  | grep -oE '"publicIp":[[:space:]]*"[0-9.]+"' \
  | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' || true)"
if [[ -z "${PUBLIC_IP}" ]]; then
  PUBLIC_IP="$(curl -fsS --max-time 5 https://ifconfig.me 2>/dev/null || true)"
fi
if [[ -z "${PUBLIC_IP}" ]]; then
  PUBLIC_IP="<vm-public-ip>"
fi

cat <<EOF

n8n is running. It is reachable ONLY on the VM (127.0.0.1:5678).
Open the SSH tunnel from your machine, then browse http://localhost:5678 :

    ssh -L 5678:localhost:5678 ubuntu@${PUBLIC_IP}

Next: RUNBOOK.md Parts C-H (owner account, variables, credentials, import + cutover, verify, cleanup).
EOF
