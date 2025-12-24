import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Filter, X, RotateCcw, Sparkles } from 'lucide-react';
import { NodeFilters } from '@/hooks/useNodeFilters';

interface NodeFilterPanelProps {
  filters: NodeFilters;
  filterOptions: {
    regions: string[];
    versions: string[];
    statuses: string[];
  };
  onUpdateFilter: <K extends keyof NodeFilters>(key: K, value: NodeFilters[K]) => void;
  onApplyPreset: (presetId: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  activePreset: string | null;
  presets: Array<{ id: string; name: string; description: string }>;
  resultCount: number;
  totalCount: number;
}

export function NodeFilterPanel({
  filters,
  filterOptions,
  onUpdateFilter,
  onApplyPreset,
  onReset,
  hasActiveFilters,
  activePreset,
  presets,
  resultCount,
  totalCount
}: NodeFilterPanelProps) {
  const toggleArrayFilter = <K extends keyof NodeFilters>(
    key: K,
    value: string,
    currentValues: string[]
  ) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onUpdateFilter(key, newValues as NodeFilters[K]);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <Filter className="h-4 w-4" />
          Advanced Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {resultCount}/{totalCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Filter nodes by multiple criteria to find exactly what you need
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Filter Presets */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium">Quick Presets</Label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {presets.map(preset => (
                <Button
                  key={preset.id}
                  variant={activePreset === preset.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onApplyPreset(preset.id)}
                  className="justify-start text-xs h-auto py-2 px-3"
                >
                  <div className="text-left">
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-[10px] opacity-70 font-normal">
                      {preset.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4" />

          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="IP, ID, location..."
              value={filters.search}
              onChange={(e) => onUpdateFilter('search', e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.statuses.map(status => (
                <Badge
                  key={status}
                  variant={filters.status.includes(status) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayFilter('status', status, filters.status)}
                >
                  {status}
                </Badge>
              ))}
            </div>
          </div>

          {/* Region Filter */}
          <div className="space-y-2">
            <Label>Regions ({filters.regions.length} selected)</Label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {filterOptions.regions.map(region => (
                <Badge
                  key={region}
                  variant={filters.regions.includes(region) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayFilter('regions', region, filters.regions)}
                >
                  {region}
                </Badge>
              ))}
            </div>
          </div>

          {/* Health Score Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Health Score</Label>
              <span className="text-sm text-muted-foreground">
                {filters.healthScoreMin} - {filters.healthScoreMax}
              </span>
            </div>
            <div className="space-y-2">
              <Slider
                value={[filters.healthScoreMin]}
                onValueChange={([value]) => onUpdateFilter('healthScoreMin', value)}
                max={100}
                step={5}
                className="w-full"
              />
              <Slider
                value={[filters.healthScoreMax]}
                onValueChange={([value]) => onUpdateFilter('healthScoreMax', value)}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          {/* Uptime Minimum */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Minimum Uptime</Label>
              <span className="text-sm text-muted-foreground">
                {filters.uptimeMin}%
              </span>
            </div>
            <Slider
              value={[filters.uptimeMin]}
              onValueChange={([value]) => onUpdateFilter('uptimeMin', value)}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Latency Maximum */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Maximum Latency</Label>
              <span className="text-sm text-muted-foreground">
                {filters.latencyMax}ms
              </span>
            </div>
            <Slider
              value={[filters.latencyMax]}
              onValueChange={([value]) => onUpdateFilter('latencyMax', value)}
              max={1000}
              step={50}
              className="w-full"
            />
          </div>

          {/* Storage Minimum */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Minimum Storage</Label>
              <span className="text-sm text-muted-foreground">
                {filters.storageMin} GB
              </span>
            </div>
            <Slider
              value={[filters.storageMin]}
              onValueChange={([value]) => onUpdateFilter('storageMin', value)}
              max={2000}
              step={50}
              className="w-full"
            />
          </div>

          {/* Version Filter */}
          {filterOptions.versions.length > 0 && (
            <div className="space-y-2">
              <Label>Versions ({filters.versions.length} selected)</Label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {filterOptions.versions.map(version => (
                  <Badge
                    key={version}
                    variant={filters.versions.includes(version) ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleArrayFilter('versions', version, filters.versions)}
                  >
                    {version}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sort Options */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={filters.sortBy}
                onValueChange={(value) => onUpdateFilter('sortBy', value as NodeFilters['sortBy'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthScore">Health Score</SelectItem>
                  <SelectItem value="uptime">Uptime</SelectItem>
                  <SelectItem value="latency">Latency</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="credits">Credits</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) => onUpdateFilter('sortOrder', value as 'asc' | 'desc')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Showing {resultCount} of {totalCount} nodes
              </span>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReset}
                  className="gap-2 h-8"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
