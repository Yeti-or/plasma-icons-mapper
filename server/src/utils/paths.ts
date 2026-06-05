import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT_DIR = path.resolve(__dirname, '../../..');
export const ICONS_DIR = path.join(ROOT_DIR, 'Icons');
export const DATA_DIR = path.join(ROOT_DIR, 'data');
export const DESCRIPTIONS_DIR = path.join(DATA_DIR, 'descriptions');
export const GENERATION_LOG_PATH = path.join(DATA_DIR, 'generation-log.json');
