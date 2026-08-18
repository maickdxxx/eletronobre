import editableSchema from "./editable-schema.json";
import { getByPath, useCoruja } from "./content.jsx";
import { getCorujaRoute } from "./preview.js";

function markerValue(value) {
  if (value === undefined || value === null) return "";
  if (["string", "number", "boolean"].includes(typeof value)) return String(value);
  try { return JSON.stringify(value); } catch { return String(value); }
}

function routeMatches(route, pathname) {
  if (route === pathname) return true;
  if (route === "/blog" && pathname.startsWith("/blog/")) return true;
  const pattern = String(route || "").replace(/:[^/]+/g, "[^/]+");
  return pattern ? new RegExp(`^${pattern}$`).test(pathname) : false;
}

export default function CorujaRouteMarkers() {
  const content = useCoruja();
  const route = getCorujaRoute();
  const page = (editableSchema.pages || []).find((candidate) => routeMatches(candidate.route, route));
  const fields = [...(editableSchema.globalFields || []), ...(page?.fields || [])];
  const collectionFields = (editableSchema.collections || []).flatMap((collection) => {
    const items = getByPath(content, collection.path);
    if (!Array.isArray(items)) return [];
    return items.flatMap((item, index) => (collection.itemSchema || []).map((field) => ({
      path: `${collection.path}.${index}.${field.key}`,
      label: field.label,
      type: field.type,
      itemId: item?.id,
    })));
  });

  return <div className="coruja-route-markers" aria-hidden="true">
    {[...fields, ...collectionFields].map((field) => <span
      key={field.path}
      data-coruja-editable="true"
      data-coruja-path={field.path}
      data-coruja-field-type={field.type || "text"}
      data-coruja-label={field.label || field.path}
      data-coruja-item-id={field.itemId}
    >{markerValue(getByPath(content, field.path))}</span>)}
  </div>;
}
