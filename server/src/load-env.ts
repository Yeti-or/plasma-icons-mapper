import path from 'node:path';
import dotenv from 'dotenv';
import { ROOT_DIR } from './utils/paths.js';

dotenv.config({ path: path.join(ROOT_DIR, '.env') });
