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

interface CustomTextInputProps {
  onStartTyping: (texts: string[]) => void;
  onBack: () => void;
}

// Clean text utility - removes unrecognizable characters and formats paragraphs
function cleanText(text: string): string {
  // Remove non-printable characters (keep letters, numbers, punctuation, and whitespace)
  let cleaned = text
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Remove other non-printable Unicode characters
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ')
    // Replace non-keyboard characters with alternatives
    .replace(/[●○◦•●■□▪▫◊♦♢]/g, '*')  // bullets
    .replace(/[─━│┃┄┅┆┇┈┉┊┋┌┍┎┏┐┑┒┓└┕┖┗┘┙┚┛├┝┞┟┠┡┢┣┤┥┦┧┨┩┪┫┬┭┮┯┰┱┲┳┴┵┶┷┸┹┺┻┼┽┾┿╀╁╂╃╄╅╆╇╈╉╊╋]/g, '-')  // box drawing
    .replace(/[═║╒╓╔╕╖╗╘╙╚╛╜╝╞╟╠╡╢╣╤╥╦╧╨╩╪╫╬]/g, '=')  // double box drawing
    .replace(/[←↑→↓↔↕↖↗↘↙]/g, '->')  // arrows
    .replace(/[∀∂∃∅∇∈∉∋∏∑−∗√∝∞∠∧∨∩∪∫∴∼≅≈≠≡≤≥⊂⊃⊄⊆⊇⊕⊗⊥⋅]/g, '')  // math symbols
    .replace(/[€£¥¢¤]/g, '$')  // currency
    .replace(/[©®™§¶†‡]/g, '')  // legal/punctuation marks
    .replace(/[«»‹›『』「」【】〔〕〖〗〘〙〚〛]/g, '"')  // quotation marks
    .replace(/[′″‴]/g, "'")  // prime marks
    .replace(/[^\x00-\x7F\n]/g, (char) => {
      // Keep common accented characters and remove others
      if (/[\u00C0-\u017F\u0100-\u024F]/.test(char)) return char;  // Latin extended
      if (/[\u0400-\u04FF]/.test(char)) return char;  // Cyrillic
      return '';  // Remove other non-ASCII
    })
    // Normalize multiple spaces to single space
    .replace(/[ \t]+/g, ' ')
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
  
  // Separate paragraphs: detect title-like lines (short lines, often followed by longer content)
  // and ensure proper spacing
  const lines = cleaned.split('\n');
  const processedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';
    
    if (line.length === 0) {
      // Skip empty lines, we'll add paragraph breaks as needed
      continue;
    }
    
    // Check if this looks like a title:
    // - Short line (less than 50 chars)
    // - Followed by a longer line (paragraph content)
    // - Doesn't end with typical sentence punctuation
    const isTitleLike = line.length < 50 && 
                        nextLine.length > 50 && 
                        !line.endsWith('.') && 
                        !line.endsWith(',') &&
                        !line.endsWith(':') &&
                        !line.endsWith(';') &&
                        !/[.!?]$/.test(line);
    
    // Add extra newline before title if there's content before it
    if (isTitleLike && processedLines.length > 0) {
      processedLines.push(''); // Add blank line before title
    }
    
    processedLines.push(line);
    
    // Add blank line after a paragraph (long line) if next line is also content
    if (line.length > 50 && nextLine.length > 0 && nextLine.length < 50) {
      // This is a paragraph followed by a potential title
      processedLines.push('');
    }
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
  // Dynamic import for browser-only code
  const pdfjsLib = await import('pdfjs-dist').then(mod => mod);
  
  // Set worker to local file in public folder
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Group items by their Y position to detect lines and potential titles
    const items = textContent.items as Array<{ str: string; transform: number[]; height?: number }>;
    
    let lastY: number | null = null;
    let pageText = '';
    
    for (const item of items) {
      const str = item.str?.trim();
      if (!str) continue;
      
      // Filter out non-recognizable characters from this item
      const cleanStr = str
        .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .replace(/[\u200B-\u200D\uFEFF]/g, '');
      
      if (!cleanStr) continue;
      
      // Check if we need a newline (different Y position)
      const currentY = item.transform?.[5];
      if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
        // Different line - add newline
        pageText += '\n';
      } else if (pageText && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
        pageText += ' ';
      }
      
      pageText += cleanStr;
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
        throw new Error('The file contains too little text to practice with.');
      }
      
      if (cleanedText.length > 10000) {
        setText(cleanedText.substring(0, 10000));
        setError('Text was truncated to 10,000 characters for optimal performance.');
      } else {
        setText(cleanedText);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
      setFileName(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Custom Text</h2>
          <p className="text-muted-foreground">
            Practice with your own content
          </p>
        </div>
      </div>

      {/* File Upload */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Upload a File
          </CardTitle>
          <CardDescription>
            Supported formats: .txt, .pdf, .docx (max 10,000 characters)
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
                  <span>Processing file...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {fileName || 'Click to upload or drag and drop'}
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
          <CardTitle className="text-lg">Or Paste Your Text</CardTitle>
          <CardDescription>
            Enter any text you want to practice typing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your text here..."
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
              <span>{text.length.toLocaleString()} characters</span>
              <span>{wordCount.toLocaleString()} words</span>
              <span>{paragraphs.length} paragraphs</span>
            </motion.div>
          )}

          {/* Lesson Size Setting */}
          {text.length > 0 && (
            <div className="flex items-center gap-4 py-2 border-y border-border">
              <Label htmlFor="lesson-size" className="flex-shrink-0">Lesson Size:</Label>
              <Select
                value={chunkSize.toString()}
                onValueChange={(val) => setChunkSize(val === 'all' ? 'all' : parseInt(val))}
              >
                <SelectTrigger id="lesson-size" className="w-[200px]">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Full Text (1 Lesson)</SelectItem>
                  <SelectItem value="100">100 words (~Half Page)</SelectItem>
                  <SelectItem value="250">250 words (~1 Page)</SelectItem>
                  <SelectItem value="500">500 words (~2 Pages)</SelectItem>
                  <SelectItem value="1000">1000 words (~4 Pages)</SelectItem>
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
              Start Typing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
