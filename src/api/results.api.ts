import apiClient from './client';

export interface ReconciliationResult {
    id: string;
    jobId: string;
    resultType: 'MATCHED' | 'CONFLICT' | 'ORPHAN_SOURCE' | 'ORPHAN_TARGET';
    sourceData?: Record<string, any>;
    targetData?: Record<string, any>;
    differences?: Array<{
        field: string;
        sourceValue: any;
        targetValue: any;
    }>;
    compositeKey: string;
    confidenceScore?: number;
}

export interface ResultsListResponse {
    results: ReconciliationResult[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const resultsAPI = {
    list: async (
        jobId: string,
        options?: { type?: string; page?: number; limit?: number }
    ) => {
        const params = new URLSearchParams();
        if (options?.type) params.append('type', options.type);
        if (options?.page) params.append('page', options.page.toString());
        if (options?.limit) params.append('limit', options.limit.toString());

        const response = await apiClient.get<{ success: boolean; data: ResultsListResponse }>(
            `/results/jobs/${jobId}/results?${params.toString()}`
        );
        return response.data;
    },

    create: async (jobId: string, results: Omit<ReconciliationResult, 'id'>[]) => {
        const response = await apiClient.post<{ success: boolean; data: { count: number } }>(
            `/results/jobs/${jobId}/results`,
            { results }
        );
        return response.data;
    },

    export: async (jobId: string) => {
        const response = await apiClient.get(`/results/jobs/${jobId}/results/export`);
        return response.data;
    },
};
