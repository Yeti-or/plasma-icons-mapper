import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  GenerationStatus,
  IconRecord,
  IconSize,
  LogicalIconRecord,
} from '@plasma-icons-mapper/shared';
import { ICON_SIZES } from '@plasma-icons-mapper/shared';
import { ICONS_DIR } from './utils/paths.js';
import { detectVariant, splitPascalCase } from './utils/tokenize.js';
import {
  buildLogicalIconId,
  buildPhysicalIconId,
  pickPreviewIconId,
  pickRepresentativeIcon,
} from './utils/icon-id.js';
import { DescriptionStorage } from './descriptions/storage.js';

function isIconSize(value: string): value is `${IconSize}` {
  return ICON_SIZES.includes(Number(value) as IconSize);
}

export function computeSvgHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function buildIconId(size: IconSize, category: string, name: string): string {
  return buildPhysicalIconId(size, category, name);
}

export class IconIndexer {
  private icons: IconRecord[] = [];
  private iconMap = new Map<string, IconRecord>();

  constructor(private readonly descriptionStorage: DescriptionStorage) {}

  getIcons(): IconRecord[] {
    return this.icons;
  }

  getIcon(id: string): IconRecord | undefined {
    return this.iconMap.get(id);
  }

  getLogicalIcons(): LogicalIconRecord[] {
    const logicalMap = new Map<string, LogicalIconRecord>();

    for (const icon of this.icons) {
      const existing = logicalMap.get(icon.logicalId);
      if (!existing) {
        logicalMap.set(icon.logicalId, {
          logicalId: icon.logicalId,
          category: icon.category,
          name: icon.name,
          variant: icon.variant,
          sizesAvailable: icon.sizesAvailable,
          previewId: pickPreviewIconId(icon),
          description: icon.description,
          tags: icon.tags,
          generatedAt: icon.generatedAt,
          model: icon.model,
          generationStatus: icon.generationStatus,
        });
        continue;
      }

      existing.sizesAvailable = icon.sizesAvailable;
      existing.description = icon.description;
      existing.tags = icon.tags;
      existing.generatedAt = icon.generatedAt;
      existing.model = icon.model;
      existing.generationStatus = icon.generationStatus;
      existing.previewId = pickPreviewIconId(icon);
    }

    return [...logicalMap.values()].sort((a, b) =>
      a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
    );
  }

  async scan(): Promise<IconRecord[]> {
    const scanned: Array<Omit<IconRecord, 'sizesAvailable' | 'generationStatus'>> = [];

    for (const sizeEntry of await fs.readdir(ICONS_DIR, { withFileTypes: true })) {
      if (!sizeEntry.isDirectory() || !isIconSize(sizeEntry.name)) continue;
      const size = Number(sizeEntry.name) as IconSize;
      const sizeDir = path.join(ICONS_DIR, sizeEntry.name);

      for (const categoryEntry of await fs.readdir(sizeDir, { withFileTypes: true })) {
        if (!categoryEntry.isDirectory()) continue;
        const category = categoryEntry.name;
        const categoryDir = path.join(sizeDir, category);

        for (const fileEntry of await fs.readdir(categoryDir, { withFileTypes: true })) {
          if (!fileEntry.isFile() || !fileEntry.name.endsWith('.svg')) continue;

          const name = fileEntry.name.replace(/\.svg$/, '');
          const relativePath = path.join('Icons', String(size), category, fileEntry.name);
          const absolutePath = path.join(categoryDir, fileEntry.name);
          const svgContent = await fs.readFile(absolutePath, 'utf8');
          const svgHash = computeSvgHash(svgContent);
          const variant = detectVariant(name);
          const tokens = [
            ...splitPascalCase(name),
            category.toLowerCase(),
            ...(variant ? [variant.toLowerCase()] : []),
          ];

          scanned.push({
            id: buildPhysicalIconId(size, category, name),
            logicalId: buildLogicalIconId(category, name),
            size,
            category,
            name,
            variant,
            relativePath,
            svgHash,
            tokens,
          });
        }
      }
    }

    const sizesByKey = new Map<string, IconSize[]>();
    for (const icon of scanned) {
      const key = icon.logicalId;
      const existing = sizesByKey.get(key) ?? [];
      existing.push(icon.size);
      sizesByKey.set(key, [...new Set(existing)].sort((a, b) => a - b));
    }

    const descriptions = await this.descriptionStorage.loadAll();
    this.icons = scanned.map((icon) => {
      const description = descriptions.get(icon.logicalId);
      const representative = pickRepresentativeIcon(scanned, icon.category, icon.name);
      const generationStatus = this.resolveGenerationStatus(
        representative?.svgHash,
        description,
      );

      return {
        ...icon,
        sizesAvailable: sizesByKey.get(icon.logicalId) ?? [icon.size],
        description: description?.description,
        tags: description?.tags,
        generatedAt: description?.generatedAt,
        model: description?.model,
        generationStatus,
      };
    });

    this.iconMap = new Map(this.icons.map((icon) => [icon.id, icon]));
    return this.icons;
  }

  private resolveGenerationStatus(
    representativeSvgHash: string | undefined,
    description?: { svgHash: string },
  ): GenerationStatus {
    if (!description) return 'missing';
    if (!representativeSvgHash || description.svgHash !== representativeSvgHash) return 'stale';
    return 'generated';
  }

  refreshDescriptions(): void {
    const descriptions = this.descriptionStorage.getCache();
    for (const icon of this.icons) {
      const description = descriptions.get(icon.logicalId);
      const representative = pickRepresentativeIcon(this.icons, icon.category, icon.name);
      icon.description = description?.description;
      icon.tags = description?.tags;
      icon.generatedAt = description?.generatedAt;
      icon.model = description?.model;
      icon.generationStatus = this.resolveGenerationStatus(
        representative?.svgHash,
        description,
      );
    }
  }
}
