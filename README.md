# Kreads Battle 🎬

Plateforme interne de vote pour le meilleur montage publicitaire de l'agence Kreads.  
Les monteurs soumettent un lien YouTube ou Vimeo. Les votants élisent leur favori.

---

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Upstash Redis** — votes, sessions, vidéos (gratuit jusqu'à 10k requêtes/jour)
- **Vercel** — déploiement zero-config

Pas de stockage vidéo, pas de R2, pas de S3. Juste des liens YouTube/Vimeo.

---

## Setup en 4 étapes

### 1. Clone & install

```bash
git clone <ton-repo>
cd kreads-battle
npm install
```

### 2. Variables d'environnement

```bash
cp .env.example .env.local
```

Remplis les 3 variables :

#### Upstash Redis (gratuit)
1. [console.upstash.com](https://console.upstash.com) → Create Database
2. Choisis la région la plus proche (Paris / Frankfurt)
3. Copie **REST URL** et **REST Token**

```env
UPSTASH_REDIS_REST_URL=https://xxxxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxxxxxxxxxxxx
SESSION_SECRET=une_chaine_aleatoire_longue_ici
REVEAL_DATE=2025-12-31T18:00:00.000Z
```

### 3. Dev local

```bash
npm run dev
# → http://localhost:3000
```

### 4. Deploy Vercel

```bash
git init && git add . && git commit -m "init: kreads battle"
git remote add origin https://github.com/TON_USER/kreads-battle.git
git push -u origin main
```

Vercel.com → New Project → importe le repo → ajoute les 4 variables d'env → Deploy.

---

## Fonctionnement

### Monteur
1. Login prénom + nom → page **Soumettre**
2. Coller un lien YouTube ou Vimeo → aperçu embed en direct
3. Ajouter un titre + note optionnelle → soumettre
4. La vidéo apparaît dans la galerie avec miniature et player embed

### Votant
1. Login → galerie → parcourir les vidéos
2. Voter (1 vote, anonyme, définitif)
3. Badge "J'ai voté" affiché partout

### Révélation
- Avant `REVEAL_DATE` : leaderboard scellé + countdown
- Après `REVEAL_DATE` : podium + scores animés
- `FORCE_REVEAL=true` pour forcer (debug admin)

---

## Structure

```
src/
├── app/
│   ├── page.tsx                    # Login
│   ├── galerie/
│   │   ├── page.tsx                # Galerie (server)
│   │   ├── GalerieClient.tsx       # Galerie (interactif)
│   │   └── [id]/page.tsx           # Page vidéo avec embed
│   ├── submit/page.tsx             # Soumission lien vidéo
│   ├── leaderboard/
│   │   ├── page.tsx
│   │   └── LeaderboardClient.tsx
│   └── api/
│       ├── auth/route.ts           # Login
│       ├── auth/me/route.ts        # Session
│       ├── videos/route.ts         # Liste vidéos
│       ├── vote/route.ts           # Voter
│       ├── submit/route.ts         # Enregistrer vidéo
│       └── preview-url/route.ts    # Parser URL pour aperçu
├── components/
│   ├── Navbar.tsx
│   ├── Countdown.tsx
│   └── VideoCard.tsx
└── lib/
    ├── redis.ts      # Client Upstash + types
    ├── video.ts      # Parser YouTube/Vimeo
    ├── session.ts    # Cookie session
    └── reveal.ts     # Logique révélation
```
