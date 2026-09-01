# Déploiement (gratuit, sans serveur payant)

Cette procédure est à faire une seule fois. Elle ne nécessite aucun paiement
ni aucun compte Apple Developer.

## 1. Activer GitHub Pages

1. Dans le dépôt, allez dans **Settings** → **Pages**.
2. Sous **Build and deployment**, choisissez **Deploy from a branch**.
3. Sélectionnez la branche `main` et le dossier `/ (root)`.
4. Cliquez sur **Save**.
5. Après quelques minutes, GitHub affiche l'adresse de l'application,
   généralement de la forme :
   `https://VOTRE-COMPTE.github.io/factures-thy/`

> **Important — dépôt privé et GitHub Pages** : un dépôt privé sur un compte
> GitHub gratuit peut publier un site avec GitHub Pages, mais ce site reste
> **public à quiconque connaît l'adresse** (GitHub Pages ne restreint pas
> l'accès selon la visibilité du dépôt sur les comptes gratuits). Cela ne
> pose pas de problème de confidentialité ici puisque l'application ne
> contient et n'affiche aucune donnée cliente : les données de Thy restent
> uniquement sur son téléphone. Le code source, lui, reste privé et n'est
> visible que par les personnes ayant accès au dépôt.

## 2. Vérifier

Ouvrez l'adresse GitHub Pages dans un navigateur : l'application doit
s'afficher. C'est cette adresse que Thy utilisera pour installer
l'application sur son iPhone (voir [INSTALLATION.md](INSTALLATION.md)).

## Mises à jour ultérieures

Pour publier une nouvelle version, il suffit de modifier les fichiers puis :

```bash
git add .
git commit -m "Mise à jour"
git push
```

GitHub Pages republie automatiquement le site après chaque `push`. Le
Service Worker de l'application se met à jour automatiquement au prochain
lancement avec connexion Internet.

## Coût

Cette procédure est entièrement gratuite :
- GitHub (dépôt privé + GitHub Pages) : gratuit.
- Aucun nom de domaine n'est nécessaire.
- Aucun serveur, aucune base de données, aucun abonnement.
