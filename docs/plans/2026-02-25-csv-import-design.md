# Design : Import CSV avec mapping interactif

**Date** : 2026-02-25
**Objectif** : Migration initiale des données d'un ancien système (clients, emplacements, réservations) via une interface d'import CSV dans le panel admin.

## Flow utilisateur (4 étapes)

1. **Choix du type** : Clients, Emplacements ou Réservations
2. **Upload CSV** : Drag & drop ou browse, parsing côté client avec PapaParse
3. **Mapping colonnes** : Associer chaque colonne CSV à un champ du système (auto-détection + correction manuelle)
4. **Aperçu + Import** : Table avec validation Zod, erreurs en rouge, bouton "Importer X lignes valides"

## Types et champs cibles

### Clients
- **Obligatoires** : firstName, lastName, email, phone
- **Optionnels** : city, province

### Emplacements
- **Obligatoires** : number, service, status, pricePerNight
- **Optionnels** : sol, longueur, largeur, vehicleRanges, booleans véhicules

### Réservations
- **Obligatoires** : spotNumber (résolu vers spotId), customerEmail (résolu vers customerId), checkIn, checkOut, adultsCount
- **Optionnels** : childrenCount, status, totalPrice

## Architecture technique

- **Parsing** : PapaParse (côté client, pas d'upload serveur du CSV brut)
- **Auto-mapping** : Correspondance fuzzy entre noms de colonnes CSV et champs système
- **Validation** : Schémas Zod existants, ligne par ligne
- **Import** : Batch POST via API existante (groupes de 50)
- **Progression** : Barre de progression pendant l'import batch

## Structure fichiers

```
src/
├── pages/ImportPage.vue              # Page stepper
├── features/import/
│   ├── ImportTypePicker.vue          # Étape 1
│   ├── CsvUploader.vue              # Étape 2
│   ├── ColumnMapper.vue             # Étape 3
│   ├── ImportPreview.vue            # Étape 4
│   └── import-schemas.ts            # Configs de mapping par type
├── services/import.service.ts        # Batch import via API
```

## Gestion des erreurs

- **Doublons clients** : Détection par email, option sauter/écraser
- **Références réservations** : Résolution spot par numéro, client par email. Erreur si non trouvé.
- **Ordre recommandé** : Emplacements → Clients → Réservations (note affichée dans l'UI)
- **Encodage** : PapaParse gère UTF-8/Latin-1. Warning si caractères mal encodés.

## Dépendance

- `papaparse` (npm) pour le parsing CSV côté client
