# GymLog – journal de musculation (PWA)

Application web installable sur Android, qui fonctionne hors-ligne.
Données stockées uniquement sur le téléphone (export/import JSON et CSV dans Réglages).

## Mise en ligne avec GitHub Pages
1. Crée un dépôt GitHub **public** (ex. `gymlog`).
2. Dépose **tous les fichiers de ce dossier à la racine** du dépôt (Add file > Upload files).
3. Settings > Pages > Source : *Deploy from a branch* > branche `main`, dossier `/ (root)` > Save.
4. Après ~1 minute, l'application est disponible sur `https://TON-PSEUDO.github.io/gymlog/`.

## Installation sur le téléphone Android
1. Ouvre le lien ci-dessus dans **Chrome**.
2. Menu ⋮ > **Installer l'application** (ou « Ajouter à l'écran d'accueil »).
3. L'icône GymLog apparaît ; l'app s'ouvre en plein écran et fonctionne sans connexion.

## Mises à jour
Modifie les fichiers sur GitHub : l'app se met à jour à la prochaine ouverture
(si besoin, change `V` dans `sw.js` pour forcer le rafraîchissement du cache).
