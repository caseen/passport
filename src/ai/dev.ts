import { config } from 'dotenv';
config();

import '@/ai/flows/extract-passport-data.ts';
import '@/ai/flows/suggest-corrections-extracted-data.ts';