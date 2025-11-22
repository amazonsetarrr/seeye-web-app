import type { FieldMapping } from '../../features/mapping/types';

export const generateCompositeKeyArray = (record: any, mappings: FieldMapping[], side: 'source' | 'target'): string[] => {
    return mappings.map((m) => {
        const field = side === 'source' ? m.sourceField : m.targetField;
        return String(record[field] || '');
    });
};
