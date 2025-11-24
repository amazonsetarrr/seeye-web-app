import React from 'react';

// Prop types with strict typing
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Visual style variant of the card */
    variant?: CardVariant;
    /** Adds hover effect to the card */
    hoverable?: boolean;
    /** Makes the card clickable */
    clickable?: boolean;
    /** Adds padding to the card */
    padded?: boolean;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Adds border bottom to the header */
    bordered?: boolean;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Adds padding to the body */
    padded?: boolean;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Adds border top to the footer */
    bordered?: boolean;
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    /** Heading level */
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

// Card Header Component
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ bordered = false, className = '', children, ...props }, ref) => {
        const borderClass = bordered ? 'border-b border-[var(--color-border)]' : '';

        return (
            <div
                ref={ref}
                className={`px-6 py-4 ${borderClass} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

CardHeader.displayName = 'Card.Header';

// Card Body Component
const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
    ({ padded = true, className = '', children, ...props }, ref) => {
        const paddingClass = padded ? 'px-6 py-4' : '';

        return (
            <div
                ref={ref}
                className={`${paddingClass} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

CardBody.displayName = 'Card.Body';

// Card Footer Component
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
    ({ bordered = false, className = '', children, ...props }, ref) => {
        const borderClass = bordered ? 'border-t border-[var(--color-border)]' : '';

        return (
            <div
                ref={ref}
                className={`px-6 py-4 ${borderClass} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

CardFooter.displayName = 'Card.Footer';

// Card Title Component
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ as: Component = 'h3', className = '', children, ...props }, ref) => {
        return (
            <Component
                ref={ref as any}
                className={`text-lg font-semibold text-[var(--color-text-main)] ${className}`}
                {...props}
            >
                {children}
            </Component>
        );
    }
);

CardTitle.displayName = 'Card.Title';

// Card Description Component
const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
    ({ className = '', children, ...props }, ref) => {
        return (
            <p
                ref={ref}
                className={`text-sm text-[var(--color-text-secondary)] mt-1 ${className}`}
                {...props}
            >
                {children}
            </p>
        );
    }
);

CardDescription.displayName = 'Card.Description';

// Main Card Component
const CardRoot = React.forwardRef<HTMLDivElement, CardProps>(
    (
        {
            variant = 'default',
            hoverable = false,
            clickable = false,
            padded = true,
            className = '',
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = 'rounded-lg transition-all duration-200 bg-[var(--color-bg-surface)]';

        const variants: Record<CardVariant, string> = {
            default: 'border border-[var(--color-border)] shadow-sm',
            elevated: 'shadow-md hover:shadow-lg',
            outlined: 'border-2 border-[var(--color-border)]',
            ghost: 'border-0 shadow-none',
        };

        const hoverableStyles = hoverable
            ? 'hover:shadow-lg hover:border-[var(--color-primary)]'
            : '';

        const clickableStyles = clickable
            ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
            : '';

        const paddingStyles = padded ? 'p-6' : '';

        return (
            <div
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${hoverableStyles} ${clickableStyles} ${paddingStyles} ${className}`}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                {...props}
            >
                {children}
            </div>
        );
    }
);

CardRoot.displayName = 'Card';

// Compound Component Pattern
export const Card = Object.assign(CardRoot, {
    Header: CardHeader,
    Body: CardBody,
    Footer: CardFooter,
    Title: CardTitle,
    Description: CardDescription,
});
