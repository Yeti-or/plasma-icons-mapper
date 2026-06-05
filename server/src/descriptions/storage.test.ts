import fs from 'node:fs/promises';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { DescriptionStorage } from './storage.js';
import { DESCRIPTIONS_DIR } from '../utils/paths.js';

describe('DescriptionStorage', () => {
  const testId = 'Arrows/ArrowBarDownTest';
  const filePath = path.join(DESCRIPTIONS_DIR, 'Arrows', 'ArrowBarDownTest.json');

  afterEach(async () => {
    await fs.unlink(filePath).catch(() => undefined);
  });

  it('saves and loads descriptions by logical id', async () => {
    const storage = new DescriptionStorage();
    const description = {
      id: testId,
      svgHash: 'abc123',
      description: 'Down arrow with bar',
      tags: ['arrow', 'down'],
      model: 'test-model',
      generatedAt: new Date().toISOString(),
      sourceSize: 24 as const,
    };

    await storage.save(description);
    const loaded = await storage.get(testId);

    expect(loaded).toEqual(description);
  });

  it('normalizes physical ids when loading', async () => {
    const storage = new DescriptionStorage();
    const description = {
      id: testId,
      svgHash: 'abc123',
      description: 'Down arrow with bar',
      tags: ['arrow', 'down'],
      model: 'test-model',
      generatedAt: new Date().toISOString(),
      sourceSize: 24 as const,
    };

    await storage.save(description);
    const loaded = await storage.get('24/Arrows/ArrowBarDownTest');

    expect(loaded?.id).toBe(testId);
  });
});
