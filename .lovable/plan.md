# Plan de refonte progressive — Yves Janvier Platform

Objectif : refondre l'architecture par petites tâches indépendantes (<2h chacune), réversibles, sans régression. Chaque tâche est validable individuellement.

Légende priorité : **C** = Critique · **H** = Haute · **M** = Moyenne · **F** = Faible

---

## BLOC 0 — Filet de sécurité (à faire AVANT toute refonte)

### T0.1 — Ajouter un ErrorBoundary global **[C · 1h]**
- **Fichiers** : `src/components/ErrorBoundary.tsx` (nouveau), `src/App.tsx` (wrap autour de `AppRouter`).
- **Risque** : aucun ; ajoute uniquement un fallback UI.
- **Validation** : provoquer une erreur dans une page test → fallback s'affiche, le reste de l'app reste utilisable.

### T0.2 — Corriger `process.env.NODE_ENV` → `import.meta.env.MODE` **[C · 15min]**
- **Fichiers** : `src/components/security/SecurityProvider.tsx`.
- **Risque** : faible ; aligne avec Vite.
- **Validation** : `bun run build` passe, console sans warning.

### T0.3 — Activer un `tsgo --noEmit` en pré-vérif manuelle **[H · 30min]**
- **Fichiers** : `package.json` (ajout script `typecheck`).
- **Risque** : aucun (lecture seule).
- **Validation** : `bun run typecheck` retourne 0 erreur sur l'état actuel (baseline).

---

## BLOC 1 — Hardening sécurité (Phase 0 de l'audit)

### T1.1 — `ProtectedRoute` rôle-aware **[C · 1h30]**
- **Fichiers** : `src/components/dashboard/ProtectedRoute.tsx`, `src/components/dashboard/AuthProvider.tsx` (lecture du rôle via RPC `has_role` ou requête `user_roles`).
- **Risque** : un admin légitime sans entrée `user_roles` perdrait l'accès → vérifier que l'utilisateur courant a bien la ligne admin AVANT déploiement.
- **Validation** :
  1. Se connecter en admin → dashboard accessible.
  2. Créer un user non-admin → redirection vers `/` ou page "accès refusé".
  3. Logout → redirection login.

### T1.2 — Activer `verify_jwt = true` sur `generate-cover-image` **[C · 30min]**
- **Fichiers** : `supabase/config.toml`, `supabase/functions/generate-cover-image/index.ts` (retirer auth manuelle redondante).
- **Risque** : appels existants doivent passer le JWT — vérifier les call-sites côté front (`supabase.functions.invoke` le fait automatiquement).
- **Validation** : appel depuis dashboard fonctionne, appel anonyme curl renvoie 401.

### T1.3 — Activer `verify_jwt = true` sur `generate-blog-article` **[C · 30min]**
- Idem T1.2 pour cette fonction.
- **Validation** : génération article depuis dashboard OK ; curl anonyme → 401.

### T1.4 — Activer `verify_jwt = true` sur `content-agent` **[C · 1h]**
- **Fichiers** : `supabase/config.toml`, vérifier toutes les invocations front (`ContentAgentPage.tsx`).
- **Risque** : plus élevé — fonction utilisée par 6 actions différentes ; tester chaque action.
- **Validation** : tester chacune des actions (discover, generate-visual, generate-carousel, auto-pipeline, republish, proofread).

### T1.5 — Ajouter vérification rôle `admin` en début des 3 edge functions IA **[C · 1h]**
- **Fichiers** : `generate-blog-article`, `generate-cover-image`, `content-agent` (`_shared/auth.ts` nouveau, utilisé par les 3).
- **Risque** : régression si le user actuel n'a pas le rôle admin.
- **Validation** : appel admin OK, appel user normal → 403.

### T1.6 — Migrer `service_role_key` hors `app.*` settings vers Vault **[H · 1h30]**
- **Fichiers** : migration SQL (mise à jour des 2 triggers `trigger_blog_post_notification`, `trigger_project_notification`).
- **Risque** : si Vault mal configuré, notifications cassées ; garder ancien fallback temporairement.
- **Validation** : publier un article test → email notification reçu.

### T1.7 — Nettoyer `SecurityProvider` (retirer CSRF mort, garder rate-limit log) **[M · 30min]**
- **Fichiers** : `src/components/security/SecurityProvider.tsx`, `src/lib/security.ts`.
- **Risque** : composants qui consomment `useSecurity().csrfToken` → recherche globale d'abord.
- **Validation** : build OK, aucune référence orpheline.

---

## BLOC 2 — Couche services (préparation aux décompositions)

### T2.1 — Créer `src/services/` avec un service par domaine (squelettes) **[H · 1h]**
- **Fichiers** : `src/services/blog.service.ts`, `portfolio.service.ts`, `journal.service.ts`, `testimonials.service.ts`, `services.service.ts`, `resources.service.ts`, `content-queue.service.ts`.
- Chaque service exporte : `list()`, `get(id)`, `create(dto)`, `update(id, dto)`, `remove(id)`.
- **Risque** : aucun ; code non encore appelé.
- **Validation** : `bun run typecheck` passe.

