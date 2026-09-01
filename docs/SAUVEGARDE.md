# Sauvegarde et restauration

Toutes les données vivent uniquement sur l'iPhone. Il est donc important de
faire des sauvegardes régulières, par exemple avant de changer de téléphone
ou de faire une mise à jour majeure d'iOS.

## Exporter une sauvegarde

1. Allez dans **Réglages** → **Sauvegarde et restauration**.
2. Choisissez un **mot de passe** (à retenir précieusement : il est
   indispensable pour restaurer la sauvegarde, et personne — y compris le
   développeur — ne peut le récupérer si vous l'oubliez).
3. Appuyez sur **Exporter une sauvegarde chiffrée**.
4. Un fichier `sauvegarde-factures-thy-AAAA-MM-JJ.json` est proposé à
   l'enregistrement (par exemple dans l'application Fichiers, sur iCloud
   Drive, ou tout autre emplacement de votre choix).

Le fichier est chiffré (AES-GCM, clé dérivée du mot de passe via PBKDF2) :
sans le mot de passe, son contenu est illisible.

## Restaurer une sauvegarde

1. Allez dans **Réglages** → **Sauvegarde et restauration** → **Restaurer
   une sauvegarde**.
2. Sélectionnez le fichier de sauvegarde.
3. Saisissez le mot de passe utilisé lors de l'export.
4. Appuyez sur **Importer et restaurer**.

⚠️ La restauration **remplace toutes les données actuelles** de
l'application par celles de la sauvegarde. Utilisez-la par exemple après
avoir réinstallé l'application sur un nouvel iPhone.

## Bonnes pratiques

- Exportez une sauvegarde régulièrement (par exemple une fois par mois, ou
  avant tout événement important : changement de téléphone, mise à jour
  d'iOS).
- Conservez le fichier de sauvegarde dans un endroit sûr (iCloud Drive,
  ordinateur...).
- Notez votre mot de passe de sauvegarde dans un gestionnaire de mots de
  passe ou un carnet — il n'existe aucun moyen de le récupérer autrement.
