import { ReconciliationEngine } from '../src/logic/reconciliation/ReconciliationEngine';
import type { UploadedFile } from '../src/features/file-management/types';
import type { MatchConfig } from '../src/features/matching/types';

const mockSourceFile: UploadedFile = {
    id: 'source',
    name: 'source.csv',
    size: 1024,
    type: 'text/csv',
    lastModified: Date.now(),
    data: [
        { id: '1', name: 'Server A', ip: '192.168.1.1' },
        { id: '2', name: 'Server B', ip: '192.168.1.2' },
        { id: '3', name: 'Server C', ip: '192.168.1.3' }, // Exact match
        { id: '4', name: 'Server D', ip: '192.168.1.4' }, // Fuzzy match candidate
    ],
    columns: ['id', 'name', 'ip'],
    rowCount: 4
};

const mockTargetFile: UploadedFile = {
    id: 'target',
    name: 'target.csv',
    size: 1024,
    type: 'text/csv',
    lastModified: Date.now(),
    data: [
        { id: '101', hostname: 'Server A', address: '192.168.1.1' },
        { id: '102', hostname: 'Server B', address: '192.168.1.20' }, // Conflict
        { id: '103', hostname: 'Server C', address: '192.168.1.3' }, // Exact match
        { id: '104', hostname: 'Server_D', address: '192.168.1.4' }, // Fuzzy match
    ],
    columns: ['id', 'hostname', 'address'],
    rowCount: 4
};

const config: MatchConfig = {
    mappings: [
        { id: 'm1', sourceField: 'name', targetField: 'hostname', isKey: true, dataType: 'string' },
        { id: 'm2', sourceField: 'ip', targetField: 'address', isKey: false, dataType: 'string' }
    ],
    fuzzyThreshold: 0.8
};

async function runVerification() {
    console.log('--- Starting Verification ---');

    // Test 1: Exact Match Strategy
    console.log('\nTesting Exact Match Strategy...');
    const exactEngine = new ReconciliationEngine('exact');
    const exactResults = exactEngine.reconcile(mockSourceFile, mockTargetFile, config);

    console.log('Exact Match Summary:', exactResults.summary);
    // Expected: Server A (match), Server B (match), Server C (match), Server D (orphan)
    // Wait, Server D is 'Server D' vs 'Server_D', so exact match should fail.
    // Server A vs Server A -> Match
    // Server B vs Server B -> Match
    // Server C vs Server C -> Match
    // Server D vs Server_D -> Orphan

    const exactMatches = exactResults.results.filter(r => r.status === 'matched');
    console.log('Exact Matches found:', exactMatches.length);
    exactMatches.forEach(m => {
        console.log(`Matched: ${m.sourceRecord.name} <-> ${m.targetRecord.hostname}`);
    });

    // Test 2: Fuzzy Match Strategy
    console.log('\nTesting Fuzzy Match Strategy...');
    const fuzzyEngine = new ReconciliationEngine('fuzzy');
    const fuzzyResults = fuzzyEngine.reconcile(mockSourceFile, mockTargetFile, config);

    console.log('Fuzzy Match Summary:', fuzzyResults.summary);
    // Expected: Server D should match Server_D

    const fuzzyMatches = fuzzyResults.results.filter(r => r.status === 'matched');
    console.log('Fuzzy Matches found:', fuzzyMatches.length);
    fuzzyMatches.forEach(m => {
        console.log(`Matched: ${m.sourceRecord.name} <-> ${m.targetRecord.hostname} (Score: ${m.confidenceScore.toFixed(2)})`);
    });

    if (exactMatches.length === 3 && fuzzyMatches.length === 4) {
        console.log('\n✅ Verification PASSED');
    } else {
        console.log('\n❌ Verification FAILED');
    }
}

runVerification().catch(console.error);
