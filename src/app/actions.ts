
'use server';

import {
  extractPassportData as extractPassportDataFlow,
  ExtractPassportDataInput,
  ExtractPassportDataOutput,
} from '@/ai/flows/extract-passport-data';
import {
  suggestCorrections as suggestCorrectionsFlow,
  SuggestCorrectionsInput,
  SuggestCorrectionsOutput,
} from '@/ai/flows/suggest-corrections-extracted-data';
import { passportSchema } from '@/lib/schemas';

export async function extractPassportDataAction(
  input: ExtractPassportDataInput
): Promise<{ success: true; data: ExtractPassportDataOutput } | { success: false; error: string }> {
  try {
    const data = await extractPassportDataFlow(input);
    return { success: true, data };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Failed to extract passport data. Please try again.' };
  }
}

export async function suggestCorrectionsAction(
  input: SuggestCorrectionsInput
): Promise<{ success: true; data: SuggestCorrectionsOutput } | { success: false; error: string }> {
  try {
    const validatedInput = passportSchema.parse(input);
    const data = await suggestCorrectionsFlow({ ...validatedInput, passportImage: input.passportImage });
    return { success: true, data };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Failed to get suggestions. Please try again.' };
  }
}
