import * as XLSX from 'xlsx';
import type { ReconciliationResult } from '../features/matching/types';

export const exportNormalizedDataToExcel = (
    data: any[],
    headers: string[],
    filename: string = 'normalized-data'
) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    XLSX.utils.book_append_sheet(wb, ws, 'Normalized Data');
    XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
};

export const exportToExcel = (results: ReconciliationResult, filename: string = 'reconciliation-report') => {
    const wb = XLSX.utils.book_new();

    // 1. Summary Sheet
    const summaryData = [
        ['Reconciliation Report'],
        ['Date', new Date().toISOString()],
        [''],
        ['Summary Statistics'],
        ['Total Records', results.summary.total],
        ['Matched', results.summary.matched],
        ['Conflicts', results.summary.conflicts],
        ['Orphans (Source)', results.summary.orphans.source],
        ['Orphans (Target)', results.summary.orphans.target],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    // 2. Detailed Results Sheet
    const flatResults = results.results.map((r) => {
        const row: any = {
            Status: r.status,
            Confidence: r.confidenceScore,
        };

        // Flatten Source Record
        if (r.sourceRecord) {
            Object.keys(r.sourceRecord).forEach((key) => {
                row[`Source_${key}`] = r.sourceRecord[key];
            });
        }

        // Flatten Target Record
        if (r.targetRecord) {
            Object.keys(r.targetRecord).forEach((key) => {
                row[`Target_${key}`] = r.targetRecord[key];
            });
        }

        // Differences
        if (r.differences) {
            const diffs = Object.keys(r.differences).join(', ');
            row['Differences'] = diffs;
        }

        return row;
    });

    const resultsSheet = XLSX.utils.json_to_sheet(flatResults);
    XLSX.utils.book_append_sheet(wb, resultsSheet, 'Detailed Results');

    // Write file
    XLSX.writeFile(wb, `${filename}.xlsx`);
};