### T2.2 — Migrer `ProjectList` vers `portfolio.service.ts` **[H · 1h]**
- **Fichiers** : `src/components/dashboard/portfolio/project-list.tsx`.
- Le composant n'appelle plus `supabase.from(...)` directement.
- **Risque** : régression liste portfolio dashboard.
- **Validation** : afficher, supprimer, toggle featured d'un projet — tout fonctionne.

### T2.3 — Migrer `TestimonialsList` vers service **[H · 45min]**
- **Fichiers** : `src/components/dashboard/testimonials/TestimonialsList.tsx`.
- **Validation** : CRUD testimonials OK.

### T2.4 — Migrer `BlogList` vers service **[H · 45min]**
- **Fichiers** : `src/components/dashboard/blog/BlogList.tsx`.
- **Validation** : CRUD blog OK.

### T2.5 — Migrer `JournalList`, `ServicesList`, `ResourcesList` vers services **[H · 1h30]**
- 3 micro-tâches en série.
- **Validation** : CRUD de chaque section OK.

---

## BLOC 3 — TanStack Query systématique

### T3.1 — Créer `src/lib/query-keys.ts` avec factory typée **[M · 30min]**
- **Risque** : aucun.
- **Validation** : build OK.

### T3.2 — Hook `useEntityList<T>` générique (TanStack Query + service) **[H · 1h30]**
- **Fichiers** : `src/hooks/data/useEntityList.ts`.
- **Risque** : faible (nouveau hook, pas encore utilisé).
- **Validation** : test isolé sur 1 liste (ex: testimonials) ; comparer comportement.

### T3.3 — Migrer `TestimonialsList` vers `useEntityList` **[H · 45min]**
- Premier vrai usage du hook générique.
- **Validation** : CRUD + recherche + cache OK ; pas de re-fetch inutile (vérifier devtools).

### T3.4 — Migrer `ProjectList`, `BlogList`, `JournalList`, `ServicesList`, `ResourcesList` vers `useEntityList` **[H · 2h max — sinon découper en 2]**
- **Risque** : régressions UI mineures (loader, empty state).
- **Validation** : pour chaque liste : afficher, rechercher, supprimer.

---

## BLOC 4 — Décomposition de `ContentAgentPage` (~1000 lignes)

### T4.1 — Créer dossier `src/features/content-agent/` **[M · 30min]**
- Structure : `tabs/`, `dialogs/`, `hooks/`, `components/`, `types.ts`, `index.tsx`.
- **Risque** : aucun.

### T4.2 — Extraire les hooks data (`useContentQueue`, `useContentDiscovery`) **[H · 1h30]**
- **Fichiers** : `features/content-agent/hooks/*`, page allégée.
- **Validation** : tous les onglets affichent les mêmes données qu'avant.

### T4.3 — Extraire l'onglet **Découvrir** dans `tabs/DiscoverTab.tsx` **[H · 1h]**
- **Validation** : onglet identique, génération discovery OK.

### T4.4 — Extraire l'onglet **Contenu** dans `tabs/ContentTab.tsx` **[H · 1h]**
- **Validation** : prévisualisation, partage, suppression OK.

### T4.5 — Extraire l'onglet **Programme** (calendrier) dans `tabs/ScheduleTab.tsx` + `components/ContentCalendar.tsx` **[H · 1h30]**
- **Risque** : c'est ici que les `NotFoundError` apparaissaient — bien tester navigation entre onglets.
- **Validation** : naviguer 10× entre onglets, switcher mois calendrier, aucune erreur console.

### T4.6 — Extraire l'onglet **Automation** dans `tabs/AutomationTab.tsx` **[H · 45min]**
- **Validation** : déclenchement pipeline OK.

### T4.7 — Extraire l'onglet **Analytique** dans `tabs/AnalyticsTab.tsx` **[H · 1h]**
- **Validation** : tous les charts s'affichent.

### T4.8 — Extraire le `UnifiedPublisher` dans `dialogs/UnifiedPublisherDialog.tsx` **[H · 1h30]**
- **Validation** : séquence "Tout publier" fonctionne (LinkedIn, WhatsApp, download IG).

### T4.9 — Vérifier `ContentAgentPage.tsx` réduit à <150 lignes **[M · 15min]**
- **Validation** : grep wc -l ; relecture finale.

---

## BLOC 5 — Décomposition de l'edge function `content-agent`

### T5.1 — Créer `supabase/functions/_shared/` (auth, cors, gemini-client) **[H · 1h30]**
- **Risque** : aucun (code non utilisé).
- **Validation** : `supabase functions serve` build sans erreur.

### T5.2 — Extraire `content-discover` en fonction dédiée **[H · 1h30]**
- **Fichiers** : nouvelle fn, `config.toml`, front (`ContentAgentPage` → invoque la nouvelle fn).
- **Risque** : action discover cassée si invocation mal redirigée.
- **Validation** : bouton "Découvrir" fonctionne.

