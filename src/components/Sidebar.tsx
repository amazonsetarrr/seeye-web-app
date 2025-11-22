import { Home, Database, GitGraph, CheckSquare, FileText, Settings, LogOut } from 'lucide-react';
import logo from '../assets/logo.png';
import { ThemeToggle } from './ThemeToggle';

export type View = 'home' | 'datasource' | 'mapping' | 'reconciliation' | 'report' | 'settings';

interface SidebarProps {
    currentView: View;
    onNavigate: (view: View) => void;
    stepsStatus: {
        datasource: boolean; // true if files uploaded
        mapping: boolean;    // true if mapping done
        reconciliation: boolean; // true if results ready
    };
}

export function Sidebar({ currentView, onNavigate, stepsStatus }: SidebarProps) {
    const navItems = [
        { id: 'home', label: 'Home', icon: Home, disabled: false },
        { id: 'datasource', label: 'Data Source', icon: Database, disabled: false },
        { id: 'mapping', label: 'Mapping', icon: GitGraph, disabled: !stepsStatus.datasource },
        { id: 'reconciliation', label: 'Reconciliation', icon: CheckSquare, disabled: !stepsStatus.mapping },
        { id: 'report', label: 'Report', icon: FileText, disabled: !stepsStatus.reconciliation },
        { id: 'settings', label: 'Settings', icon: Settings, disabled: false },
    ] as const;

    return (
        <div className="w-64 bg-[var(--glass-bg)] border-r border-[var(--glass-border)] backdrop-blur-[var(--backdrop-blur)] flex flex-col h-screen sticky top-0">
            <div className="p-6 flex items-center space-x-3 border-b border-[var(--glass-border)]">
                <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg shadow-gray-900/20">
                    <img src={logo} alt="SeeEye Logo" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-lg font-bold bg-clip-text text-transparent bg-[var(--gradient-primary)] tracking-tight">SeeEye</h1>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    const isDisabled = item.disabled;

                    return (
                        <button
                            key={item.id}
                            onClick={() => !isDisabled && onNavigate(item.id as View)}
                            disabled={isDisabled}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-gray-900/20'
                                : isDisabled
                                    ? 'opacity-50 cursor-not-allowed text-[var(--color-text-tertiary)]'
                                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface-hover)] hover:text-[var(--color-text-main)]'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-current'}`} />
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50" />
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-[var(--glass-border)] space-y-2">
                <div className="px-4">
                    <ThemeToggle />
                </div>
                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-[var(--color-text-secondary)] hover:bg-red-50 hover:text-red-600 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}
