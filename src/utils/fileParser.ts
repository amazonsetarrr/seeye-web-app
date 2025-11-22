import * as XLSX from 'xlsx';
import type { UploadedFile } from '../features/file-management/types';

export const parseFile = async (file: File): Promise<UploadedFile> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

                if (jsonData.length === 0) {
                    reject(new Error('File is empty'));
                    return;
                }

                const headers = jsonData[0] as string[];
                const rows = jsonData.slice(1);

                // Basic validation: ensure headers exist
                if (!headers || headers.length === 0) {
                    reject(new Error('No headers found in file'));
                    return;
                }

                // Convert array rows to objects with column keys for proper field access
                const dataObjects = rows.map((row: any[]) => {
                    const obj: Record<string, any> = {};
                    headers.forEach((header, index) => {
                        obj[header] = row[index] !== undefined ? row[index] : '';
                    });
                    return obj;
                });

                resolve({
                    id: crypto.randomUUID(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                    data: dataObjects,
                    columns: headers,
                    rowCount: dataObjects.length,
                });
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
};
