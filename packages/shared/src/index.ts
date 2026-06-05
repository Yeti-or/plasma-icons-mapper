export type IconSize = 16 | 24 | 36;
export type IconVariant = 'Fill' | 'Outline' | null;
export type GenerationMode = 'missing' | 'stale' | 'force';
export type GenerationStatus = 'pending' | 'generated' | 'stale' | 'failed' | 'missing';

export interface IconDescription {
  id: string;
  svgHash: string;
  description: string;
  tags: string[];
  model: string;
  generatedAt: string;
  sourceSize?: IconSize;
}

export interface IconRecord {
  id: string;
  logicalId: string;
  size: IconSize;
  category: string;
  name: string;
  variant: IconVariant;
  relativePath: string;
  svgHash: string;
  tokens: string[];
  sizesAvailable: IconSize[];
  description?: string;
  tags?: string[];
  generatedAt?: string;
  model?: string;
  generationStatus: GenerationStatus;
}

export interface LogicalIconRecord {
  logicalId: string;
  category: string;
  name: string;
  variant: IconVariant;
  sizesAvailable: IconSize[];
  previewId: string;
  description?: string;
  tags?: string[];
  generatedAt?: string;
  model?: string;
  generationStatus: GenerationStatus;
}

export interface SearchResultItem {
  id: string;
  size: IconSize;
  category: string;
  name: string;
  variant: IconVariant;
  relativePath: string;
  sizesAvailable: IconSize[];
  description?: string;
  tags?: string[];
  score: number;
}

export interface SearchResponse {
  query: string;
  mode: 'name' | 'description';
  size: IconSize;
  results: SearchResultItem[];
}

export interface GenerateRequest {
  mode: GenerationMode;
  iconIds?: string[];
  model?: string;
  concurrency?: number;
}

export interface TestGenerateRequest {
  iconIds: string[];
  model?: string;
  promptOverride?: string;
}

export interface ManualDescriptionUpdateRequest {
  iconId: string;
  description: string;
}

export interface TestGenerateResult {
  id: string;
  description: string;
  tags: string[];
  model: string;
  rawResponse?: string;
}

export interface GenerationFailure {
  id: string;
  error: string;
  failedAt: string;
}

export interface ArchivedDescription {
  id: string;
  previous: IconDescription;
  archivedAt: string;
}

export interface GenerationLog {
  lastRunAt?: string;
  lastMode?: GenerationMode;
  lastModel?: string;
  inProgress: boolean;
  processed: number;
  total: number;
  failures: GenerationFailure[];
  archivedDescriptions?: ArchivedDescription[];
}

export interface GenerationStatusResponse {
  totalIcons: number;
  totalPhysicalIcons: number;
  withDescription: number;
  missing: number;
  stale: number;
  failed: number;
  log: GenerationLog;
}

export const DEFAULT_ICON_SIZE: IconSize = 24;
export const ICON_SIZES: IconSize[] = [16, 24, 36];
