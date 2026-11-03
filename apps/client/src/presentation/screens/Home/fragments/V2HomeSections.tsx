/**
 * RBT-096 — V2 Brutalist Mono Home Sections (Re-implementation)
 *
 * PROTOTYPE 01-home.html EXACT COPY:
 * - Events grid: 2px gap (ink background creates border effect)
 * - Cards: 3D tilt, grayscale→color on hover
 * - Categories: 4-column grid, reveal on hover
 * - Stats: ink bar, animated counters
 * - How-it-works: numbered steps
 * - Testimonials: quote cards
 * - Newsletter: email form
 * - Footer: ink background, link columns
 */
import { Pressable, Text, View, type ViewStyle } from 'react-native';

import {
  V2Reveal,
  V2EventCard,
  V2CategoryCard,
} from '@presentation/components/v2';
import { v2Colors, v2Borders, v2SpacingSemantic, interFonts } from '@presentation/theme';

import type { HomeSectionsProps } from '../interface';
import { V2HomeFooter } from './V2HomeFooter';

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY DATA (prototype .categories-grid)
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORIES = [
  {
    name: 'Konser',
    count: '150+ event',
    imageUri: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80',
  },
  {
    name: 'Festival',
    count: '45+ event',
    imageUri: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80',
  },
  {
    name: 'Olahraga',
    count: '80+ event',
    imageUri: 'https://images.unsplash.com/photo-1461896836934- voices?w=600&q=80',
  },
  {
    name: 'Theater',
    count: '35+ event',
    imageUri: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&q=80',
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION HEADER (prototype .section-header)
// ═══════════════════════════════════════════════════════════════════════════════

function V2SectionHeader({
  title,
  linkText,
  onLinkPress,
  showFilter,
  onFilterPress,
}: {
  readonly title: string;
  readonly linkText?: string;
  readonly onLinkPress?: () => void;
  readonly showFilter?: boolean;
  readonly onFilterPress?: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: v2SpacingSemantic.l,
        paddingBottom: v2SpacingSemantic.s,
        borderBottomWidth: v2Borders.standard,
        borderBottomColor: v2Colors.ink,
      }}
    >
      <Text
        accessibilityRole="header"
        style={{
          color: v2Colors.ink,
          fontSize: 24,
          fontFamily: interFonts.black, // weight 900
          textTransform: 'uppercase',
          letterSpacing: 0.48,
        }}
      >
        {title}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        {showFilter && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filter Event"
            onPress={onFilterPress}
            testID="filter-btn"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              borderWidth: v2Borders.standard,
              borderColor: v2Colors.ink,
              backgroundColor: v2Colors.ground,
              paddingVertical: 12,
              paddingHorizontal: 20,
            }}
          >
            <Text style={{ color: v2Colors.ink, fontSize: 12 }}>⚙</Text>
            <Text
              style={{
                color: v2Colors.ink,
                fontSize: 12,
                fontFamily: interFonts.bold, // weight 700
                textTransform: 'uppercase',
                letterSpacing: 0.48,
              }}
            >
              Filter
            </Text>
          </Pressable>
        )}

        {linkText && onLinkPress && (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={linkText}
            onPress={onLinkPress}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <Text
              style={{
                color: v2Colors.ink,
                fontSize: 14,
                fontFamily: interFonts.bold, // weight 700
                textTransform: 'uppercase',
                letterSpacing: 0.56,
              }}
            >
              {linkText}
            </Text>
            <Text style={{ color: v2Colors.ink, fontSize: 14, fontFamily: interFonts.bold }}>→</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTS GRID (prototype .events-grid)
// Grid with 2px gap creates border effect (ink background behind cards)
// ═══════════════════════════════════════════════════════════════════════════════

function V2EventsGrid({
  events,
  onPress,
  columns,
  history = false,
}: {
  readonly events: readonly { id: string }[];
  readonly onPress: (eventId: string) => void;
  readonly columns: 1 | 2 | 3;
  readonly history?: boolean;
}) {
  if (events.length === 0) {
    return (
      <View
        style={{
          padding: 48,
          borderWidth: v2Borders.standard,
          borderStyle: 'dashed',
          borderColor: v2Colors.ink,
        }}
      >
        <Text
          style={{
            color: v2Colors.inkMuted,
            fontSize: 14,
            textAlign: 'center',
            fontFamily: interFonts.regular, // weight 400
          }}
        >
          Belum ada event yang cocok.
        </Text>
      </View>
    );
  }

  // The prototype uses gap: 2px with background: ink to create the border effect.
  // To avoid empty cells showing black, we use a different approach:
  // - Outer container has ink border
  // - Each item has ink-colored right/bottom margin to create internal gaps
  // - Items fill to their percentage width but the wrapper clips properly
  const gapSize = 2; // 2px gap per prototype

  const gridStyle: ViewStyle = {
    borderWidth: gapSize,
    borderColor: v2Colors.ink,
    flexDirection: 'row',
    flexWrap: 'wrap',
    // Outer border frames all items; no background needed
    backgroundColor: 'transparent',
    overflow: 'hidden',
  };

  const itemStyle = (index: number): ViewStyle => {
    const isLastInRow = (index + 1) % columns === 0;
    const totalRows = Math.ceil(events.length / columns);
    const currentRow = Math.floor(index / columns) + 1;
    const isLastRow = currentRow === totalRows;

    return {
      width: `${100 / columns}%` as `${number}%`,
      // Border between items creates the ink gap effect
      borderRightWidth: isLastInRow ? 0 : gapSize,
      borderBottomWidth: isLastRow ? 0 : gapSize,
      borderColor: v2Colors.ink,
    };
  };

  return (
    <View style={gridStyle}>
      {(events as readonly any[]).map((ev, i) => (
        <View key={ev.id} style={itemStyle(i)}>
          <V2Reveal delay={i * 80}>
            <V2EventCard event={ev} onPress={onPress} history={history} />
          </V2Reveal>
        </View>
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIES GRID (prototype .categories-grid)
// 4 columns, 2px gap, reveal on hover
// ═══════════════════════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- temporarily disabled, will re-enable
function V2CategoriesGrid({ onCategoryPress }: { readonly onCategoryPress: (cat: string) => void }) {
  const columns = 4;
  const gapSize = 2;

  const gridStyle: ViewStyle = {
    backgroundColor: v2Colors.ink,
    flexDirection: 'row',
    flexWrap: 'wrap',
  };

  const itemStyle = (index: number): ViewStyle => {
    const isLastInRow = (index + 1) % columns === 0;
    return {
      width: `${100 / columns}%` as `${number}%`,
      paddingRight: isLastInRow ? 0 : gapSize,
      paddingBottom: index < CATEGORIES.length - columns ? gapSize : 0,
    };
  };

  return (
    <View style={gridStyle}>
      {CATEGORIES.map((cat, i) => (
        <View key={cat.name} style={itemStyle(i)}>
          <V2Reveal delay={i * 80}>
            <V2CategoryCard
              name={cat.name}
              count={cat.count}
              imageUri={cat.imageUri}
              onPress={() => onCategoryPress(cat.name.toLowerCase())}
              testID={`category-${cat.name.toLowerCase()}`}
            />
          </V2Reveal>
        </View>
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SECTIONS COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function V2HomeSections({
  data,
  isDesktop,
  columns,
  onPressEvent,
  onFilter,
  onFeaturedLayout,
  onHistoryLayout,
  onSeeAll,
}: HomeSectionsProps) {
  return (
    <View>
      {/* ═══════════════════════════════════════════════════════════════════════
          EVENTS SECTION (prototype #featured / .events)
          ═══════════════════════════════════════════════════════════════════════ */}
      <View
        style={{
          backgroundColor: v2Colors.field, // prototype .events { background: var(--field) }
          paddingTop: v2SpacingSemantic.xl,
          paddingHorizontal: v2SpacingSemantic.m,
          paddingBottom: v2SpacingSemantic.xl,
        }}
        onLayout={(e) => onFeaturedLayout(e.nativeEvent.layout.y)}
        testID="section-events"
      >
        <V2Reveal>
          <V2SectionHeader
            title="Event Minggu Ini"
            linkText="Lihat Semua"
            onLinkPress={onSeeAll}
            showFilter
            onFilterPress={onFilter}
          />
        </V2Reveal>

        <V2EventsGrid
          events={data.upcoming}
          onPress={onPressEvent}
          columns={columns}
        />
      </View>

      {/* ═══════════════════════════════════════════════════════════════════════
          CATEGORIES SECTION (prototype .categories)
          ═══════════════════════════════════════════════════════════════════════ */}
      {/* <View
        style={{
          paddingTop: v2SpacingSemantic.xl,
          paddingHorizontal: v2SpacingSemantic.m,
          paddingBottom: v2SpacingSemantic.xl,
        }}
        testID="section-categories"
      >
        <V2Reveal>
          <V2SectionHeader
            title="Kategori"
            linkText="Jelajahi"
            onLinkPress={() => {}}
          />
        </V2Reveal>

        <V2CategoriesGrid onCategoryPress={handleCategoryPress} />
      </View> */}

      {/* ═══════════════════════════════════════════════════════════════════════
          MARKETING SECTIONS (Stats, How-to, Testimonials, Newsletter)
          ═══════════════════════════════════════════════════════════════════════ */}
      {/* <V2HomeMarketing /> */}

      {/* ═══════════════════════════════════════════════════════════════════════
          HISTORY SECTION (prototype .events with archive styling)
          ═══════════════════════════════════════════════════════════════════════ */}
      {data.history.length > 0 && (
        <View
          style={{
            paddingTop: v2SpacingSemantic.xl,
            paddingHorizontal: v2SpacingSemantic.m,
            paddingBottom: v2SpacingSemantic.xl,
          }}
          onLayout={(e) => onHistoryLayout(e.nativeEvent.layout.y)}
          testID="section-history"
        >
          <V2Reveal>
            <V2SectionHeader title="Event Sebelumnya" />
          </V2Reveal>

          <V2EventsGrid
            events={data.history}
            onPress={onPressEvent}
            columns={columns}
            history
          />
        </View>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          FOOTER (prototype .footer)
          ═══════════════════════════════════════════════════════════════════════ */}
      <V2HomeFooter />
    </View>
  );
}

export default V2HomeSections;
