const FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

export function escapeCSVCell(value: string | number | boolean | null | undefined): string {
  const str = String(value ?? '');

  let escaped = str;
  if (FORMULA_PREFIXES.some((prefix) => str.startsWith(prefix))) {
    escaped = "'" + str;
  } else if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    escaped = '"' + str.replace(/"/g, '""') + '"';
  }

  return escaped;
}
