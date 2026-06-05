import { describe, expect, it } from 'vitest';
import {
  containsAllExactTokens,
  containsPhrase,
  detectVariant,
  splitPascalCase,
  tokenizeQuery,
  tokenizeWords,
} from './tokenize.js';

describe('tokenize utilities', () => {
  it('splits PascalCase names', () => {
    expect(splitPascalCase('HeartCircleFill')).toEqual(['heart', 'circle', 'fill']);
    expect(splitPascalCase('ArrowBarDown')).toEqual(['arrow', 'bar', 'down']);
  });

  it('detects icon variants', () => {
    expect(detectVariant('HeartCircleFill')).toBe('Fill');
    expect(detectVariant('HeartCircleOutline')).toBe('Outline');
    expect(detectVariant('Menu')).toBeNull();
  });

  it('tokenizes search queries', () => {
    expect(tokenizeQuery('icon inside circle')).toEqual(['icon', 'inside', 'circle']);
    expect(tokenizeQuery('heart+circle_fill')).toEqual(['heart', 'circle', 'fill']);
  });

  it('tokenizes prose into complete words', () => {
    expect(tokenizeWords('features like undo/redo')).toEqual(['features', 'like', 'undo', 'redo']);
    expect(tokenizeWords('plug-like top')).toEqual(['plug', 'like', 'top']);
  });

  it('matches phrases and exact token sets', () => {
    const words = tokenizeWords('heart icon inside a circle');
    expect(containsPhrase(words, ['icon', 'inside'])).toBe(true);
    expect(containsAllExactTokens(words, ['heart', 'circle'])).toBe(true);
    expect(containsPhrase(words, ['like'])).toBe(false);
  });
});
