import fs from 'node:fs/promises';
import path from 'node:path';
import type { FastifyInstance } from 'fastify';
import type { IconSize } from '@plasma-icons-mapper/shared';
import { ROOT_DIR } from '../utils/paths.js';
import type { IconIndexer } from '../indexer.js';

export async function registerIconRoutes(
  app: FastifyInstance,
  indexer: IconIndexer,
): Promise<void> {
  app.get('/api/icons', async (request) => {
    const query = request.query as {
      size?: string;
      category?: string;
      variant?: string;
      q?: string;
    };

    let icons = indexer.getIcons();

    if (query.size) {
      const size = Number(query.size) as IconSize;
      icons = icons.filter((icon) => icon.size === size);
    }

    if (query.category) {
      icons = icons.filter(
        (icon) => icon.category.toLowerCase() === query.category!.toLowerCase(),
      );
    }

    if (query.variant) {
      icons = icons.filter((icon) => icon.variant === query.variant);
    }

    if (query.q) {
      const normalized = query.q.toLowerCase();
      icons = icons.filter((icon) =>
        icon.name.toLowerCase().includes(normalized) ||
        icon.tokens.some((token) => token.includes(normalized)),
      );
    }

    return { total: icons.length, icons };
  });

  app.get('/api/icons/logical', async (request) => {
    const query = request.query as {
      category?: string;
      q?: string;
      status?: string;
    };

    let icons = indexer.getLogicalIcons();

    if (query.category) {
      icons = icons.filter(
        (icon) => icon.category.toLowerCase() === query.category!.toLowerCase(),
      );
    }

    if (query.status) {
      icons = icons.filter((icon) => icon.generationStatus === query.status);
    }

    if (query.q) {
      const normalized = query.q.toLowerCase();
      icons = icons.filter(
        (icon) =>
          icon.name.toLowerCase().includes(normalized) ||
          icon.logicalId.toLowerCase().includes(normalized),
      );
    }

    return { total: icons.length, icons };
  });

  app.get('/api/icons/*', async (request, reply) => {
    const wildcard = (request.params as { '*': string })['*'];
    const parts = wildcard.split('/');
    const id = parts.join('/');

    if (parts.at(-1) === 'svg') {
      const iconId = parts.slice(0, -1).join('/');
      const icon = indexer.getIcon(iconId);
      if (!icon) {
        return reply.code(404).send({ error: 'Icon not found' });
      }

      const svg = await fs.readFile(path.join(ROOT_DIR, icon.relativePath), 'utf8');
      reply.header('Content-Type', 'image/svg+xml');
      return reply.send(svg);
    }

    const icon = indexer.getIcon(id);
    if (!icon) {
      return reply.code(404).send({ error: 'Icon not found' });
    }

    return icon;
  });
}
