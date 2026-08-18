import { getCorujaRoute } from './preview.js';

const ATTR = 'data-coruja-path';
const root = () => document.getElementById('root');
const one = (selector, scope = document) => scope?.querySelector?.(selector) || null;
const all = (selector, scope = document) => Array.from(scope?.querySelectorAll?.(selector) || []);

function mark(el, path, label, type = 'text') {
  if (!el || !path) return;
  el.setAttribute(ATTR, path);
  el.setAttribute('data-coruja-label', label || path);
  el.setAttribute('data-coruja-field-type', type);
}

function markImage(el, path, altPath, label) {
  if (!el) return;
  mark(el, path, label, 'image');
  el.setAttribute('data-coruja-src-path', path);
  if (altPath) el.setAttribute('data-coruja-alt-path', altPath);
}

function collection(container, id) {
  if (container) container.setAttribute('data-coruja-collection', id);
}

function item(el, id, index) {
  if (!el) return;
  el.setAttribute('data-coruja-item-index', String(index));
  if (id != null) el.setAttribute('data-coruja-item-id', String(id));
}

function route() {
  return getCorujaRoute();
}

function markSectionTitle(section, prefix) {
  if (!section || !prefix) return;
  const box = one('.section-title', section);
  if (!box) return;
  mark(one('.eyebrow', box), `${prefix}.eyebrow`, 'Chamada da seção');
  mark(one('h2', box), `${prefix}.title`, 'Título da seção');
  mark(one('p', box), `${prefix}.description`, 'Descrição da seção');
}

function annotateBrandAndChrome() {
  all('.brand').forEach((brand) => {
    const img = one('img', brand);
    if (img) markImage(img, 'global.brand.logoUrl', 'global.brand.name', 'Logo principal');
    const name = one('span:not(.mark)', brand);
    if (name) mark(name, 'global.brand.name', 'Nome da empresa');
  });

  const navMap = [
    ['/servicos', 'global.nav.servicesLabel', 'Menu Serviços'],
    ['/sobre', 'global.nav.aboutLabel', 'Menu Sobre'],
    ['/blog', 'global.nav.blogLabel', 'Menu Conteúdos'],
    ['/contato', 'global.nav.contactLabel', 'Menu Contato'],
  ];
  all('.desktop-nav a, .mobile-panel > a:not(.btn), .footer-links a').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const found = navMap.find(([suffix]) => href.endsWith(suffix));
    if (found) mark(link, found[1], found[2]);
    if (href.includes('#projetos')) mark(link, 'global.nav.projectsLabel', 'Menu Projetos');
    if (href.startsWith('tel:')) {
      mark(link, 'global.contact.phone', 'Telefone exibido');
      link.setAttribute('data-coruja-event-label', 'contact_phone');
    }
    if (href.startsWith('mailto:')) mark(link, 'global.contact.email', 'E-mail');
  });

  all('.header-cta, .mobile-panel .btn').forEach((el) => {
    mark(el, 'global.cta.headerLabel', 'Botão principal do menu');
    el.setAttribute('data-coruja-event-label', 'header_whatsapp');
  });
  mark(one('.footer-brand > p'), 'global.footer.tagline', 'Texto do rodapé');
  mark(one('.footer-bottom > span'), 'global.footer.copyright', 'Direitos autorais');
  mark(one('.floating-wa strong'), 'global.cta.floatingTitle', 'Título do WhatsApp flutuante');
  mark(one('.floating-wa > div > span'), 'global.cta.floatingText', 'Texto do WhatsApp flutuante');
  const floating = one('.floating-wa > a');
  if (floating) floating.setAttribute('data-coruja-event-label', 'floating_whatsapp');
}

