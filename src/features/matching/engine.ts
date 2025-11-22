import type { UploadedFile } from '../file-management/types';
import type { MatchConfig, ReconciliationResult } from './types';
import { ReconciliationEngine } from '../../logic/reconciliation/ReconciliationEngine';

export const reconcileData = (
    sourceFile: UploadedFile,
    targetFile: UploadedFile,
    config: MatchConfig
): ReconciliationResult => {
    const engine = new ReconciliationEngine(config.strategy || 'fuzzy');
    return engine.reconcile(sourceFile, targetFile, config);
};

// Exporting for backward compatibility if needed, though it's now in logic/reconciliation/utils
export { generateCompositeKeyArray } from '../../logic/reconciliation/utils';
