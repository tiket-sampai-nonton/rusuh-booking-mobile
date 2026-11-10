/** Home screen sections composed from screen-owned fragments. */
import { View } from "react-native";
import { Reveal } from "@presentation/components/design-system";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { HomeFooter } from "../HomeFooter";
import type { HomeSectionsProps } from "../../interface";
import { EventsGrid } from "./fragments/EventsGrid";
import { EventsHorizontalScroll } from "./fragments/EventsHorizontalScroll";
import { SectionHeader } from "./fragments/SectionHeader";
import { homeSectionsStyles } from "./style";

const UPCOMING_PREVIEW_LIMIT = 8;
const HISTORY_PREVIEW_LIMIT = 4;

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
  const { isNative, isMobileWeb } = useResponsive();
  const upcomingPreview = data.upcoming.slice(0, UPCOMING_PREVIEW_LIMIT);
  const historyPreview = data.history.slice(0, HISTORY_PREVIEW_LIMIT);

  return (
    <View>
      <View
        style={homeSectionsStyles.featuredSection(isNative, isMobileWeb)}
        onLayout={(event) => onFeaturedLayout(event.nativeEvent.layout.y)}
        testID="section-events"
      >
        <Reveal>
          <SectionHeader
            title={isMobileWeb ? "Event populer" : "Daftar Event"}
            linkText="Lihat Semua"
            onLinkPress={onSeeAll}
            showFilter={!isNative}
            onFilterPress={onFilter}
            isNative={isNative}
            isMobileWeb={isMobileWeb}
          />
        </Reveal>
        {isNative ? (
          <EventsHorizontalScroll
            events={upcomingPreview}
            onPress={onPressEvent}
          />
        ) : (
          <EventsGrid
            events={upcomingPreview}
            onPress={onPressEvent}
            columns={columns}
          />
        )}
      </View>

      {historyPreview.length > 0 && (
        <View
          style={homeSectionsStyles.historySection(isMobileWeb)}
          onLayout={(event) => onHistoryLayout(event.nativeEvent.layout.y)}
          testID="section-history"
        >
          <Reveal>
            <SectionHeader
              title={isMobileWeb ? "Event sebelumnya" : "Event Sebelumnya"}
              linkText="Lihat Semua"
              onLinkPress={() => onNavigate("/history")}
              isNative={isNative}
              isMobileWeb={isMobileWeb}
            />
          </Reveal>
          {isNative ? (
            <EventsHorizontalScroll
              events={historyPreview}
              onPress={onPressEvent}
            />
          ) : (
            <EventsGrid
              events={historyPreview}
              onPress={onPressEvent}
              columns={columns}
              history
            />
          )}
        </View>
      )}

      {!isNative && <HomeFooter onNavigate={onNavigate} />}
    </View>
  );
}

export default HomeSections;
