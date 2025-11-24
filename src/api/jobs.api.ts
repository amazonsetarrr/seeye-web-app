import apiClient from './client';

export interface ReconciliationJob {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    sourceFileId?: string;
    targetFileId?: string;
    createdBy: string;
    createdAt: string;
    completedAt?: string;
    matchStrategy: 'EXACT' | 'FUZZY';
    fuzzyThreshold: number;
    summaryStats?: {
        total: number;
        matched: number;
        conflicts: number;
        orphans: { source: number; target: number };
    };
}

export interface CreateJobRequest {
    projectId: string;
    name: string;
    description?: string;
    sourceFileId?: string;
    targetFileId?: string;
    matchStrategy?: 'EXACT' | 'FUZZY';
    fuzzyThreshold?: number;
}

export const jobsAPI = {
    list: async (filters?: { projectId?: string; status?: string }) => {
        const params = new URLSearchParams(filters as Record<string, string>);
        const response = await apiClient.get<{ success: boolean; data: ReconciliationJob[] }>(
            `/jobs?${params.toString()}`
        );
        return response.data;
    },

    create: async (data: CreateJobRequest) => {
        const response = await apiClient.post<{ success: boolean; data: ReconciliationJob }>('/jobs', data);
        return response.data;
    },

    get: async (id: string) => {
        const response = await apiClient.get<{ success: boolean; data: ReconciliationJob }>(`/jobs/${id}`);
        return response.data;
    },

    update: async (id: string, data: Partial<ReconciliationJob>) => {
        const response = await apiClient.put<{ success: boolean; data: ReconciliationJob }>(`/jobs/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete<{ success: boolean; message: string }>(`/jobs/${id}`);
        return response.data;
    },
};
