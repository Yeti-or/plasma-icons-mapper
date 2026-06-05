export interface GeneratedDescriptionPayload {
  description: string;
  tags: string[];
}

export interface OpenRouterOptions {
  apiKey: string;
  model: string;
  promptOverride?: string;
}

const DEFAULT_PROMPT = `You are helping build a searchable icon library.
Analyze the provided SVG icon metadata and SVG markup.
Return strict JSON with this shape:
{
  "description": "short human-readable description",
  "tags": ["searchable", "keywords", "synonyms"]
}
Keep description concise (1-2 sentences).
Tags should include visual objects, actions, and common UI meanings.
Do not include markdown or extra keys.`;

export class OpenRouterClient {
  constructor(private readonly options: OpenRouterOptions) {}

  async generateDescription(input: {
    id: string;
    category: string;
    name: string;
    size: number;
    variant: string | null;
    svgContent: string;
  }): Promise<GeneratedDescriptionPayload> {
    const systemPrompt = this.options.promptOverride ?? DEFAULT_PROMPT;
    const userPrompt = [
      `Icon ID: ${input.id}`,
      `Category: ${input.category}`,
      `Name: ${input.name}`,
      `Size: ${input.size}`,
      `Variant: ${input.variant ?? 'none'}`,
      'SVG:',
      input.svgContent,
    ].join('\n');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://plasma-icons-mapper.local',
        'X-Title': 'Plasma Icons Mapper',
      },
      body: JSON.stringify({
        model: this.options.model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter request failed (${response.status}): ${errorText}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenRouter returned an empty response');
    }

    const parsed = JSON.parse(content) as GeneratedDescriptionPayload;
    if (!parsed.description || !Array.isArray(parsed.tags)) {
      throw new Error('OpenRouter response did not match expected JSON shape');
    }

    return {
      description: parsed.description.trim(),
      tags: parsed.tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean),
    };
  }
}