### T5.3 — Extraire `content-generate-visual` **[H · 1h30]**
- **Validation** : génération visuelle d'un quote-card produit la même sortie.

### T5.4 — Extraire `content-carousel` **[H · 1h30]**
- **Validation** : carousel 3 slides OK.

### T5.5 — Extraire `content-pipeline` (auto-pipeline) **[H · 1h]**
- **Validation** : pipeline auto end-to-end OK.

### T5.6 — Extraire `content-republish` et `content-proofread` **[M · 1h30]**
- **Validation** : republication d'un article + proofread français OK.

### T5.7 — Supprimer l'ancienne fonction `content-agent` **[M · 15min]**
- **Risque** : si une invocation oubliée → erreur 404 front.
- **Validation** : grep global `content-agent` → uniquement archives.

---

## BLOC 6 — Refactor SQL (dette mineure)

### T6.1 — Créer 1 fonction générique `public.tg_set_updated_at()` + recâbler 12 triggers **[M · 1h]**
- **Fichiers** : 1 migration.
- **Risque** : si trigger mal recréé → `updated_at` ne s'incrémente plus.
- **Validation** : UPDATE manuel sur 3 tables → `updated_at` change.

### T6.2 — Supprimer les 12 anciennes fonctions `update_*_updated_at` **[F · 30min]**
- Faire APRÈS T6.1 validé en prod.
- **Validation** : aucune erreur sur UPDATE.

---

## BLOC 7 — Normalisation & conventions

### T7.1 — Inventorier les fichiers casing inconsistant **[M · 30min]**
- **Livrable** : liste markdown des renames à faire.
- **Risque** : aucun.

### T7.2 — Renommer fichiers `project-list.tsx`, etc. en PascalCase **[M · 1h]**
- **Risque** : imports cassés ; faire 1 fichier à la fois avec recherche d'imports.
- **Validation** : build OK après chaque rename.

### T7.3 — Réorganiser `src/hooks/` en `hooks/ui/` et `hooks/data/` **[M · 1h]**
- **Risque** : imports à mettre à jour.
- **Validation** : build OK.

### T7.4 — Activer `strictNullChecks: true` dans `tsconfig.app.json` **[H · 2h max — sinon découper]**
- **Risque** : élevé, beaucoup d'erreurs TS à corriger.
- **Validation** : `bun run typecheck` 0 erreur.

### T7.5 — Activer `noImplicitAny: true` **[H · 2h max — sinon découper]**
- **Validation** : `bun run typecheck` 0 erreur.

---

## BLOC 8 — Performance ciblée

### T8.1 — Lazy-load `Recharts` (charts dashboard) **[M · 45min]**
- **Fichiers** : `AnalyticsTab.tsx`, `analytics/AnalyticsCharts.tsx`.
- **Validation** : Lighthouse bundle initial réduit ; charts s'affichent toujours.

### T8.2 — Lazy-load pages publiques peu visitées (`ResourcesPage`, `JournalPage`) **[M · 30min]**
- **Fichiers** : `src/router/AppRouter.tsx`.
- **Validation** : navigation fonctionne, splitting visible dans Network.

### T8.3 — Ajouter `React.memo` sur `ContentCalendar` et items du calendrier **[F · 45min]**
- **Validation** : DevTools profiler — réduction des re-renders.

### T8.4 — Pagination serveur pour `BlogList` (>20 items) **[M · 1h30]**
- **Fichiers** : `BlogList.tsx`, `blog.service.ts`.
- **Validation** : tester avec >20 articles ; pagination fluide.

---

## BLOC 9 — Tests (optionnel, à programmer après stabilisation)

### T9.1 — Installer Vitest + Testing Library **[M · 30min]**
### T9.2 — 1er test sur `blog.service.ts` (mock Supabase) **[M · 1h]**
### T9.3 — 1 test E2E Playwright : login dashboard **[M · 1h30]**

---

## Ordre d'exécution recommandé

```text
BLOC 0  →  BLOC 1  →  BLOC 2  →  BLOC 3
                                    ↓
                  BLOC 4  ←  ←  ←  ←
                    ↓
                  BLOC 5
                    ↓
        BLOC 6  +  BLOC 7  +  BLOC 8  (en parallèle)
                    ↓
                  BLOC 9
```

## Règles à respecter à chaque tâche

1. Une seule tâche par commit logique.
2. Validation manuelle obligatoire avant la suivante.
3. Si une tâche dépasse 2h, la découper.
4. En cas de doute, utiliser le bouton "Revert" Lovable.
5. Garder un journal de bord (quelle tâche, quels fichiers, quelles validations).

## Estimation totale

- **BLOC 0+1 (Critique)** : ~8h
- **BLOC 2+3 (Haute)** : ~10h
- **BLOC 4+5 (Haute)** : ~18h
- **BLOC 6+7+8 (Moyenne)** : ~12h
- **BLOC 9 (Optionnel)** : ~3h

**Total : ~50h de dev, étalées sur 2-3 semaines à raison de 2-3h/jour.**
