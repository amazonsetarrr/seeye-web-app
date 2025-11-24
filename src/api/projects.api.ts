import apiClient from './client';

export interface Project {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
        jobs: number;
    };
}

export interface CreateProjectRequest {
    name: string;
    description?: string;
}

export const projectsAPI = {
    list: async () => {
        const response = await apiClient.get<{ success: boolean; data: Project[] }>('/projects');
        return response.data;
    },

    create: async (data: CreateProjectRequest) => {
        const response = await apiClient.post<{ success: boolean; data: Project }>('/projects', data);
        return response.data;
    },

    get: async (id: string) => {
        const response = await apiClient.get<{ success: boolean; data: Project }>(`/projects/${id}`);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateProjectRequest>) => {
        const response = await apiClient.put<{ success: boolean; data: Project }>(`/projects/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete<{ success: boolean; message: string }>(`/projects/${id}`);
        return response.data;
    },
};
