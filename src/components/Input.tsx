import React, { forwardRef, useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

// Prop types with strict typing
export type InputVariant = 'default' | 'filled' | 'flushed';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Visual style variant of the input */
    variant?: InputVariant;
    /** Size of the input */
    size?: InputSize;
    /** Label text for the input */
    label?: string;
    /** Error message to display */
    error?: string;
    /** Helper text to display below input */
    helperText?: string;
    /** Icon to display on the left side */
    leftIcon?: React.ReactNode;
    /** Icon to display on the right side */
    rightIcon?: React.ReactNode;
    /** Full width input */
    fullWidth?: boolean;
    /** Container className for the wrapper div */
    containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            variant = 'default',
            size = 'md',
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            fullWidth = false,
            containerClassName = '',
            className = '',
            type = 'text',
            id,
            disabled,
            required,
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';
        const inputType = isPassword && showPassword ? 'text' : type;

        // Generate unique ID if not provided
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

        const baseStyles = 'w-full border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--color-bg-surface)] text-[var(--color-text-main)] placeholder:text-[var(--color-text-secondary)]';

        const variants: Record<InputVariant, string> = {
            default: 'border-[var(--color-border)] rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]',
            filled: 'border-transparent rounded-md bg-[var(--color-bg-surface-hover)] focus:ring-[var(--color-primary)] focus:bg-[var(--color-bg-surface)]',
            flushed: 'border-0 border-b-2 border-[var(--color-border)] rounded-none focus:ring-0 focus:border-[var(--color-primary)] px-0',
        };

        const sizes: Record<InputSize, string> = {
            sm: 'h-8 px-3 text-sm',
            md: 'h-10 px-4 py-2',
            lg: 'h-12 px-6 text-lg',
        };

        const errorStyles = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
        const widthClass = fullWidth ? 'w-full' : '';
        const paddingLeft = leftIcon ? 'pl-10' : '';
        const paddingRight = rightIcon || isPassword ? 'pr-10' : '';

        return (
            <div className={`${widthClass} ${containerClassName}`}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-[var(--color-text-main)] mb-1"
                    >
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        type={inputType}
                        disabled={disabled}
                        required={required}
                        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${errorStyles} ${paddingLeft} ${paddingRight} ${className}`}
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={
                            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
                        }
                        {...props}
                    />

                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    )}

                    {!isPassword && rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
                            {rightIcon}
                        </div>
                    )}

                    {error && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                            <AlertCircle className="h-4 w-4" />
                        </div>
                    )}
                </div>

                {error && (
                    <p id={`${inputId}-error`} className="mt-1 text-sm text-red-500">
                        {error}
                    </p>
                )}

                {!error && helperText && (
                    <p id={`${inputId}-helper`} className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
