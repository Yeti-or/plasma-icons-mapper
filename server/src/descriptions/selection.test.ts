import { describe, expect, it } from 'vitest';
import type { LogicalIconRecord } from '@plasma-icons-mapper/shared';
import { selectLogicalIconsForGeneration } from './selection.js';

function createIcon(logicalId: string, status: LogicalIconRecord['generationStatus']): LogicalIconRecord {
  const [category, name] = logicalId.split('/');
  return {
    logicalId,
    category,
    name,
    variant: null,
    sizesAvailable: [24],
    previewId: `24/${logicalId}`,
    generationStatus: status,
  };
}

describe('selectLogicalIconsForGeneration', () => {
  const icons = [
    createIcon('Arrows/A', 'missing'),
    createIcon('Arrows/B', 'stale'),
    createIcon('Arrows/C', 'generated'),
  ];

  it('selects missing icons only', () => {
    expect(selectLogicalIconsForGeneration(icons, 'missing')).toHaveLength(1);
  });

  it('selects missing and stale icons', () => {
    expect(selectLogicalIconsForGeneration(icons, 'stale')).toHaveLength(2);
  });

  it('forces regeneration for all selected icons', () => {
    expect(selectLogicalIconsForGeneration(icons, 'force')).toHaveLength(3);
  });

  it('normalizes physical ids to logical ids', () => {
    const selected = selectLogicalIconsForGeneration(icons, 'force', ['24/Arrows/A', '36/Arrows/B']);
    expect(selected.map((icon) => icon.logicalId)).toEqual(['Arrows/A', 'Arrows/B']);
  });
});
