import apiClient from './client';

export interface FileMetadata {
    id: string;
    jobId?: string;
    filename: string;
    fileType: 'SOURCE' | 'TARGET';
    fileSize: number;
    headers: string[];
    rowCount: number;
    uploadedBy: string;
    uploadedAt: string;
    storagePath: string;
    checksum: string;
}

export const filesAPI = {
    upload: async (file: File, fileType: 'SOURCE' | 'TARGET', jobId?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', fileType);
        if (jobId) {
            formData.append('jobId', jobId);
        }

        const response = await apiClient.post<{ success: boolean; data: FileMetadata }>(
            '/files/upload',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    get: async (id: string) => {
        const response = await apiClient.get<{ success: boolean; data: FileMetadata }>(`/files/${id}`);
        return response.data;
    },

    download: async (id: string) => {
        const response = await apiClient.get(`/files/${id}/download`, {
            responseType: 'blob',
        });
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete<{ success: boolean; message: string }>(`/files/${id}`);
        return response.data;
    },
};
