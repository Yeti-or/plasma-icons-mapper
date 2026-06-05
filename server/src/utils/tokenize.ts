export function splitPascalCase(value: string): string[] {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .split(/[\s_-]+/)
    .map((part) => part.toLowerCase())
    .filter(Boolean);
}

export function detectVariant(name: string): 'Fill' | 'Outline' | null {
  if (name.endsWith('Fill')) return 'Fill';
  if (name.endsWith('Outline')) return 'Outline';
  return null;
}

export function normalizeQuery(value: string): string {
  return value.trim().toLowerCase();
}

export function tokenizeQuery(value: string): string[] {
  return normalizeQuery(value)
    .split(/[\s+._-]+/)
    .filter(Boolean);
}
