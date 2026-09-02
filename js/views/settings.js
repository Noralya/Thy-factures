// settings.js
import {
  getProfile,
  saveProfile,
  getSettings,
  saveSettings
} from '../db/repository.js';

import { previewNextNumber } from '../utils/numbering.js';

import {
  createEncryptedBackup,
  restoreEncryptedBackup,
  restoreAllData
} from '../utils/backup.js';

import {
  showToast,
  confirmDialog
} from '../utils/toast.js';

import { renderIcons } from '../utils/icons.js';

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

export async function renderSettings(container) {
  const [profile, settings] = await Promise.all([
    getProfile(),
    getSettings()
  ]);

  container.innerHTML = `
    <h1>Réglages</h1>

    <div class="card">
      <h2>
        <span class="section-icon">
          <span data-icon="user"></span>
        </span>
        Profil professionnel
      </h2>

      <form id="profile-form">

        <div class="field-row">
          <div>
            <label>Prénom</label>
            <input
              name="firstName"
              value="${profile.firstName || ''}"
            />
          </div>

          <div>
            <label>Nom</label>
            <input
              name="lastName"
              value="${profile.lastName || ''}"
            />
          </div>
        </div>

        <label>Nom commercial</label>
        <input
          name="businessName"
          value="${profile.businessName || ''}"
        />

        <label>Adresse</label>
        <input
          name="address"
          value="${profile.address || ''}"
        />

        <div class="field-row">
          <div>
            <label>Code postal</label>
            <input
              name="postalCode"
              value="${profile.postalCode || ''}"
            />
          </div>

          <div>
            <label>Ville</label>
            <input
              name="city"
              value="${profile.city || ''}"
            />
          </div>
        </div>

        <label>Téléphone</label>
        <input
          name="phone"
          value="${profile.phone || ''}"
        />

        <label>E-mail</label>
        <input
          name="email"
          type="email"
          value="${profile.email || ''}"
        />

        <label>SIRET</label>
        <input
          name="siret"
          value="${profile.siret || ''}"
        />

        <label>Informations fiscales</label>
        <textarea name="taxInfo">${profile.taxInfo || ''}</textarea>

        <label>Coordonnées de paiement (RIB, etc.)</label>
        <textarea name="paymentDetails">${profile.paymentDetails || ''}</textarea>

        <label>Conditions de paiement</label>
        <textarea name="paymentTerms">${profile.paymentTerms || ''}</textarea>

        <label>Mentions légales</label>
        <textarea name="legalNotice">${profile.legalNotice || ''}</textarea>

        <label>Logo</label>

        ${
          profile.logoDataUrl
            ? `
              <img
                src="${profile.logoDataUrl}"
                class="logo-preview"
                alt="Logo professionnel"
              />
            `
            : ''
        }

        <input
          type="file"
          id="logo-input"
          accept="image/png,image/jpeg"
        />

        ${
          profile.logoDataUrl
            ? `
              <button
                type="button"
                id="remove-logo"
                class="btn btn-sm btn-outline"
                style="margin-top:6px;"
              >
                <span data-icon="x"></span>
                Retirer le logo
              </button>
            `
            : ''
        }

        <button
          type="submit"
          class="btn btn-primary"
          style="margin-top:16px;"
        >
          <span data-icon="save"></span>
          Enregistrer le profil
        </button>

      </form>
    </div>

    <div class="card">
      <h2>
        <span class="section-icon">
          <span data-icon="fileText"></span>
        </span>
        Numérotation des factures
      </h2>

      <label>Format</label>

      <input
        id="numbering-pattern"
        value="${settings.numberingPattern}"
      />

      <div class="helper-text">
        Utilisez {YEAR} et {SEQ:3}
        (nombre de chiffres).

        Aperçu :
        <strong id="numbering-preview"></strong>
      </div>

      <label
        style="display:flex;align-items:center;gap:8px;margin-top:10px;"
      >
        <input
          type="checkbox"
          id="numbering-reset"
          style="width:auto;"
          ${settings.numberingResetYearly ? 'checked' : ''}
        />

        Réinitialiser la numérotation chaque année
      </label>

      <button
        id="save-numbering"
        class="btn btn-secondary"
        style="margin-top:12px;"
      >
        <span data-icon="save"></span>
        Enregistrer
      </button>
    </div>

    <div class="card">
      <h2>
        <span class="section-icon">
          <span data-icon="sparkles"></span>
        </span>
        Prestations
      </h2>

      <a
        href="#/services"
        class="btn btn-outline"
      >
        <span data-icon="briefcase"></span>
        Gérer le catalogue de prestations
      </a>
    </div>

    <div class="card">
      <h2>
        <span class="section-icon">
          <span data-icon="shield"></span>
        </span>
        Sauvegarde et restauration
      </h2>

      <p class="helper-text">
        La sauvegarde contient toutes vos données
        (clients, prestations, factures, réglages).
        Elle est chiffrée avec un mot de passe que vous seule
        connaissez : personne d'autre, y compris le développeur,
        ne peut la lire.
      </p>

      <label>Mot de passe de sauvegarde</label>

      <input
        type="password"
        id="backup-password"
        placeholder="Choisissez un mot de passe"
      />

      <button
        id="export-btn"
        class="btn btn-primary"
        style="margin-top:10px;"
      >
        <span data-icon="download"></span>
        Exporter une sauvegarde chiffrée
      </button>

      <h3 style="margin-top:20px;">
        Restaurer une sauvegarde
      </h3>

      <input
        type="file"
        id="restore-file"
        accept="application/json"
      />

      <label>Mot de passe de la sauvegarde</label>

      <input
        type="password"
        id="restore-password"
        placeholder="Mot de passe"
      />

      <button
        id="restore-btn"
        class="btn btn-outline"
        style="margin-top:10px;"
      >
        <span data-icon="upload"></span>
        Importer et restaurer
      </button>

      <p class="helper-text">
        <span class="inline-warning-icon">
          <span data-icon="triangleAlert"></span>
        </span>
        La restauration remplace toutes les données actuelles
        de l'application.
      </p>
    </div>
  `;

  renderIcons(container);

  // --- Profile form ---

  container
    .querySelector('#profile-form')
    .addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = Object.fromEntries(
        new FormData(e.target).entries()
      );

      await saveProfile({
        ...profile,
        ...data
      });

      showToast(
        'Profil enregistré',
        'success'
      );
    });

  // --- Logo ---

  container
    .querySelector('#logo-input')
    .addEventListener('change', async (e) => {
      const file = e.target.files[0];

      if (!file) return;

      const dataUrl = await fileToDataUrl(file);

      await saveProfile({
        ...profile,
        logoDataUrl: dataUrl
      });

      showToast(
        'Logo enregistré',
        'success'
      );

      renderSettings(container);
    });

  const removeLogoBtn =
    container.querySelector('#remove-logo');

  if (removeLogoBtn) {
    removeLogoBtn.addEventListener(
      'click',
      async () => {
        await saveProfile({
          ...profile,
          logoDataUrl: null
        });

        renderSettings(container);
      }
    );
  }

  // --- Numbering ---

  const patternInput =
    container.querySelector('#numbering-pattern');

  const previewEl =
    container.querySelector('#numbering-preview');

  const updatePreview = () => {
    previewEl.textContent =
      previewNextNumber(patternInput.value);
  };

  patternInput.addEventListener(
    'input',
    updatePreview
  );

  updatePreview();

  container
    .querySelector('#save-numbering')
    .addEventListener(
      'click',
      async () => {
        await saveSettings({
          ...settings,
          numberingPattern: patternInput.value,
          numberingResetYearly:
            container.querySelector(
              '#numbering-reset'
            ).checked
        });

        showToast(
          'Numérotation enregistrée',
          'success'
        );
      }
    );

  // --- Backup export ---

  container
    .querySelector('#export-btn')
    .addEventListener(
      'click',
      async () => {
        const password =
          container.querySelector(
            '#backup-password'
          ).value;

        try {
          const blob =
            await createEncryptedBackup(
              password
            );

          const url =
            URL.createObjectURL(blob);

          const a =
            document.createElement('a');

          const dateStr =
            new Date()
              .toISOString()
              .slice(0, 10);

          a.href = url;
          a.download =
            `sauvegarde-factures${dateStr}.json`;

          document.body.appendChild(a);
          a.click();
          a.remove();

          setTimeout(
            () => URL.revokeObjectURL(url),
            5000
          );

          showToast(
            'Sauvegarde exportée',
            'success'
          );
        } catch (err) {
          showToast(
            err.message,
            'error'
          );
        }
      }
    );

  // --- Backup restore ---

  container
    .querySelector('#restore-btn')
    .addEventListener(
      'click',
      async () => {
        const fileInput =
          container.querySelector(
            '#restore-file'
          );

        const password =
          container.querySelector(
            '#restore-password'
          ).value;

        const file =
          fileInput.files[0];

        if (!file) {
          showToast(
            'Sélectionnez un fichier de sauvegarde.',
            'error'
          );
          return;
        }

        if (!password) {
          showToast(
            'Entrez le mot de passe de la sauvegarde.',
            'error'
          );
          return;
        }

        if (
          !confirmDialog(
            'Cette action remplacera toutes les données actuelles par celles de la sauvegarde. Continuer ?'
          )
        ) {
          return;
        }

        try {
          const payload =
            await restoreEncryptedBackup(
              file,
              password
            );

          await restoreAllData(
            payload,
            { replace: true }
          );

          showToast(
            'Données restaurées avec succès',
            'success'
          );

          setTimeout(
            () => window.location.reload(),
            800
          );
        } catch (err) {
          showToast(
            err.message,
            'error'
          );
        }
      }
    );
}
