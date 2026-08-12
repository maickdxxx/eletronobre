import defaults from './defaults.json';
import { fetchCorujaContent, isCorujaPublicRuntime } from './api.js';

const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

function deepMerge(base, overlay) {
  if (overlay === undefined || overlay === null) return base;
  if (Array.isArray(overlay)) return overlay;
  if (!isObject(base) || !isObject(overlay)) return overlay;
  const out = { ...base };
  for (const key of Object.keys(overlay)) out[key] = key in base ? deepMerge(base[key], overlay[key]) : overlay[key];
  return out;
}

function looksLikeContent(value) {
  return isObject(value) && (isObject(value.global) || isObject(value.pages) || isObject(value.collections) || isObject(value.blog));
}

function unwrap(raw) {
  if (!isObject(raw)) return undefined;
  for (const key of ['projectContent', 'project_content', 'siteContent', 'site_content', 'content']) {
    if (isObject(raw[key])) {
      const nested = unwrap(raw[key]);
      if (nested) return nested;
    }
  }
  if (isObject(raw.data)) {
    const nested = unwrap(raw.data);
    if (nested) return nested;
  }
  return looksLikeContent(raw) ? raw : undefined;
}

function readInjected() {
  for (const candidate of [
    window.__CORUJA_CONTENT__,
    window.__CORUJA__?.content,
    window.__CORUJA_RUNTIME_PAYLOAD__,
    window.__CORUJA_PROJECT_CONTENT__,
    window.__CORUJA_SITE_CONTENT__,
    window.__CORUJA__,
  ]) {
    const current = unwrap(candidate);
    if (current) return current;
  }
  return undefined;
}

function getByPath(obj, path) {
  return String(path || '').split('.').filter(Boolean).reduce((current, key) => current == null ? undefined : current[key], obj);
}

function setByPath(target, path, value) {
  const keys = String(path || '').split('.').filter(Boolean);
  if (!keys.length) return target;
  const out = Array.isArray(target) ? [...target] : { ...target };
  let current = out;
  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    const nextKey = keys[index + 1];
    const existing = current[key];
    const cloned = Array.isArray(existing) ? [...existing] : isObject(existing) ? { ...existing } : /^\d+$/.test(nextKey) ? [] : {};
    current[key] = cloned;
    current = cloned;
  }
  current[keys[keys.length - 1]] = value;
  return out;
}

const injected = readInjected();
let content = deepMerge(defaults, injected || {});
const get = (path, fallback = '') => getByPath(content, path) ?? fallback;

function applyLogoIconFallback() {
  const logo = String(get('global.brand.logoUrl', '') || '').trim();
  const icon = String(get('global.brand.logoIconUrl', '') || '').trim();
  const brand = String(get('global.brand.name', '') || '').trim();
  document.querySelectorAll('.brand .mark').forEach((mark) => {
    if (!logo && icon) {
      mark.dataset.corujaIconApplied = '1';
      mark.setAttribute('data-coruja-path', 'global.brand.logoIconUrl');
      mark.setAttribute('data-coruja-src-path', 'global.brand.logoIconUrl');
      mark.setAttribute('data-coruja-label', 'Ícone da marca');
      mark.setAttribute('data-coruja-field-type', 'image');
      mark.setAttribute('role', 'img');
      mark.setAttribute('aria-label', brand ? `Ícone ${brand}` : 'Ícone da marca');
      mark.textContent = '';
      mark.style.backgroundImage = `url(${JSON.stringify(icon).slice(1, -1)})`;
      mark.style.backgroundPosition = 'center';
      mark.style.backgroundRepeat = 'no-repeat';
      mark.style.backgroundSize = 'contain';
    } else if (mark.dataset.corujaIconApplied === '1') {
      delete mark.dataset.corujaIconApplied;
      mark.removeAttribute('data-coruja-path');
      mark.removeAttribute('data-coruja-src-path');
      mark.removeAttribute('data-coruja-label');
      mark.removeAttribute('data-coruja-field-type');
      mark.removeAttribute('role');
      mark.removeAttribute('aria-label');
      mark.style.removeProperty('background-image');
      mark.style.removeProperty('background-position');
      mark.style.removeProperty('background-repeat');
      mark.style.removeProperty('background-size');
      mark.textContent = '⌁';
    }
  });
}

