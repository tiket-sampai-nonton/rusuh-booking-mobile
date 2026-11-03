/**
 * RBT-096 — V2 Home Marketing Sections
 *
 * MASTER-SPEC §3.1 + prototype 01-home.html EXACT COPY:
 *
 * STATS SECTION (.stats):
 * - Background: #000 (ink), text: #fff (ground)
 * - Counter animation on scroll into view
 * - Stagger: each stat delays 0.1s
 * - stat-number: clamp(2.5rem, 6vw, 4rem), font-900, tabular-nums
 * - stat-label: text-s, font-500, opacity 0.7, uppercase, letter-spacing 0.08em
 *
 * HOW IT WORKS (.how-it-works / .steps-grid):
 * - 4-column grid, 2px gap (ink background)
 * - step-number: clamp(4rem, 10vw, 8rem), font-900, opacity 0.08 → 0.15 on hover
 * - step-title: text-m, font-800, uppercase
 * - step-desc: text-s, color muted
 * - ::before bar: top 0, height 4px, scaleX 0 → 1 on hover
 * - Arrow between steps (→)
 *
 * TESTIMONIALS (.testimonials):
 * - Background: field (#f5f5f5), 3-column grid, 2px gap
 * - Card: hover inverts to ink bg + ground text
 * - Quote: ::before = " with opacity 0.2
 * - Avatar: grayscale 100% → 0% on hover
 *
 * NEWSLETTER (.newsletter):
 * - Centered, section-header without border-bottom
 * - Input + button combo, max-width 500px
 * - Input: field bg, border, focus: inset shadow
 * - Success: green bg + border
 */
import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { V2Reveal, useV2Toast } from '@presentation/components/v2';
import { v2Colors, v2Borders, v2Duration, v2Easing, v2SpacingSemantic, interFonts } from '@presentation/theme';

const EASE = Easing.bezier(...v2Easing.primary);

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════

interface StatItem {
  target: number;
  suffix: string;
  label: string;
  decimal?: number;
}

const STATS: StatItem[] = [
  { target: 2_500_000, suffix: '+', label: 'Tiket Terjual' },
  { target: 500, suffix: '+', label: 'Partner Event' },
  { target: 1_000_000, suffix: '+', label: 'Pengguna Aktif' },
  { target: 99.9, suffix: '%', label: 'Transaksi Aman', decimal: 1 },
];

const STEPS = [
  { number: '01', title: 'Pilih Event', desc: 'Cari dan pilih event yang ingin kamu hadiri dari berbagai kategori' },
  { number: '02', title: 'Pilih Tiket', desc: 'Tentukan kategori kursi dan jumlah tiket sesuai kebutuhan' },
  { number: '03', title: 'Bayar', desc: 'Selesaikan pembayaran dengan metode pilihanmu secara aman' },
  { number: '04', title: 'Masuk Venue', desc: 'Tunjukkan e-ticket di pintu masuk dan nikmati acaranya' },
] as const;

