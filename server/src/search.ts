import type { IconRecord, SearchResultItem } from '@plasma-icons-mapper/shared';
import { pickRepresentativeIcon } from './utils/icon-id.js';
import {
  containsAllExactTokens,
  containsPhrase,
  normalizeQuery,
  tokenizeQuery,
  tokenizeWords,
} from './utils/tokenize.js';

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

function scoreNameField(icon: IconRecord, query: string, queryTokens: string[]): number {
  const normalizedQuery = normalizeQuery(query);
  const compactName = icon.name.toLowerCase();
  const compactQuery = normalizedQuery.replace(/[\s+._-]+/g, '');

  if (compactName === compactQuery) return 1;
  if (compactName.startsWith(compactQuery)) return 0.95;

  const iconTokenSet = new Set(icon.tokens);
  const matchedNameTokens = queryTokens.filter((token) => iconTokenSet.has(token)).length;
  if (matchedNameTokens === queryTokens.length) return 0.95;
  if (matchedNameTokens > 0) {
    return 0.85 * (matchedNameTokens / queryTokens.length);
  }

  return 0;
}

function scoreTagField(icon: IconRecord, query: string, queryTokens: string[]): number {
  const normalizedQuery = normalizeQuery(query);
  const tags = (icon.tags ?? []).map((tag) => tag.toLowerCase());
  if (tags.length === 0) return 0;

  if (tags.includes(normalizedQuery)) return 0.9;

  const tagPhrase = queryTokens.join(' ');
  if (tags.includes(tagPhrase)) return 0.8;

  if (queryTokens.length > 1 && queryTokens.every((token) => tags.includes(token))) {
    return 0.8;
  }

  return 0;
}

function scoreDescriptionField(icon: IconRecord, queryTokens: string[]): number {
  const description = icon.description?.trim();
  if (!description) return 0;

  const descriptionTokens = tokenizeWords(description);
  if (containsPhrase(descriptionTokens, queryTokens)) {
    return queryTokens.length > 1 ? 0.7 : 0.55;
  }

  if (containsAllExactTokens(descriptionTokens, queryTokens)) {
    return queryTokens.length > 1 ? 0.65 : 0.55;
  }

  return 0;
}

function scoreCategoryField(icon: IconRecord, query: string, queryTokens: string[]): number {
  const normalizedQuery = normalizeQuery(query);
  const categoryLower = icon.category.toLowerCase();

  if (categoryLower === normalizedQuery) return 0.3;

  const categoryTokens = tokenizeWords(categoryLower);
  if (queryTokens.some((token) => categoryTokens.includes(token))) {
    return 0.15;
  }

  return 0;
}

function scoreTokenHelperField(icon: IconRecord, queryTokens: string[], nameScore: number): number {
  if (nameScore >= 0.95 || queryTokens.length === 0) return 0;

  const iconTokenSet = new Set(icon.tokens);
  if (queryTokens.every((token) => iconTokenSet.has(token))) {
    return 0.2;
  }

  return 0;
}

function scoreDescriptionMatch(icon: IconRecord, query: string): number {
  const queryTokens = tokenizeQuery(query);
  if (queryTokens.length === 0) return 0;

  const nameScore = scoreNameField(icon, query, queryTokens);
  const tagScore = scoreTagField(icon, query, queryTokens);
  const descriptionScore = scoreDescriptionField(icon, queryTokens);
  const categoryScore = scoreCategoryField(icon, query, queryTokens);
  const tokenHelperScore = scoreTokenHelperField(icon, queryTokens, nameScore);

  const fieldScores = [nameScore, tagScore, descriptionScore, categoryScore, tokenHelperScore];
  let score = Math.max(...fieldScores);

  const strongFieldCount = [nameScore >= 0.85, tagScore >= 0.8, descriptionScore >= 0.55].filter(
    Boolean,
  ).length;
  if (strongFieldCount >= 2) {
    score = Math.min(score + 0.05 * (strongFieldCount - 1), 1);
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
