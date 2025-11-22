export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    lastModified: number;
    data: any[]; // Parsed data
    columns: string[];
    rowCount: number;
}

export interface FileUploadProps {
    onFilesSelected: (files: File[]) => void;
    maxFiles?: number;
    maxSizeMB?: number;
    acceptedFormats?: string[];
}
