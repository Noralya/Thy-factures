// uid.js
// Generates locally-unique identifiers without any network call.

export function generateId(prefix = '') {
  const random = crypto.getRandomValues(new Uint32Array(4))
    .reduce((acc, n) => acc + n.toString(36), '');
  const time = Date.now().toString(36);
  return `${prefix}${time}-${random}`;
}
