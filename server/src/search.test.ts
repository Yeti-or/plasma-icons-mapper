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

const likeSearchIcons: IconRecord[] = [
  {
    id: '24/Toggle/LikeFill',
    logicalId: 'Toggle/LikeFill',
    size: 24,
    category: 'Toggle',
    name: 'LikeFill',
    variant: 'Fill',
    relativePath: 'Icons/24/Toggle/LikeFill.svg',
    svgHash: 'hash-like-fill',
    tokens: ['like', 'fill', 'toggle'],
    sizesAvailable: [16, 24, 36],
    description: "A filled icon depicting a hand with the thumb raised, commonly recognized as a 'like' gesture.",
    tags: ['like', 'thumbs up', 'agree', 'approve'],
    generationStatus: 'generated',
  },
  {
    id: '24/Toggle/LikeOutline',
    logicalId: 'Toggle/LikeOutline',
    size: 24,
    category: 'Toggle',
    name: 'LikeOutline',
    variant: 'Outline',
    relativePath: 'Icons/24/Toggle/LikeOutline.svg',
    svgHash: 'hash-like-outline',
    tokens: ['like', 'outline', 'toggle'],
    sizesAvailable: [16, 24, 36],
    description: "An outline icon of a hand with the thumb extended upwards, commonly known as a 'like' gesture.",
    tags: ['like', 'thumbs up', 'approval', 'agree'],
    generationStatus: 'generated',
  },
  {
    id: '24/Toggle/HeartFill',
    logicalId: 'Toggle/HeartFill',
    size: 24,
    category: 'Toggle',
    name: 'HeartFill',
    variant: 'Fill',
    relativePath: 'Icons/24/Toggle/HeartFill.svg',
    svgHash: 'hash-heart-fill',
    tokens: ['heart', 'fill', 'toggle'],
    sizesAvailable: [16, 24, 36],
    description: "A heart shape, commonly used to indicate a favorite item, a 'like', or love.",
    tags: ['heart', 'love', 'like', 'favorite'],
    generationStatus: 'generated',
  },
  {
    id: '24/Commerce/ArrowWideForwardBack',
    logicalId: 'Commerce/ArrowWideForwardBack',
    size: 24,
    category: 'Commerce',
    name: 'ArrowWideForwardBack',
    variant: null,
    relativePath: 'Icons/24/Commerce/ArrowWideForwardBack.svg',
    svgHash: 'hash-arrow-wide',
    tokens: ['arrow', 'wide', 'forward', 'back', 'commerce'],
    sizesAvailable: [16, 24, 36],
    description:
      'This icon depicts an arrow pointing forward and another arrow pointing back, symbolizing a two-way movement or exchange. It can represent features like undo/redo, history, or transaction flow.',
    tags: ['arrow', 'forward', 'back', 'reverse', 'exchange'],
    generationStatus: 'generated',
  },
  {
    id: '24/Devices/PowerWireFill',
    logicalId: 'Devices/PowerWireFill',
    size: 24,
    category: 'Devices',
    name: 'PowerWireFill',
    variant: 'Fill',
    relativePath: 'Icons/24/Devices/PowerWireFill.svg',
    svgHash: 'hash-power-wire',
    tokens: ['power', 'wire', 'fill', 'devices'],
    sizesAvailable: [16, 24, 36],
    description:
      'This is a filled icon depicting a power wire or electrical cord, symbolizing charging, power, or connectivity. It features a plug-like top connected to a wire.',
    tags: ['power', 'wire', 'cord', 'charging', 'plug'],
    generationStatus: 'generated',
  },
  {
    id: '24/Data/ChartDistributionOutline',
    logicalId: 'Data/ChartDistributionOutline',
    size: 24,
    category: 'Data',
    name: 'ChartDistributionOutline',
    variant: 'Outline',
    relativePath: 'Icons/24/Data/ChartDistributionOutline.svg',
    svgHash: 'hash-chart',
    tokens: ['chart', 'distribution', 'outline', 'data'],
    sizesAvailable: [16, 24, 36],
    description:
      'This icon depicts a data distribution chart, often used to visualize statistical distributions or histograms. It features a bar chart-like cluster with varying heights.',
    tags: ['chart', 'distribution', 'data', 'statistics'],
    generationStatus: 'generated',
  },
  {
    id: '24/Toggle/DislikeFill',
    logicalId: 'Toggle/DislikeFill',
    size: 24,
    category: 'Toggle',
    name: 'DislikeFill',
    variant: 'Fill',
    relativePath: 'Icons/24/Toggle/DislikeFill.svg',
    svgHash: 'hash-dislike-fill',
    tokens: ['dislike', 'fill', 'toggle'],
    sizesAvailable: [16, 24, 36],
    description:
      'A filled icon depicting a downward-pointing thumb, commonly used to express disapproval, dislike, or negative feedback.',
    tags: ['dislike', 'downvote', 'negative', 'disapprove'],
    generationStatus: 'generated',
  },
  {
    id: '24/Toggle/HeartDashFill',
    logicalId: 'Toggle/HeartDashFill',
    size: 24,
    category: 'Toggle',
    name: 'HeartDashFill',
    variant: 'Fill',
    relativePath: 'Icons/24/Toggle/HeartDashFill.svg',
    svgHash: 'hash-heart-dash',
    tokens: ['heart', 'dash', 'fill', 'toggle'],
    sizesAvailable: [16, 24, 36],
    description: 'This icon depicts a heart shape with a diagonal dashed line passing through it.',
    tags: ['heart', 'dash', 'remove', 'unlike', 'unfavorite'],
    generationStatus: 'generated',
  },
  {
    id: '24/Status/TagOnlyLike',
    logicalId: 'Status/TagOnlyLike',
    size: 24,
    category: 'Status',
    name: 'TagOnlyLike',
    variant: null,
    relativePath: 'Icons/24/Status/TagOnlyLike.svg',
    svgHash: 'hash-tag-only',
    tokens: ['tag', 'only', 'status'],
    sizesAvailable: [16, 24, 36],
    description: 'A generic status indicator used in dashboards.',
    tags: ['like', 'status'],
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

  it('ranks LikeFill and LikeOutline first for description query "like"', () => {
    const results = searchByDescription(likeSearchIcons, 'like');
    const topNames = results.slice(0, 2).map((item) => item.name);

    expect(topNames).toContain('LikeFill');
    expect(topNames).toContain('LikeOutline');
    expect(results[0]?.score).toBeGreaterThan(0.9);
    expect(results[1]?.score).toBeGreaterThan(0.9);
  });

  it('does not give incidental prose matches a top-tier score for "like"', () => {
    const results = searchByDescription(likeSearchIcons, 'like');
    const incidental = results.filter((item) =>
      ['ArrowWideForwardBack', 'PowerWireFill', 'ChartDistributionOutline'].includes(item.name),
    );

    expect(incidental.length).toBeGreaterThan(0);
    for (const item of incidental) {
      expect(item.score).toBeLessThan(0.8);
    }
  });

  it('does not match dislike or unlike for the query "like"', () => {
    const results = searchByDescription(likeSearchIcons, 'like');
    const names = results.map((item) => item.name);

    expect(names).not.toContain('DislikeFill');
    expect(names).not.toContain('HeartDashFill');
  });

  it('still finds dislike icons for the query "dislike"', () => {
    const results = searchByDescription(likeSearchIcons, 'dislike');

    expect(results[0]?.name).toBe('DislikeFill');
    expect(results[0]?.score).toBeGreaterThan(0.9);
  });

  it('ranks exact tag matches above description-only matches', () => {
    const results = searchByDescription(likeSearchIcons, 'like');
    const tagOnly = results.find((item) => item.name === 'TagOnlyLike');
    const heart = results.find((item) => item.name === 'HeartFill');
    const likeFill = results.find((item) => item.name === 'LikeFill');

    expect(tagOnly?.score).toBeGreaterThan(0.8);
    expect(likeFill?.score).toBeGreaterThan(tagOnly?.score ?? 0);
    expect(heart?.score).toBeGreaterThan(0.8);
    expect(likeFill?.score).toBeGreaterThan(heart?.score ?? 0);
  });
});
