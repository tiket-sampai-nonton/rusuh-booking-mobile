import { Pressable, Text, View, Platform } from 'react-native';

import { browseCountText, browseCountValue, browseFilterButton, browseHeader, browseNativeHeader, browseNativeViewButton, browseSortControl, browseSortSelect, browseToolbarActions, browseViewBtn, browseViewBtnActive, browseViewDivider, browseViewToggle } from '../../style';
import { FilterIcon } from './icons/FilterIcon';
import { GridIcon } from './icons/GridIcon';
import { ListIcon } from './icons/ListIcon';

const SORT_OPTIONS = [
  { key: 'date', label: 'Urutkan Berdasarkan Tanggal' },
  { key: 'price-low', label: 'Harga Terendah' },
  { key: 'price-high', label: 'Harga Tertinggi' },
  { key: 'popular', label: 'Paling Populer' },
] as const;

interface BrowseResultsToolbarProps {
  readonly count: number;
  readonly isNative: boolean;
  readonly sortBy: string;
  readonly viewMode: 'grid' | 'list';
  readonly onFilterPress: () => void;
  readonly onSortChange: (sort: string) => void;
  readonly onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function BrowseResultsToolbar({
  count,
  isNative,
  sortBy,
  viewMode,
  onFilterPress,
  onSortChange,
  onViewModeChange,
}: BrowseResultsToolbarProps) {
  return (
    <View style={[browseHeader, isNative && browseNativeHeader]}>
      <Text style={browseCountText} testID="browse-count">
        Menampilkan <Text style={browseCountValue}>{count}</Text> event
      </Text>
      <View style={browseToolbarActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Saring event"
          onPress={onFilterPress}
          style={browseFilterButton}
          testID="browse-filter"
        >
          <FilterIcon />
        </Pressable>
        {Platform.OS === 'web' ? (
          <View style={browseSortSelect}>
            <select
              aria-label="Urutkan event"
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value)}
              style={browseSortControl}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>{option.label}</option>
              ))}
            </select>
          </View>
        ) : null}
        <View style={browseViewToggle}>
          <Pressable
            style={[viewMode === 'grid' ? browseViewBtnActive : browseViewBtn, isNative && browseNativeViewButton]}
            onPress={() => onViewModeChange('grid')}
            testID="view-grid"
          >
            <GridIcon active={viewMode === 'grid'} />
          </Pressable>
          <View style={browseViewDivider} />
          <Pressable
            style={[viewMode === 'list' ? browseViewBtnActive : browseViewBtn, isNative && browseNativeViewButton]}
            onPress={() => onViewModeChange('list')}
            testID="view-list"
          >
            <ListIcon active={viewMode === 'list'} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
