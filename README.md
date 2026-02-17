# WeWeb Video Slider (Vertical)

Slider vertical de vidéos, inspiré du style TikTok, conçu pour WeWeb.

## Fonctionnalités
- Navigation verticale par glisser (pointer/touch)
- Boutons `Prev/Next` et points de pagination (optionnels)
- Lecture automatique des vidéos visibles (pause des autres)
- Slide CTA finale (appel à l’action)
- Gestion du `poster`, du `muted` et des contrôles natifs

## Intégration
Utilise la CLI WeWeb et les scripts du projet :
- `npm run serve`
- `npm run build`

## Configuration (WeWeb)
Dans l’éditeur WeWeb, configure les propriétés suivantes :
- `videos` (Array)
  - `url` (string) : URL de la vidéo
  - `poster` (string) : URL du poster (optionnel)
  - `caption` (string) : légende (optionnelle)
- `showControls` (boolean) : affiche les contrôles natifs
- `showDots` (boolean) : affiche les points de pagination
- `autoPlayMuted` (boolean) : lecture auto en sourdine

## Comportement
- Le slider est vertical et passe à la vidéo suivante/précédente après un glissement suffisant.
- Une slide CTA est ajoutée automatiquement à la fin des vidéos.
- Seule la vidéo visible est lue, les autres sont mises en pause.

## Notes
- L’auto‑play est soumis aux politiques navigateur (souvent requis `muted`).
- Les formats vidéo supportés dépendent du navigateur (MP4 recommandé).

## À préciser (si besoin)
Si tu veux que je documente des points spécifiques (CTA, design, accessibilité, analytics, etc.), dis-moi lesquels.
