import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  ArchivedDescription,
  GenerationLog,
  GenerationMode,
  IconDescription,
  LogicalIconRecord,
  TestGenerateResult,
} from '@plasma-icons-mapper/shared';
import { selectLogicalIconsForGeneration } from './selection.js';
import { ROOT_DIR, GENERATION_LOG_PATH } from '../utils/paths.js';
import { DescriptionStorage } from './storage.js';
import { OpenRouterClient } from './openrouter.js';
import type { IconIndexer } from '../indexer.js';
import { pickRepresentativeIcon, toLogicalIconId } from '../utils/icon-id.js';

const DEFAULT_CONCURRENCY = 3;

export class DescriptionGenerator {
  private log: GenerationLog = {
    inProgress: false,
    processed: 0,
    total: 0,
    failures: [],
    archivedDescriptions: [],
  };

  constructor(
    private readonly indexer: IconIndexer,
    private readonly storage: DescriptionStorage,
    private readonly openRouter: OpenRouterClient,
  ) {}

  getLog(): GenerationLog {
    return this.log;
  }

  async loadLog(): Promise<void> {
    try {
      const content = await fs.readFile(GENERATION_LOG_PATH, 'utf8');
      this.log = { ...this.log, ...JSON.parse(content) };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  private async persistLog(): Promise<void> {
    await fs.mkdir(path.dirname(GENERATION_LOG_PATH), { recursive: true });
    await fs.writeFile(GENERATION_LOG_PATH, `${JSON.stringify(this.log, null, 2)}\n`, 'utf8');
  }

  async generate(options: {
    mode: GenerationMode;
    iconIds?: string[];
    model?: string;
    concurrency?: number;
  }): Promise<GenerationLog> {
    if (this.log.inProgress) {
      throw new Error('Generation is already in progress');
    }

    const icons = selectLogicalIconsForGeneration(
      this.indexer.getLogicalIcons(),
      options.mode,
      options.iconIds,
    );
    const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;
    const model = options.model ?? process.env.OPENROUTER_MODEL ?? 'google/gemini-2.5-flash';

    this.log = {
      ...this.log,
      inProgress: true,
      processed: 0,
      total: icons.length,
      lastRunAt: new Date().toISOString(),
      lastMode: options.mode,
      lastModel: model,
      failures: [],
      archivedDescriptions: options.mode === 'force' ? [] : this.log.archivedDescriptions,
    };
    await this.persistLog();

    const queue = [...icons];
    const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
      while (queue.length > 0) {
        const icon = queue.shift();
        if (!icon) break;
        await this.generateForLogicalIcon(icon, model, options.mode === 'force');
        this.log.processed += 1;
        await this.persistLog();
      }
    });

    await Promise.all(workers);

    this.log.inProgress = false;
    await this.persistLog();
    this.indexer.refreshDescriptions();
    return this.log;
  }

  private async generateForLogicalIcon(
    logicalIcon: LogicalIconRecord,
    model: string,
    force: boolean,
  ): Promise<void> {
    try {
      const representative = pickRepresentativeIcon(
        this.indexer.getIcons(),
        logicalIcon.category,
        logicalIcon.name,
      );

      if (!representative) {
        throw new Error('Representative icon not found');
      }

      const previous = force ? await this.storage.get(logicalIcon.logicalId) : undefined;
      const svgContent = await fs.readFile(path.join(ROOT_DIR, representative.relativePath), 'utf8');
      const generated = await this.openRouter.generateDescription({
        id: logicalIcon.logicalId,
        category: logicalIcon.category,
        name: logicalIcon.name,
        size: representative.size,
        variant: logicalIcon.variant,
        svgContent,
      });

      const description: IconDescription = {
        id: logicalIcon.logicalId,
        svgHash: representative.svgHash,
        description: generated.description,
        tags: generated.tags,
        model,
        generatedAt: new Date().toISOString(),
        sourceSize: representative.size,
      };

      await this.storage.save(description);

      if (force && previous) {
        const archived: ArchivedDescription = {
          id: logicalIcon.logicalId,
          previous,
          archivedAt: new Date().toISOString(),
        };
        this.log.archivedDescriptions = [...(this.log.archivedDescriptions ?? []), archived];
      }
    } catch (error) {
      this.log.failures.push({
        id: logicalIcon.logicalId,
        error: error instanceof Error ? error.message : String(error),
        failedAt: new Date().toISOString(),
      });
    }
  }