function applyWhatsAppIdentity() {
  const display = String(get('global.contact.whatsappDisplay', '') || '').trim();
  if (!display) return;
  document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"], a[href^="whatsapp:"]').forEach((link) => {
    const currentTitle = link.getAttribute('title') || '';
    if (!link.dataset.corujaBaseTitle) link.dataset.corujaBaseTitle = currentTitle;
    link.setAttribute('title', `${link.dataset.corujaBaseTitle ? `${link.dataset.corujaBaseTitle} — ` : ''}WhatsApp ${display}`);
  });
}

function applyOrganizationSchema() {
  const id = 'coruja-eletronobre-organization-schema';
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  const canonical = String(get('global.seo.canonicalBase', '') || '').replace(/\/+$/, '');
  const logo = String(get('global.brand.logoUrl', '') || '').trim() || String(get('global.brand.logoIconUrl', '') || '').trim();
  const whatsappRaw = String(get('global.contact.whatsappRaw', '') || '').replace(/\D/g, '');
  const whatsappDisplay = String(get('global.contact.whatsappDisplay', '') || '').trim();
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': canonical ? `${canonical}/#organization` : undefined,
    name: get('global.brand.name') || undefined,
    legalName: get('global.brand.legalName') || undefined,
    description: get('global.brand.description') || undefined,
    logo: logo || undefined,
    url: canonical || undefined,
    email: get('global.contact.email') || undefined,
    telephone: get('global.contact.phoneRaw') || get('global.contact.phone') || undefined,
    taxID: get('global.contact.cnpj') || undefined,
    areaServed: get('global.contact.serviceArea') || undefined,
    address: get('global.contact.address') || undefined,
    sameAs: [get('global.social.instagram'), get('global.social.facebook'), get('global.social.linkedin')].filter(Boolean),
    contactPoint: whatsappRaw || whatsappDisplay ? [{
      '@type': 'ContactPoint',
      contactType: 'WhatsApp',
      telephone: whatsappDisplay || undefined,
      url: whatsappRaw ? `https://wa.me/${whatsappRaw}` : undefined,
    }] : undefined,
  });
}

let scheduled = false;
function refresh() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    applyLogoIconFallback();
    applyWhatsAppIdentity();
    applyOrganizationSchema();
  });
}

function applyDetail(detail) {
  if (!isObject(detail)) return false;
  const direct = unwrap(detail.content) || unwrap(detail.payload);
  if (direct) {
    content = deepMerge(defaults, direct);
    refresh();
    return true;
  }
  if (Array.isArray(detail.patches)) {
    for (const patch of detail.patches) if (isObject(patch) && typeof patch.path === 'string') content = setByPath(content, patch.path, patch.value);
    refresh();
    return true;
  }
  if (typeof detail.path === 'string') {
    content = setByPath(content, detail.path, detail.value);
    refresh();
    return true;
  }
  return false;
}

function allowedPreviewOrigin(origin) {
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === 'corujahost.com.br' || host.endsWith('.corujahost.com.br') || host === 'localhost' || host === '127.0.0.1';
  } catch {
    return false;
  }
}

window.addEventListener('message', (event) => {
  if (window.parent === window || !allowedPreviewOrigin(event.origin) || !isObject(event.data)) return;
  if (['CORUJA_PREVIEW_PATCH', 'CORUJA_CONTENT_PATCH', 'coruja:preview-patch'].includes(String(event.data.type || ''))) applyDetail(event.data);
  if (['CORUJA_PREVIEW_CONTENT', 'CORUJA_SET_CONTENT', 'coruja:preview-content'].includes(String(event.data.type || ''))) applyDetail(event.data);
});

for (const name of ['coruja:preview-patch', 'CORUJA_PREVIEW_PATCH', 'CORUJA_CONTENT_PATCH', 'coruja:preview-content', 'CORUJA_PREVIEW_CONTENT', 'CORUJA_SET_CONTENT']) {
  window.addEventListener(name, (event) => applyDetail(event.detail));
}

if (!injected && isCorujaPublicRuntime()) {
  fetchCorujaContent().then((remote) => {
    if (remote) {
      content = deepMerge(defaults, remote);
      refresh();
    }
  });
}

refresh();
const root = document.getElementById('root');
if (root && typeof MutationObserver !== 'undefined') new MutationObserver(refresh).observe(root, { childList: true, subtree: true });
