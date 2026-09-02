// js/utils/icons.js

const icons = {
  sparkles: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3-1.5 4.5L6 9l4.5 1.5L12 15l1.5-4.5L18 9l-4.5-1.5L12 3Z"/>
      <path d="m19 14-.75 2.25L16 17l2.25.75L19 20l.75-2.25L22 17l-2.25-.75L19 14Z"/>
      <path d="m5 3-.6 1.8L2.5 5.4l1.9.6L5 7.8l.6-1.8 1.9-.6-1.9-.6L5 3Z"/>
    </svg>
  `,

  house: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z"/>
      <path d="M9 21v-6h6v6"/>
    </svg>
  `,

  receipt: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 2v20l3-2 2 2 3-2 3 2 2-2 3 2V2l-3 2-2-2-3 2-3-2-2 2-3-2Z"/>
      <path d="M8 8h8M8 12h8M8 16h5"/>
    </svg>
  `,

  plus: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  `,

  users: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  `,

  settings: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/>
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.8 1.8-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.55v-.1a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.8-1.8.06-.06A1.7 1.7 0 0 0 8.1 15a1.7 1.7 0 0 0-1.56-1.03h-.1v-2.55h.1A1.7 1.7 0 0 0 8.1 10.4a1.7 1.7 0 0 0-.34-1.88L7.7 8.46l1.8-1.8.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56V5h2.55v.1a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.8 1.8-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.1v2.55h-.1A1.7 1.7 0 0 0 19.4 15Z"/>
    </svg>
  `,

  circleHelp: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9"/>
      <path d="M9.5 9a2.5 2.5 0 1 1 4.05 1.97c-.95.73-1.55 1.2-1.55 2.53"/>
      <path d="M12 17h.01"/>
    </svg>
  `,

  userPlus: `
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
		<circle cx="8.5" cy="7" r="4"/>
		<path d="M19 8v6M16 11h6"/>
	</svg>
   `,

	trash2: `
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path d="M3 6h18"/>
		<path d="M8 6V4h8v2"/>
		<path d="M19 6l-1 15H6L5 6"/>
		<path d="M10 11v6M14 11v6"/>
	</svg>
	`,

	fileText: `
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/>
		<path d="M14 2v6h6M8 13h8M8 17h6"/>
	</svg>
	`,

	pencil: `
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path d="M12 20h9"/>
		<path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
	</svg>
	`,

	fileDown: `
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/>
		<path d="M14 2v6h6"/>
		<path d="M12 11v6M9 14l3 3 3-3"/>
	</svg>
	`,

	search: `
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<circle cx="11" cy="11" r="7"/>
		<path d="m20 20-4-4"/>
	</svg>
	`,

	user: `
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<circle cx="12" cy="7" r="4"/>
		<path d="M4 21a8 8 0 0 1 16 0"/>
	</svg>
	`,

	x: `
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path d="M6 6l12 12M18 6L6 18"/>
	</svg>
	`,

	lock: `
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<rect x="4" y="10" width="16" height="11" rx="2"/>
		<path d="M8 10V7a4 4 0 0 1 8 0v3"/>
	</svg>
	`,

	eye: `
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/>
		<circle cx="12" cy="12" r="3"/>
	</svg>
	`,

	check: `
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path d="m5 12 4 4L19 6"/>
	</svg>
	`,

	copy: `
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<rect x="9" y="9" width="11" height="11" rx="2"/>
		<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
	</svg>
	`,

	save: `
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path d="M5 3h12l3 3v15H4V3h1Z"/>
		<path d="M8 3v6h8V3M8 21v-5h8v5"/>
	</svg>
	`,

	download: `
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path d="M12 3v12"/>
		<path d="m7 10 5 5 5-5"/>
		<path d="M4 21h16"/>
	</svg>
	`,

	upload: `
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path d="M12 21V9"/>
		<path d="m7 14 5-5 5 5"/>
		<path d="M4 3h16"/>
	</svg>
	`,

	briefcase: `
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<rect x="3" y="7" width="18" height="13" rx="2"/>
		<path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
		<path d="M3 12h18M10 12v2h4v-2"/>
	</svg>
	`,

	shield: `
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z"/>
		<path d="m9 12 2 2 4-4"/>
	</svg>
	`,

	triangleAlert: `
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path d="m12 3 10 18H2L12 3Z"/>
		<path d="M12 9v4M12 17h.01"/>
	</svg>
	`,

};

export function icon(name, className = '') {
  const svg = icons[name];

  if (!svg) {
    console.warn(`Icône inconnue : ${name}`);
    return '';
  }

  return svg.replace(
    '<svg ',
    `<svg class="app-icon ${className}" `
  );
}

export function renderIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((element) => {
    const name = element.dataset.icon;
    const className = element.dataset.iconClass || '';

    element.innerHTML = icon(name, className);
  });
}