# Présentation du Projet : DonationFlow

**Plateforme de crowdfunding et de dons en ligne**

---

## Équipe

| Membre | Rôle |
|--------|------|
| **Abdo** | Développeur Full-Stack (Backend, Base de données, Intégration) |
| **Soukaina** | Développeuse Frontend (UI/UX, Design, Composants) |
| **Salma** | Chef de Projet (Gestion, Documentation, Modèle d'affaires) |

---

## Aperçu du Projet

**DonationFlow** est une plateforme web de crowdfunding qui permet aux utilisateurs de :
- Créer des campagnes de financement
- Faire des dons à des causes variées
- Suivre les contributions en temps réel
- Analyser les performances via un dashboard interactif

**Stack technique :** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Supabase (PostgreSQL, Auth, RLS, Realtime) · Recharts

---

# Partie 1 : Pour le Professeur de React/Next.js (Frontend)

## Architecture Frontend

### Next.js 16 App Router
- **Server Components** par défaut : chargement des données côté serveur, réduction du JS bundle
- **Client Components** (`'use client'`) : uniquement pour l'interactivité (formulaires, temps réel, toggles)
- **Server Actions** : soumission de formulaires sans API REST

## Détail par Étudiant

### Abdo — Backend, Auth & Intégration

#### 1. Authentification Complète (auth/login, sign-up, OAuth)
- **Login (app/auth/login/page.tsx)** : formulaire email + mot de passe avec gestion des erreurs et état de chargement
- **Sign Up (app/auth/sign-up/page.tsx)** : inscription avec confirmation de mot de passe, validation côté client
- **OAuth Providers (components/oauth-providers.tsx)** : intégration de **Google** et **GitHub** via Supabase Auth
  - Configuration des providers OAuth dans Supabase Dashboard
  - Callback route (app/auth/callback/route.ts) pour échange du code OAuth contre une session
- **Middleware (proxy.ts)** : protection des routes /dashboard, vérification de session
- **Clients Supabase Auth** : client.ts (navigateur) et server.ts (côté serveur avec cookies)
- **Gestion des erreurs d'authentification** : page d'erreur dédiée avec diagnostic
- **Redirection intelligente** après connexion/déconnexion

#### 2. Système de Dons (donation-form.tsx)
- Formulaire avec calcul en temps réel des frais de plateforme (5%)
- Affichage de la répartition : montant donné → frais → montant reçu par la campagne
- Gestion des états : utilisateur connecté vs invité, chargement, erreurs
- Validation côté client et soumission vers Supabase
- Support des dons anonymes

#### 3. Dashboard & Analytics (dashboard-charts.tsx)
- **Graphiques Recharts** avec 3 onglets :
  - **LineChart** : Évolution des dons dans le temps
  - **BarChart** : Performance des campagnes (montant collecté vs objectif)
  - **PieChart** : Répartition des revenus (campagne vs plateforme)
- **Statistiques** (dashboard-stats.tsx) : cartes avec icônes pour campagnes actives, total collecté, donateurs uniques, revenus

#### 4. Notifications Temps Réel (realtime-donations.tsx)
- Abonnement Supabase Realtime aux nouveaux dons
- Notifications toast instantanées avec nom, montant et message

#### 5. Backend Supabase
- **Clients Supabase** : client.ts (navigateur) et server.ts (serveur avec cookies)
- **Middleware** : proxy.ts pour la protection des routes /dashboard
- **Server Actions** : actions.ts pour la création de campagne

### Soukaina — Frontend & UI/UX

#### 1. Page d'Accueil (app/page.tsx)
- **Hero Section** : bannière avec dégradé, titre accrocheur, boutons CTA
- **Section Statistiques** : total collecté, campagnes actives, nombre de donateurs
- **Grille de Campagnes** : affichage dynamique des campagnes avec leurs cartes
- **État vide** : message quand aucune campagne n'existe

#### 2. Page Détail de Campagne (campaigns/[id]/page.tsx)
- **Affichage complet** : image, titre, description, catégorie
- **Informations du créateur** avec avatar
- **Barre de progression** animée (progress-bar.tsx)
- **Boutons** : Partager (copie du lien), Faire un don (scroll)
- **Section dons récents** : cartes de dons individuelles
- **Classement des donateurs** (donor-leaderboard.tsx)
- **Formulaire de don** dans la sidebar

#### 3. Navigation & Design
- **Navbar (navbar.tsx)** : responsive avec menu mobile (hamburger), état connecté/déconnecté
- **Mode sombre/clair** (theme-provider.tsx) avec next-themes
- **Composants shadcn/ui** : 60+ composants réutilisables (Card, Button, Input, Badge, Table, Tabs, Dialog, etc.)
- **Design responsive** : mobile-first, grilles adaptatives

### Salma — Gestion & Contenu

#### 1. Gestion des Campagnes (campaign-list.tsx)
- **Liste complète** avec recherche et filtre par statut (actif/en pause/terminé)
- **Barres de progression** par campagne
- **Actions CRUD** : modifier, supprimer (avec confirmation), mettre en pause

#### 2. Pages Dashboard
- **Dashboard principal** (dashboard/page.tsx) : vue d'ensemble avec stats, graphiques, feed d'activité
- **Page Donations** (dashboard/donations/) : tableau complet avec campagne, donateur, montant, frais, message, date
  - Cartes de statistiques : total dons, collecté, frais, donateurs uniques
  - Actions de suppression avec confirmation

#### 3. Flux d'Activité (activity-feed.tsx)
- Fil d'actualité en temps réel avec Supabase Realtime
- Événements : dons reçus, campagnes créées
- Tri chronologique, limite de 20 événements
- États : chargement (skeleton), vide, erreur

#### 4. Données de Démonstration (demo-data.ts)
- 6 campagnes fictives avec donateurs
- Utilisées pour la présentation sans base de données réelle

---

# Partie 2 : Pour le Professeur de Gestion de Projet

## Méthodologie de Travail

### Organisation de l'Équipe (3 membres)

| Rôle | Responsable | Tâches |
|------|-------------|--------|
| **Lead Technique / Backend / Auth** | Abdo | Architecture, base de données, auth (Google, GitHub), intégration |
| **Frontend / UI** | Soukaina | Design, composants, expérience utilisateur |
| **Chef de Projet / QA** | Salma | Planning, documentation, tests, business |

### Cycle de Développement

```
Phase 1: Conception (1 semaine)
├── Analyse des besoins
├── Choix technologiques (Next.js, Supabase, shadcn/ui)
├── Maquettage UI/UX
└── Schéma de base de données

Phase 2: Développement (3 semaines)
├── Sprint 1: Base de données (Abdo)
├── Sprint 2: Auth Google/GitHub + Page d'accueil (Abdo, Soukaina)
├── Sprint 3: Campagnes CRUD (Salma)
├── Sprint 4: Système de dons (Abdo)
├── Sprint 5: Dashboard + Analytics (Soukaina)
└── Sprint 6: Paramètres + Tests (Salma)

Phase 3: Tests & Déploiement (1 semaine)
├── Tests fonctionnels
├── Tests de sécurité (RLS, auth)
├── Correction de bugs
└── Documentation finale
```

### Répartition Détaillée du Travail

| Module | Abdo | Soukaina | Salma |
|--------|:----:|:--------:|:-----:|
| Base de données (Supabase) | ✓ | | |
| Authentification (Google, GitHub) | ✓ | | |
| Page d'accueil | | ✓ | |
| Campagnes (CRUD) | ✓ | | ✓ |
| Système de dons | ✓ | | |
| Dashboard & Graphiques | ✓ | ✓ | |
| Notifications temps réel | ✓ | | |
| Design UI/UX | | ✓ | |
| Mode sombre/clair | | ✓ | |
| Paramètres plateforme | | | ✓ |
| Documentation | | | ✓ |
| Données de démo | | | ✓ |
| Tests & QA | | | ✓ |

### Outils de Gestion Utilisés

- **Versionning** : Git (branches par fonctionnalité)
- **Communication** : Réunions quotidiennes (stand-up)
- **Suivi** : Tableau de tâches partagé
- **Revue de code** : Validation par les 3 membres avant merge

### Défis Relevés

1. **Gestion des états asynchrones** : chargement, erreur, succès pour chaque action
2. **Sécurité des données** : Row-Level Security (13 politiques RLS)
3. **Temps réel** : Abonnement Supabase Realtime pour les notifications instantanées
4. **Responsive design** : Adaptation mobile/tablette/desktop
5. **Expérience utilisateur** : États vides, squelettes de chargement, toasts de succès/erreur

---

# Partie 3 : Pour le Professeur d'Entrepreneuriat

## Modèle d'Affaires

### Problème Identifié
Les créateurs de projets solidaires et les startups manquent d'une plateforme simple, transparente et moderne pour collecter des fonds avec des frais réduits.

### Solution : DonationFlow
Plateforme de crowdfunding avec :
- Création de campagnes en quelques clics
- Dons sécurisés avec suivi en temps réel
- Frais de plateforme transparents et configurables
- Dashboard analytique pour suivre les performances
- Notifications en temps réel pour un engagement immédiat

### Modèle Économique

#### Source de Revenus : Frais de Plateforme
- **Frais par défaut** : 5% sur chaque don
- **Configurable** : 0% à 50% selon la stratégie
- **Exemple** : Don de 100 MAD → 5 MAD pour la plateforme, 95 MAD pour la campagne

#### Projections Financières

| Métrique | Calcul |
|----------|--------|
| Revenu par don | 5% du montant |
| Seuil de rentabilité | 1000 dons de 100 MAD = 5 000 MAD de revenu |
| Coûts opérationnels | Hébergement (Supabase/Vercel), maintenance |

### Proposition de Valeur

#### Pour les Créateurs de Campagnes
- **Gratuit** à la création
- **Dashboard complet** pour suivre les dons en temps réel
- **Analytics** : graphiques d'évolution, performance des campagnes
- **Partage facile** : lien direct, bouton de partage

#### Pour les Donateurs
- **Transparence** : visualisation des frais avant validation
- **Simplicité** : don en 3 clics, sans compte obligatoire
- **Anonymat** : option de don anonyme
- **Temps réel** : notification instantanée de l'impact

### Analyse du Marché

#### Concurrence
| Plateforme | Frais | Fonctionnalités |
|------------|-------|-----------------|
| GoFundMe | 2.9% + 0.30$ | International, Paiements |
| KissKissBankBank | 5% + 3.5% paiement | Europe, Projets créatifs |
| **DonationFlow** | **5% (configurable)** | **Temps réel, Analytics, Open source** |

#### Avantages Concurrentiels
1. **Technologie moderne** : Next.js 16, React 19, Supabase
2. **Temps réel** : Notifications instantanées à chaque don
3. **Transparence** : Frais visibles et configurables
4. **Analytics intégrés** : Graphiques, statistiques, tableaux de bord
5. **Open source** : Code accessible et modifiable

### Stratégie de Croissance

1. **Phase 1 (MVP)** : Plateforme fonctionnelle avec auth, dons, dashboard
2. **Phase 2** : Paiements en ligne réels (Stripe/PayPal)
3. **Phase 3** : Fonctionnalités sociales (commentaires, partage réseaux)
4. **Phase 4** : Version mobile native (React Native)
5. **Phase 5** : Marketplace de campagnes avec recommandations IA

### Impact Social
- Facilite le financement de causes médicales, éducatives, communautaires
- Permet aux startups de lever des fonds facilement
- Transparence totale entre donateurs et créateurs
- Pas de barrière à l'entrée : inscription gratuite, création de campagne gratuite

---

## Pages et Routes du Projet

| Route | Type | Description |
|-------|------|-------------|
| `/` | Public | Page d'accueil (hero, stats, campagnes) |
| `/auth/login` | Public | Connexion |
| `/auth/sign-up` | Public | Inscription |
| `/auth/sign-up-success` | Public | Confirmation d'inscription |
| `/auth/callback` | API | Échange code OAuth |
| `/auth/error` | Public | Page d'erreur auth |
| `/campaigns/[id]` | Public | Détail campagne + don |
| `/dashboard` | Protégé | Vue d'ensemble + graphiques |
| `/dashboard/create` | Protégé | Création de campagne |
| `/dashboard/campaigns/[id]/edit` | Protégé | Modification campagne |
| `/dashboard/donations` | Protégé | Historique des dons |
| `/dashboard/settings` | Protégé | Configuration plateforme |

## Schéma de la Base de Données

```
profiles (id, full_name, avatar_url, created_at, updated_at)
campaigns (id, user_id, title, description, goal_amount, current_amount, category, status, image_url, created_at, updated_at)
donations (id, campaign_id, donor_id, amount, platform_fee, platform_fee_percentage, donor_name, donor_email, message, anonymous, created_at)
platform_settings (id, fee_percentage, updated_at)
```

---

**Projet réalisé par :** Abdo · Soukaina · Salma  
**Technologies :** Next.js 16 · React 19 · TypeScript · Tailwind CSS · Supabase · Recharts · shadcn/ui
