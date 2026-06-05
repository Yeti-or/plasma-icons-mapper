import type { FastifyInstance } from 'fastify';
import type { SearchResultItem } from '@plasma-icons-mapper/shared';
import type { IconIndexer } from '../indexer.js';
import { searchByDescription, searchByName } from '../search.js';

function getRequestBaseUrl(request: { headers: Record<string, string | string[] | undefined> }): string {
  const host = Array.isArray(request.headers.host) ? request.headers.host[0] : request.headers.host;
  const forwardedProto = request.headers['x-forwarded-proto'];
  const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
  return `${proto ?? 'http'}://${host ?? 'localhost:3001'}`;
}

function withLinks(
  results: SearchResultItem[],
  options: { baseUrl: string; mode: 'name' | 'description'; query: string },
): SearchResultItem[] {
  const searchParam = options.mode === 'name' ? 'name' : 'description';

  return results.map((result) => {
    const previewParams = new URLSearchParams({
      [searchParam]: options.query,
      selected: result.id,
    });

    return {
      ...result,
      svgUrl: `${options.baseUrl}/api/icons/${result.id}/svg`,
      previewUrl: `${options.baseUrl}/?${previewParams.toString()}`,
    };
  });
}

export async function registerSearchRoutes(
  app: FastifyInstance,
  indexer: IconIndexer,
): Promise<void> {
  app.get('/api/search', async (request) => {
    const query = request.query as {
      name?: string;
      description?: string;
    };

    const baseUrl = getRequestBaseUrl(request);

    if (query.name) {
      const results = searchByName(indexer.getIcons(), query.name);
      return {
        query: query.name,
        mode: 'name' as const,
        results: withLinks(results, { baseUrl, mode: 'name', query: query.name }),
      };
    }

    if (query.description) {
      const results = searchByDescription(indexer.getIcons(), query.description);
      return {
        query: query.description,
        mode: 'description' as const,
        results: withLinks(results, {
          baseUrl,
          mode: 'description',
          query: query.description,
        }),
      };
    }

    return {
      query: '',
      mode: 'name' as const,
      results: [],
    };
  });
}
