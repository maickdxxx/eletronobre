import { useEffect, useState } from "react";
import { CorujaContentGate, CorujaProvider, buildWhatsAppHref, useCollection, useContent, useTelHref, useWhatsAppUrl } from "./coruja-template/content.jsx";
import { fetchCorujaBlogPost, fetchCorujaBlogPosts } from "./coruja-template/api.js";
import { getCorujaRoute, resolveCorujaAssetUrl, withCorujaPreviewBasePath } from "./coruja-template/preview.js";

function siteHref(path = "/") {
  return withCorujaPreviewBasePath(path);
}
function currentRoute() {
  return getCorujaRoute();
}
function currentSlug() {
  const match = currentRoute().match(/^\/blog\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : "";
}
function setMeta(name, content, attr = "name") {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) { tag = document.createElement("meta"); tag.setAttribute(attr, name); document.head.appendChild(tag); }
  tag.setAttribute("content", content);
}
function setLink(rel, href) {
  if (!href) return;
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) { tag = document.createElement("link"); tag.rel = rel; document.head.appendChild(tag); }
  tag.href = href;
}
function SeoManager({ post }) {
  const route = currentRoute();
  const pageId = route === "/servicos" ? "services" : route === "/sobre" ? "about" : route === "/contato" ? "contact" : route.startsWith("/blog") ? "blog" : "home";
  const globalTitle = useContent("global.seo.title", "");
  const globalDescription = useContent("global.seo.description", "");
  const globalImage = useContent("global.seo.ogImage", "");
  const pageTitle = useContent(`pages.${pageId}.seo.title`, globalTitle);
  const pageDescription = useContent(`pages.${pageId}.seo.description`, globalDescription);
  const pageImage = useContent(`pages.${pageId}.seo.ogImage`, globalImage);
  const canonicalBase = useContent("global.seo.canonicalBase", "");
  const favicon = resolveCorujaAssetUrl(useContent("global.brand.faviconUrl", ""), "/favicon.svg");
  const brand = useContent("global.brand.name", "");
  const phone = useContent("global.contact.phoneRaw", "");
  const address = useContent("global.contact.address", "");
  const serviceArea = useContent("global.contact.serviceArea", "");
  useEffect(() => {
    const title = post?.seoTitle || post?.title || pageTitle || globalTitle;
    const description = post?.seoDescription || post?.excerpt || pageDescription || globalDescription;
    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", post ? "article" : "website", "property");
    const resolvedPageImage = resolveCorujaAssetUrl(pageImage);
    if (resolvedPageImage) setMeta("og:image", resolvedPageImage, "property");
    setLink("icon", favicon);
    const suffix = post ? `/blog/${post.slug}` : route;
    if (canonicalBase) setLink("canonical", `${canonicalBase.replace(/\/+$/, "")}${suffix === "/" ? "" : suffix}`);
    const id = "coruja-electrician-schema";
    document.getElementById(id)?.remove();
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Electrician", name: brand, telephone: phone, address, areaServed: serviceArea, url: canonicalBase || undefined });
    document.head.appendChild(script);
    return () => script.remove();
  }, [post, pageTitle, pageDescription, pageImage, globalTitle, globalDescription, canonicalBase, favicon, brand, phone, address, serviceArea, route]);
  return null;
}
function Mark() { return <span className="mark" aria-hidden="true">⌁</span>; }
function Brand() {
  const name = useContent("global.brand.name", "");
  const logo = useContent("global.brand.logoUrl", "");
  const logoSrc = resolveCorujaAssetUrl(logo);
  return <a className="brand" href={siteHref("/")}>{logoSrc ? <img src={logoSrc} alt={name} /> : <><Mark/><span>{name}</span></>}</a>;
}
function Header() {
  const serviceLabel = useContent("global.nav.servicesLabel", "");
  const aboutLabel = useContent("global.nav.aboutLabel", "");
  const projectsLabel = useContent("global.nav.projectsLabel", "");
  const blogLabel = useContent("global.nav.blogLabel", "");
  const contactLabel = useContent("global.nav.contactLabel", "");
  const ctaLabel = useContent("global.cta.headerLabel", "");
  const wa = useWhatsAppUrl();
  const links = [["/servicos", serviceLabel], ["/sobre", aboutLabel], ["/#projetos", projectsLabel], ["/blog", blogLabel], ["/contato", contactLabel]];
  return <header className="header"><div className="container header-inner"><Brand/><nav className="desktop-nav">{links.map(([href,label]) => <a key={href} href={siteHref(href)}>{label}</a>)}</nav><a className="btn btn-dark header-cta" href={wa} target="_blank" rel="noopener">{ctaLabel}</a><details className="mobile-menu"><summary aria-label="Abrir menu"><span/><span/><span/></summary><div className="mobile-panel">{links.map(([href,label]) => <a key={href} href={siteHref(href)}>{label}</a>)}<a className="btn btn-dark" href={wa} target="_blank" rel="noopener">{ctaLabel}</a></div></details></div></header>;
}
function Footer() {
  const tagline = useContent("global.footer.tagline", "");
  const copyright = useContent("global.footer.copyright", "");
  const email = useContent("global.contact.email", "");
  const phone = useContent("global.contact.phone", "");
  const tel = useTelHref();
  const services = useContent("global.nav.servicesLabel", "");
  const about = useContent("global.nav.aboutLabel", "");
  const blog = useContent("global.nav.blogLabel", "");
  const contact = useContent("global.nav.contactLabel", "");
  const instagram = useContent("global.social.instagram", "");
  const facebook = useContent("global.social.facebook", "");
  const linkedin = useContent("global.social.linkedin", "");
  return <footer className="footer"><div className="container footer-grid"><div className="footer-brand"><Brand/><p>{tagline}</p></div><div><strong>Navegação</strong><div className="footer-links"><a href={siteHref("/servicos")}>{services}</a><a href={siteHref("/sobre")}>{about}</a><a href={siteHref("/blog")}>{blog}</a><a href={siteHref("/contato")}>{contact}</a></div></div><div><strong>Contato</strong><div className="footer-links"><a href={tel}>{phone}</a><a href={`mailto:${email}`}>{email}</a></div><div className="socials">{instagram && <a href={instagram} target="_blank" rel="noopener">Instagram</a>}{facebook && <a href={facebook} target="_blank" rel="noopener">Facebook</a>}{linkedin && <a href={linkedin} target="_blank" rel="noopener">LinkedIn</a>}</div></div></div><div className="container footer-bottom"><span>{copyright}</span></div></footer>;
}
function FloatingWhatsapp() {
  const title = useContent("global.cta.floatingTitle", "");
  const text = useContent("global.cta.floatingText", "");
  const label = useContent("global.cta.floatingButtonLabel", "");
  const wa = useWhatsAppUrl();
  return <div className="floating-wa"><div><strong>{title}</strong><span>{text}</span></div><a href={wa} target="_blank" rel="noopener" aria-label={label}>↗</a></div>;
}
function Layout({ children, post }) { return <><SeoManager post={post}/><Header/><main>{children}</main><Footer/><FloatingWhatsapp/></>; }
function Eyebrow({ children }) { return <span className="eyebrow">{children}</span>; }
function SectionTitle({ eyebrow, title, description, align = "left" }) { return <div className={`section-title ${align === "center" ? "center" : ""}`}><Eyebrow>{eyebrow}</Eyebrow><h2>{title}</h2>{description && <p>{description}</p>}</div>; }
function Stats() { const items = useCollection("collections.stats"); return <div className="stats">{items.map(item => <div key={item.id}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>; }
function ServiceCard({ item }) {
  const number = useContent("global.contact.whatsappRaw", "");
  const fallback = useContent("global.contact.whatsappMessage", "");
  const href = buildWhatsAppHref(number, item.whatsappMessage || fallback);
  return <article className="service-card"><div className="service-head"><span className="service-icon">{item.icon}</span><span>{item.highlight}</span></div><h3>{item.title}</h3><p>{item.description}</p><a href={href} target="_blank" rel="noopener">{item.ctaLabel}<span>↗</span></a></article>;
}
function Principles() { const items = useCollection("collections.principles"); return <div className="principle-grid">{items.map(item => <article key={item.id}><span>{item.number}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div>; }
function Projects() { const items = useCollection("collections.projects"); const fallbacks = ["/project-living.svg", "/project-panel.svg", "/project-store.svg"]; return <div className="project-grid">{items.map((item,index) => <article className={`project-card ${index === 0 ? "project-main" : ""}`} key={item.id}><img src={resolveCorujaAssetUrl(item.image, fallbacks[index % fallbacks.length])} alt={item.imageAlt || item.title}/><div><span>{item.category}</span><h3>{item.title}</h3><p>{item.description}</p></div></article>)}</div>; }
function Testimonials() { const items = useCollection("collections.testimonials"); return <div className="testimonial-grid">{items.map(item => <article key={item.id}><div className="quote-mark">“</div><blockquote>{item.quote}</blockquote><div className="testimonial-foot"><div><strong>{item.name}</strong><span>{item.role}</span></div><span className="rating">★ {item.rating}</span></div></article>)}</div>; }
function Faq() { const items = useCollection("collections.faq"); return <div className="faq-list">{items.map(item => <details key={item.id}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}</div>; }
function PageHero({ page }) {
  const eyebrow = useContent(`pages.${page}.hero.eyebrow`, "");
  const title = useContent(`pages.${page}.hero.title`, "");
  const description = useContent(`pages.${page}.hero.description`, "");
  return <section className="page-hero"><div className="container"><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{description}</p></div></section>;
}
function HomePage() {
  const services = useCollection("collections.services");
  const wa = useWhatsAppUrl();
  const finalMessage = useContent("pages.home.finalCta.whatsappMessage", "");
  const finalWa = useWhatsAppUrl(finalMessage);
  return <Layout>
    <section className="hero"><div className="container hero-grid"><div className="hero-copy"><Eyebrow>{useContent("pages.home.hero.eyebrow", "")}</Eyebrow><h1>{useContent("pages.home.hero.title", "")} <em>{useContent("pages.home.hero.titleAccent", "")}</em></h1><p>{useContent("pages.home.hero.description", "")}</p><div className="hero-actions"><a className="btn btn-copper" href={wa} target="_blank" rel="noopener">{useContent("pages.home.hero.primaryCtaLabel", "")}</a><a className="text-link" href={siteHref("/servicos")}>{useContent("pages.home.hero.secondaryCtaLabel", "")}<span>↗</span></a></div><div className="hero-note">{useContent("pages.home.hero.note", "")}</div><Stats/></div><div className="hero-visual"><img src={resolveCorujaAssetUrl(useContent("pages.home.hero.image", ""), "/hero-nobre.svg")} alt={useContent("pages.home.hero.imageAlt", "")}/><div className="hero-stamp"><Mark/><span>{useContent("global.brand.name", "")}</span><small>Elétrica & acabamento</small></div></div></div></section>
    <section className="signature-section"><div className="container signature-grid"><div><Eyebrow>{useContent("pages.home.signature.eyebrow", "")}</Eyebrow><h2>{useContent("pages.home.signature.title", "")}</h2></div><div><p>{useContent("pages.home.signature.description", "")}</p></div></div><div className="container"><Principles/></div></section>
    <section className="section"><div className="container"><SectionTitle eyebrow={useContent("pages.home.services.eyebrow", "")} title={useContent("pages.home.services.title", "")} description={useContent("pages.home.services.description", "")}/><div className="services-grid">{services.slice(0,6).map(item => <ServiceCard key={item.id} item={item}/>)}</div><div className="section-action"><a className="btn btn-outline" href={siteHref("/servicos")}>{useContent("pages.home.services.ctaLabel", "")}</a></div></div></section>
    <section className="section projects-section" id="projetos"><div className="container"><SectionTitle eyebrow={useContent("pages.home.projects.eyebrow", "")} title={useContent("pages.home.projects.title", "")} description={useContent("pages.home.projects.description", "")}/><Projects/></div></section>
    <section className="section testimonials-section"><div className="container"><SectionTitle eyebrow={useContent("pages.home.testimonials.eyebrow", "")} title={useContent("pages.home.testimonials.title", "")} description={useContent("pages.home.testimonials.description", "")}/><Testimonials/></div></section>
    <section className="final-cta"><div className="container final-cta-inner"><div><Eyebrow>{useContent("pages.home.finalCta.eyebrow", "")}</Eyebrow><h2>{useContent("pages.home.finalCta.title", "")}</h2><p>{useContent("pages.home.finalCta.description", "")}</p></div><a className="btn btn-light" href={finalWa} target="_blank" rel="noopener">{useContent("pages.home.finalCta.ctaLabel", "")}</a></div></section>
  </Layout>;
}
function ServicesPage() {
  const services = useCollection("collections.services");
  const process = useCollection("collections.process");
  return <Layout><PageHero page="services"/><section className="section"><div className="container"><SectionTitle eyebrow={useContent("pages.services.hero.eyebrow", "")} title={useContent("pages.services.intro.title", "")} description={useContent("pages.services.intro.description", "")}/><div className="services-grid">{services.map(item => <ServiceCard key={item.id} item={item}/>)}</div></div></section><section className="process-section"><div className="container"><SectionTitle eyebrow={useContent("pages.services.process.eyebrow", "")} title={useContent("pages.services.process.title", "")}/><div className="process-grid">{process.map(item => <article key={item.id}><span>{item.step}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></div></section><section className="section"><div className="container faq-wrap"><SectionTitle eyebrow="DÚVIDAS FREQUENTES" title="Antes de contratar, saiba como funciona"/><Faq/></div></section></Layout>;
}
function AboutPage() {
  const values = useCollection("collections.values");
  const areas = useCollection("collections.serviceAreas");
  const wa = useWhatsAppUrl();
  return <Layout><PageHero page="about"/><section className="section"><div className="container story-grid"><div><SectionTitle eyebrow={useContent("pages.about.hero.eyebrow", "")} title={useContent("pages.about.story.title", "")}/></div><div className="story-copy"><p>{useContent("pages.about.story.paragraph1", "")}</p><p>{useContent("pages.about.story.paragraph2", "")}</p><a className="btn btn-copper" href={wa} target="_blank" rel="noopener">{useContent("global.cta.headerLabel", "")}</a></div></div></section><section className="section soft-section"><div className="container"><h2 className="standalone-title">{useContent("pages.about.valuesTitle", "")}</h2><div className="value-grid">{values.map((item,index) => <article key={item.id}><span>0{index+1}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></div></section><section className="section"><div className="container"><h2 className="standalone-title">{useContent("pages.about.areasTitle", "")}</h2><div className="area-list">{areas.map(item => <span key={item.id}>{item.text}</span>)}</div></div></section></Layout>;
}
function ContactForm() {
  const enabled = Boolean(useContent("pages.contact.form.enabled", true));
  const number = useContent("global.contact.whatsappRaw", "");
  const initialMessage = useContent("pages.contact.form.whatsappMessage", "");
  const title = useContent("pages.contact.form.title", "");
  const description = useContent("pages.contact.form.description", "");
  const nameLabel = useContent("pages.contact.form.nameLabel", "");
  const namePlaceholder = useContent("pages.contact.form.namePlaceholder", "");
  const phoneLabel = useContent("pages.contact.form.phoneLabel", "");
  const phonePlaceholder = useContent("pages.contact.form.phonePlaceholder", "");
  const serviceLabel = useContent("pages.contact.form.serviceLabel", "");
  const servicePlaceholder = useContent("pages.contact.form.servicePlaceholder", "");
  const messageLabel = useContent("pages.contact.form.messageLabel", "");
  const messagePlaceholder = useContent("pages.contact.form.messagePlaceholder", "");
  const submitText = useContent("pages.contact.form.submitText", "");
  const [form, setForm] = useState({ name: "", phone: "", service: "", message: "" });
  if (!enabled) return null;
  function submit(event) {
    event.preventDefault();
    const body = [initialMessage, `Nome: ${form.name}`, `Telefone: ${form.phone}`, `Serviço: ${form.service}`, `Detalhes: ${form.message}`].filter(Boolean).join("\n");
    window.open(buildWhatsAppHref(number, body), "_blank", "noopener,noreferrer");
  }
  return <form className="contact-form" data-coruja-form="contact_whatsapp" data-coruja-event-label="contact_form_submit" onSubmit={submit}><div className="form-head"><Eyebrow>ORÇAMENTO</Eyebrow><h2>{title}</h2><p>{description}</p></div><label>{nameLabel}<input required value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder={namePlaceholder}/></label><label>{phoneLabel}<input required value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} placeholder={phonePlaceholder}/></label><label>{serviceLabel}<input required value={form.service} onChange={e => setForm({...form,service:e.target.value})} placeholder={servicePlaceholder}/></label><label>{messageLabel}<textarea rows="5" value={form.message} onChange={e => setForm({...form,message:e.target.value})} placeholder={messagePlaceholder}/></label><button className="btn btn-dark" type="submit">{submitText}</button></form>;
}
function ContactPage() {
  const phone = useContent("global.contact.phone", "");
  const email = useContent("global.contact.email", "");
  const address = useContent("global.contact.address", "");
  const area = useContent("global.contact.serviceArea", "");
  const week = useContent("global.contact.businessHoursWeek", "");
  const saturday = useContent("global.contact.businessHoursSaturday", "");
  const tel = useTelHref();
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  return <Layout><PageHero page="contact"/><section className="section"><div className="container contact-grid"><ContactForm/><aside className="contact-info"><Eyebrow>ATENDIMENTO</Eyebrow><h2>{useContent("pages.contact.info.title", "")}</h2><div className="info-block"><span>{useContent("pages.contact.info.hoursLabel", "")}</span><strong>{week}</strong><small>{saturday}</small></div><div className="info-block"><span>{useContent("pages.contact.info.areaLabel", "")}</span><strong>{area}</strong></div><div className="info-block"><span>{useContent("pages.contact.info.addressLabel", "")}</span><strong>{address}</strong></div><div className="info-links"><a href={tel}>{phone}</a><a href={`mailto:${email}`}>{email}</a></div></aside></div><div className="container map-wrap"><iframe title="Localização" src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade"/></div></section></Layout>;
}
function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const eyebrow = useContent("pages.blog.eyebrow", "");
  const title = useContent("pages.blog.title", "");
  const description = useContent("pages.blog.description", "");
  const emptyMessage = useContent("pages.blog.emptyMessage", "");
  const readMore = useContent("pages.blog.readMoreLabel", "");
  useEffect(() => { let active = true; fetchCorujaBlogPosts().then(data => { if (active) { setPosts(data); setLoading(false); } }); return () => { active = false; }; }, []);
  return <Layout><section className="page-hero blog-hero"><div className="container"><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{description}</p></div></section><section className="section"><div className="container">{loading ? <div className="blog-state">Carregando conteúdos…</div> : posts.length ? <div className="blog-grid">{posts.map(post => <article className="blog-card" key={post.slug}>{post.coverImage && <img src={post.coverImage} alt={post.coverImageAlt || post.title}/>}<div><span>{post.category || "Conteúdo"}</span><h2>{post.title}</h2><p>{post.excerpt}</p><a href={siteHref(`/blog/${post.slug}`)}>{readMore}<b>↗</b></a></div></article>)}</div> : <div className="blog-state">{emptyMessage}</div>}</div></section></Layout>;
}
function BlogPostPage() {
  const slug = currentSlug();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const backLabel = useContent("pages.blog.backLabel", "");
  useEffect(() => { let active = true; fetchCorujaBlogPost(slug).then(data => { if (active) { setPost(data); setLoading(false); } }); return () => { active = false; }; }, [slug]);
  if (loading) return <Layout><div className="blog-state page-loading">Carregando artigo…</div></Layout>;
  if (!post) return <NotFound/>;
  return <Layout post={post}><article className="article"><div className="container article-head"><a href={siteHref("/blog")}>← {backLabel}</a><span>{post.category || "Conteúdo"}</span><h1>{post.title}</h1><p>{post.excerpt}</p>{post.coverImage && <img src={post.coverImage} alt={post.coverImageAlt || post.title}/>}</div><div className="container article-body">{post.contentHtml ? <div dangerouslySetInnerHTML={{__html:post.contentHtml}}/> : Array.isArray(post.content) ? post.content.map((paragraph,index) => <p key={index}>{paragraph}</p>) : <p>{post.content}</p>}</div></article></Layout>;
}
function NotFound() { return <Layout><section className="not-found"><div><Eyebrow>404</Eyebrow><h1>Página não encontrada</h1><a className="btn btn-dark" href={siteHref("/")}>Voltar ao início</a></div></section></Layout>; }
function RouterView() {
  const route = currentRoute();
  const blogEnabled = Boolean(useContent("blog.enabled", true));
  if (route === "/") return <HomePage/>;
  if (route === "/servicos") return <ServicesPage/>;
  if (route === "/sobre") return <AboutPage/>;
  if (route === "/contato") return <ContactPage/>;
  if (blogEnabled && route === "/blog") return <BlogPage/>;
  if (blogEnabled && /^\/blog\/[^/]+$/.test(route)) return <BlogPostPage/>;
  return <NotFound/>;
}
export default function App() { return <CorujaProvider><CorujaContentGate><RouterView/></CorujaContentGate></CorujaProvider>; }
