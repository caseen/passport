'use server';

/**
 * @fileOverview A passport data extraction AI agent.
 *
 * - extractPassportData - A function that handles the passport data extraction process.
 * - ExtractPassportDataInput - The input type for the extractPassportData function.
 * - ExtractPassportDataOutput - The return type for the extractPassportData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractPassportDataInputSchema = z.object({
  passportDataUri: z
    .string()
    .describe(
      "A photo or PDF of a passport, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractPassportDataInput = z.infer<typeof ExtractPassportDataInputSchema>;

const ExtractPassportDataOutputSchema = z.object({
  firstName: z.string().describe('The first name of the passport holder.'),
  lastName: z.string().describe('The last name of the passport holder.'),
  dateOfBirth: z.string().describe('The date of birth of the passport holder (MM/DD/YYYY).'),
  passportNumber: z.string().describe('The passport number.'),
  expirationDate: z.string().describe('The expiration date of the passport (MM/DD/YYYY).'),
});
export type ExtractPassportDataOutput = z.infer<typeof ExtractPassportDataOutputSchema>;

export async function extractPassportData(input: ExtractPassportDataInput): Promise<ExtractPassportDataOutput> {
  return extractPassportDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractPassportDataPrompt',
  input: {schema: ExtractPassportDataInputSchema},
  output: {schema: ExtractPassportDataOutputSchema},
  prompt: `You are an expert in extracting data from passports. Extract the information from the provided passport. If the data is unreadable, leave the field blank.
  
Passport: {{media url=passportDataUri}}`,
});

const extractPassportDataFlow = ai.defineFlow(
  {
    name: 'extractPassportDataFlow',
    inputSchema: ExtractPassportDataInputSchema,
    outputSchema: ExtractPassportDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
