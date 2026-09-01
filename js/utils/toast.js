// toast.js
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

export function confirmDialog(message) {
  // window.confirm is fine here: it's synchronous, native, and requires no
  // network access or extra dependency - well suited to a lightweight offline app.
  return window.confirm(message);
}
