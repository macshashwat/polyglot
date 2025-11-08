'use client';

import {useCallback, useEffect, useMemo, useState, type CSSProperties} from 'react';
import {convertCode, getRecentConversions, isConversionHistoryAvailable} from '@/ai/flows/code-conversion';
import {LANGUAGE_OPTIONS} from '@/lib/languages';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {ScrollArea} from '@/components/ui/scroll-area';
import {useToast} from '@/hooks/use-toast';
import {formatDistanceToNow} from 'date-fns';
import {Copy, Loader2, Moon, Sparkles, Sun, Wand2, Check} from 'lucide-react';
import {PrismLight as SyntaxHighlighter} from 'react-syntax-highlighter';
import vs from 'react-syntax-highlighter/dist/esm/styles/prism/vs';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import kotlin from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin';
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift';
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import dart from 'react-syntax-highlighter/dist/esm/languages/prism/dart';
import scala from 'react-syntax-highlighter/dist/esm/languages/prism/scala';
import lua from 'react-syntax-highlighter/dist/esm/languages/prism/lua';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import r from 'react-syntax-highlighter/dist/esm/languages/prism/r';
import matlab from 'react-syntax-highlighter/dist/esm/languages/prism/matlab';
import julia from 'react-syntax-highlighter/dist/esm/languages/prism/julia';

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('ruby', ruby);
SyntaxHighlighter.registerLanguage('rust', rust);
SyntaxHighlighter.registerLanguage('kotlin', kotlin);
SyntaxHighlighter.registerLanguage('swift', swift);
SyntaxHighlighter.registerLanguage('php', php);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('dart', dart);
SyntaxHighlighter.registerLanguage('scala', scala);
SyntaxHighlighter.registerLanguage('lua', lua);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('r', r);
SyntaxHighlighter.registerLanguage('matlab', matlab);
SyntaxHighlighter.registerLanguage('julia', julia);

type ThemeSection = Record<string, unknown>;
type ThemeDefinition = Record<string, ThemeSection>;

function sanitizeTheme(theme: ThemeDefinition): ThemeDefinition {
  const entries = Object.entries(theme).map(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const section = value as ThemeSection & {Opacity?: unknown; opacity?: unknown};
      if (section.Opacity !== undefined) {
        const {Opacity, ...rest} = section;
        if (rest.opacity === undefined) {
          return [key, {...rest, opacity: Opacity}];
        }
        return [key, rest];
      }
    }
    return [key, value];
  });
  return Object.fromEntries(entries) as ThemeDefinition;
}

const lightTheme = sanitizeTheme(vs as ThemeDefinition) as Record<string, CSSProperties>;
const darkTheme = sanitizeTheme(vscDarkPlus as ThemeDefinition) as Record<string, CSSProperties>;

const initialCode = `function factorial(n) {
  if (n < 0) {
    throw new Error('Number must be non-negative');
  }
  if (n === 0) {
    return 1;
  }
  let result = 1;
  for (let i = 1; i <= n; i += 1) {
    result *= i;
  }
  return result;
}

console.log(factorial(5));`;

type ConversionStatus = 'idle' | 'success' | 'invalid_code';

type ConversionHistoryItem = {
  id: string;
  detectedLanguage: string;
  targetLanguage: string;
  message: string;
  createdAt: string;
  sourcePreview: string;
  convertedPreview: string;
};

