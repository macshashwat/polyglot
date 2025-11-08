import { CodeConverter } from '@/components/code-analyzer';
import { Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="p-4 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-headline">
            Polyglot Code
          </h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <CodeConverter />
      </main>
    </div>
  );
}
