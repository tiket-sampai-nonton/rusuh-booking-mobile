/**
 * RBT-096 — V2 Home Footer
 *
 * MASTER-SPEC + prototype 01-home.html EXACT COPY:
 *
 * FOOTER (.footer):
 * - Background: ink (#000), text: ground (#fff)
 * - footer-grid: 4 columns (brand + 3 link sections)
 * - footer-brand: logo + description paragraph
 * - footer-title: text-s, font-800, uppercase, letter-spacing 0.08em, margin-bottom space-m
 * - footer-links: list of links, underline on hover
 * - footer-bottom: copyright + social links, border-top
 * - social-link: 40x40, border white, hover fills circle → square + inverts color
 *
 * Animations:
 * - Links: underline slides from left on hover
 * - Social icons: scale + fill animation
 */
import { useCallback } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { V2Reveal, useV2Toast } from '@presentation/components/v2';
import { v2Colors, v2Borders, v2Duration, v2Easing, v2SpacingSemantic, interFonts } from '@presentation/theme';

const EASE = Easing.bezier(...v2Easing.primary);

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════

const LINK_COLUMNS = [
  {
    title: 'Event',
    links: [
      { label: 'Konser', href: '/browse?cat=konser' },
      { label: 'Festival', href: '/browse?cat=festival' },
      { label: 'Olahraga', href: '/browse?cat=olahraga' },
      { label: 'Teater', href: '/browse?cat=theater' },
    ],
  },
  {
    title: 'Bantuan',
    links: [
      { label: 'Pusat Bantuan', href: '#' },
      { label: 'Cara Beli', href: '#' },
      { label: 'Pembayaran', href: '#' },
      { label: 'Pengembalian Dana', href: '#' },
    ],
  },
  {
    title: 'Perusahaan',
    links: [
      { label: 'Tentang Kami', href: '#' },
      { label: 'Karir', href: '#' },
      { label: 'Media', href: '#' },
      { label: 'Kontak', href: '#' },
    ],
  },
] as const;

const SOCIAL_LINKS = [
  { label: 'IG', name: 'Instagram', handle: '@rusuhtiket' },
  { label: 'TW', name: 'Twitter', handle: '@rusuhtiket' },
  { label: 'FB', name: 'Facebook', handle: 'Rusuh Tiket' },
  { label: 'YT', name: 'YouTube', handle: 'Rusuh Tiket Official' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// FOOTER LINK (with underline hover animation)
// ═══════════════════════════════════════════════════════════════════════════════

function V2FooterLink({
  label,
  href,
}: {
  readonly label: string;
  readonly href: string;
}) {
  const reducedMotion = useReducedMotion();
  const hovered = useSharedValue(0);

  const setHovered = useCallback(
    (v: boolean) => {
      if (reducedMotion) {
        hovered.value = v ? 1 : 0;
        return;
      }
      hovered.value = withTiming(v ? 1 : 0, { duration: v2Duration.fast, easing: EASE });
    },
    [reducedMotion, hovered],
  );

  // Underline: scaleX 0 → 1 from left
  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: interpolate(hovered.value, [0, 1], [0, 1]) }],
  }));

  const handlePress = useCallback(() => {
    if (href.startsWith('/')) {
      // Internal navigation - would use router in real app
      console.log('Navigate to:', href);
    } else if (href !== '#') {
      Linking.openURL(href);
    }
  }, [href]);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={handlePress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={{ marginBottom: 12 }}
    >
      <View style={{ position: 'relative' }}>
        <Text
          style={{
            color: v2Colors.ground,
            fontSize: 14,
            fontFamily: interFonts.bold,
            opacity: 0.8,
          }}
        >
          {label}
        </Text>

        {/* Underline */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: -2,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: v2Colors.ground,
              transformOrigin: 'left',
            },
            underlineStyle,
          ]}
        />
      </View>
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOCIAL LINK (circle → square fill animation)
// ═══════════════════════════════════════════════════════════════════════════════

