import { describe, expect, it } from 'vitest';
import type { IconRecord } from '@plasma-icons-mapper/shared';
import {
  buildLogicalIconId,
  pickRepresentativeIcon,
  toLogicalIconId,
} from './icon-id.js';

const icons: IconRecord[] = [
  {
    id: '16/Arrows/ArrowBarDown',
    logicalId: 'Arrows/ArrowBarDown',
    size: 16,
    category: 'Arrows',
    name: 'ArrowBarDown',
    variant: null,
    relativePath: 'Icons/16/Arrows/ArrowBarDown.svg',
    svgHash: 'hash-16',
    tokens: [],
    sizesAvailable: [16, 24, 36],
    generationStatus: 'missing',
  },
  {
    id: '24/Arrows/ArrowBarDown',
    logicalId: 'Arrows/ArrowBarDown',
    size: 24,
    category: 'Arrows',
    name: 'ArrowBarDown',
    variant: null,
    relativePath: 'Icons/24/Arrows/ArrowBarDown.svg',
    svgHash: 'hash-24',
    tokens: [],
    sizesAvailable: [16, 24, 36],
    generationStatus: 'missing',
  },
];

describe('icon id helpers', () => {
  it('builds logical ids without size', () => {
    expect(buildLogicalIconId('Arrows', 'ArrowBarDown')).toBe('Arrows/ArrowBarDown');
  });

  it('normalizes physical ids to logical ids', () => {
    expect(toLogicalIconId('24/Arrows/ArrowBarDown')).toBe('Arrows/ArrowBarDown');
    expect(toLogicalIconId('Arrows/ArrowBarDown')).toBe('Arrows/ArrowBarDown');
  });

  it('prefers size 24 as representative icon', () => {
    const representative = pickRepresentativeIcon(icons, 'Arrows', 'ArrowBarDown');
    expect(representative?.size).toBe(24);
    expect(representative?.svgHash).toBe('hash-24');
  });
});
