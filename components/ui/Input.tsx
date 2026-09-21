import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      value,
      defaultValue,
      onChange,
      type,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const isPasswordType = type === 'password';
    const [showPassword, setShowPassword] = useState(false);
    const resolvedType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

    // Determine if input is meant to be controlled.
    // When controlled (or when onChange is provided), ensure value is never undefined
    // to prevent React's "A component is changing an uncontrolled input to be controlled" warning.
    const isFileInput = type === 'file';
    const isControlled = !isFileInput && (onChange !== undefined || value !== undefined);
    const resolvedValue = isFileInput ? undefined : isControlled ? (value ?? '') : undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-zinc-300">
            {label}
            {props.required && <span className="text-rose-400 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-zinc-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={resolvedType}
            value={resolvedValue}
            defaultValue={!isControlled ? defaultValue : undefined}
            onChange={onChange}
            className={cn(
              'w-full rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-sm px-3.5 py-2.5 transition-colors duration-150 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              (rightIcon || isPasswordType) && 'pr-10',
              error && 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          />
          {isPasswordType ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 p-1 rounded-md text-zinc-400 hover:text-zinc-200 focus:outline-none cursor-pointer transition-colors"
              aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          ) : rightIcon ? (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-zinc-400">
              {rightIcon}
            </div>
          ) : null}
        </div>
        {error ? (
          <p className="text-xs text-rose-400">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-zinc-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
