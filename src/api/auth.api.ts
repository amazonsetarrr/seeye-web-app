import apiClient from './client';

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'USER';
    createdAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest extends LoginRequest {
    name: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: User;
        token: string;
    };
}

export const authAPI = {
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    getMe: async (): Promise<{ success: boolean; data: User }> => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
};
