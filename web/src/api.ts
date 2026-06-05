import type {
  GenerateRequest,
  GenerationStatusResponse,
  IconRecord,
  LogicalIconRecord,
  ManualDescriptionUpdateRequest,
  SearchResponse,
  TestGenerateRequest,
  TestGenerateResult,
} from '@plasma-icons-mapper/shared';
import type { GenerationLog, IconSize } from '@plasma-icons-mapper/shared';

export async function searchIcons(params: {
  mode: 'name' | 'description';
  query: string;
}): Promise<SearchResponse> {
  const searchParam = params.mode === 'name' ? 'name' : 'description';
  const url = `/api/search?${searchParam}=${encodeURIComponent(params.query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Search failed');
  return response.json();
}

export async function listIcons(params?: {
  size?: IconSize;
  category?: string;
  q?: string;
}): Promise<{ total: number; icons: IconRecord[] }> {
  const query = new URLSearchParams();
  if (params?.size) query.set('size', String(params.size));
  if (params?.category) query.set('category', params.category);
  if (params?.q) query.set('q', params.q);
  const response = await fetch(`/api/icons?${query.toString()}`);
  if (!response.ok) throw new Error('Failed to load icons');
  return response.json();
}

export async function listLogicalIcons(params?: {
  category?: string;
  q?: string;
  status?: string;
}): Promise<{ total: number; icons: LogicalIconRecord[] }> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.q) query.set('q', params.q);
  if (params?.status) query.set('status', params.status);
  const response = await fetch(`/api/icons/logical?${query.toString()}`);
  if (!response.ok) throw new Error('Failed to load logical icons');
  return response.json();
}

export function iconSvgUrl(id: string): string {
  return `/api/icons/${id}/svg`;
}

export async function getGenerationStatus(): Promise<GenerationStatusResponse> {
  const response = await fetch('/api/admin/descriptions/status');
  if (!response.ok) throw new Error('Failed to load generation status');
  return response.json();
}

export async function startGeneration(
  body: GenerateRequest,
): Promise<{ ok: boolean; log: GenerationLog }> {
  const response = await fetch('/api/admin/descriptions/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'Generation failed');
  }
  return response.json();
}

export async function testGeneration(
  body: TestGenerateRequest,
): Promise<{ results: TestGenerateResult[] }> {
  const response = await fetch('/api/admin/descriptions/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'Test generation failed');
  }
  return response.json();
}

export async function updateIconDescription(
  body: ManualDescriptionUpdateRequest,
): Promise<{ icon: LogicalIconRecord; status: GenerationStatusResponse }> {
  const response = await fetch('/api/admin/descriptions/manual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'Failed to update description');
  }
  return response.json();
}
