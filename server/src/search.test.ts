import { describe, expect, it } from 'vitest';
import type { IconRecord } from '@plasma-icons-mapper/shared';
import { searchByDescription, searchByName } from './search.js';

const sampleIcons: IconRecord[] = [
  {
    id: '24/Status/HeartCircleFill',
    logicalId: 'Status/HeartCircleFill',
    size: 24,
    category: 'Status',
    name: 'HeartCircleFill',
    variant: 'Fill',
    relativePath: 'Icons/24/Status/HeartCircleFill.svg',
    svgHash: 'hash-1',
    tokens: ['heart', 'circle', 'fill', 'status'],
    sizesAvailable: [16, 24, 36],
    description: 'Heart icon inside a circle',
    tags: ['love', 'favorite', 'heart', 'circle'],
    generationStatus: 'generated',
  },
  {
    id: '24/Arrows/ArrowBarDown',
    logicalId: 'Arrows/ArrowBarDown',
    size: 24,
    category: 'Arrows',
    name: 'ArrowBarDown',
    variant: null,
    relativePath: 'Icons/24/Arrows/ArrowBarDown.svg',
    svgHash: 'hash-2',
    tokens: ['arrow', 'bar', 'down', 'arrows'],
    sizesAvailable: [16, 24, 36],
    description: 'Downward arrow ending at a horizontal bar',
    tags: ['arrow', 'down', 'download'],
    generationStatus: 'generated',
  },
  {
    id: '16/Status/HeartCircleFill',
    logicalId: 'Status/HeartCircleFill',
    size: 16,
    category: 'Status',
    name: 'HeartCircleFill',
    variant: 'Fill',
    relativePath: 'Icons/16/Status/HeartCircleFill.svg',
    svgHash: 'hash-3',
    tokens: ['heart', 'circle', 'fill', 'status'],
    sizesAvailable: [16, 24, 36],
    description: 'Heart icon inside a circle',
    tags: ['love', 'favorite', 'heart', 'circle'],
    generationStatus: 'generated',
  },
];

describe('search', () => {
  it('finds icons by exact and partial name', () => {
    const exact = searchByName(sampleIcons, 'HeartCircleFill');
    expect(exact[0]?.name).toBe('HeartCircleFill');
    expect(exact[0]?.score).toBeGreaterThan(0.9);

    const partial = searchByName(sampleIcons, 'heart circle');
    expect(partial[0]?.name).toBe('HeartCircleFill');
  });

  it('returns one representative result per logical icon', () => {
    const results = searchByName(sampleIcons, 'HeartCircleFill');
    expect(results).toHaveLength(1);
    expect(results[0]?.size).toBe(24);
    expect(results[0]?.sizesAvailable).toEqual([16, 24, 36]);
  });

  it('returns category in description search results', () => {
    const results = searchByDescription(sampleIcons, 'icon inside circle');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.category).toBe('Status');
    expect(results[0]?.score).toBeGreaterThan(0);
  });

  it('uses category as a semantic signal', () => {
    const results = searchByDescription(sampleIcons, 'arrows');
    expect(results.some((item) => item.category === 'Arrows')).toBe(true);
  });

  it('shows available sizes instead of requiring size input', () => {
    const results = searchByDescription(sampleIcons, 'heart inside circle');
    expect(results[0]?.description).toBe('Heart icon inside a circle');
    expect(results[0]?.size).toBe(24);
    expect(results[0]?.sizesAvailable).toEqual([16, 24, 36]);
  });
});
