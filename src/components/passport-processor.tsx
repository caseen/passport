'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, FileCheck2, Loader2, Save, Sparkles, Trash2, UploadCloud, User, Copy } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { extractPassportDataAction, suggestCorrectionsAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { passportSchema, type PassportData } from '@/lib/schemas';
import { Icons } from './icons';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type Suggestions = z.infer<z.ZodObject<{
  firstNameSuggestions: z.ZodArray<z.ZodString, "many">;
  lastNameSuggestions: z.ZodArray<z.ZodString, "many">;
  dateOfBirthSuggestions: z.ZodArray<z.ZodString, "many">;
  passportNumberSuggestions: z.ZodArray<z.ZodString, "many">;
  expirationDateSuggestions: z.ZodArray<z.ZodString, "many">;
}>>;

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function PassportProcessor() {
  const { toast } = useToast();
  const [isExtracting, startExtractTransition] = useTransition();
  const [isSuggesting, startSuggestTransition] = useTransition();
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<PassportData | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PassportData>({
    resolver: zodResolver(passportSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      passportNumber: '',
      expirationDate: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      resetState();
      setPreviewUrl(URL.createObjectURL(file));
      startExtractTransition(async () => {
        try {
          const uri = await fileToDataUri(file);
          setDataUri(uri);
          const result = await extractPassportDataAction({ passportDataUri: uri });
          if (result.success) {
            form.reset(result.data);
            setExtractedData(result.data);
            toast({
              title: "Extraction Complete",
              description: "Passport data has been extracted successfully.",
            });
          } else {
            setError(result.error);
            toast({
              variant: "destructive",
              title: "Extraction Failed",
              description: result.error,
            });
          }
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
          setError(errorMessage);
          toast({
            variant: "destructive",
            title: "Error",
            description: "An unexpected error occurred during file processing.",
          });
        }
      });
    }
  };

  const handleSuggestCorrections = () => {
    if (!dataUri) return;
    const currentData = form.getValues();
    startSuggestTransition(async () => {
      const result = await suggestCorrectionsAction({ ...currentData, passportImage: dataUri });
      if (result.success) {
        setSuggestions(result.data);
        toast({
          title: "Suggestions Ready",
          description: "AI has provided correction suggestions.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Suggestion Failed",
          description: result.error,
        });
      }
    });
  };

  const onSubmit = (data: PassportData) => {
    toast({
      title: "Data Saved (Simulated)",
      description: <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4"><code className="text-white">{JSON.stringify(data, null, 2)}</code></pre>,
    });
  };

  const resetState = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setDataUri(null);
    setExtractedData(null);
    setSuggestions(null);
    setError(null);
    form.reset({ firstName: '', lastName: '', dateOfBirth: '', passportNumber: '', expirationDate: '' });
  }, [previewUrl, form]);

  const handleCopy = (value: string, fieldName: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: `${fieldName} Copied`,
      description: `"${value}" has been copied to your clipboard.`,
    });
  };

  const renderField = (name: keyof PassportData, label: string, icon: React.ReactNode, placeholder: string) => {
    const suggestionKey = `${name}Suggestions` as keyof Suggestions;
    const hasSuggestions = suggestions && suggestionKey in suggestions && (suggestions[suggestionKey]?.length ?? 0) > 0;

    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel className="flex items-center gap-2 font-semibold">
                {icon} {label}
              </FormLabel>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleCopy(field.value, label)}
                disabled={!field.value}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy {label}</span>
              </Button>
            </div>
            {hasSuggestions ? (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-accent/50 border-accent">
                    <SelectValue placeholder="Choose a suggestion" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {suggestions![suggestionKey]!.map((s, i) => (
                    <SelectItem key={`${name}-${i}`} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <FormControl>
                <Input placeholder={placeholder} {...field} />
              </FormControl>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };
  
  return (
    <Card className="w-full">
      <CardContent className="p-4 sm:p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column: File Upload & Preview */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-dashed bg-muted/50 flex flex-col items-center justify-center">
              {previewUrl ? (
                <Image src={previewUrl} alt="Passport Preview" layout="fill" objectFit="contain" />
              ) : (
                <div className="text-center p-8">
                  <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm font-semibold text-foreground">Upload your Passport</p>
                  <p className="mt-1 text-xs text-muted-foreground">Drag and drop or click to upload</p>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild className="flex-1" disabled={isExtracting}>
                <label htmlFor="file-upload" className="cursor-pointer">
                  {isExtracting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                  {previewUrl ? 'Change File' : 'Upload File'}
                </label>
              </Button>
              <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" disabled={isExtracting} />
              {previewUrl && (
                <Button variant="outline" onClick={resetState} className="flex-1 sm:flex-auto" disabled={isExtracting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Right Column: Extracted Data Form */}
          <div className="flex flex-col gap-6 animate-in fade-in-0 duration-500">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileCheck2 className="text-primary" />
                Extracted Information
              </h2>
              {extractedData && (
                <Button onClick={handleSuggestCorrections} disabled={isSuggesting || isExtracting} size="sm" variant="outline">
                  {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Suggest Corrections
                </Button>
              )}
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {isExtracting ? (
                  Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                ) : extractedData ? (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {renderField('firstName', 'First Name', <User className="h-4 w-4" />, "e.g. John")}
                      {renderField('lastName', 'Last Name', <User className="h-4 w-4" />, "e.g. Doe")}
                    </div>
                    {renderField('dateOfBirth', 'Date of Birth', <Calendar className="h-4 w-4" />, "MM/DD/YYYY")}
                    {renderField('passportNumber', 'Passport Number', <Icons.passport className="h-4 w-4" />, "e.g. A12345678")}
                    {renderField('expirationDate', 'Expiration Date', <Calendar className="h-4 w-4" />, "MM/DD/YYYY")}

                    <Button type="submit" className="w-full" disabled={isExtracting || isSuggesting}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Information
                    </Button>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground p-8 border rounded-lg bg-muted/20">
                    Upload a passport to begin extraction.
                  </div>
                )}
              </form>
            </Form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
