import type { FastifyInstance } from 'fastify';
import { DEFAULT_ICON_SIZE, type IconSize } from '@plasma-icons-mapper/shared';
import type { IconIndexer } from '../indexer.js';
import { searchByDescription, searchByName } from '../search.js';

function parseSize(value?: string): IconSize {
  const size = Number(value ?? DEFAULT_ICON_SIZE);
  if (size === 16 || size === 24 || size === 36) {
    return size;
  }
  return DEFAULT_ICON_SIZE;
}

export async function registerSearchRoutes(
  app: FastifyInstance,
  indexer: IconIndexer,
): Promise<void> {
  app.get('/api/search', async (request) => {
    const query = request.query as {
      name?: string;
      description?: string;
      size?: string;
    };

    const size = parseSize(query.size);

    if (query.name) {
      const results = searchByName(indexer.getIcons(), query.name, size);
      return {
        query: query.name,
        mode: 'name' as const,
        size,
        results,
      };
    }

    if (query.description) {
      const results = searchByDescription(indexer.getIcons(), query.description, size);
      return {
        query: query.description,
        mode: 'description' as const,
        size,
        results,
      };
    }

    return {
      query: '',
      mode: 'name' as const,
      size,
      results: [],
    };
  });
}
