# CLAUDE.md - Camping Lajoie Admin Panel

## Projet

Application desktop d'administration pour **Camping Lajoie** (gestion de réservations, clients, emplacements et fiscalité). Interface en **français**.

## Stack technique

- **Frontend** : Vue 3 (Composition API, `<script setup lang="ts">`), TypeScript (strict), Vite 6
- **Desktop** : Tauri v2 (avec plugins SQL et Opener)
- **State** : Pinia 3 (composition API style)
- **Routing** : Vue Router 5 (hash history, requis pour Tauri)
- **UI** : Tailwind CSS v4, shadcn-vue (style new-york), Radix Vue, Reka UI, Lucide icons
- **Validation** : Zod 4 (schemas = types + validation runtime)
- **HTTP** : api-client.ts custom (fetch wrapper avec auth headers)
- **Dates** : dayjs (locale fr-ca)
- **PDF** : jsPDF
- **Tables** : @tanstack/vue-table
- **Toasts** : vue-sonner (position top-right, durée 3s)
- **Tests** : Vitest (environment node)

## Architecture

```
src/
├── app/           # Bootstrap (main.ts, pinia.ts, router.ts)
├── pages/         # Composants de route (une page par route)
├── layouts/       # AppShell (sidebar) et AuthLayout (login)
├── components/
│   ├── ui/        # Composants shadcn-vue (ne pas modifier manuellement)
│   └── shared/    # Composants métier réutilisables
├── features/      # Composants spécifiques par domaine (dialogs, tables, etc.)
├── services/      # Couche API (un fichier par domaine)
├── stores/        # Pinia stores (un fichier par domaine)
├── types/         # Schémas Zod + types TypeScript
├── utils/         # Fonctions utilitaires (date, format, pricing, pdf)
├── lib/           # Utilitaires généraux (cn(), etc.)
└── mocks/         # Données et handlers mock pour le développement
```

### Flux de données

```
api-client.ts → services/*.service.ts → stores/*.store.ts → composants Vue
```

## Conventions de code

### Composants Vue

- Toujours utiliser `<script setup lang="ts">`
- Imports avec alias `@/` (= `./src/`)
- State réactif avec `ref()` et `computed()`
- Props typées avec `defineProps<{ ... }>()`
- Événements typés avec `defineEmits<{ ... }>()`

### Services

- Utiliser les fonctions de `@/services/api-client.ts` : `apiGet<T>`, `apiPost<T>`, `apiPatch<T>`, `apiPut<T>`
- Chaque service exporte des fonctions async typées
- Ne jamais appeler fetch directement, toujours passer par api-client

### Stores (Pinia)

- Pattern composition API (`defineStore('name', () => { ... })`)
- State : `ref()` pour les données, `isLoading`, `error`
- Actions : fonctions async avec try/catch
- Toasts pour les notifications utilisateur (via `toast` de vue-sonner)

### Types

- Définir les types avec des schémas Zod dans `src/types/`
- Exporter le type inféré : `export type X = z.infer<typeof XSchema>`
- Utiliser les schémas Zod pour la validation de formulaires

### Styles

- Tailwind CSS uniquement (pas de CSS custom sauf global dans style.css)
- Classes utilitaires, approche mobile-first
- Utiliser `cn()` de `@/lib/utils` pour merger les classes conditionnelles

## Commandes

```bash
npm run dev          # Serveur dev (port 1420)
npm run build        # Build production (type-check + vite build)
npm run preview      # Preview du build
npm run tauri         # Commandes Tauri desktop
npm run test         # Tests unitaires
npm run test:watch   # Tests en mode watch
```

## Variables d'environnement

- `VITE_API_BASE_URL` : URL de l'API backend
- `VITE_ADMIN_API_KEY` : Clé API pour l'authentification admin

## Domaine métier

### Statuts de réservation

`CONFIRMED` | `HOLD` | `CANCELLED` | `EXPIRED` | `COMPLETED` | `NO_SHOW`

### Calculs de prix (src/utils/pricing.ts)

- Taux de taxe : 14.975%
- Dépôt : 25% du total
- Occupants de base : 2 (inclus dans le prix de base)
- Frais personne supplémentaire : 6$/nuit/personne

## Règles importantes

- **Langue de l'interface** : Français (toujours écrire les labels, messages et textes UI en français)
- **Ne pas modifier** les composants dans `src/components/ui/` (gérés par shadcn-vue CLI)
- **Hash history** obligatoire pour le routing (compatibilité Tauri)
- **Auth** : Token stocké dans localStorage (`auth_token`), vérifié par le guard du router
- **Pas de CSS-in-JS** : Utiliser exclusivement Tailwind CSS
