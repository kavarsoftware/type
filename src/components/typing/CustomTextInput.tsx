'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTypingStore } from '@/store/typing-store';
import { getTranslation } from '@/lib/i18n/translations';

interface CustomTextInputProps {
  onStartTyping: (texts: string[]) => void;
  onBack: () => void;
}

// Clean text utility - removes unrecognizable characters and formats paragraphs
function cleanText(text: string): string {
  let cleaned = text
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ')
    .replace(/[●○◦•●■□▪▫◊♦♢]/g, '*')
    .replace(/[─━│┃┄┅┆┇┈┉┊┋┌┍┎┏┐┑┒┓└┕┖┗┘┙┚┛├┝┞┟┠┡┢┣┤┥┦┧┨┩┪┫┬┭┮┯┰┱┲┳┴┵┶┷┸┹┺┻┼┽┾┿╀╁╂╃╄╅╆╇╈╉╊╋]/g, '-')
    .replace(/[═║╒╓╔╕╖╗╘╙╚╛╜╝╞╟╠╡╢╣╤╥╦╧╨╩╪╫╬]/g, '=')
    .replace(/[←↑→↓↔↕↖↗↘↙]/g, '->')
    .replace(/[∀∂∃∅∇∈∉∋∏∑−∗√∝∞∠∧∨∩∪∫∴∼≅≈≠≡≤≥⊂⊃⊄⊆⊇⊕⊗⊥⋅]/g, '')
    .replace(/[€£¥¢¤]/g, '$')
    .replace(/[©®™§¶†‡]/g, '')
    .replace(/[«»‹›『』「」【】〔〕〖〗〘〙〚〛]/g, '"')
    .replace(/[′″‴]/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
  
  const lines = cleaned.split('\n');
  const processedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;
    processedLines.push(line);
  }
  
  return processedLines.join('\n').trim();
}

function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

function splitTextIntoChunks(text: string, wordsPerChunk: number | 'all'): string[] {
  if (wordsPerChunk === 'all') return [text];
  
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
  }
  
  return chunks;
}

// File parsing functions - loaded dynamically
async function parseTxt(file: File): Promise<string> {
  return await file.text();
}

async function parsePdf(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist').then(mod => mod);
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as Array<{ str: string; transform: number[] }>;
    
    let lastY: number | null = null;
    let pageText = '';
    
    for (const item of items) {
      const str = item.str?.trim();
      if (!str) continue;
      
      const currentY = item.transform?.[5];
      if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
        pageText += '\n';
      } else if (pageText && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
        pageText += ' ';
      }
      
      pageText += str;
      lastY = currentY;
    }
    
    fullText += pageText + '\n\n';
  }
  
  return fullText.trim();
}

async function parseDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth').then(mod => mod);
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function parseFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'txt':
      return parseTxt(file);
    case 'pdf':
      return parsePdf(file);
    case 'docx':
      return parseDocx(file);
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

export function CustomTextInput({ onStartTyping, onBack }: CustomTextInputProps) {
  const { language } = useTypingStore();
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [chunkSize, setChunkSize] = useState<number | 'all'>('all');

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      const rawText = await parseFile(file);
      const cleanedText = cleanText(rawText);
      
      if (cleanedText.length < 10) {
        throw new Error(language === 'ar' ? 'الملف يحتوي على نص قليل جداً للتمرين' : 'The file contains too little text to practice with.');
      }
      
      if (cleanedText.length > 10000) {
        setText(cleanedText.substring(0, 10000));
        setError(language === 'ar' ? 'تم تقليص النص إلى ١٠,٠٠٠ حرف للأداء الأمثل.' : 'Text was truncated to 10,000 characters for optimal performance.');
      } else {
        setText(cleanedText);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : (language === 'ar' ? 'فشل معالجة الملف' : 'Failed to parse file'));
      setFileName(null);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const handleStart = () => {
    const trimmed = text.trim();
    if (trimmed.length >= 10) {
      const chunks = splitTextIntoChunks(trimmed, chunkSize);
      onStartTyping(chunks);
    }
  };

  const paragraphs = splitIntoParagraphs(text);
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{getTranslation(language, 'customTextHeader')}</h2>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'تدرب باستخدام المحتوى الخاص بك' : 'Practice with your own content'}
          </p>
        </div>
      </div>

      {/* File Upload */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            {getTranslation(language, 'uploadFile')}
          </CardTitle>
          <CardDescription>
            {getTranslation(language, 'uploadFileDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <input
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex items-center justify-center gap-3 p-6 rounded-lg bg-muted/30 border border-border">
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span>{language === 'ar' ? 'جاري معالجة الملف...' : 'Processing file...'}</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {fileName || getTranslation(language, 'dragAndDrop')}
                  </span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{getTranslation(language, 'pasteText')}</CardTitle>
          <CardDescription>
            {getTranslation(language, 'pasteTextPlaceholder')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={getTranslation(language, 'pasteTextPlaceholder')}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setFileName(null);
              setError(null);
            }}
            className="min-h-[200px] font-mono text-sm"
          />
          
          {/* Stats */}
          {text.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-4 text-sm text-muted-foreground"
            >
              <span>{text.length.toLocaleString()} {getTranslation(language, 'characters')}</span>
              <span>{wordCount.toLocaleString()} {language === 'ar' ? 'كلمة' : 'words'}</span>
              <span>{paragraphs.length} {getTranslation(language, 'paragraphs')}</span>
            </motion.div>
          )}

          {/* Lesson Size Setting */}
          {text.length > 0 && (
            <div className="flex items-center gap-4 py-2 border-y border-border">
              <Label htmlFor="lesson-size" className="flex-shrink-0">
                {language === 'ar' ? 'حجم الدرس:' : 'Lesson Size:'}
              </Label>
              <Select
                value={chunkSize.toString()}
                onValueChange={(val) => setChunkSize(val === 'all' ? 'all' : parseInt(val))}
              >
                <SelectTrigger id="lesson-size" className="w-[200px]">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ar' ? 'النص كاملاً' : 'Full Text (1 Lesson)'}</SelectItem>
                  <SelectItem value="100">{language === 'ar' ? '١٠٠ كلمة' : '100 words (~Half Page)'}</SelectItem>
                  <SelectItem value="250">{language === 'ar' ? '٢٥٠ كلمة' : '250 words (~1 Page)'}</SelectItem>
                  <SelectItem value="500">{language === 'ar' ? '٥٠٠ كلمة' : '500 words (~2 Pages)'}</SelectItem>
                  <SelectItem value="1000">{language === 'ar' ? '١٠٠٠ كلمة' : '1000 words (~4 Pages)'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Start Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleStart}
              disabled={text.trim().length < 10}
              size="lg"
            >
              {getTranslation(language, 'startTyping')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