function annotateServiceCards() {
  const grid = one('.services-grid');
  collection(grid, 'services');
  all('.service-card').forEach((card, index) => {
    item(card, card.getAttribute('data-id') || index, index);
    mark(one('.service-icon', card), `collections.services.${index}.icon`, 'Ícone do serviço');
    const headSpans = all('.service-head > span', card);
    mark(headSpans[1], `collections.services.${index}.highlight`, 'Destaque do serviço');
    mark(one('h3', card), `collections.services.${index}.title`, 'Título do serviço');
    mark(one('p', card), `collections.services.${index}.description`, 'Descrição do serviço');
    const cta = one('a', card);
    mark(cta, `collections.services.${index}.ctaLabel`, 'Botão do serviço');
    if (cta) cta.setAttribute('data-coruja-event-label', 'service_whatsapp');
  });
}

function annotateCollections() {
  const stats = one('.stats');
  collection(stats, 'stats');
  all('.stats > div').forEach((el, index) => {
    item(el, index, index);
    mark(one('strong', el), `collections.stats.${index}.value`, 'Valor do indicador');
    mark(one('span', el), `collections.stats.${index}.label`, 'Descrição do indicador');
  });

  const principles = one('.principle-grid');
  collection(principles, 'principles');
  all('.principle-grid > article').forEach((el, index) => {
    item(el, index, index);
    mark(one(':scope > span', el), `collections.principles.${index}.number`, 'Número');
    mark(one('h3', el), `collections.principles.${index}.title`, 'Título');
    mark(one('p', el), `collections.principles.${index}.description`, 'Descrição');
  });

  const projects = one('.project-grid');
  collection(projects, 'projects');
  all('.project-card').forEach((el, index) => {
    item(el, index, index);
    markImage(one('img', el), `collections.projects.${index}.image`, `collections.projects.${index}.imageAlt`, 'Imagem do projeto');
    mark(one('.project-card > div > span', el), `collections.projects.${index}.category`, 'Categoria do projeto');
    mark(one('h3', el), `collections.projects.${index}.title`, 'Título do projeto');
    mark(one('p', el), `collections.projects.${index}.description`, 'Descrição do projeto');
  });

  const testimonials = one('.testimonial-grid');
  collection(testimonials, 'testimonials');
  all('.testimonial-grid > article').forEach((el, index) => {
    item(el, index, index);
    mark(one('blockquote', el), `collections.testimonials.${index}.quote`, 'Depoimento');
    mark(one('.testimonial-foot strong', el), `collections.testimonials.${index}.name`, 'Nome');
    mark(one('.testimonial-foot > div span', el), `collections.testimonials.${index}.role`, 'Identificação');
    mark(one('.rating', el), `collections.testimonials.${index}.rating`, 'Nota');
  });

  const faq = one('.faq-list');
  collection(faq, 'faq');
  all('.faq-list > details').forEach((el, index) => {
    item(el, index, index);
    mark(one('summary', el), `collections.faq.${index}.question`, 'Pergunta');
    mark(one('p', el), `collections.faq.${index}.answer`, 'Resposta');
  });

  const process = one('.process-grid');
  collection(process, 'process');
  all('.process-grid > article').forEach((el, index) => {
    item(el, index, index);
    mark(one(':scope > span', el), `collections.process.${index}.step`, 'Etapa');
    mark(one('h3', el), `collections.process.${index}.title`, 'Título da etapa');
    mark(one('p', el), `collections.process.${index}.description`, 'Descrição da etapa');
  });

  const values = one('.value-grid');
  collection(values, 'values');
  all('.value-grid > article').forEach((el, index) => {
    item(el, index, index);
    mark(one('h3', el), `collections.values.${index}.title`, 'Título do valor');
    mark(one('p', el), `collections.values.${index}.description`, 'Descrição do valor');
  });

  const areas = one('.area-list');
  collection(areas, 'serviceAreas');
  all('.area-list > span').forEach((el, index) => {
    item(el, index, index);
    mark(el, `collections.serviceAreas.${index}.text`, 'Região atendida');
  });
}