const TESTIMONIALS = [
  {
    text: 'Proses beli tiket cepat banget, langsung masuk ke email. Gak perlu antre panjang lagi di lokasi.',
    name: 'Rina Putri',
    role: 'Jakarta',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
  },
  {
    text: 'Sudah beli 10+ tiket di Rusuh Tiket. Harga kompetitif dan sering ada promo menarik setiap bulan.',
    name: 'Dimas Prakoso',
    role: 'Bandung',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
  },
  {
    text: 'Customer service responsif. Waktu ada kendala pembayaran, langsung ditangani dengan cepat dan profesional.',
    name: 'Sarah Amelia',
    role: 'Surabaya',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// STATS SECTION
// Counter animation + stagger reveal
// ═══════════════════════════════════════════════════════════════════════════════

function V2StatsSection() {
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  // Create shared values for each counter (fixed count, hooks called unconditionally)
  const counter0 = useSharedValue(0);
  const counter1 = useSharedValue(0);
  const counter2 = useSharedValue(0);
  const counter3 = useSharedValue(0);
  const counters = [counter0, counter1, counter2, counter3];

  useEffect(() => {
    if (visible && !reducedMotion) {
      STATS.forEach((stat, i) => {
        counters[i].value = withDelay(
          i * 100, // Stagger 0.1s
          withTiming(stat.target, { duration: 2000, easing: EASE }),
        );
      });
    } else if (visible && reducedMotion) {
      STATS.forEach((stat, i) => {
        counters[i].value = stat.target;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- counters is a fixed array
  }, [visible, reducedMotion, counter0, counter1, counter2, counter3]);

  return (
    <View
      style={{
        backgroundColor: v2Colors.ink,
        paddingVertical: v2SpacingSemantic.xl,
        paddingHorizontal: v2SpacingSemantic.m,
      }}
      onLayout={() => setVisible(true)}
      testID="section-stats"
    >
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
          gap: v2SpacingSemantic.l,
        }}
      >
        {STATS.map((stat, i) => (
          <V2StatItem
            key={stat.label}
            stat={stat}
            counter={counters[i]}
            delay={i * 100}
            visible={visible}
          />
        ))}
      </View>
    </View>
  );
}

function V2StatItem({
  stat,
  counter,
  delay,
  visible,
}: {
  readonly stat: StatItem;
  readonly counter: Animated.SharedValue<number>;
  readonly delay: number;
  readonly visible: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    if (visible) {
      if (reducedMotion) {
        opacity.value = 1;
        translateY.value = 0;
      } else {
        opacity.value = withDelay(delay, withTiming(1, { duration: v2Duration.slow, easing: EASE }));
        translateY.value = withDelay(delay, withTiming(0, { duration: v2Duration.slow, easing: EASE }));
      }
    }
  }, [visible, reducedMotion, delay, opacity, translateY]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // Display with suffix
  const [displayValue, setDisplayValue] = useState('0');
  
  // Update display value when counter changes
  useEffect(() => {
    const id = setInterval(() => {
      const val = counter.value;
      if (stat.decimal != null) {
        setDisplayValue(val.toFixed(stat.decimal));
      } else {
        setDisplayValue(Math.floor(val).toLocaleString('id-ID'));
      }
    }, 16); // ~60fps
    return () => clearInterval(id);
  }, [counter, stat.decimal]);

  return (
    <Animated.View
      style={[
        {
          alignItems: 'center',
          minWidth: 120,
        },
        containerStyle,
      ]}
    >
      <Text
        style={{
          color: v2Colors.ground,
          fontSize: 48,
          fontWeight: '900',
          lineHeight: 56,
          fontVariant: ['tabular-nums'],
          fontFamily: interFonts.bold,
        }}
      >
        {displayValue}{stat.suffix}
      </Text>
      <Text
        style={{
          color: v2Colors.ground,
          fontSize: 14,
          fontWeight: '500',
          opacity: 0.7,
          textTransform: 'uppercase',
          letterSpacing: 1.12, // 0.08em
          fontFamily: interFonts.bold,
          marginTop: 8,
        }}
      >
        {stat.label}
      </Text>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOW IT WORKS SECTION
// 4-column grid, numbered steps, arrow connectors
// ═══════════════════════════════════════════════════════════════════════════════

function V2HowItWorksSection() {
  return (
    <View
      style={{
        paddingTop: v2SpacingSemantic.xl,
        paddingHorizontal: v2SpacingSemantic.m,
        paddingBottom: v2SpacingSemantic.xl,
      }}
      testID="section-how-it-works"
    >
      {/* Section Header */}
      <V2Reveal>
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
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: 0.48,
              fontFamily: interFonts.bold,
            }}
          >
            Cara Beli Tiket
          </Text>
        </View>
      </V2Reveal>

      {/* Steps Grid */}
      <View
        style={{
          backgroundColor: v2Colors.ink, // Gap color
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {STEPS.map((step, i) => (
          <View
            key={step.number}
            style={{
              width: '25%',
              paddingRight: i < STEPS.length - 1 ? 2 : 0,
            }}
          >
            <V2Reveal delay={i * 80}>
              <V2StepCard step={step} isLast={i === STEPS.length - 1} />
            </V2Reveal>
          </View>
        ))}
      </View>
    </View>
  );
}

function V2StepCard({
  step,
  isLast,
}: {
  readonly step: (typeof STEPS)[number];
  readonly isLast: boolean;
}) {
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

  // Top bar: scaleX 0 → 1 on hover
  const barStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: interpolate(hovered.value, [0, 1], [0, 1]) }],
  }));

  // Number: opacity 0.08 → 0.15, translateX 0 → -10 on hover
  const numberStyle = useAnimatedStyle(() => ({
    opacity: interpolate(hovered.value, [0, 1], [0.08, 0.15]),
    transform: [{ translateX: interpolate(hovered.value, [0, 1], [0, -10]) }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={{
        backgroundColor: v2Colors.ground,
        padding: v2SpacingSemantic.l,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top bar animation */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: v2Colors.ink,
            transformOrigin: 'left',
          },
          barStyle,
        ]}
      />

      {/* Step number */}
      <Animated.Text
        style={[
          {
            color: v2Colors.ink,
            fontSize: 80,
            fontWeight: '900',
            lineHeight: 64,
            marginBottom: v2SpacingSemantic.s,
            fontFamily: interFonts.bold,
          },
          numberStyle,
        ]}
      >
        {step.number}
      </Animated.Text>

      {/* Title */}
      <Text
        style={{
          color: v2Colors.ink,
          fontSize: 16,
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: 0.32, // 0.02em
          marginBottom: v2SpacingSemantic.xs,
          fontFamily: interFonts.bold,
        }}
      >
        {step.title}
      </Text>

      {/* Description */}
      <Text
        style={{
          color: v2Colors.inkMuted,
          fontSize: 14,
          lineHeight: 22.4, // 1.6
          fontFamily: interFonts.bold,
        }}
      >
        {step.desc}
      </Text>

      {/* Arrow connector (not on last) */}
      {!isLast && (
        <View
          style={{
            position: 'absolute',
            right: -12,
            top: '50%',
            transform: [{ translateY: -12 }],
            zIndex: 1,
          }}
        >
          <Text
            style={{
              color: v2Colors.ground,
              fontSize: 24,
              fontWeight: '900',
              fontFamily: interFonts.bold,
            }}
          >
            →
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTIMONIALS SECTION
// 3-column grid, hover inverts colors, grayscale avatar
// ═══════════════════════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- temporarily disabled, will re-enable
function V2TestimonialsSection() {
  return (
    <View
      style={{
        backgroundColor: v2Colors.field,
        paddingTop: v2SpacingSemantic.xl,
        paddingHorizontal: v2SpacingSemantic.m,
        paddingBottom: v2SpacingSemantic.xl,
      }}
      testID="section-testimonials"
    >
      {/* Section Header */}
      <V2Reveal>
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
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: 0.48,
              fontFamily: interFonts.bold,
            }}
          >
            Kata Mereka
          </Text>
        </View>
      </V2Reveal>

      {/* Testimonials Grid */}
      <View
        style={{
          backgroundColor: v2Colors.ink, // Gap color
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {TESTIMONIALS.map((testimonial, i) => (
          <View
            key={testimonial.name}
            style={{
              width: '33.333%',
              paddingRight: i < TESTIMONIALS.length - 1 ? 2 : 0,
            }}
          >
            <V2Reveal delay={i * 80}>
              <V2TestimonialCard testimonial={testimonial} />
            </V2Reveal>
          </View>
        ))}
      </View>
    </View>
  );
}

function V2TestimonialCard({
  testimonial,
}: {
  readonly testimonial: (typeof TESTIMONIALS)[number];
}) {
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

  // Card background: ground → ink on hover
  const cardStyle = useAnimatedStyle(() => ({
    backgroundColor:
      hovered.value > 0.5 ? v2Colors.ink : v2Colors.ground,
  }));

  // Text color: ink → ground on hover
  const textStyle = useAnimatedStyle(() => ({
    color: hovered.value > 0.5 ? v2Colors.ground : v2Colors.ink,
  }));

  // Role color: muted → semi-transparent white on hover
  const roleStyle = useAnimatedStyle(() => ({
    color: hovered.value > 0.5 ? 'rgba(255,255,255,0.6)' : v2Colors.inkMuted,
  }));

  // Avatar: grayscale 100% → 0% on hover (use opacity overlay)
  const avatarOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(hovered.value, [0, 1], [1, 0]),
  }));

  return (
    <Pressable
      accessibilityRole="button"
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      <Animated.View
        style={[
          {
            padding: v2SpacingSemantic.l,
          },
          cardStyle,
        ]}
      >
        {/* Quote text with decorative " */}
        <View style={{ position: 'relative', paddingLeft: v2SpacingSemantic.m }}>
          {/* Quote mark */}
          <Text
            style={{
              position: 'absolute',
              left: 0,
              top: -5,
              fontSize: 48,
              fontWeight: '900',
              lineHeight: 48,
              opacity: 0.2,
              color: v2Colors.ink,
              fontFamily: interFonts.bold,
            }}
          >
            "
          </Text>

          <Animated.Text
            style={[
              {
                fontSize: 16,
                lineHeight: 27.2, // 1.7
                marginBottom: v2SpacingSemantic.m,
                fontFamily: interFonts.bold,
              },
              textStyle,
            ]}
          >
            {testimonial.text}
          </Animated.Text>
        </View>

        {/* Author info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: v2SpacingSemantic.s }}>
          {/* Avatar with grayscale effect */}
          <View style={{ width: 48, height: 48, position: 'relative', overflow: 'hidden' }}>
            <Image
              source={{ uri: testimonial.avatar }}
              style={{ width: '100%', height: '100%' }}
              accessibilityIgnoresInvertColors
            />
            {/* Grayscale overlay */}
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: v2Colors.ink,
                },
                avatarOverlayStyle,
              ]}
            />
          </View>

          <View>
            <Animated.Text
              style={[
                {
                  fontWeight: '700',
                  fontSize: 14,
                  fontFamily: interFonts.bold,
                },
                textStyle,
              ]}
            >
              {testimonial.name}
            </Animated.Text>
            <Animated.Text
              style={[
                {
                  fontSize: 12,
                  fontFamily: interFonts.bold,
                },
                roleStyle,
              ]}
            >
              {testimonial.role}
            </Animated.Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEWSLETTER SECTION
// Centered form with animated input
// ═══════════════════════════════════════════════════════════════════════════════

function V2NewsletterSection() {
  const toast = useV2Toast();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [focused, setFocused] = useState(false);

  const handleSubmit = useCallback(() => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      toast.show('Email tidak valid', 'error');
      return;
    }

    // Simulate success
    setStatus('success');
    toast.show('Berhasil mendaftar newsletter!', 'success');
    setEmail('');
    setTimeout(() => setStatus('idle'), 3000);
  }, [email, toast]);

  const inputBgColor = status === 'success' ? v2Colors.field : v2Colors.field;
  const inputBorderColor = status === 'success' ? v2Colors.success : status === 'error' ? v2Colors.danger : v2Colors.ink;

  return (
    <View
      style={{
        paddingTop: v2SpacingSemantic.xl,
        paddingHorizontal: v2SpacingSemantic.m,
        paddingBottom: v2SpacingSemantic.xl,
        alignItems: 'center',
      }}
      testID="section-newsletter"
    >
      {/* Section Header (centered, no border) */}
      <V2Reveal>
        <Text
          accessibilityRole="header"
          style={{
            color: v2Colors.ink,
            fontSize: 24,
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: 0.48,
            fontFamily: interFonts.bold,
            textAlign: 'center',
            marginBottom: v2SpacingSemantic.xs,
          }}
        >
          Dapatkan Info Event Terbaru
        </Text>
      </V2Reveal>

      <V2Reveal delay={80}>
        <Text
          style={{
            color: v2Colors.inkMuted,
            fontSize: 16,
            fontFamily: interFonts.bold,
            textAlign: 'center',
            marginBottom: v2SpacingSemantic.l,
          }}
        >
          Daftar newsletter dan jangan lewatkan event favoritmu
        </Text>
      </V2Reveal>

      {/* Form */}
      <V2Reveal delay={160}>
        <View
          style={{
            flexDirection: 'row',
            maxWidth: 500,
            width: '100%',
          }}
        >
          <TextInput
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Alamat email kamu"
            placeholderTextColor={v2Colors.inkMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            accessibilityLabel="Email untuk newsletter"
            style={{
              flex: 1,
              paddingHorizontal: 20,
              paddingVertical: 16,
              backgroundColor: inputBgColor,
              borderWidth: v2Borders.standard,
              borderRightWidth: 0,
              borderColor: inputBorderColor,
              fontSize: 16,
              fontFamily: interFonts.bold,
              color: v2Colors.ink,
              // Focus style: inset shadow effect
              ...(focused && status === 'idle' && {
                backgroundColor: v2Colors.ground,
                shadowColor: v2Colors.ink,
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
              }),
            }}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Daftar newsletter"
            onPress={handleSubmit}
            style={{
              backgroundColor: v2Colors.ink,
              borderWidth: v2Borders.standard,
              borderLeftWidth: 0,
              borderColor: v2Colors.ink,
              paddingHorizontal: 24,
              paddingVertical: 16,
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: v2Colors.ground,
                fontSize: 16,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 0.64,
                fontFamily: interFonts.bold,
              }}
            >
              Daftar
            </Text>
          </Pressable>
        </View>
      </V2Reveal>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export function V2HomeMarketing() {
  return (
    <View>
      <V2StatsSection />
      <V2HowItWorksSection />
      {/* <V2TestimonialsSection /> */}
      <V2NewsletterSection />
    </View>
  );
}

export default V2HomeMarketing;