export function CodeConverter() {
  const {toast} = useToast();
  const [sourceCode, setSourceCode] = useState(initialCode);
  const [targetLanguage, setTargetLanguage] = useState(LANGUAGE_OPTIONS[1]?.value ?? 'Python');
  const [detectedLanguage, setDetectedLanguage] = useState('Unknown');
  const [convertedCode, setConvertedCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }
    const stored = window.localStorage.getItem('theme');
    return stored === 'light' ? 'light' : 'dark';
  });
  const [lastPayload, setLastPayload] = useState<{code: string; targetLanguage: string} | null>(null);
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [historyEnabled, setHistoryEnabled] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    const bootstrapHistory = async () => {
      const available = await isConversionHistoryAvailable();
      if (!available || !active) {
        return;
      }
      setHistoryEnabled(true);
      setIsHistoryLoading(true);
      try {
        const entries = await getRecentConversions();
        if (!active) {
          return;
        }
        setHistory(entries);
      } finally {
        if (active) {
          setIsHistoryLoading(false);
        }
      }
    };
    bootstrapHistory();
    return () => {
      active = false;
    };
  }, []);

  const sourcePrismLanguage = useMemo(() => {
    const match = LANGUAGE_OPTIONS.find(option => option.value === detectedLanguage);
    return match?.prismLanguage ?? 'javascript';
  }, [detectedLanguage]);

  const targetPrismLanguage = useMemo(() => {
    const match = LANGUAGE_OPTIONS.find(option => option.value === targetLanguage);
    return match?.prismLanguage ?? 'javascript';
  }, [targetLanguage]);

  const refreshHistory = useCallback(async () => {
    if (!historyEnabled) {
      return;
    }
    setIsHistoryLoading(true);
    try {
      const entries = await getRecentConversions();
      setHistory(entries);
    } catch {
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [historyEnabled]);

  const getRelativeTime = useCallback((value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'just now';
    }
    return formatDistanceToNow(date, {addSuffix: true});
  }, []);

  const runConversion = async (payload: {code: string; targetLanguage: string}) => {
    setIsLoading(true);
    setStatus('idle');
    setStatusMessage('');
    setErrorMessage(null);
    try {
      const response = await convertCode(payload);
      setDetectedLanguage(response.detectedLanguage);
      if (response.status === 'invalid_code') {
        setStatus('invalid_code');
        setConvertedCode('');
        setStatusMessage(response.message);
        toast({
          title: 'Invalid code provided',
          description: response.message,
          variant: 'destructive',
        });
        return;
      }
      setConvertedCode(response.convertedCode ?? '');
      setStatus('success');
      setStatusMessage(response.message);
      toast({
        title: 'Conversion complete',
        description: `Detected ${response.detectedLanguage} → ${payload.targetLanguage}`,
      });
      if (historyEnabled) {
        void refreshHistory();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      setErrorMessage(message.includes('Unsupported language') ? 'The selected language is not supported yet.' : 'Unable to reach the Gemini API. Check your connection and try again.');
      toast({
        title: 'Conversion failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvert = async () => {
    const trimmed = sourceCode.trim();
    if (!trimmed) {
      setStatus('invalid_code');
      setStatusMessage('Code cannot be empty.');
      setConvertedCode('');
      setErrorMessage(null);
      toast({
        title: 'Code is empty',
        description: 'Paste some code before converting.',
        variant: 'destructive',
      });
      return;
    }
    const payload = {code: trimmed, targetLanguage};
    setLastPayload(payload);
    await runConversion(payload);
  };

  const handleRetry = async () => {
    if (!lastPayload) {
      return;
    }
    await runConversion(lastPayload);
  };

  const handleCopy = async () => {
    if (!convertedCode) {
      return;
    }
    await navigator.clipboard.writeText(convertedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast({
      title: 'Copied to clipboard',
      description: 'Converted code is ready to paste.',
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Polyglot Code Converter</h2>
          <p className="text-muted-foreground">Detect, convert, and share code in seconds across twenty-one languages.</p>
        </div>
        <Button variant="outline" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? (
            <>
              <Sun className="mr-2 h-4 w-4" /> Light Mode
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" /> Dark Mode
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Source Code</CardTitle>
              <CardDescription>Paste code in any supported language. Gemini will detect the original syntax automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={sourceCode}
                onChange={event => setSourceCode(event.target.value)}
                className="min-h-[320px] font-code text-sm"
                placeholder="Paste your snippet here"
              />
            
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Conversion Settings</CardTitle>
              <CardDescription>Pick a target language and let Gemini rewrite the snippet while preserving intent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <span className="text-sm font-medium text-muted-foreground">Target language</span>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {LANGUAGE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs uppercase tracking-wider">
                  Detected: {detectedLanguage}
                </Badge>
                {statusMessage && status === 'success' && (
                  <Badge variant="secondary" className="text-xs">
                    {statusMessage}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleConvert} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Convert with Gemini
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSourceCode('');
                    setConvertedCode('');
                    setStatus('idle');
                    setStatusMessage('');
                    setDetectedLanguage('Unknown');
                    setErrorMessage(null);
                  }}
                >
                  Clear
                </Button>
                {errorMessage && lastPayload && (
                  <Button variant="outline" onClick={handleRetry} disabled={isLoading}>
                    Retry
                  </Button>
                )}
              </div>
              {status === 'invalid_code' && (
                <Alert variant="destructive">
                  <AlertTitle>Invalid code</AlertTitle>
                  <AlertDescription>{statusMessage}</AlertDescription>
                </Alert>
              )}
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertTitle>Conversion failed</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-lg shadow-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Converted Code</CardTitle>
                <CardDescription>Auto-formatted output in {targetLanguage} with syntax highlighting.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopy} disabled={!convertedCode}>
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />} Copy
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[420px]">
                {isLoading ? (
                  <div className="flex h-[320px] w-full items-center justify-center text-muted-foreground">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating conversion…
                  </div>
                ) : convertedCode ? (
                  <SyntaxHighlighter
                    language={targetPrismLanguage}
                    style={theme === 'dark' ? darkTheme : lightTheme}
                    wrapLongLines
                    customStyle={{margin: 0, background: 'transparent', padding: '1.25rem'}}
                  >
                    {convertedCode}
                  </SyntaxHighlighter>
                ) : (
                  <div className="flex h-[320px] w-full items-center justify-center text-muted-foreground">
                    <Sparkles className="mr-2 h-5 w-5" /> Your converted code will appear here.
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {historyEnabled && (
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Recent Conversions</CardTitle>
                <CardDescription>The latest five conversions saved to Firestore.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isHistoryLoading ? (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Syncing history…
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Run a conversion to see it tracked here.</p>
                ) : (
                  <div className="space-y-3">
                    {history.map(item => (
                      <div key={item.id} className="rounded-lg border border-border/60 p-3 space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm font-medium">
                          <span>{item.detectedLanguage} → {item.targetLanguage}</span>
                          <span className="text-xs text-muted-foreground">{getRelativeTime(item.createdAt)}</span>
                        </div>
                        {item.message && <p className="text-xs text-muted-foreground leading-snug">{item.message}</p>}
                        <div className="grid gap-2 text-xs">
                          {item.sourcePreview && (
                            <div>
                              <span className="text-xs font-semibold text-muted-foreground">Input</span>
                              <pre className="mt-1 max-h-20 overflow-hidden rounded border border-border/40 bg-muted/30 p-2 font-code whitespace-pre-wrap break-all">
                                {item.sourcePreview}
                              </pre>
                            </div>
                          )}
                          {item.convertedPreview && (
                            <div>
                              <span className="text-xs font-semibold text-muted-foreground">Output</span>
                              <pre className="mt-1 max-h-20 overflow-hidden rounded border border-border/40 bg-muted/30 p-2 font-code whitespace-pre-wrap break-all">
                                {item.convertedPreview}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
