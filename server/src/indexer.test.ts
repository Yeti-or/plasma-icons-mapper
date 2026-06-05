import { describe, expect, it } from 'vitest';
import { buildIconId, computeSvgHash } from './indexer.js';
import { DescriptionStorage } from './descriptions/storage.js';
import { IconIndexer } from './indexer.js';

describe('indexer', () => {
  it('builds stable icon ids', () => {
    expect(buildIconId(24, 'Arrows', 'ArrowBarDown')).toBe('24/Arrows/ArrowBarDown');
  });

  it('hashes svg content consistently', () => {
    const hashA = computeSvgHash('<svg></svg>');
    const hashB = computeSvgHash('<svg></svg>');
    const hashC = computeSvgHash('<svg><path /></svg>');
    expect(hashA).toBe(hashB);
    expect(hashA).not.toBe(hashC);
  });

  it('scans icons from the repository', async () => {
    const storage = new DescriptionStorage();
    const indexer = new IconIndexer(storage);
    const icons = await indexer.scan();

    expect(icons.length).toBeGreaterThan(3000);
    expect(icons.some((icon) => icon.id === '24/Arrows/ArrowBarDown')).toBe(true);
    expect(icons.find((icon) => icon.id === '24/Arrows/ArrowBarDown')?.category).toBe('Arrows');
  });
});