function annotatePageHero(page) {
  const hero = one('.page-hero:not(.blog-hero)');
  if (!hero || !page) return;
  mark(one('.eyebrow', hero), `pages.${page}.hero.eyebrow`, 'Chamada da página');
  mark(one('h1', hero), `pages.${page}.hero.title`, 'Título da página');
  mark(one('p', hero), `pages.${page}.hero.description`, 'Descrição da página');
}

function annotateHome() {
  const hero = one('.hero');
  if (!hero) return;
  mark(one('.hero-copy > .eyebrow', hero), 'pages.home.hero.eyebrow', 'Chamada do topo');
  mark(one('.hero-copy h1', hero), 'pages.home.hero.title', 'Título principal');
  mark(one('.hero-copy h1 em', hero), 'pages.home.hero.titleAccent', 'Trecho destacado');
  mark(one('.hero-copy > p', hero), 'pages.home.hero.description', 'Descrição principal');
  const actions = all('.hero-actions a', hero);
  mark(actions[0], 'pages.home.hero.primaryCtaLabel', 'Botão principal');
  if (actions[0]) actions[0].setAttribute('data-coruja-event-label', 'hero_whatsapp');
  mark(actions[1], 'pages.home.hero.secondaryCtaLabel', 'Botão secundário');
  mark(one('.hero-note', hero), 'pages.home.hero.note', 'Linha de confiança');
  markImage(one('.hero-visual > img', hero), 'pages.home.hero.image', 'pages.home.hero.imageAlt', 'Imagem principal');

  mark(one('.signature-grid .eyebrow'), 'pages.home.signature.eyebrow', 'Chamada do padrão');
  mark(one('.signature-grid h2'), 'pages.home.signature.title', 'Título do padrão');
  mark(one('.signature-grid p'), 'pages.home.signature.description', 'Descrição do padrão');

  const sections = all('main > .section');
  const services = sections.find((section) => one('.services-grid', section));
  const projects = sections.find((section) => section.id === 'projetos' || one('.project-grid', section));
  const testimonials = sections.find((section) => one('.testimonial-grid', section));
  if (services) {
    markSectionTitle(services, 'pages.home.services');
    mark(one('.section-action a', services), 'pages.home.services.ctaLabel', 'Botão dos serviços');
  }
  if (projects) markSectionTitle(projects, 'pages.home.projects');
  if (testimonials) markSectionTitle(testimonials, 'pages.home.testimonials');

  const final = one('.final-cta');
  if (final) {
    mark(one('.eyebrow', final), 'pages.home.finalCta.eyebrow', 'Chamada final');
    mark(one('h2', final), 'pages.home.finalCta.title', 'Título final');
    mark(one('p', final), 'pages.home.finalCta.description', 'Descrição final');
    const button = one('a', final);
    mark(button, 'pages.home.finalCta.ctaLabel', 'Botão final');
    if (button) button.setAttribute('data-coruja-event-label', 'hero_whatsapp');
  }
}

function annotateServices() {
  annotatePageHero('services');
  const intro = all('main > .section').find((section) => one('.services-grid', section));
  if (intro) {
    const box = one('.section-title', intro);
    mark(one('.eyebrow', box), 'pages.services.hero.eyebrow', 'Chamada de serviços');
    mark(one('h2', box), 'pages.services.intro.title', 'Título da introdução');
    mark(one('p', box), 'pages.services.intro.description', 'Descrição da introdução');
  }
  const process = one('.process-section');
  if (process) {
    const box = one('.section-title', process);
    mark(one('.eyebrow', box), 'pages.services.process.eyebrow', 'Chamada do processo');
    mark(one('h2', box), 'pages.services.process.title', 'Título do processo');
  }
}

