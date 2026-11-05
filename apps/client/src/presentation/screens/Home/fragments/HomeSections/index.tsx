/** Home screen sections composed from screen-owned fragments. */
import { View } from 'react-native';
import { Reveal } from '@presentation/components/design-system';
import { useResponsive } from '@presentation/hooks/useResponsive';
import { HomeFooter } from '../HomeFooter';
import type { HomeSectionsProps } from '../../interface';
import { EventsGrid } from './fragments/EventsGrid';
import { EventsHorizontalScroll } from './fragments/EventsHorizontalScroll';
import { SectionHeader } from './fragments/SectionHeader';
import { homeSectionsStyles } from './style';

export function HomeSections({
  data,
  columns,
  onPressEvent,
  onFilter,
  onFeaturedLayout,
  onHistoryLayout,
  onSeeAll,
  onNavigate,
}: HomeSectionsProps) {
  const { isNative } = useResponsive();

  return (
    <View>
      <View
        style={homeSectionsStyles.featuredSection(isNative)}
        onLayout={(event) => onFeaturedLayout(event.nativeEvent.layout.y)}
        testID="section-events"
      >
        <Reveal>
          <SectionHeader
            title="Daftar Event"
            linkText="Lihat Semua"
            onLinkPress={onSeeAll}
            showFilter={!isNative}
            onFilterPress={onFilter}
            isNative={isNative}
          />
        </Reveal>
        {isNative ? (
          <EventsHorizontalScroll events={data.upcoming} onPress={onPressEvent} />
        ) : (
          <EventsGrid events={data.upcoming} onPress={onPressEvent} columns={columns} />
        )}
      </View>

      {data.history.length > 0 && (
        <View
          style={homeSectionsStyles.historySection}
          onLayout={(event) => onHistoryLayout(event.nativeEvent.layout.y)}
          testID="section-history"
        >
          <Reveal>
            <SectionHeader title="Event Sebelumnya" />
          </Reveal>
          {isNative ? (
            <EventsHorizontalScroll events={data.history} onPress={onPressEvent} />
          ) : (
            <EventsGrid events={data.history} onPress={onPressEvent} columns={columns} history />
          )}
        </View>
      )}

      {!isNative && <HomeFooter onNavigate={onNavigate} />}
    </View>
  );
}

export default HomeSections;
