// router.js
// Minimal hash-based router - no build step, no server-side routing needed,
// which keeps this compatible with a static GitHub Pages deployment.

const routes = [];

export function addRoute(pattern, handler) {
  // pattern like '/invoices/:id/edit'
  const paramNames = [];
  const regexStr = pattern
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        paramNames.push(segment.slice(1));
        return '([^/]+)';
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  const regex = new RegExp(`^${regexStr}/?$`);
  routes.push({ regex, paramNames, handler });
}

export function currentPath() {
  const hash = window.location.hash || '#/';
  return hash.slice(1) || '/';
}

export async function resolveRoute() {
  const path = currentPath().split('?')[0];
  for (const route of routes) {
    const match = path.match(route.regex);
    if (match) {
      const params = {};
      route.paramNames.forEach((name, i) => (params[name] = decodeURIComponent(match[i + 1])));
      return route.handler(params);
    }
  }
  return null;
}

export function navigate(path) {
  window.location.hash = `#${path}`;
}

export function startRouter(onNavigate) {
  window.addEventListener('hashchange', onNavigate);
  onNavigate();
}