function annotateAbout() {
  annotatePageHero('about');
  mark(one('.story-grid .section-title h2'), 'pages.about.story.title', 'Título da história');
  const paragraphs = all('.story-copy > p');
  mark(paragraphs[0], 'pages.about.story.paragraph1', 'Primeiro parágrafo');
  mark(paragraphs[1], 'pages.about.story.paragraph2', 'Segundo parágrafo');
  const cta = one('.story-copy .btn');
  if (cta) cta.setAttribute('data-coruja-event-label', 'hero_whatsapp');
  const titles = all('.standalone-title');
  mark(titles[0], 'pages.about.valuesTitle', 'Título dos valores');
  mark(titles[1], 'pages.about.areasTitle', 'Título das regiões');
}

function annotateContact() {
  annotatePageHero('contact');
  const form = one('.contact-form');
  if (form) {
    form.setAttribute('data-coruja-form', 'contact_whatsapp');
    form.setAttribute('data-coruja-event-label', 'contact_form_submit');
    mark(one('.form-head h2', form), 'pages.contact.form.title', 'Título do formulário');
    mark(one('.form-head p', form), 'pages.contact.form.description', 'Descrição do formulário');
    const labels = all(':scope > label', form);
    const labelPaths = ['nameLabel', 'phoneLabel', 'serviceLabel', 'messageLabel'];
    labels.forEach((el, index) => mark(el, `pages.contact.form.${labelPaths[index]}`, 'Rótulo do campo'));
    mark(one('button[type="submit"]', form), 'pages.contact.form.submitText', 'Botão enviar');
  }
  const info = one('.contact-info');
  if (info) {
    mark(one('h2', info), 'pages.contact.info.title', 'Título das informações');
    const blocks = all('.info-block', info);
    if (blocks[0]) {
      mark(one('span', blocks[0]), 'pages.contact.info.hoursLabel', 'Rótulo horário');
      mark(one('strong', blocks[0]), 'global.contact.businessHoursWeek', 'Horário durante a semana');
      mark(one('small', blocks[0]), 'global.contact.businessHoursSaturday', 'Horário de sábado');
    }
    if (blocks[1]) {
      mark(one('span', blocks[1]), 'pages.contact.info.areaLabel', 'Rótulo atendimento');
      mark(one('strong', blocks[1]), 'global.contact.serviceArea', 'Região atendida');
    }
    if (blocks[2]) {
      mark(one('span', blocks[2]), 'pages.contact.info.addressLabel', 'Rótulo localização');
      mark(one('strong', blocks[2]), 'global.contact.address', 'Endereço');
    }
  }
}

function annotateBlog() {
  const hero = one('.blog-hero');
  if (hero) {
    mark(one('.eyebrow', hero), 'pages.blog.eyebrow', 'Chamada do blog');
    mark(one('h1', hero), 'pages.blog.title', 'Título do blog');
    mark(one('p', hero), 'pages.blog.description', 'Descrição do blog');
  }
  all('.blog-card a').forEach((link) => mark(link, 'pages.blog.readMoreLabel', 'Texto ler artigo'));
  const state = one('.blog-state:not(.page-loading)');
  if (state && !state.textContent?.includes('Carregando')) mark(state, 'pages.blog.emptyMessage', 'Mensagem sem artigos');
}

function annotate() {
  if (!root()) return;
  annotateBrandAndChrome();
  annotateCollections();
  annotateServiceCards();
  const current = route();
  if (current === '/') annotateHome();
  else if (current === '/servicos') annotateServices();
  else if (current === '/sobre') annotateAbout();
  else if (current === '/contato') annotateContact();
  else if (current === '/blog') annotateBlog();
  else if (current.startsWith('/blog/')) {
    const back = one('.article-head > a');
    if (back) mark(back, 'pages.blog.backLabel', 'Texto voltar');
  }
}

let scheduled = false;
function scheduleAnnotate() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    annotate();
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleAnnotate, { once: true });
else scheduleAnnotate();

const target = root();
if (target && typeof MutationObserver !== 'undefined') {
  new MutationObserver(scheduleAnnotate).observe(target, { childList: true, subtree: true });
}
window.addEventListener('popstate', scheduleAnnotate);
window.addEventListener('hashchange', scheduleAnnotate);
