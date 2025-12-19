import { formatDistanceToNow } from 'date-fns';

export function formatRelativeTime(isoString: string): string {
    try {
        return formatDistanceToNow(new Date(isoString), { addSuffix: true });
    } catch (error) {
        return 'unknown time';
    }
}

export function validateNodeId(id: string): boolean {
    // Basic validation for Xandeum node IDs (base58, 44 chars)
    return /^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(id);
}
