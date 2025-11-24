import React from 'react';
import { Sidebar, type View } from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
    currentView: View;
    onNavigate: (view: View) => void;
    stepsStatus: {
        datasource: boolean;
        mapping: boolean;
        normalization: boolean;
        reconciliation: boolean;
    };
}

export function Layout({ children, currentView, onNavigate, stepsStatus }: LayoutProps) {
    return (
        <div className="min-h-screen bg-[var(--color-bg-app)] text-[var(--color-text-main)] font-sans selection:bg-[var(--color-primary-subtle)] selection:text-[var(--color-primary)] flex">
            <Sidebar currentView={currentView} onNavigate={onNavigate} stepsStatus={stepsStatus} />
            <main className="flex-1 min-w-0 overflow-auto">
                <div className="max-w-7xl mx-auto p-6 md:p-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
