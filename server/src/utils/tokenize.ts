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

export function tokenizeWords(text: string): string[] {
  return normalizeQuery(text)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export function containsExactToken(tokens: string[], needle: string): boolean {
  return tokens.includes(needle);
}

export function containsAllExactTokens(haystack: string[], needles: string[]): boolean {
  const tokenSet = new Set(haystack);
  return needles.every((needle) => tokenSet.has(needle));
}

export function containsPhrase(haystack: string[], phraseTokens: string[]): boolean {
  if (phraseTokens.length === 0) return false;
  if (phraseTokens.length === 1) return haystack.includes(phraseTokens[0]!);

  for (let index = 0; index <= haystack.length - phraseTokens.length; index += 1) {
    if (phraseTokens.every((token, offset) => haystack[index + offset] === token)) {
      return true;
    }
  }

  return false;
}
