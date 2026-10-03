# PasswordMonkey — n8n on Oracle Cloud (Always Free Compute VM)

Production deployment kit for the news automation:

**Ampere A1 VM → Docker → n8n (localhost only) → Cron every 6 h → RSS feeds → GitHub commit → passwordmonkey.org publishes.**

Security posture: the VM's only open port is SSH (22, restricted to your IP).
n8n binds to `127.0.0.1:5678` and is reachable only through an SSH tunnel.
The automation is fully outbound — no webhooks, no public UI, no inbound HTTP.

## Kit contents

| File | Purpose |
|---|---|
| `docker-compose.yml` | n8n service: localhost-only bind, persistent volume, task runners, telemetry off |
| `.env.example` | Template for `.env` (encryption key, timezone, image tag, runner toggle); real `.env` is git-ignored |
| `setup-vm.sh` | Idempotent bootstrap: installs Docker, deploys to `/opt/passwordmonkey-n8n`, starts n8n |
| `RUNBOOK.md` | This guide |

## Part A — Provision the VM (OCI console, ~15 min)

**No account yet?** Sign up first at `cloud.oracle.com` → choose the **Free Tier** (Always Free).
Two things to know: a credit/debit card is required for identity verification but is not
charged for Always Free usage, and the **home region you choose at signup is permanent** —
pick the one closest to you (A1 free capacity is also easier to find in less popular regions).

1. Sign in at `cloud.oracle.com` → **Compute → Instances → Create instance**.
2. **Name**: `passwordmonkey-n8n`.
3. **Image** (click *Edit*): *Canonical Ubuntu 22.04*.
4. **Shape** (click *Edit*): **Ampere (VM.Standard.A1.Flex)** → 2 OCPUs, 12 GB.
   (Always Free covers up to 4 OCPU / 24 GB total; 2/12 is comfortably enough for this workload.)
5. **SSH keys**: *Generate key pair* → **save both files** — the private key is the only way in.
6. **Networking**: leave defaults (new VCN + public subnet); a **public IPv4 address is required**.
7. **Create**, wait for *Running*, copy the **Public IP**.
8. **Restrict SSH**: Networking → your VCN → Subnet → Security Lists → default list →
   edit the `22/tcp` ingress rule → **Source = your IP /32** (never leave `0.0.0.0/0`).

## Part B — Deploy the kit (from your machine)

From the repo root (PowerShell on Windows works — OpenSSH is built in):

```
ssh -i <private-key> ubuntu@<vm-public-ip> "mkdir -p ~/kit"
scp -i <private-key> -r automation/oci ubuntu@<vm-public-ip>:~/kit/
ssh -i <private-key> ubuntu@<vm-public-ip>
cd ~/kit/oci && chmod +x setup-vm.sh && sudo ./setup-vm.sh
```

The script installs Docker, copies the kit to `/opt/passwordmonkey-n8n`, writes `.env`
with a freshly generated encryption key, and starts the container. It never overwrites
an existing `.env`, and the transfer above is deterministic, so re-running Part B is safe.
Never delete `.env` to force regeneration — a new key makes every stored credential
undecryptable.

## Part C — First login (SSH tunnel)

```
ssh -i <private-key> -L 5678:localhost:5678 ubuntu@<vm-public-ip>
```

Browse **http://localhost:5678** → create the Owner account (strong, unique password).
Keep this tunnel command — it is the *only* way to reach the UI.

## Part D — Instance variables (n8n → Settings → Variables)

| Name | Value |
|---|---|
| `GITHUB_OWNER` | `elmokhtarmchich` |
| `GITHUB_REPO` | `passwordmonkey` |
| `GITHUB_TOKEN` | your GitHub PAT (Part E) |
| `NEWS_KEYWORDS` | `password,breach,authentication,cybersecurity` |
| `USE_SUMMARY` | `true` |

Names must match exactly — the workflow reads `$vars.<NAME>`.
(Only `NEWS_KEYWORDS`, `GITHUB_OWNER`, `GITHUB_REPO` have in-code fallbacks.)

## Part E — Credentials

1. **GitHub PAT**: github.com → Settings → Developer settings → **Fine-grained tokens** →
   *Generate new token* → Repository access: `elmokhtarmchich/passwordmonkey` →
   Permissions: **Contents → Read and write**.
