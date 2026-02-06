import * as React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

import { cn } from '@/utils/cn';

import { FieldWrapper, FieldWrapperPassThroughProps } from './field-wrapper';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  FieldWrapperPassThroughProps & {
    className?: string;
    registration: Partial<UseFormRegisterReturn>;
  };

const TextareaRHF = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, registration, ...props }, ref) => {
    return (
      <FieldWrapper label={label} error={error}>
        <textarea
          className={cn(
            'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          ref={ref}
          {...registration}
          {...props}
        />
      </FieldWrapper>
    );
  },
);
TextareaRHF.displayName = 'TextareaRHF';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea, TextareaRHF };
