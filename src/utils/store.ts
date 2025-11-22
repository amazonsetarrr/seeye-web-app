export interface Job {
    id: string;
    name: string;
    date: string;
    status: 'Completed' | 'Review Needed' | 'Failed';
    items: number;
    timestamp: number;
}

const STORAGE_KEY = 'cmdb_reconciler_jobs';

export const JobStore = {
    getRecentJobs: (): Job[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to parse jobs from local storage', e);
            return [];
        }
    },

    addJob: (job: Omit<Job, 'id' | 'date' | 'timestamp'>) => {
        const jobs = JobStore.getRecentJobs();
        const newJob: Job = {
            ...job,
            id: crypto.randomUUID(),
            date: 'Just now',
            timestamp: Date.now(),
        };

        // Keep only last 50 jobs
        const updatedJobs = [newJob, ...jobs].slice(0, 50);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedJobs));
        return newJob;
    },

    clearJobs: () => {
        localStorage.removeItem(STORAGE_KEY);
    },

    // Helper to format relative time (e.g. "2 hours ago")
    formatRelativeTime: (timestamp: number): string => {
        const now = Date.now();
        const diffInSeconds = Math.floor((now - timestamp) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }
};
