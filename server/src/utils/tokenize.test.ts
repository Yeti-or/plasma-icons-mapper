import { describe, expect, it } from 'vitest';
import { detectVariant, splitPascalCase, tokenizeQuery } from './tokenize.js';

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
});
