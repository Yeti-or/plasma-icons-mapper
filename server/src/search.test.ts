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
    const exact = searchByName(sampleIcons, 'HeartCircleFill', 24);
    expect(exact[0]?.name).toBe('HeartCircleFill');
    expect(exact[0]?.score).toBeGreaterThan(0.9);

    const partial = searchByName(sampleIcons, 'heart circle', 24);
    expect(partial[0]?.name).toBe('HeartCircleFill');
  });

  it('defaults to size 24 results only', () => {
    const results = searchByName(sampleIcons, 'HeartCircleFill');
    expect(results).toHaveLength(1);
    expect(results[0]?.size).toBe(24);
  });

  it('returns category in description search results', () => {
    const results = searchByDescription(sampleIcons, 'icon inside circle', 24);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.category).toBe('Status');
    expect(results[0]?.score).toBeGreaterThan(0);
  });

  it('uses category as a semantic signal', () => {
    const results = searchByDescription(sampleIcons, 'arrows', 24);
    expect(results.some((item) => item.category === 'Arrows')).toBe(true);
  });

  it('shares description across sizes for the same logical icon', () => {
    const results16 = searchByDescription(sampleIcons, 'heart inside circle', 16);
    const results24 = searchByDescription(sampleIcons, 'heart inside circle', 24);
    expect(results16[0]?.description).toBe(results24[0]?.description);
    expect(results16[0]?.size).toBe(16);
    expect(results24[0]?.size).toBe(24);
  });
});
