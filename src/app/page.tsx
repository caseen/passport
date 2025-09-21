import { PassportProcessor } from '@/components/passport-processor';

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <header className="w-full p-4 sm:p-6 border-b bg-card shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold font-headline text-center tracking-tight">
          Passport Info Extractor
        </h1>
      </header>
      <main className="flex-grow w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-8">
        <PassportProcessor />
      </main>
      <footer className="w-full py-4 text-center text-xs text-muted-foreground">
        © 2025 JS Lanka Travels and Tours (Pvt) Ltd. All right reserved
      </footer>
    </div>
  );
}
