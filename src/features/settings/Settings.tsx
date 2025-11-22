import { useState } from 'react';
import { Trash2, Moon, Sun, Shield } from 'lucide-react';
import { JobStore } from '../../utils/store';

export function Settings() {
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const handleClearHistory = () => {
        JobStore.clearJobs();
        setShowClearConfirm(false);
        // Ideally trigger a refresh or toast here
        window.location.reload(); // Simple reload to refresh state for now
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Settings</h2>
                <p className="text-[var(--color-text-secondary)] mt-1">Manage your application preferences and data.</p>
            </div>

            <div className="space-y-6">
                {/* General Section */}
                <section className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                        <h3 className="font-semibold text-[var(--color-text-main)] flex items-center">
                            <Shield className="w-4 h-4 mr-2" />
                            General
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-[var(--color-text-main)]">Application Version</p>
                                <p className="text-sm text-[var(--color-text-secondary)]">Current installed version</p>
                            </div>
                            <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-600 rounded-full">v1.0.0</span>
                        </div>
                    </div>
                </section>

                {/* Appearance Section (Placeholder for now) */}
                <section className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                        <h3 className="font-semibold text-[var(--color-text-main)] flex items-center">
                            <Sun className="w-4 h-4 mr-2" />
                            Appearance
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between opacity-60 cursor-not-allowed">
                            <div>
                                <p className="font-medium text-[var(--color-text-main)]">Theme</p>
                                <p className="text-sm text-[var(--color-text-secondary)]">Switch between light and dark mode</p>
                            </div>
                            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
                                <button className="p-2 bg-white shadow-sm rounded-md text-yellow-500"><Sun className="w-4 h-4" /></button>
                                <button className="p-2 text-gray-400"><Moon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Data Management Section */}
                <section className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                        <h3 className="font-semibold text-[var(--color-text-main)] flex items-center">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Data Management
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-[var(--color-text-main)]">Clear Job History</p>
                                <p className="text-sm text-[var(--color-text-secondary)]">Remove all saved reconciliation jobs from local storage</p>
                            </div>
                            <button
                                onClick={() => setShowClearConfirm(true)}
                                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                                Clear History
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Confirmation Modal */}
            {showClearConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 m-4">
                        <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-2">Clear All History?</h3>
                        <p className="text-[var(--color-text-secondary)] mb-6">
                            This action cannot be undone. All your recent job history will be permanently deleted from this device.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearHistory}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                            >
                                Yes, Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
