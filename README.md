# TOV4R MUSIC — Website V5

Site vitrine responsive **HTML / CSS / JavaScript**, prêt pour GitHub Pages, pour le bot Discord **TOV4R MUSIC**.

## Nouveautés de V5

- **Playlist Stormy — DESPERADO (2026)**, les **15 morceaux** dans l'ordre officiel, avec les durées et les artistes invités. Lecture assurée via un **lecteur officiel Apple Music** intégré. Selon le pays et le compte Apple Music, l'écoute complète peut nécessiter un abonnement. Les fichiers audio de Stormy **ne sont pas redistribués** par ce site.
- **Vrai lecteur audio HTML5** avec quatre petites compositions instrumentales originales incluses dans `assets/audio/`. Play, Pause, suivant, précédent, volume, barre de progression, shuffle, répétition et changement de pochette.
- **Playlist améliorée** : favoris conservés pendant la session, retrait des fichiers importés, contrôle Muet/Réactiver le son et statut de lecture.
- **Tracklist Stormy corrigée** : les lignes sont des métadonnées (pas de faux liens individuels) ; la lecture se fait exclusivement avec le lecteur officiel Apple Music.
- **Import de fichiers audio personnels** (MP3, WAV, OGG, M4A, WebM) dans le navigateur. Les fichiers ne sont pas uploadés. Les fichiers importés restent dans la liste uniquement le temps de la session.
- **Fond vidéo animé original**, plus effets d'intro, dans `assets/hero-ambient.mp4`.
- **Captures illustratives des commandes** (concepts graphiques, non captures d'un vrai serveur Discord).
- **Page Support / FAQ séparée**, accessible par `support.html`.
- Visuels et galerie rouge/noir, menu responsive, commandes filtrables et boutons de copie.

## Lancer le site

1. Décompresse le ZIP.
2. Ouvre le dossier `TOV4R-MUSIC-WEBSITE`.
3. Lance `index.html` dans ton navigateur. Pour une expérience plus fidèle aux conditions d'hébergement, tu peux servir les fichiers statiquement depuis le dossier :

```bash
python -m http.server 8000
```

Puis ouvre `http://localhost:8000`.

**Note :** Apple Music est un service externe. Son lecteur intégré nécessite une connexion Internet et suit les restrictions de son fournisseur. Le lecteur de morceaux originaux fonctionne directement avec les fichiers du projet.

## Ajouter le bot Discord

Le lien est déjà configuré dans `assets/config.js` :

`https://discord.com/oauth2/authorize?client_id=1567328279265017968`

Il suffit de changer `clientId` et `inviteUrl` si tu changes de bot. Ne publie **jamais le token du bot** dans HTML, JS ni sur GitHub. L'Application ID est public.

`supportUrl` et `githubUrl` sont facultatifs. Tant qu'aucun serveur support n'est indiqué, la page `support.html` peut répondre aux questions sans inventer un lien de support.

## Publier sur GitHub Pages

1. Crée un dépôt GitHub.
2. Transfère **le contenu** de ce dossier, pour que `index.html` et `support.html` se trouvent à la racine du dépôt.
3. Dans **Settings → Pages**, sélectionne **Deploy from a branch**.
4. Choisis `main` et `/(root)`, puis sauvegarde.

Le site ne nécessite pas de backend.

## Structure

```text
TOV4R-MUSIC-WEBSITE/
├── index.html                # Accueil, vrai lecteur, playlist DESPERADO, commandes
├── support.html              # FAQ et support dédiés
├── README.md
└── assets/
    ├── app.js                # Interactions, audio HTML5, commandes, tracklist
    ├── config.js             # Application ID Discord et liens configurables
    ├── style.css             # Design + responsive
    ├── hero-ambient.mp4      # Animation de fond originale
    ├── desperado-art.webp    # Artwork TOV4R original (pas la jaquette officielle)
    ├── shot-music.webp       # Aperçu conceptuel des commandes
    ├── shot-queue.webp
    ├── shot-control.webp
    ├── ... autres images et icônes
    └── audio/
        ├── midnight-signal.mp3
        ├── after-hours.mp3
        ├── neon-frequency.mp3
        └── red-room.mp3
```

## Informations importantes

- Le **TOV4R Player** lit de vrais fichiers audio locaux, indépendamment du bot Discord. Il ne peut pas contrôler le bot à distance sans backend et authentification Discord.
- Le lecteur officiel **Stormy / DESPERADO** suit les conditions d'utilisation d'Apple Music. Il ne peut pas être contrôlé par les boutons du lecteur TOV4R Player.
- La compatibilité du **bot Discord** avec YouTube, Spotify et d'autres plateformes dépend du code du bot. Le site n'active pas ces intégrations.
- L'album **DESPERADO** est une œuvre de Stormy publiée en 2026 (Austora). Les titres et durées sont utilisés comme métadonnées. L'illustration de cet album sur le site a été créée pour le site TOV4R, et n'est pas la couverture officielle.
- Les aperçus Discord sont des mockups de présentation ; ils ne constituent pas des captures réelles du bot en production.

## Personnalisation

- Modifier le texte et les sections dans `index.html` et `support.html`.
- Modifier les couleurs et les animations dans `assets/style.css`.
- Modifier les pistes musicales originales de démo et les commandes dans `assets/app.js`.
- Modifier le lien d'installation dans `assets/config.js`.

Enjoy your music — **TOV4R MUSIC**.
