import './load-env.js';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { DescriptionStorage } from './descriptions/storage.js';
import { OpenRouterClient } from './descriptions/openrouter.js';
import { DescriptionGenerator } from './descriptions/generator.js';
import { IconIndexer } from './indexer.js';
import { registerSearchRoutes } from './routes/search.js';
import { registerIconRoutes } from './routes/icons.js';
import { registerAdminRoutes } from './routes/admin.js';

const PORT = Number(process.env.PORT ?? 3001);

async function main() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });

  const descriptionStorage = new DescriptionStorage();
  const indexer = new IconIndexer(descriptionStorage);
  await descriptionStorage.loadAll();
  await indexer.scan();

  const openRouter = new OpenRouterClient({
    apiKey: process.env.OPENROUTER_API_KEY ?? '',
    model: process.env.OPENROUTER_MODEL ?? 'google/gemini-2.5-flash',
  });

  const generator = new DescriptionGenerator(indexer, descriptionStorage, openRouter);
  await generator.loadLog();

  await registerSearchRoutes(app, indexer);
  await registerIconRoutes(app, indexer);
  await registerAdminRoutes(app, generator);

  app.get('/api/health', async () => ({
    ok: true,
    icons: indexer.getIcons().length,
  }));

  await app.listen({ port: PORT, host: '0.0.0.0' });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