2. n8n → Credentials → *Create* → **GitHub API** → paste the token → name it `GitHub account 2`.

Create ONLY this credential. The export also references an unused "Header Auth account"
attachment (the nodes authenticate via the GitHub API credential plus an explicit
`Bearer {{ $vars.GITHUB_TOKEN }}` header) — do not store the PAT a second time; clear
that orphaned assignment in the node UI if it shows a warning (Part F, step 1).

## Part F — Import the production workflow

n8n → Workflows → **Import from File** → choose the repo copy:

```
automation/oci/workflows/LS41E1sQ0wNfjHYe-workflow_main.json
```

(from your local checkout; the original export at
`D:\Website\passwordmonkey\webmediadevaccount-workflows\webmediadevaccount-workflows\LS41E1sQ0wNfjHYe-workflow_main.json`
is byte-identical)

Import **only this file**. The export folder contains four near-duplicates of the same
pipeline (`workflow_main_test`, `passwordmonkeyworkflow`, and `My_workflow` — that one
embeds *two* copies). Multiple imports = duplicate commits.

After import:

1. Open every node that shows a **red credential warning** (the GitHub/HTTP nodes such as
   *Check File Exists1*, *Create a file1*) and re-select `GitHub account 2` — the export
   carries credential IDs from the old instance, which do not exist here. If a node also
   flags the unused "Header Auth account", clear that assignment instead of re-creating it.
2. Confirm the Cron trigger shows *every 6 hours*.
3. **Deactivate the workflow on the OLD host first** (the webmediadevaccount n8n) — two
   active copies can race at the same 6-hour boundary and double-post an article.
4. **Activate** the workflow here (top-right toggle).

## Part G — Verify

1. Click **Execute Workflow** (manual run) and watch it complete.
2. Check github.com/elmokhtarmchich/passwordmonkey → a new commit touching `news/`.
3. Load passwordmonkey.org → the article appears in the news section.
4. After the next 6-hour boundary, check **Executions** — the cron run must appear on its own.

## Part H — Post-cutover cleanup

The old host was deactivated in Part F, step 3, *before* this one went live. Finish with:

1. Confirm exactly one active copy: the old host's workflow shows *Inactive*.
2. Sweep for duplicates published during the overlap window — check the repo's recent
   `news/` commits and the live site, and delete any article committed by both hosts.

## Maintenance

```
cd /opt/passwordmonkey-n8n
sudo docker logs -f n8n                                      # logs
sudo docker run --rm -v n8n_data:/data -v /opt/passwordmonkey-n8n:/backup \
  alpine tar czf /backup/n8n-backup-$(date +%F).tar.gz -C /data .   # backup all n8n data
```

**Updating n8n** — always in this order. Never run `docker compose pull` with an
unpinned `N8N_IMAGE`: a major-version jump migrates the SQLite database on startup,
older images cannot read it back, and the only downgrade path is restoring the backup.

1. Take the backup shown above.
2. `sudo nano .env` and deliberately set `N8N_IMAGE` to the new tag
   (find tags at https://hub.docker.com/r/n8nio/n8n/tags — keep it pinned).
3. `sudo docker compose pull && sudo docker compose up -d`

- OS updates: `sudo apt-get update && sudo apt-get upgrade -y` monthly; keep
  `unattended-upgrades` enabled (Ubuntu cloud images ship it on).
- Key rotation: changing `N8N_ENCRYPTION_KEY` invalidates all stored credentials —
  re-enter them after rotating. Never delete `.env` to force regeneration.

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Out of host capacity" at provisioning | Retry later, or try another Availability Domain / region (free-tier A1 capacity is scarce in popular regions) |
| Login loops with *"Could not find cookie"* | `sudo nano /opt/passwordmonkey-n8n/.env` → set `N8N_SECURE_COOKIE=false` → `sudo docker compose up -d` |
| `docker: permission denied` | Run with `sudo`, or add the user to the `docker` group |
| Cron never fires | Workflow must be **Active** and the container up (`sudo docker ps`); check Executions for errors |
| GitHub nodes return 401 | Re-select credentials on each node (Part F, step 1); verify the `GITHUB_TOKEN` variable and that the PAT has not expired |
| Code-node executions fail after enabling task runners | `sudo nano /opt/passwordmonkey-n8n/.env` → set `N8N_RUNNERS_ENABLED=false` → `sudo docker compose up -d` |
