import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeContext';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-full flex items-center p-1 rounded-xl bg-[var(--color-bg-surface-hover)] border border-[var(--color-border)] shadow-inner transition-all duration-300"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <div
                className={`absolute w-[calc(50%-4px)] h-[calc(100%-8px)] bg-[var(--color-bg-surface)] rounded-lg shadow-sm transition-all duration-300 ease-out ${theme === 'light' ? 'translate-x-0' : 'translate-x-[100%]'
                    }`}
            />
            <div className={`relative z-10 flex-1 flex items-center justify-center py-2 text-sm font-medium transition-colors duration-300 ${theme === 'light' ? 'text-[var(--color-text-main)]' : 'text-[var(--color-text-tertiary)]'
                }`}>
                <Sun className="w-4 h-4 mr-2" />
                Light
            </div>
            <div className={`relative z-10 flex-1 flex items-center justify-center py-2 text-sm font-medium transition-colors duration-300 ${theme === 'dark' ? 'text-[var(--color-text-main)]' : 'text-[var(--color-text-tertiary)]'
                }`}>
                <Moon className="w-4 h-4 mr-2" />
                Dark
            </div>
        </button>
    );
}