function V2SocialLink({
  label,
  name,
  handle,
}: {
  readonly label: string;
  readonly name: string;
  readonly handle: string;
}) {
  const toast = useV2Toast();
  const reducedMotion = useReducedMotion();
  const hovered = useSharedValue(0);

  const setHovered = useCallback(
    (v: boolean) => {
      if (reducedMotion) {
        hovered.value = v ? 1 : 0;
        return;
      }
      hovered.value = withTiming(v ? 1 : 0, { duration: v2Duration.normal, easing: EASE });
    },
    [reducedMotion, hovered],
  );

  // Fill circle: scale 0 → 1.5, borderRadius 50% → 0
  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(hovered.value, [0, 1], [0, 1.5]) }],
    borderRadius: interpolate(hovered.value, [0, 1], [20, 0]),
  }));

  // Border: white → transparent on hover
  const containerStyle = useAnimatedStyle(() => ({
    borderColor:
      hovered.value > 0.5 ? 'transparent' : v2Colors.ground,
  }));

  // Text: white → ink on hover
  const textStyle = useAnimatedStyle(() => ({
    color: hovered.value > 0.5 ? v2Colors.ink : v2Colors.ground,
  }));

  const handlePress = useCallback(() => {
    toast.show(`${name}: ${handle}`, 'default');
  }, [toast, name, handle]);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${name}: ${handle}`}
      onPress={handlePress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      <Animated.View
        style={[
          {
            width: 40,
            height: 40,
            borderWidth: v2Borders.standard,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          },
          containerStyle,
        ]}
      >
        {/* Fill circle */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: 40,
              height: 40,
              backgroundColor: v2Colors.ground,
            },
            fillStyle,
          ]}
        />

        {/* Label */}
        <Animated.Text
          style={[
            {
              fontSize: 14,
              fontWeight: '700',
              fontFamily: interFonts.bold,
              zIndex: 1,
            },
            textStyle,
          ]}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FOOTER
// ═══════════════════════════════════════════════════════════════════════════════

export function V2HomeFooter() {
  return (
    <View
      style={{
        backgroundColor: v2Colors.ink,
        paddingTop: v2SpacingSemantic.xl,
        paddingHorizontal: v2SpacingSemantic.m,
      }}
      testID="footer"
    >
      {/* Main Grid */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: v2SpacingSemantic.l,
          marginBottom: v2SpacingSemantic.xl,
        }}
      >
        {/* Brand Column */}
        <V2Reveal>
          <View style={{ flex: 1, minWidth: 280 }}>
            <Text
              style={{
                color: v2Colors.ground,
                fontSize: 20,
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: -0.4,
                fontFamily: interFonts.bold,
                marginBottom: v2SpacingSemantic.m,
              }}
            >
              Rusuh Tiket
            </Text>

            <Text
              style={{
                color: v2Colors.ground,
                fontSize: 14,
                lineHeight: 22.4,
                opacity: 0.7,
                fontFamily: interFonts.bold,
                maxWidth: 300,
              }}
            >
              Platform tiket event terpercaya di Indonesia. Beli tiket konser, festival, olahraga, dan teater dengan mudah dan aman.
            </Text>
          </View>
        </V2Reveal>

        {/* Link Columns */}
        {LINK_COLUMNS.map((column, i) => (
          <V2Reveal key={column.title} delay={(i + 1) * 80}>
            <View style={{ minWidth: 140 }}>
              <Text
                style={{
                  color: v2Colors.ground,
                  fontSize: 12,
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: 0.96, // 0.08em
                  fontFamily: interFonts.bold,
                  marginBottom: v2SpacingSemantic.m,
                }}
              >
                {column.title}
              </Text>

              {column.links.map((link) => (
                <V2FooterLink key={link.label} label={link.label} href={link.href} />
              ))}
            </View>
          </V2Reveal>
        ))}
      </View>

      {/* Bottom Bar */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: v2SpacingSemantic.m,
          paddingTop: v2SpacingSemantic.l,
          paddingBottom: v2SpacingSemantic.l,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.2)',
        }}
      >
        {/* Copyright */}
        <Text
          style={{
            color: v2Colors.ground,
            fontSize: 14,
            opacity: 0.6,
            fontFamily: interFonts.bold,
          }}
        >
          © 2025 Rusuh Tiket. Hak cipta dilindungi.
        </Text>

        {/* Social Links */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {SOCIAL_LINKS.map((social) => (
            <V2SocialLink
              key={social.label}
              label={social.label}
              name={social.name}
              handle={social.handle}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export default V2HomeFooter;
