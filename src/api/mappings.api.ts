import apiClient from './client';

export interface FieldMapping {
    id: string;
    jobId?: string;
    projectId?: string;
    name: string;
    mappings: Array<{
        sourceField: string;
        targetField: string;
        isKey: boolean;
    }>;
    isTemplate: boolean;
    createdBy: string;
    createdAt: string;
}

export interface CreateMappingRequest {
    jobId?: string;
    projectId?: string;
    name: string;
    mappings: Array<{
        sourceField: string;
        targetField: string;
        isKey: boolean;
    }>;
    isTemplate?: boolean;
}

export const mappingsAPI = {
    list: async (filters?: { projectId?: string; jobId?: string; isTemplate?: boolean }) => {
        const params = new URLSearchParams();
        if (filters?.projectId) params.append('projectId', filters.projectId);
        if (filters?.jobId) params.append('jobId', filters.jobId);
        if (filters?.isTemplate !== undefined) params.append('isTemplate', filters.isTemplate.toString());

        const response = await apiClient.get<{ success: boolean; data: FieldMapping[] }>(
            `/mappings?${params.toString()}`
        );
        return response.data;
    },

    create: async (data: CreateMappingRequest) => {
        const response = await apiClient.post<{ success: boolean; data: FieldMapping }>('/mappings', data);
        return response.data;
    },

    get: async (id: string) => {
        const response = await apiClient.get<{ success: boolean; data: FieldMapping }>(`/mappings/${id}`);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateMappingRequest>) => {
        const response = await apiClient.put<{ success: boolean; data: FieldMapping }>(`/mappings/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete<{ success: boolean; message: string }>(`/mappings/${id}`);
        return response.data;
    },
};
