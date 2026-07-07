'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/utils/cn';

type MarkdownContentProps = {
  content: string;
  className?: string;
};

/**
 * Wrapper maison autour de react-markdown (règle Bulletproof : jamais de lib
 * tierce importée directement dans les composants métier). Rendu en éléments
 * React — pas de dangerouslySetInnerHTML, pas de HTML brut interprété.
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none break-words',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
        {content}
      </ReactMarkdown>
    </div>
  );
}
