#!/usr/bin/env bash
# One-time VPS setup for the yashfaa-clinic app.
# Run manually over SSH (as root or with sudo) from a checkout of this repo
# on the VPS — it is NOT run by CI. Re-running it later is safe (every step
# is idempotent) if you need to repair something.
#
# Before running this: point the domain's DNS A record(s) at this VPS's IP
# for both yashfaa-clinic.uz and www.yashfaa-clinic.uz, and wait for them to
# resolve — certbot's HTTP challenge will fail otherwise.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DOMAIN="yashfaa-clinic.uz"

apt-get update

# Node.js 20 LTS (needed to run the built server; CI ships a self-contained
# .output build, so no project deps need installing here).
if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# PM2 keeps the Node process running and restarts it on crash/reboot.
command -v pm2 >/dev/null || npm install -g pm2

# Nginx + certbot for the reverse proxy and TLS certificate.
command -v nginx >/dev/null || apt-get install -y nginx
command -v certbot >/dev/null || apt-get install -y certbot python3-certbot-nginx

mkdir -p /opt/yashfaa/app

# Install the Nginx site config (HTTP only at this point).
cp "$REPO_DIR/deploy/nginx/$DOMAIN.conf" "/etc/nginx/sites-available/$DOMAIN.conf"
ln -sf "/etc/nginx/sites-available/$DOMAIN.conf" "/etc/nginx/sites-enabled/$DOMAIN.conf"
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# Issue the certificate and let certbot rewrite the Nginx config for HTTPS
# + the http->https redirect.
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN"

# Start pm2's own boot-time resurrection service (prints a command to run
# as root on first use — this invocation already runs as root).
pm2 startup systemd -u "$(whoami)" --hp "$HOME"

echo "Done. Deploy the app with the 'Deploy App (VPS)' GitHub Actions workflow."
