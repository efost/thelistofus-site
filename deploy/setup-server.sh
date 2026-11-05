#!/usr/bin/env bash
# One-time setup on the Droplet for push-to-deploy. Run it with sudo:
#
#   curl -fsSL https://raw.githubusercontent.com/efost/thelistofus-site/main/deploy/setup-server.sh | sudo bash
#
# (Before the deploy files are on main, fetch it from the branch and pass REF=<branch>.)
#
# It changes nothing about the running site. It finds how thelistofus.com runs today
# (the process on port 3000), then adds:
#   • a systemd service, thelistofus-web, to run new builds on the same port
#   • a `thelistofus-deploy` user whose SSH key can only run `deploy <sha>`
#   • /usr/local/sbin/thelistofus-deploy, which builds a commit and switches to it
#   • /etc/thelistofus.env, the site's settings (copied from the current .env)
# The first deploy from GitHub then stops the old process and starts the new service,
# putting the old one back if the new build doesn't come up.
#
# Safe to re-run. Pass --new-key to replace the deploy key.
set -euo pipefail

REPO_URL=https://github.com/efost/thelistofus-site.git
PORT=3000
BASE=/srv/apps/thelistofus-web
SERVICE=thelistofus-web
DEPLOY_USER=thelistofus-deploy
RAW="https://raw.githubusercontent.com/efost/thelistofus-site/${REF:-main}/deploy"

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
die() { printf '✗ %s\n' "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || die "Run with sudo."
new_key=""
[[ "${1:-}" == "--new-key" ]] && new_key=yes

# ── 1. What runs the site now ─────────────────────────────────────────────────────
say "Looking at what serves port $PORT"
pid="$(ss -ltnpH "sport = :$PORT" | grep -oP 'pid=\K[0-9]+' | head -1 || true)"
legacy_unit="" legacy_pm2="" legacy_dir=""
if [[ -f /etc/thelistofus-deploy.conf ]]; then
  # shellcheck source=/dev/null
  source /etc/thelistofus-deploy.conf
  app_user="$APP_USER" node_dir="$NODE_DIR" legacy_unit="${LEGACY_UNIT:-}" legacy_pm2="${LEGACY_PM2:-}"
  echo "Already set up for $app_user; keeping those settings."
elif [[ -n "$pid" ]]; then
  app_user="$(ps -o user= -p "$pid" | tr -d ' ')"
  node_dir="$(dirname "$(readlink -f "/proc/$pid/exe")")"
  legacy_dir="$(readlink -f "/proc/$pid/cwd")"
  unit="$(ps -o unit= -p "$pid" | tr -d ' ')"
  pm2_name=""
  if pm2_list="$(runuser -u "$app_user" -- env PATH="$node_dir:$PATH" pm2 jlist 2>/dev/null)"; then
    pm2_name="$(printf '%s' "$pm2_list" | python3 -c \
      "import json,sys;print(next((p['name'] for p in json.load(sys.stdin) if p.get('pid')==$pid),''))" 2>/dev/null || true)"
  fi
  if [[ -n "$pm2_name" ]]; then
    legacy_pm2="$pm2_name"
  elif [[ "$unit" == *.service && "$unit" != user@* ]]; then
    legacy_unit="$unit"
  fi
  echo "Port $PORT: pid $pid, user $app_user, folder $legacy_dir"
  if [[ -n "$legacy_unit" ]]; then echo "Kept running by systemd unit $legacy_unit"
  elif [[ -n "$legacy_pm2" ]]; then echo "Kept running by pm2 process \"$legacy_pm2\""
  else echo "⚠ Couldn't tell what keeps it running. Stop it by hand right before the first deploy."
  fi
else
  die "Nothing is listening on port $PORT. Start the current site first, or edit PORT at the top."
fi
[[ -x "$node_dir/node" ]] || die "No node at $node_dir."
app_home="$(getent passwd "$app_user" | cut -d: -f6)"
"$node_dir/node" -e 'process.exit(+process.versions.node.split(".")[0] >= 18 ? 0 : 1)' ||
  die "Node $("$node_dir/node" -v) is too old; Next 15 needs 18.18 or newer."

# ── 2. Settings ───────────────────────────────────────────────────────────────────
say "Site settings: /etc/thelistofus.env"
if [[ ! -f /etc/thelistofus.env ]]; then
  {
    echo "# thelistofus.com settings, read by the build and the service."
    echo "NODE_ENV=production"
    echo "PORT=$PORT"
    echo "HOSTNAME=127.0.0.1"
    for f in .env .env.production .env.local .env.production.local; do
      [[ -n "$legacy_dir" && -f "$legacy_dir/$f" ]] && grep -E '^[A-Z0-9_]+=' "$legacy_dir/$f" || true
    done | grep -vE '^(NODE_ENV|PORT|HOSTNAME)=' | awk -F= '!seen[$1]++'
  } >/etc/thelistofus.env
  chmod 600 /etc/thelistofus.env
  echo "Copied from $legacy_dir/.env*"
fi
if ! grep -q '^GOOGLE_PLACES_API_KEY=.' /etc/thelistofus.env; then
  read -rsp "Google Places API key for place photos (Enter to skip): " key </dev/tty || key=""
  echo
  [[ -n "$key" ]] && echo "GOOGLE_PLACES_API_KEY=$key" >>/etc/thelistofus.env
fi
grep -q '^NEXT_PUBLIC_FIREBASE_PROJECT_ID=.' /etc/thelistofus.env ||
  echo "⚠ No Firebase settings found. Add the NEXT_PUBLIC_FIREBASE_* lines to /etc/thelistofus.env."

cat >/etc/thelistofus-deploy.conf <<EOF
APP_USER=$app_user
APP_HOME=$app_home
NODE_DIR=$node_dir
BASE=$BASE
REPO=$REPO_URL
SERVICE=$SERVICE
PORT=$PORT
AASA_DIR=/srv/apps/thelistofus
LEGACY_UNIT=$legacy_unit
LEGACY_PM2=$legacy_pm2
EOF

# ── 3. Folders and a copy of the repo ─────────────────────────────────────────────
say "Releases: $BASE"
install -d -o "$app_user" -g "$app_user" "$BASE" "$BASE/releases"
if [[ ! -d "$BASE/repo.git" ]]; then
  runuser -u "$app_user" -- git clone --quiet --bare "$REPO_URL" "$BASE/repo.git"
fi

# ── 4. Service ────────────────────────────────────────────────────────────────────
say "Service: $SERVICE (installed, not started; the first deploy starts it)"
cat >/etc/systemd/system/$SERVICE.service <<EOF
[Unit]
Description=thelistofus.com (Next.js)
After=network.target

[Service]
User=$app_user
WorkingDirectory=$BASE/current
EnvironmentFile=/etc/thelistofus.env
ExecStart=$node_dir/node server.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload

# ── 5. Deploy scripts, user and key ───────────────────────────────────────────────
say "Deploy user: $DEPLOY_USER"
curl -fsSL "$RAW/thelistofus-deploy" -o /usr/local/sbin/thelistofus-deploy
curl -fsSL "$RAW/deploy-gate" -o /usr/local/bin/thelistofus-deploy-gate
chmod 755 /usr/local/sbin/thelistofus-deploy /usr/local/bin/thelistofus-deploy-gate
id "$DEPLOY_USER" >/dev/null 2>&1 || adduser --system --group --shell /bin/sh --home "/home/$DEPLOY_USER" "$DEPLOY_USER" >/dev/null
echo "$DEPLOY_USER ALL=(root) NOPASSWD: /usr/local/sbin/thelistofus-deploy" >/etc/sudoers.d/thelistofus-deploy
chmod 440 /etc/sudoers.d/thelistofus-deploy
visudo -cf /etc/sudoers.d/thelistofus-deploy >/dev/null

ssh_dir="/home/$DEPLOY_USER/.ssh"
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$ssh_dir"
private_key=""
if [[ -n "$new_key" || ! -s "$ssh_dir/authorized_keys" ]]; then
  tmp="$(mktemp -d)"
  ssh-keygen -q -t ed25519 -N "" -C "github-actions@thelistofus-site" -f "$tmp/key"
  echo "restrict,command=\"/usr/local/bin/thelistofus-deploy-gate\" $(cat "$tmp/key.pub")" >"$ssh_dir/authorized_keys"
  private_key="$(cat "$tmp/key")"
  rm -rf "$tmp"
fi
chown "$DEPLOY_USER:$DEPLOY_USER" "$ssh_dir/authorized_keys"
chmod 600 "$ssh_dir/authorized_keys"

if allow="$(sshd -T 2>/dev/null | awk '$1=="allowusers"{ $1=""; print }')" && [[ -n "$allow" ]] &&
  [[ " $allow " != *" $DEPLOY_USER "* ]]; then
  echo "⚠ sshd only allows: $allow — add $DEPLOY_USER to AllowUsers and reload sshd."
fi

# ── 6. What to paste into GitHub ──────────────────────────────────────────────────
host_ip="$(curl -fsS -4 https://ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
say "Done. Add these two repository secrets to efost/thelistofus-site"
echo "(Settings → Secrets and variables → Actions → New repository secret)"
if [[ -n "$private_key" ]]; then
  printf '\nDEPLOY_SSH_KEY\n%s\n' "$private_key"
else
  printf '\nDEPLOY_SSH_KEY: unchanged (run with --new-key to make a new one)\n'
fi
printf '\nDEPLOY_KNOWN_HOSTS\n'
for f in /etc/ssh/ssh_host_ed25519_key.pub /etc/ssh/ssh_host_ecdsa_key.pub; do
  [[ -f "$f" ]] && echo "$host_ip $(cut -d' ' -f1,2 "$f")"
done
echo
echo "Then merge website-redesign into main (or re-run the Deploy workflow) to go live."
