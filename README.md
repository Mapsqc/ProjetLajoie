# Camping Lajoie — Panneau d'administration

Application desktop de gestion pour le Camping Lajoie, construite avec Tauri v2, Vue 3 et TypeScript.

## Stack technique

- **Desktop** : Tauri v2
- **Frontend** : Vue 3 + TypeScript + Vite
- **State** : Pinia (composition API)
- **Routing** : Vue Router (hash history pour Tauri)
- **UI** : Tailwind CSS v4 + shadcn-vue
- **Tables** : @tanstack/vue-table
- **Validation** : Zod
- **Dates** : dayjs (locale fr-ca)
- **Icons** : lucide-vue-next

## Prerequis

- Node.js 18+
- Rust (pour le build Tauri desktop)

## Installation

```bash
npm install
```

## Developpement

```bash
# Frontend seulement (navigateur)
npm run dev

# Application desktop Tauri
npm run tauri dev
```

## Build

```bash
npm run tauri build
```

## Identifiants mock

| Champ | Valeur |
|-------|--------|
| Courriel | `admin@camping.com` |
| Mot de passe | `admin123` |

## Structure du projet

```
src/
  app/            # Bootstrap (main.ts, router.ts, pinia.ts)
  layouts/        # AppShell, AuthLayout
  pages/          # Pages route-level
  components/
    ui/           # Composants shadcn-vue
    shared/       # Composants reutilisables
  features/       # Logique par domaine (auth, dashboard, spots, reservations, calendar)
  services/       # Couche service
  stores/         # Stores Pinia
  types/          # Schemas Zod + types TS
  utils/          # Utilitaires (dates, format)
  mocks/          # Donnees et handlers mock
```

## Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de developpement Vite |
| `npm run build` | Build de production |
| `npm run preview` | Preview du build |
| `npm run tauri dev` | App desktop en developpement |
| `npm run tauri build` | Build de l'app desktop |
