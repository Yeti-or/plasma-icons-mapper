import type { IconRecord, SearchResultItem } from '@plasma-icons-mapper/shared';
import { pickRepresentativeIcon } from './utils/icon-id.js';
import { normalizeQuery, tokenizeQuery } from './utils/tokenize.js';

function toSearchResult(icon: IconRecord, score: number): SearchResultItem {
  return {
    id: icon.id,
    size: icon.size,
    category: icon.category,
    name: icon.name,
    variant: icon.variant,
    relativePath: icon.relativePath,
    sizesAvailable: icon.sizesAvailable,
    description: icon.description,
    tags: icon.tags,
    score,
  };
}

function scoreNameMatch(icon: IconRecord, query: string): number {
  const normalizedQuery = normalizeQuery(query);
  const compactName = icon.name.toLowerCase();
  const compactQuery = normalizedQuery.replace(/[\s+._-]+/g, '');

  if (compactName === compactQuery) return 1;
  if (compactName.startsWith(compactQuery)) return 0.95;
  if (compactName.includes(compactQuery)) return 0.85;

  const queryTokens = tokenizeQuery(query);
  if (queryTokens.length === 0) return 0;

  const iconTokens = new Set(icon.tokens);
  const matched = queryTokens.filter((token) => iconTokens.has(token)).length;
  const tokenScore = matched / queryTokens.length;

  const fuzzyScore = queryTokens.every((token) =>
    icon.tokens.some((iconToken) => iconToken.includes(token) || token.includes(iconToken)),
  )
    ? 0.7
    : 0;

  return Math.max(tokenScore * 0.8, fuzzyScore);
}

function scoreDescriptionMatch(icon: IconRecord, query: string): number {
  const normalizedQuery = normalizeQuery(query);
  const queryTokens = tokenizeQuery(query);
  if (queryTokens.length === 0) return 0;

  const searchableParts = [
    icon.description ?? '',
    ...(icon.tags ?? []),
    icon.category,
    icon.name,
    ...icon.tokens,
  ]
    .join(' ')
    .toLowerCase();

  if (!searchableParts.trim()) return 0;

  let score = 0;
  if (searchableParts.includes(normalizedQuery)) {
    score += 0.5;
  }

  const matchedTokens = queryTokens.filter((token) => searchableParts.includes(token)).length;
  score += (matchedTokens / queryTokens.length) * 0.4;

  if (icon.category.toLowerCase().includes(normalizedQuery)) {
    score += 0.1;
  }

  return Math.min(score, 1);
}

function getRepresentativeIcons(icons: IconRecord[]): IconRecord[] {
  const logicalKeys = new Set(icons.map((icon) => icon.logicalId));
  return [...logicalKeys]
    .map((logicalId) => {
      const icon = icons.find((candidate) => candidate.logicalId === logicalId);
      if (!icon) return undefined;
      return pickRepresentativeIcon(icons, icon.category, icon.name);
    })
    .filter((icon): icon is IconRecord => Boolean(icon));
}

export function searchByName(icons: IconRecord[], query: string): SearchResultItem[] {
  return getRepresentativeIcons(icons)
    .map((icon) => ({ icon, score: scoreNameMatch(icon, query) }))
    .filter(({ score }) => score > 0.2)
    .sort((a, b) => b.score - a.score || a.icon.name.localeCompare(b.icon.name))
    .map(({ icon, score }) => toSearchResult(icon, Number(score.toFixed(4))));
}

export function searchByDescription(icons: IconRecord[], query: string): SearchResultItem[] {
  return getRepresentativeIcons(icons)
    .map((icon) => ({ icon, score: scoreDescriptionMatch(icon, query) }))
    .filter(({ score }) => score > 0.15)
    .sort((a, b) => b.score - a.score || a.icon.name.localeCompare(b.icon.name))
    .map(({ icon, score }) => toSearchResult(icon, Number(score.toFixed(4))));
}
