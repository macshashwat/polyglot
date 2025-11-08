'use server';

/**
 * @fileOverview Analyzes code and provides suggestions for optimization, bug fixes, and best practices.
 *
 * - analyzeCode - A function that handles the code analysis process.
 * - CodeAnalysisInput - The input type for the analyzeCode function.
 * - CodeAnalysisOutput - The return type for the analyzeCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeAnalysisInputSchema = z.object({
  code: z.string().describe('The code to be analyzed.'),
});
export type CodeAnalysisInput = z.infer<typeof CodeAnalysisInputSchema>;

const CodeAnalysisOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe(
      'A list of AI-powered suggestions for optimization, bug fixes, and best practices.'
    ),
});
export type CodeAnalysisOutput = z.infer<typeof CodeAnalysisOutputSchema>;

export async function analyzeCode(input: CodeAnalysisInput): Promise<CodeAnalysisOutput> {
  return analyzeCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codeAnalysisPrompt',
  input: {schema: CodeAnalysisInputSchema},
  output: {schema: CodeAnalysisOutputSchema},
  prompt: `You are an AI code analyst. Analyze the following code and provide suggestions for optimization, bug fixes, and best practices. Be concise and provide specific examples. Return your suggestions as a list of bullet points.

Code: {{{code}}}`,
});

const analyzeCodeFlow = ai.defineFlow(
  {
    name: 'analyzeCodeFlow',
    inputSchema: CodeAnalysisInputSchema,
    outputSchema: CodeAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
