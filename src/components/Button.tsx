import React from 'react';
import { Loader2 } from 'lucide-react';

// Prop types with strict typing
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Visual style variant of the button */
    variant?: ButtonVariant;
    /** Size of the button */
    size?: ButtonSize;
    /** Shows loading spinner and disables the button */
    isLoading?: boolean;
    /** Icon to display on the left side */
    leftIcon?: React.ReactNode;
    /** Icon to display on the right side */
    rightIcon?: React.ReactNode;
    /** Full width button */
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            fullWidth = false,
            className = '',
            disabled,
            type = 'button',
            ...props
        },
        ref
    ) => {
        const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

        const variants: Record<ButtonVariant, string> = {
            primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus:ring-[var(--color-primary)]',
            secondary: 'bg-[var(--color-bg-surface-hover)] text-[var(--color-text-main)] hover:bg-[var(--color-border)] focus:ring-[var(--color-border)]',
            outline: 'border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-bg-surface-hover)] text-[var(--color-text-main)]',
            ghost: 'bg-transparent hover:bg-[var(--color-bg-surface-hover)] text-[var(--color-text-main)]',
            danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        };

        const sizes: Record<ButtonSize, string> = {
            sm: 'h-8 px-3 text-sm gap-1',
            md: 'h-10 px-4 py-2 gap-2',
            lg: 'h-12 px-6 text-lg gap-2',
        };

        const widthClass = fullWidth ? 'w-full' : '';

        return (
            <button
                ref={ref}
                type={type}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
                disabled={disabled || isLoading}
                aria-busy={isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {!isLoading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
            </button>
        );
    }
);

Button.displayName = 'Button';
