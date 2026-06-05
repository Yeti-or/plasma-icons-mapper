import type { FastifyInstance } from 'fastify';
import type {
  GenerateRequest,
  ManualDescriptionUpdateRequest,
  TestGenerateRequest,
} from '@plasma-icons-mapper/shared';
import type { DescriptionGenerator } from '../descriptions/generator.js';

export async function registerAdminRoutes(
  app: FastifyInstance,
  generator: DescriptionGenerator,
): Promise<void> {
  app.post('/api/admin/descriptions/generate', async (request, reply) => {
    const body = request.body as GenerateRequest;

    if (!process.env.OPENROUTER_API_KEY) {
      return reply.code(400).send({ error: 'OPENROUTER_API_KEY is not configured' });
    }

    if (!body?.mode) {
      return reply.code(400).send({ error: 'mode is required' });
    }

    const log = await generator.generate({
      mode: body.mode,
      iconIds: body.iconIds,
      model: body.model,
      concurrency: body.concurrency,
    });

    return { ok: true, log };
  });

  app.post('/api/admin/descriptions/test', async (request, reply) => {
    const body = request.body as TestGenerateRequest;

    if (!process.env.OPENROUTER_API_KEY) {
      return reply.code(400).send({ error: 'OPENROUTER_API_KEY is not configured' });
    }

    if (!body?.iconIds?.length) {
      return reply.code(400).send({ error: 'iconIds is required' });
    }

    const results = await generator.testGenerate(body);
    return { results };
  });

  app.post('/api/admin/descriptions/manual', async (request, reply) => {
    const body = request.body as ManualDescriptionUpdateRequest;
    const description = body?.description?.trim();

    if (!body?.iconId) {
      return reply.code(400).send({ error: 'iconId is required' });
    }

    if (!description) {
      return reply.code(400).send({ error: 'description is required' });
    }

    try {
      const icon = await generator.updateManualDescription(body.iconId, description);
      return { icon, status: generator.getStatusSummary() };
    } catch (error) {
      return reply.code(404).send({
        error: error instanceof Error ? error.message : 'Failed to update description',
      });
    }
  });

  app.get('/api/admin/descriptions/status', async () => {
    return generator.getStatusSummary();
  });
}
