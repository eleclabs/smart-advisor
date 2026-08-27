export function maskCitizenId(value?: string) {
  const id = String(value || "").trim();

  if (!id) return "-";
  if (id.length <= 4) return id;

  return `${"x".repeat(id.length - 4)}${id.slice(-4)}`;
}