  async testGenerate(options: {
    iconIds: string[];
    model?: string;
    promptOverride?: string;
  }): Promise<TestGenerateResult[]> {
    const model = options.model ?? process.env.OPENROUTER_MODEL ?? 'google/gemini-2.5-flash';
    const client = new OpenRouterClient({
      apiKey: process.env.OPENROUTER_API_KEY ?? '',
      model,
      promptOverride: options.promptOverride,
    });

    const results: TestGenerateResult[] = [];
    for (const iconId of options.iconIds) {
      const logicalId = toLogicalIconId(iconId);
      const logicalIcon = this.indexer.getLogicalIcons().find((icon) => icon.logicalId === logicalId);
      if (!logicalIcon) {
        results.push({
          id: logicalId,
          description: '',
          tags: [],
          model,
          rawResponse: 'Icon not found',
        });
        continue;
      }

      const representative = pickRepresentativeIcon(
        this.indexer.getIcons(),
        logicalIcon.category,
        logicalIcon.name,
      );

      if (!representative) {
        results.push({
          id: logicalId,
          description: '',
          tags: [],
          model,
          rawResponse: 'Representative icon not found',
        });
        continue;
      }

      const svgContent = await fs.readFile(path.join(ROOT_DIR, representative.relativePath), 'utf8');
      const generated = await client.generateDescription({
        id: logicalId,
        category: logicalIcon.category,
        name: logicalIcon.name,
        size: representative.size,
        variant: logicalIcon.variant,
        svgContent,
      });

      results.push({
        id: logicalId,
        description: generated.description,
        tags: generated.tags,
        model,
      });
    }

    return results;
  }

  async updateManualDescription(iconId: string, descriptionText: string): Promise<LogicalIconRecord> {
    const logicalId = toLogicalIconId(iconId);
    const logicalIcon = this.indexer.getLogicalIcons().find((icon) => icon.logicalId === logicalId);
    if (!logicalIcon) {
      throw new Error('Icon not found');
    }

    const representative = pickRepresentativeIcon(
      this.indexer.getIcons(),
      logicalIcon.category,
      logicalIcon.name,
    );
    if (!representative) {
      throw new Error('Representative icon not found');
    }

    const previous = await this.storage.get(logicalId);
    const description: IconDescription = {
      id: logicalId,
      svgHash: representative.svgHash,
      description: descriptionText,
      tags: previous?.tags ?? [],
      model: 'manual',
      generatedAt: new Date().toISOString(),
      sourceSize: representative.size,
    };

    await this.storage.save(description);
    this.indexer.refreshDescriptions();

    const updatedIcon = this.indexer.getLogicalIcons().find((icon) => icon.logicalId === logicalId);
    if (!updatedIcon) {
      throw new Error('Updated icon not found');
    }

    return updatedIcon;
  }

  getStatusSummary() {
    const logicalIcons = this.indexer.getLogicalIcons();
    return {
      totalIcons: logicalIcons.length,
      totalPhysicalIcons: this.indexer.getIcons().length,
      withDescription: logicalIcons.filter((icon) => icon.generationStatus === 'generated').length,
      missing: logicalIcons.filter((icon) => icon.generationStatus === 'missing').length,
      stale: logicalIcons.filter((icon) => icon.generationStatus === 'stale').length,
      failed: this.log.failures.length,
      log: this.log,
    };
  }
}
