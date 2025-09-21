'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting corrections to extracted passport data.
 *
 * It takes extracted data and the passport image as input, and returns suggestions for corrections.
 * @fileOverview
 * - `suggestCorrections`: The main function to initiate the correction suggestion flow.
 * - `SuggestCorrectionsInput`: The input type for the `suggestCorrections` function.
 * - `SuggestCorrectionsOutput`: The output type for the `suggestCorrections` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCorrectionsInputSchema = z.object({
  firstName: z.string().describe('The extracted first name from the passport.'),
  lastName: z.string().describe('The extracted last name from the passport.'),
  dateOfBirth: z.string().describe('The extracted date of birth from the passport (MM/DD/YYYY).'),
  passportNumber: z.string().describe('The extracted passport number from the passport.'),
  expirationDate: z.string().describe('The extracted expiration date from the passport (MM/DD/YYYY).'),
  passportImage: z
    .string()
    .describe(
      'The passport image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'  
    ),
});

export type SuggestCorrectionsInput = z.infer<typeof SuggestCorrectionsInputSchema>;

const SuggestCorrectionsOutputSchema = z.object({
  firstNameSuggestions: z.array(z.string()).describe('Suggested corrections for the first name.'),
  lastNameSuggestions: z.array(z.string()).describe('Suggested corrections for the last name.'),
  dateOfBirthSuggestions: z.array(z.string()).describe('Suggested corrections for the date of birth (MM/DD/YYYY).'),
  passportNumberSuggestions: z.array(z.string()).describe('Suggested corrections for the passport number.'),
  expirationDateSuggestions: z.array(z.string()).describe('Suggested corrections for the expiration date (MM/DD/YYYY).'),
});

export type SuggestCorrectionsOutput = z.infer<typeof SuggestCorrectionsOutputSchema>;

export async function suggestCorrections(input: SuggestCorrectionsInput): Promise<SuggestCorrectionsOutput> {
  return suggestCorrectionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCorrectionsPrompt',
  input: {schema: SuggestCorrectionsInputSchema},
  output: {schema: SuggestCorrectionsOutputSchema},
  prompt: `You are an AI assistant designed to suggest corrections for extracted passport data.

  Given the following extracted information and the passport image, please provide suggestions for each field.
  If a field seems correct, you can suggest the current value as the only suggestion.
  Focus on providing accurate suggestions based on the image provided, considering potential OCR errors or unclear characters.

  First Name: {{{firstName}}}
  Last Name: {{{lastName}}}
  Date of Birth: {{{dateOfBirth}}}
  Passport Number: {{{passportNumber}}}
  Expiration Date: {{{expirationDate}}}
  Passport Image: {{media url=passportImage}}

  Format your suggestions as a JSON object matching the following schema:
  ${JSON.stringify(SuggestCorrectionsOutputSchema.describe, null, 2)}
  `,
});

const suggestCorrectionsFlow = ai.defineFlow(
  {
    name: 'suggestCorrectionsFlow',
    inputSchema: SuggestCorrectionsInputSchema,
    outputSchema: SuggestCorrectionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
