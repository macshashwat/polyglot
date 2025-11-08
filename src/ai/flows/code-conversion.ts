'use server';

import {ai} from '@/ai/genkit';
import {firestore, isFirestoreEnabled} from '@/lib/firebase';
import {SUPPORTED_LANGUAGES} from '@/lib/languages';
import {z} from 'genkit';
import {addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp, Timestamp} from 'firebase/firestore';

class UnsupportedLanguageError extends Error {
  constructor(language: string) {
    super(`Unsupported language: ${language}`);
    this.name = 'UnsupportedLanguageError';
  }
}

const CONVERSIONS_COLLECTION = 'codeConversions';
const HISTORY_LIMIT = 5;

const CodeConversionInputSchema = z.object({
  code: z.string().min(1),
  targetLanguage: z.string(),
});

type CodeConversionInput = z.infer<typeof CodeConversionInputSchema>;

const CodeConversionOutputSchema = z.object({
  status: z.enum(['success', 'invalid_code']),
  detectedLanguage: z.string(),
  message: z.string(),
  convertedCode: z.string().optional(),
});

type CodeConversionOutput = z.infer<typeof CodeConversionOutputSchema>;

type ConversionRecord = {
  detectedLanguage: string;
  targetLanguage: string;
  message: string;
  sourceCode: string;
  convertedCode: string;
};

type ConversionHistoryItem = {
  id: string;
  detectedLanguage: string;
  targetLanguage: string;
  message: string;
  createdAt: string;
  sourcePreview: string;
  convertedPreview: string;
};

function createPreview(code: string) {
  return code.length > 500 ? `${code.slice(0, 500)}...` : code;
}

async function persistConversion(record: ConversionRecord) {
  if (!firestore) {
    return;
  }
  try {
    await addDoc(collection(firestore, CONVERSIONS_COLLECTION), {
      detectedLanguage: record.detectedLanguage,
      targetLanguage: record.targetLanguage,
      message: record.message,
      sourcePreview: createPreview(record.sourceCode),
      convertedPreview: createPreview(record.convertedCode),
      createdAt: serverTimestamp(),
    });
  } catch {}
}

export async function getRecentConversions(): Promise<ConversionHistoryItem[]> {
  if (!firestore) {
    return [];
  }
  const snapshot = await getDocs(
    query(
      collection(firestore, CONVERSIONS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(HISTORY_LIMIT)
    )
  );
  return snapshot.docs.map(doc => {
    const data = doc.data();
    const createdAtValue = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();
    return {
      id: doc.id,
      detectedLanguage: data.detectedLanguage ?? 'Unknown',
      targetLanguage: data.targetLanguage ?? 'Unknown',
      message: data.message ?? '',
      createdAt: createdAtValue,
      sourcePreview: data.sourcePreview ?? '',
      convertedPreview: data.convertedPreview ?? '',
    };
  });
}

export async function isConversionHistoryAvailable() {
  return isFirestoreEnabled;
}

const prompt = ai.definePrompt({
  name: 'codeConversionPrompt',
  input: {schema: CodeConversionInputSchema},
  output: {schema: CodeConversionOutputSchema},
  prompt: `You are an expert software polyglot. Detect the primary programming language of the provided code and convert it to the requested target language.\n\nOutput a JSON object that matches the following schema exactly:\n{\n  \\"status\\": \\"success\\" | \\"invalid_code\\",\n  \\"detectedLanguage\\": string,\n  \\"message\\": string,\n  \\"convertedCode\\": string (required when status is \\"success\\", otherwise empty string)\n}\n\nGuidelines:\n- Only return the JSON object.\n- Always detect the source language and provide its readable name.\n- If the input code is syntactically invalid or incomplete, set status to \\"invalid_code\\", explain the issue in \\"message\\", and return an empty string for \\"convertedCode\\".\n- When status is \\"success\\", provide only the translated code in \\"convertedCode\\" with no explanations, comments, or code fences.\n- Do not invent functionality beyond the original code's intent.\n\nSource code:\n{{{code}}}\n\nTarget language: {{targetLanguage}}`,
});

const convertCodeFlow = ai.defineFlow(
  {
    name: 'convertCodeFlow',
    inputSchema: CodeConversionInputSchema,
    outputSchema: CodeConversionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

function sleep(duration: number) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

async function runWithRetry<T>(operation: () => Promise<T>, attempts = 3) {
  let lastError: unknown;
  for (let index = 0; index < attempts; index += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (index === attempts - 1) {
        break;
      }
      await sleep(200 * 2 ** index);
    }
  }
  throw lastError;
}

export async function convertCode(input: CodeConversionInput): Promise<CodeConversionOutput> {
  const trimmed = input.code.trim();
  if (!trimmed) {
    return {
      status: 'invalid_code',
      detectedLanguage: 'Unknown',
      message: 'Code cannot be empty.',
      convertedCode: '',
    };
  }

  if (!SUPPORTED_LANGUAGES.includes(input.targetLanguage)) {
    throw new UnsupportedLanguageError(input.targetLanguage);
  }

  const response = await runWithRetry(() => convertCodeFlow({
    code: trimmed,
    targetLanguage: input.targetLanguage,
  }));

  if (response.status === 'success' && !response.convertedCode) {
    return {
      status: 'invalid_code',
      detectedLanguage: response.detectedLanguage,
      message: 'The conversion did not return any code. Please review your input and try again.',
      convertedCode: '',
    };
  }

  if (response.status === 'success' && isFirestoreEnabled) {
    void persistConversion({
      detectedLanguage: response.detectedLanguage,
      targetLanguage: input.targetLanguage,
      message: response.message,
      sourceCode: trimmed,
      convertedCode: response.convertedCode ?? '',
    });
  }

  return response;
}
