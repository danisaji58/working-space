import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      id,
      rows = 3,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const isControlled = onChange !== undefined || value !== undefined;
    const resolvedValue = isControlled ? (value ?? '') : undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-medium text-zinc-300">
            {label}
            {props.required && <span className="text-rose-400 ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          value={resolvedValue}
          defaultValue={!isControlled ? defaultValue : undefined}
          onChange={onChange}
          className={cn(
            'w-full rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-sm px-3.5 py-2.5 transition-colors duration-150 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 disabled:opacity-50 disabled:cursor-not-allowed resize-y',
            error && 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-rose-400">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-zinc-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
