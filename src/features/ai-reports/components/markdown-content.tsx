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
 *
 * SÉCURITÉ : le contenu provient d'un LLM. `skipHtml` neutralise le HTML brut,
 * mais la syntaxe image GFM `![](url)` déclencherait un chargement réseau vers
 * un hôte arbitraire (exfiltration d'IP/métadonnées si un prompt injection y
 * glisse une URL de tracker). On interdit donc `img` au rendu.
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert min-w-0 max-w-none break-words',
        // Les blocs à largeur intrinsèque (code, tableaux GFM) forcent sinon la
        // largeur de la bulle → scroll horizontal de toute la page. On les
        // borne pour qu'ils scrollent DANS leur propre conteneur.
        '[&_pre]:max-w-full [&_pre]:overflow-x-auto',
        '[&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        disallowedElements={['img']}
        unwrapDisallowed
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
