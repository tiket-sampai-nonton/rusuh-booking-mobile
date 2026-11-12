/**
 *  Brutalist Mono Lightbox Modal
 *
 * MATCHES: `.oil-ui/v2/02-event-detail.html` .lightbox
 *
 * Features:
 * - Full-screen dark overlay (95% opacity)
 * - Close button with rotate(90deg) on hover
 * - Prev/Next navigation buttons
 * - Scale animation on open
 * - Keyboard navigation (Escape, Arrow keys)
 */
import { useCallback, useEffect, useRef } from "react";
import { Animated, Modal, Platform, Text } from "react-native";
import { CachedImage } from "@presentation/components/design-system/CachedImage";

import { designDuration } from "@presentation/theme/event-design-tokens";
import { nativeDriverSupported } from "@presentation/utils/style";
import { NavButton } from "./NavButton";
import { lightboxNavButtonStyles } from "./NavButton/style";
import { lightboxStyles } from "./style";
import {
  styleForLightboxAnimatedView0,
  styleForLightboxAnimatedView1,
} from "./style";

// ═══════════════════════════════════════════════════════════════════════════════
// LIGHTBOX COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface LightboxProps {
  readonly images: readonly string[];
  readonly fallbackUri?: string;
  readonly currentIndex: number;
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onNavigate: (index: number) => void;
}

export function Lightbox({
  images,
  fallbackUri,
  currentIndex,
  visible,
  onClose,
  onNavigate,
}: LightboxProps) {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Open/close animations
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: designDuration.normal,
          useNativeDriver: nativeDriverSupported(),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: designDuration.normal,
          useNativeDriver: nativeDriverSupported(),
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible, fadeAnim, scaleAnim]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onNavigate(prevIndex);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onNavigate(nextIndex);
  }, [currentIndex, images.length, onNavigate]);

  // Keyboard navigation (web only)
  useEffect(() => {
    if (Platform.OS !== "web" || !visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          handlePrev();
          break;
        case "ArrowRight":
          handleNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, onClose, handlePrev, handleNext]);

  const currentImage = images[currentIndex];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          lightboxStyles.container,
          styleForLightboxAnimatedView0(fadeAnim),
        ]}
      >
        {/* Close Button */}
        <NavButton
          kind="close"
          onPress={onClose}
          style={lightboxNavButtonStyles.close}
          accessibilityLabel="Tutup galeri foto"
        />

        {/* Prev Button */}
        {images.length > 1 && (
          <NavButton
            kind="previous"
            onPress={handlePrev}
            style={[
              lightboxNavButtonStyles.navigation,
              lightboxNavButtonStyles.previous,
            ]}
            accessibilityLabel="Gambar sebelumnya"
          />
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <NavButton
            kind="next"
            onPress={handleNext}
            style={[
              lightboxNavButtonStyles.navigation,
              lightboxNavButtonStyles.next,
            ]}
            accessibilityLabel="Gambar selanjutnya"
          />
        )}

        {/* Image Content */}
        <Animated.View
          style={[
            lightboxStyles.content,
            styleForLightboxAnimatedView1(scaleAnim),
          ]}
        >
          <CachedImage
            source={{ uri: currentImage, memoryCache: false }}
            fallbackSource={fallbackUri ? { uri: fallbackUri } : undefined}
            style={lightboxStyles.image}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </Animated.View>

        {/* Image Counter */}
        <Text style={lightboxStyles.counter}>
          {currentIndex + 1} / {images.length}
        </Text>
      </Animated.View>
    </Modal>
  );
}
