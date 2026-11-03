/**
 * V2 Brutalist Mono Lightbox Modal
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
import {
  Animated,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

import { interFonts } from "@presentation/theme/fonts";
import {
  v2Colors,
  v2Duration,
  v2FontSizes,
  v2SpacingSemantic,
} from "@presentation/theme/v2-tokens";

// ═══════════════════════════════════════════════════════════════════════════════
// LIGHTBOX COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface LightboxProps {
  readonly images: readonly string[];
  readonly currentIndex: number;
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onNavigate: (index: number) => void;
}

export function Lightbox({
  images,
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
          duration: v2Duration.normal,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: v2Duration.normal,
          useNativeDriver: true,
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
      <Animated.View style={[lightboxStyles.container, { opacity: fadeAnim }]}>
        {/* Close Button */}
        <NavButton
          label="×"
          onPress={onClose}
          style={lightboxStyles.closeBtn}
          accessibilityLabel="Tutup lightbox"
        />

        {/* Prev Button */}
        {images.length > 1 && (
          <NavButton
            label="←"
            onPress={handlePrev}
            style={[lightboxStyles.navBtn, lightboxStyles.navBtnPrev]}
            accessibilityLabel="Gambar sebelumnya"
          />
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <NavButton
            label="→"
            onPress={handleNext}
            style={[lightboxStyles.navBtn, lightboxStyles.navBtnNext]}
            accessibilityLabel="Gambar selanjutnya"
          />
        )}

        {/* Image Content */}
        <Animated.View
          style={[
            lightboxStyles.content,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Image
            source={{ uri: currentImage }}
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

// ═══════════════════════════════════════════════════════════════════════════════
// NAV BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface NavButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly style?: any;
  readonly accessibilityLabel: string;
}

function NavButton({ label, onPress, style, accessibilityLabel }: NavButtonProps) {
  return (
    <Pressable
      style={({ hovered }) => [
        lightboxStyles.btn,
        style,
        hovered && lightboxStyles.btnHover,
        hovered && label === "×" && lightboxStyles.closeBtnHover,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {({ hovered }) => (
        <Text
          style={[
            lightboxStyles.btnText,
            hovered && lightboxStyles.btnTextHover,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const lightboxStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  btn: {
    position: "absolute",
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: v2Colors.ground,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  btnHover: {
    backgroundColor: v2Colors.ground,
  },
  btnText: {
    fontFamily: interFonts.bold,
    fontSize: v2FontSizes.l,
    color: v2Colors.ground,
  },
  btnTextHover: {
    color: v2Colors.ink,
  },
  closeBtn: {
    top: v2SpacingSemantic.m,
    right: v2SpacingSemantic.m,
  },
  closeBtnHover: {
    transform: [{ rotate: "90deg" }],
  },
  navBtn: {
    top: "50%",
    marginTop: -25, // Center vertically
  },
  navBtnPrev: {
    left: v2SpacingSemantic.m,
  },
  navBtnNext: {
    right: v2SpacingSemantic.m,
  },
  content: {
    maxWidth: "90%",
    maxHeight: "90%",
  },
  image: {
    width: "100%",
    height: "100%",
    minWidth: 300,
    minHeight: 200,
    maxWidth: 1200,
    maxHeight: 800,
  },
  counter: {
    position: "absolute",
    bottom: v2SpacingSemantic.m,
    fontFamily: interFonts.medium,
    fontSize: v2FontSizes.s,
    color: v2Colors.ground,
    opacity: 0.7,
  },
});
