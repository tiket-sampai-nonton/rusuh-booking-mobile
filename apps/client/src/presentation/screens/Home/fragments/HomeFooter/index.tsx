/**
 * RBT-096 —  Home Footer
 *
 * MASTER-SPEC + prototype 01-home.html EXACT COPY:
 *
 * FOOTER (.footer):
 * - Background and text use shared ink and ground tokens
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
import { Text, View } from "react-native";

import { BrandMark } from "@presentation/components/BrandMark";
import { Reveal } from "@presentation/components/design-system";
import { designColors } from "@presentation/theme";

import { FooterLink } from "./FooterLink";
import { SocialLink } from "./SocialLink";
import { componentStyles } from "./style";

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════

const LINK_COLUMNS = [
  {
    title: "Event",
    links: [
      { label: "Konser", href: "/browse?genre=concert" },
      { label: "Festival", href: "/browse?genre=festival" },
      { label: "Olahraga", href: "/browse?genre=sports" },
      { label: "Teater", href: "/browse?genre=theater" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "Pusat Bantuan", href: "#" },
      { label: "Cara Beli", href: "#" },
      { label: "Pembayaran", href: "#" },
      { label: "Pengembalian Dana", href: "#" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang Kami", href: "#" },
      { label: "Karir", href: "#" },
      { label: "Media", href: "#" },
      { label: "Kontak", href: "#" },
    ],
  },
] as const;

const SOCIAL_LINKS = [
  { label: "IG", name: "Instagram", handle: "@rusuhtiket" },
  { label: "TW", name: "Twitter", handle: "@rusuhtiket" },
  { label: "FB", name: "Facebook", handle: "Rusuh Tiket" },
  { label: "YT", name: "YouTube", handle: "Rusuh Tiket Official" },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FOOTER
// ═══════════════════════════════════════════════════════════════════════════════

export function HomeFooter({
  onNavigate,
}: {
  readonly onNavigate: (href: string) => void;
}) {
  return (
    <View style={componentStyles.elementBackgroundColor3} testID="footer">
      {/* Main Grid */}
      <View style={componentStyles.elementFlexDirection4}>
        {/* Brand Column */}
        <Reveal>
          <View style={componentStyles.elementFlex5}>
            <BrandMark
              size={32}
              color={designColors.ground}
              style={componentStyles.elementBrandMark}
            />

            <Text style={componentStyles.elementColor7}>
              Platform tiket event terpercaya di Indonesia. Beli tiket konser,
              festival, olahraga, dan teater dengan mudah dan aman.
            </Text>
          </View>
        </Reveal>

        {/* Link Columns */}
        {LINK_COLUMNS.map((column, i) => (
          <Reveal key={column.title} delay={(i + 1) * 80}>
            <View style={componentStyles.elementMinWidth8}>
              <Text style={componentStyles.elementColor9}>{column.title}</Text>

              {column.links.map((link) => (
                <FooterLink
                  key={link.label}
                  label={link.label}
                  href={link.href}
                  onNavigate={onNavigate}
                />
              ))}
            </View>
          </Reveal>
        ))}
      </View>

      {/* Bottom Bar */}
      <View style={componentStyles.elementFlexDirection10}>
        {/* Copyright */}
        <Text style={componentStyles.elementColor11}>
          © 2025 Rusuh Tiket. Hak cipta dilindungi.
        </Text>

        {/* Social Links */}
        <View style={componentStyles.elementFlexDirection12}>
          {SOCIAL_LINKS.map((social) => (
            <SocialLink
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

export default HomeFooter;
