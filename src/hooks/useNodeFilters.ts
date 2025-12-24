import { useState, useMemo, useCallback } from 'react';
import { PNode } from '@/types/pnode';
import { calculateHealthScore } from '@/services/health-score';

export interface NodeFilters {
  search: string;
  status: string[];
  regions: string[];
  healthScoreMin: number;
  healthScoreMax: number;
  uptimeMin: number;
  latencyMax: number;
  storageMin: number;
  versions: string[];
  sortBy: 'healthScore' | 'uptime' | 'latency' | 'storage' | 'credits' | 'name';
  sortOrder: 'asc' | 'desc';
}

export const DEFAULT_FILTERS: NodeFilters = {
  search: '',
  status: [],
  regions: [],
  healthScoreMin: 0,
  healthScoreMax: 100,
  uptimeMin: 0,
  latencyMax: 1000,
  storageMin: 0,
  versions: [],
  sortBy: 'healthScore',
  sortOrder: 'desc'
};

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: Partial<NodeFilters>;
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'top-performers',
    name: 'Top Performers',
    description: 'Nodes with excellent health scores and uptime',
    filters: {
      healthScoreMin: 90,
      uptimeMin: 99,
      status: ['online'],
      sortBy: 'healthScore',
      sortOrder: 'desc'
    }
  },
  {
    id: 'reliable',
    name: 'Reliable Nodes',
    description: 'High uptime and low latency',
    filters: {
      uptimeMin: 95,
      latencyMax: 100,
      status: ['online'],
      sortBy: 'uptime',
      sortOrder: 'desc'
    }
  },
  {
    id: 'high-capacity',
    name: 'High Capacity',
    description: 'Nodes with significant storage',
    filters: {
      storageMin: 500,
      status: ['online'],
      sortBy: 'storage',
      sortOrder: 'desc'
    }
  },
  {
    id: 'needs-attention',
    name: 'Needs Attention',
    description: 'Nodes with issues requiring review',
    filters: {
      healthScoreMax: 70,
      sortBy: 'healthScore',
      sortOrder: 'asc'
    }
  },
  {
    id: 'unstable',
    name: 'Unstable Nodes',
    description: 'Nodes with connectivity issues',
    filters: {
      status: ['unstable'],
      sortBy: 'healthScore',
      sortOrder: 'asc'
    }
  }
];

export function useNodeFilters(nodes: PNode[]) {
  const [filters, setFilters] = useState<NodeFilters>(DEFAULT_FILTERS);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const regions = new Set<string>();
    const versions = new Set<string>();
    const statuses = new Set<string>();

    nodes.forEach(node => {
      if (node.geo?.country) regions.add(node.geo.country);
      if (node.version) versions.add(node.version);
      if (node.status) statuses.add(node.status);
    });

    return {
      regions: Array.from(regions).sort(),
      versions: Array.from(versions).sort(),
      statuses: Array.from(statuses).sort()
    };
  }, [nodes]);

  // Apply filters
  const filteredNodes = useMemo(() => {
    let result = [...nodes];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(node =>
        node.id.toLowerCase().includes(searchLower) ||
        node.address.toLowerCase().includes(searchLower) ||
        node.geo?.country?.toLowerCase().includes(searchLower) ||
        node.geo?.city?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      result = result.filter(node => filters.status.includes(node.status));
    }

    // Region filter
    if (filters.regions.length > 0) {
      result = result.filter(node => 
        node.geo?.country && filters.regions.includes(node.geo.country)
      );
    }

    // Health score filter
    result = result.filter(node => {
      const score = calculateHealthScore(node).overall;
      return score >= filters.healthScoreMin && score <= filters.healthScoreMax;
    });

    // Uptime filter
    if (filters.uptimeMin > 0) {
      result = result.filter(node => (node.uptime || 0) >= filters.uptimeMin);
    }

    // Latency filter
    if (filters.latencyMax < 1000) {
      result = result.filter(node => (node.latency || 0) <= filters.latencyMax);
    }

    // Storage filter
    if (filters.storageMin > 0) {
      result = result.filter(node => {
        const storageGB = (node.storage?.committed || 0) / (1024 * 1024 * 1024);
        return storageGB >= filters.storageMin;
      });
    }

    // Version filter
    if (filters.versions.length > 0) {
      result = result.filter(node => 
        node.version && filters.versions.includes(node.version)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (filters.sortBy) {
        case 'healthScore':
          aValue = calculateHealthScore(a).overall;
          bValue = calculateHealthScore(b).overall;
          break;
        case 'uptime':
          aValue = a.uptime || 0;
          bValue = b.uptime || 0;
          break;
        case 'latency':
          aValue = a.latency || 0;
          bValue = b.latency || 0;
          break;
        case 'storage':
          aValue = a.storage?.committed || 0;
          bValue = b.storage?.committed || 0;
          break;
        case 'credits':
          aValue = a.credits || 0;
          bValue = b.credits || 0;
          break;
        case 'name':
          return filters.sortOrder === 'asc' 
            ? a.address.localeCompare(b.address)
            : b.address.localeCompare(a.address);
        default:
          aValue = 0;
          bValue = 0;
      }

      return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return result;
  }, [nodes, filters]);

  // Update filter
  const updateFilter = useCallback(<K extends keyof NodeFilters>(
    key: K,
    value: NodeFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setActivePreset(null); // Clear preset when manually changing filters
  }, []);

  // Apply preset
  const applyPreset = useCallback((presetId: string) => {
    const preset = FILTER_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setFilters(prev => ({ ...prev, ...preset.filters }));
      setActivePreset(presetId);
    }
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setActivePreset(null);
  }, []);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.status.length > 0 ||
      filters.regions.length > 0 ||
      filters.healthScoreMin > 0 ||
      filters.healthScoreMax < 100 ||
      filters.uptimeMin > 0 ||
      filters.latencyMax < 1000 ||
      filters.storageMin > 0 ||
      filters.versions.length > 0
    );
  }, [filters]);

  return {
    filters,
    filteredNodes,
    filterOptions,
    updateFilter,
    applyPreset,
    resetFilters,
    hasActiveFilters,
    activePreset,
    presets: FILTER_PRESETS
  };
}
