import type { IconRecord, IconSize } from '@plasma-icons-mapper/shared';
import { DEFAULT_ICON_SIZE, ICON_SIZES } from '@plasma-icons-mapper/shared';

export function buildPhysicalIconId(
  size: IconSize,
  category: string,
  name: string,
): string {
  return `${size}/${category}/${name}`;
}

export function buildLogicalIconId(category: string, name: string): string {
  return `${category}/${name}`;
}

export function isPhysicalIconId(id: string): boolean {
  const [first] = id.split('/');
  return ICON_SIZES.includes(Number(first) as IconSize);
}

export function toLogicalIconId(id: string): string {
  if (!isPhysicalIconId(id)) {
    return id;
  }

  const [, category, name] = id.split('/');
  return buildLogicalIconId(category, name);
}

type RepresentativeCandidate = Pick<
  IconRecord,
  'category' | 'name' | 'size' | 'svgHash' | 'relativePath'
>;

export function pickRepresentativeIcon<T extends RepresentativeCandidate>(
  icons: T[],
  category: string,
  name: string,
): T | undefined {
  const matches = icons.filter((icon) => icon.category === category && icon.name === name);
  if (matches.length === 0) return undefined;

  const preferredOrder: IconSize[] = [DEFAULT_ICON_SIZE, 16, 36];
  for (const size of preferredOrder) {
    const match = matches.find((icon) => icon.size === size);
    if (match) return match;
  }

  return matches[0];
}

export function pickPreviewIconId(icon: IconRecord): string {
  const preferred = icon.sizesAvailable.find((size) => size === DEFAULT_ICON_SIZE);
  const size = preferred ?? icon.sizesAvailable[0] ?? icon.size;
  return buildPhysicalIconId(size, icon.category, icon.name);
}
