# Deployment - Nouveau modèle d'emplacements

## Fichiers à copier sur le VPS

Copier ces 3 fichiers sur le VPS dans `/opt/camping/` :

```
vps-deploy/server/utils/migrate.ts    -> /opt/camping/server/utils/migrate.ts
vps-deploy/server/utils/seed-spots.ts -> /opt/camping/server/utils/seed-spots.ts
vps-deploy/server/api/availability.get.ts -> /opt/camping/server/api/availability.get.ts
```

## Commandes de déploiement (sur le VPS via SSH)

```bash
# 1. Aller dans le dossier
cd /opt/camping

# 2. Backup de la BD
cp data/camping-lajoie.db data/camping-lajoie.db.bak

# 3. Rebuild
npx nuxt build

# 4. Restart
pm2 restart camping~

# 5. Vérifier
curl "http://localhost:3000/api/availability?checkIn=2025-07-01&checkOut=2025-07-05"
```

## Rollback
```bash
cp data/camping-lajoie.db.bak data/camping-lajoie.db
pm2 restart camping~
```
