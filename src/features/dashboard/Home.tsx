import { useEffect, useState } from 'react';
import { Clock, CheckCircle, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { JobStore, type Job } from '../../utils/store';

export function Home() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        success: 0,
        conflicts: 0,
        pending: 0
    });

    useEffect(() => {
        const recentJobs = JobStore.getRecentJobs();
        setJobs(recentJobs);

        // Calculate stats
        const total = recentJobs.length;
        const success = recentJobs.filter(j => j.status === 'Completed').length;
        const conflicts = recentJobs.reduce((acc, j) => acc + (j.status === 'Review Needed' ? 1 : 0), 0); // Simplified logic
        const pending = recentJobs.filter(j => j.status === 'Review Needed').length;

        setStats({
            total,
            success: total > 0 ? Math.round((success / total) * 100) : 0,
            conflicts,
            pending
        });
    }, []);

    const statCards = [
        {
            label: 'Total Reconciliations',
            value: stats.total.toString(),
            icon: FileText,
            style: { bg: 'var(--color-primary-subtle)', text: 'var(--color-primary)' }
        },
        {
            label: 'Success Rate',
            value: `${stats.success}%`,
            icon: CheckCircle,
            style: { bg: 'var(--color-success-bg)', text: 'var(--color-success)' } // Using Success Green/Aqua
        },
        {
            label: 'Review Needed',
            value: stats.pending.toString(),
            icon: Clock,
            style: { bg: 'var(--color-warning-bg)', text: 'var(--color-warning)' }
        },
        {
            label: 'Recent Conflicts',
            value: stats.conflicts.toString(),
            icon: AlertTriangle,
            style: { bg: 'var(--color-error-bg)', text: 'var(--color-error)' } // Using Error Red
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-[var(--color-text-main)]">Welcome back, Admin</h1>
                <p className="text-[var(--color-text-secondary)] mt-2">Here's what's happening with your data reconciliation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-[var(--color-bg-surface)] p-6 rounded-xl shadow-sm border border-[var(--color-border)] hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">{stat.label}</p>
                                    <p className="text-2xl font-bold text-[var(--color-text-main)] mt-1">{stat.value}</p>
                                </div>
                                <div className="p-3 rounded-lg" style={{ backgroundColor: stat.style.bg }}>
                                    <Icon className="w-6 h-6" style={{ color: stat.style.text }} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-[var(--color-bg-surface)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
                <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[var(--color-text-main)]">Recent Jobs</h2>
                    <button className="text-sm font-medium text-[var(--color-accent-teal)] hover:text-[var(--color-primary)] flex items-center transition-colors">
                        View All <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[var(--color-bg-app)]">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Job Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Items</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                            {jobs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">
                                        No recent jobs found. Start a new reconciliation!
                                    </td>
                                </tr>
                            ) : (
                                jobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-[var(--color-bg-surface-hover)] transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-[var(--color-text-main)]">{job.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                                            {JobStore.formatRelativeTime(job.timestamp)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className="px-2 py-1 text-xs font-medium rounded-full"
                                                style={{
                                                    backgroundColor: job.status === 'Completed' ? 'var(--color-success-bg)' :
                                                        job.status === 'Review Needed' ? 'var(--color-warning-bg)' :
                                                            'var(--color-error-bg)',
                                                    color: job.status === 'Completed' ? 'var(--color-success)' :
                                                        job.status === 'Review Needed' ? 'var(--color-warning)' :
                                                            'var(--color-error)'
                                                }}
                                            >
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                                            {job.items.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-[var(--color-accent-teal)] hover:text-[var(--color-primary)] transition-colors">Details</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
