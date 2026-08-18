import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCorujaPreviewBasePath } from "../src/coruja-template/preview.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`Arquivo obrigatório ausente: ${relativePath}`);
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    failures.push(`JSON inválido em ${relativePath}: ${error.message}`);
    return {};
  }
}

function atPath(source, dottedPath) {
  return String(dottedPath || "").split(".").filter(Boolean).reduce(
    (value, key) => value == null ? undefined : value[key],
    source,
  );
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const template = readJson("coruja.template.json");
const manifest = readJson("src/coruja-template/manifest.json");
const integration = readJson("src/coruja-template/integration.json");
const schema = readJson("src/coruja-template/editable-schema.json");
const defaults = readJson("src/coruja-template/defaults.json");
const routesFile = readJson("src/coruja-template/routes.json");

assert(template.schemaVersion === 2, "coruja.template.json deve usar schemaVersion 2");
assert(template.contractVersion === 2, "coruja.template.json deve usar contractVersion 2");
assert(template.visibility === "public_catalog", "O modelo deve estar visível no catálogo público");
assert(template.version === manifest.version, "As versões do template e do manifest devem coincidir");
assert(template.templateId === manifest.templateId, "Os IDs do template e do manifest devem coincidir");
assert(template.router?.respectsCorujaPreviewBasePath === true, "O roteador deve respeitar o base path da prévia");
assert(template.blog?.enabledPath === "blog.enabled", "O blog deve declarar o caminho de ativação");

for (const declaredPath of Object.values(template.paths || {})) {
  assert(fs.existsSync(path.join(root, declaredPath)), `Arquivo declarado não encontrado: ${declaredPath}`);
}

for (const mediaPath of [template.thumbnailUrl, template.coverUrl]) {
  const publicFile = typeof mediaPath === "string" ? path.join(root, "public", mediaPath.replace(/^\/+/, "")) : "";
  assert(Boolean(mediaPath) && fs.existsSync(publicFile), `Mídia do catálogo inválida: ${mediaPath || "vazia"}`);
}

for (const field of schema.globalFields || []) {
  assert(field.path?.startsWith("global."), `Campo global sem path absoluto: ${field.path || field.label}`);
  const value = atPath(defaults, field.path);
  assert(value !== undefined, `Campo global ausente nos defaults: ${field.path}`);
  assert(value === null || typeof value !== "object", `Campo global deve ser escalar: ${field.path}`);
}

for (const page of schema.pages || []) {
  for (const field of page.fields || []) {
    const prefix = `pages.${page.id}.`;
    assert(field.path?.startsWith(prefix), `Campo da página ${page.id} sem path absoluto: ${field.path || field.label}`);
    const value = atPath(defaults, field.path);
    assert(value !== undefined, `Campo da página ausente nos defaults: ${field.path}`);
    assert(value === null || typeof value !== "object", `Campo de página deve ser escalar: ${field.path}`);
  }
}

for (const collection of schema.collections || []) {
  assert(collection.path === `collections.${collection.id}`, `Path inválido na coleção ${collection.id}`);
  const items = atPath(defaults, collection.path);
  assert(Array.isArray(items), `Coleção ausente nos defaults: ${collection.path}`);
  for (const [index, item] of (items || []).entries()) {
    for (const field of collection.itemSchema || []) {
      assert(item[field.key] !== undefined, `Campo ${field.key} ausente em ${collection.path}.${index}`);
    }
  }
}

const declaredRoutes = JSON.stringify(template.routes || []);
assert(declaredRoutes === JSON.stringify(routesFile.routes || []), "As rotas do template e routes.json devem coincidir");
for (const page of integration.pages || []) {
  assert((template.routes || []).some((route) => route.pageId === page.pageId && route.path === page.path), `Página de integração sem rota: ${page.pageId}`);
}

const apiSource = fs.readFileSync(path.join(root, "src/coruja-template/api.js"), "utf8");
const previewSource = fs.readFileSync(path.join(root, "src/coruja-template/preview.js"), "utf8");
const editorSource = fs.readFileSync(path.join(root, "src/coruja-template/editor-dom.js"), "utf8");
const appSource = fs.readFileSync(path.join(root, "src/App.jsx"), "utf8");
assert(apiSource.includes("import.meta.env.VITE_CORUJA_PROJECT_ID"), "O ID público do projeto deve ser incorporado ao build");
assert(apiSource.includes("/api/public/projects/"), "O cliente da API pública de conteúdo está ausente");
assert(previewSource.includes("preview.corujahost.com.br"), "A prévia por slug não está implementada");
assert(editorSource.includes("data-coruja-path"), "Os marcadores do editor visual estão ausentes");
assert(appSource.includes('data-coruja-form="contact_whatsapp"'), "O formulário precisa ser identificado para o editor");
assert(appSource.includes('data-coruja-event-label="contact_form_submit"'), "O envio do formulário precisa de rótulo analítico");

const previewCases = [
  [{ hostname: "preview.corujahost.com.br", pathname: "/eletronobre/sobre" }, "/eletronobre"],
  [{ hostname: "corujahost.com.br", pathname: "/preview/projeto-123/contato" }, "/preview/projeto-123"],
  [{ hostname: "corujahost.com.br", pathname: "/site-preview/projeto-123/blog" }, "/site-preview/projeto-123"],
  [{ hostname: "p-projeto-123.corujahost.com.br", pathname: "/sobre" }, ""],
  [{ hostname: "cliente.com.br", pathname: "/sobre" }, ""],
];
for (const [input, expected] of previewCases) {
  assert(resolveCorujaPreviewBasePath(input) === expected, `Base path incorreto para ${input.hostname}${input.pathname}`);
}

if (failures.length) {
  console.error(`\nCompatibilidade Coruja Host: ${failures.length} falha(s)`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Compatibilidade Coruja Host validada: contrato, editor, rotas, conteúdo, catálogo e prévia.");
