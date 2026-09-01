# Factures Thy — Application de facturation locale

Application de facturation pour Thy, prothésiste ongulaire indépendante.

C'est une **PWA (Progressive Web App)** : pas de compte, pas de serveur applicatif,
pas d'abonnement. Toutes les données (clientes, prestations, factures, sauvegardes)
restent **exclusivement sur le téléphone de Thy**, stockées dans IndexedDB. Le PDF
des factures est généré localement, sur l'appareil, sans jamais transiter par
Internet.

Le seul rôle du serveur (GitHub Pages) est de fournir les fichiers de
l'application (HTML/CSS/JS), exactement comme le ferait une clé USB. Aucune
donnée personnelle ou de facturation n'est envoyée vers GitHub Pages ou un
service tiers.

## Sommaire

- [Aperçu des fonctionnalités](#aperçu-des-fonctionnalités)
- [Architecture technique](#architecture-technique)
- [Déploiement (gratuit, sans serveur payant)](docs/DEPLOIEMENT.md)
- [Installation sur iPhone](docs/INSTALLATION.md)
- [Guide d'utilisation](docs/GUIDE_UTILISATION.md)
- [Sauvegarde et restauration](docs/SAUVEGARDE.md)
- [Confidentialité et sécurité](#confidentialité-et-sécurité)

## Aperçu des fonctionnalités

- Profil professionnel (identité, coordonnées, SIRET, logo, mentions légales,
  conditions de paiement)
- Carnet de clientes (création, modification, suppression, recherche)
- Catalogue de prestations (nom, description, prix, unité, TVA)
- Création de factures multi-lignes avec remises, TVA, calculs automatiques
- Numérotation automatique et configurable, garantie unique
- Statuts de facture (brouillon, envoyée, payée, partiellement payée, en
  retard, annulée) modifiables uniquement manuellement
- Brouillons persistants (reprise ultérieure)
- Historique et recherche de factures (numéro, cliente, période, statut)
- Duplication de facture
- Protection des anciennes factures : toute facture finalisée conserve les
  informations telles qu'elles étaient au moment de l'émission, même si le
  profil, une cliente ou une prestation change ensuite
- Aperçu de facture avant génération
- Génération de PDF au format A4, entièrement locale
- Partage natif du PDF (feuille de partage iOS : e-mail, messages, etc.)
- Fonctionnement 100% hors ligne après le premier chargement
- Sauvegarde chiffrée (mot de passe choisi par Thy) exportable/importable

## Architecture technique

- HTML / CSS / JavaScript (aucun framework, aucune étape de build)
- IndexedDB pour le stockage local
- Service Worker pour le fonctionnement hors ligne (mise en cache de
  l'application)
- [jsPDF](https://github.com/parallax/jsPDF) (fourni localement dans
  `js/vendor/`, aucun appel réseau) pour la génération des PDF
- Web Crypto API (PBKDF2 + AES-GCM) pour le chiffrement des sauvegardes

Aucune base de données distante, aucun backend, aucune API externe pour les
données, aucun système d'authentification, aucun tracking, aucune publicité.

## Confidentialité et sécurité

- Toutes les données sont stockées uniquement dans IndexedDB, sur l'appareil
  de Thy.
- Les sauvegardes exportées sont chiffrées avec AES-GCM ; la clé est dérivée
  du mot de passe choisi par Thy via PBKDF2 (250 000 itérations). Le mot de
  passe n'est jamais stocké, ni par l'application, ni par le développeur : il
  n'existe aucun moyen de récupérer une sauvegarde sans lui.
- Aucune requête réseau n'est effectuée pour lire ou écrire des données
  personnelles. Le seul trafic réseau possible est le chargement initial des
  fichiers statiques de l'application depuis GitHub Pages, mis en cache par
  le Service Worker pour les visites suivantes.

## Structure du dépôt

```
index.html              Page principale de l'application
manifest.json            Manifeste PWA (icône, nom, couleurs)
service-worker.js        Mise en cache pour le mode hors ligne
css/styles.css           Styles de l'application
js/app.js                 Point d'entrée, routage
js/db/                    Accès aux données (IndexedDB)
js/utils/                 Calculs, numérotation, PDF, sauvegarde chiffrée, routeur
js/views/                 Écrans de l'application
js/vendor/jspdf.umd.min.js  Bibliothèque de génération PDF (locale, hors ligne)
icons/                    Icônes de l'application
docs/                     Documentation
```
