'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTypingStore, categories } from '@/store/typing-store';
import type { Category } from '@/lib/typing/types';

interface CategorySelectorProps {
  onSelectCategory: (category: Category) => void;
  onBack: () => void;
}

export function CategorySelector({ onSelectCategory, onBack }: CategorySelectorProps) {
  const getCategoryColor = (index: number) => {
    const colors = [
      { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/50' },
      { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'hover:border-amber-500/50' },
      { text: 'text-blue-500', bg: 'bg-blue-500/10', border: 'hover:border-blue-500/50' },
      { text: 'text-purple-500', bg: 'bg-purple-500/10', border: 'hover:border-purple-500/50' },
      { text: 'text-rose-500', bg: 'bg-rose-500/10', border: 'hover:border-rose-500/50' },
      { text: 'text-teal-500', bg: 'bg-teal-500/10', border: 'hover:border-teal-500/50' },
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Practice Topics</h2>
          <p className="text-muted-foreground">
            Learn interesting facts while improving your typing skills
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((category, index) => {
            const color = getCategoryColor(index);
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${color.border}`}
                  onClick={() => onSelectCategory(category)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl ${color.bg} flex items-center justify-center text-2xl shrink-0`}>
                        {category.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {category.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {category.paragraphs.length} paragraphs
                      </Badge>
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Educational
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
