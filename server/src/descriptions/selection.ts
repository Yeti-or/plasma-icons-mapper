import type { GenerationMode, LogicalIconRecord } from '@plasma-icons-mapper/shared';
import { toLogicalIconId } from '../utils/icon-id.js';

export function selectLogicalIconsForGeneration(
  icons: LogicalIconRecord[],
  mode: GenerationMode,
  iconIds?: string[],
): LogicalIconRecord[] {
  const normalizedIds = iconIds?.map((id) => toLogicalIconId(id));
  const selected = normalizedIds?.length
    ? icons.filter((icon) => normalizedIds.includes(icon.logicalId))
    : icons;

  switch (mode) {
    case 'missing':
      return selected.filter((icon) => icon.generationStatus === 'missing');
    case 'stale':
      return selected.filter((icon) =>
        ['missing', 'stale'].includes(icon.generationStatus),
      );
    case 'force':
      return selected;
    default:
      return selected;
  }
}
