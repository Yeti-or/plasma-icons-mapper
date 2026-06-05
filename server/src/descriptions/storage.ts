import fs from 'node:fs/promises';
import path from 'node:path';
import type { IconDescription } from '@plasma-icons-mapper/shared';
import { DESCRIPTIONS_DIR } from '../utils/paths.js';
import { toLogicalIconId } from '../utils/icon-id.js';

export class DescriptionStorage {
  private cache = new Map<string, IconDescription>();

  getCache(): Map<string, IconDescription> {
    return this.cache;
  }

  async ensureDir(): Promise<void> {
    await fs.mkdir(DESCRIPTIONS_DIR, { recursive: true });
  }

  private descriptionPath(id: string): string {
    const logicalId = toLogicalIconId(id);
    const [category, name] = logicalId.split('/');
    return path.join(DESCRIPTIONS_DIR, category, `${name}.json`);
  }

  async loadAll(): Promise<Map<string, IconDescription>> {
    await this.ensureDir();
    this.cache.clear();

    try {
      await this.walkDescriptions(DESCRIPTIONS_DIR);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }

    return this.cache;
  }

  private async walkDescriptions(dir: string, depth = 0): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await this.walkDescriptions(fullPath, depth + 1);
        continue;
      }

      if (!entry.name.endsWith('.json')) continue;
      const content = await fs.readFile(fullPath, 'utf8');
      const description = JSON.parse(content) as IconDescription;
      const logicalId = toLogicalIconId(description.id);
      this.cache.set(logicalId, { ...description, id: logicalId });
    }
  }

  async get(id: string): Promise<IconDescription | undefined> {
    const logicalId = toLogicalIconId(id);
    if (this.cache.has(logicalId)) {
      return this.cache.get(logicalId);
    }

    try {
      const content = await fs.readFile(this.descriptionPath(logicalId), 'utf8');
      const description = JSON.parse(content) as IconDescription;
      const normalized = { ...description, id: logicalId };
      this.cache.set(logicalId, normalized);
      return normalized;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return undefined;
      }
      throw error;
    }
  }

  async save(description: IconDescription): Promise<void> {
    const logicalId = toLogicalIconId(description.id);
    const normalized = { ...description, id: logicalId };
    const filePath = this.descriptionPath(logicalId);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
    this.cache.set(logicalId, normalized);
  }
}
