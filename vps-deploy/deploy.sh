#!/bin/bash
# Deployment script for Camping Lajoie VPS server
# Run this from /opt/camping on the VPS

set -e

echo "=== Camping Lajoie - Deploying new spot model ==="

# Backup the database
if [ -f data/camping-lajoie.db ]; then
  echo "[1/5] Backing up database..."
  cp data/camping-lajoie.db data/camping-lajoie.db.bak
  echo "  -> Backup saved to data/camping-lajoie.db.bak"
else
  echo "[1/5] No existing database found, skipping backup"
fi

# Copy updated server files
echo "[2/5] Copying updated server files..."
cp -v server/utils/migrate.ts.new server/utils/migrate.ts
cp -v server/utils/seed-spots.ts.new server/utils/seed-spots.ts
cp -v server/api/availability.get.ts.new server/api/availability.get.ts
echo "  -> Server files updated"

# Rebuild the application
echo "[3/5] Rebuilding application..."
npx nuxt build
echo "  -> Build complete"

# Restart PM2
echo "[4/5] Restarting PM2..."
pm2 restart camping~ || pm2 restart all
echo "  -> PM2 restarted"

# Verify
echo "[5/5] Verifying..."
sleep 3
curl -s "http://localhost:3000/api/availability?checkIn=2025-07-01&checkOut=2025-07-05" | head -c 200
echo ""
echo ""
echo "=== Deployment complete! ==="
echo "To rollback: cp data/camping-lajoie.db.bak data/camping-lajoie.db && pm2 restart camping~"
