/**
 * Event fixtures — shared contract-shaped seed data (RBT-014).
 *
 * ≥5 events covering every lifecycle status the UI must render, INCLUDING the
 * three special cases the AC calls out: SOLD_OUT, NOT_STARTED, CLOSED (plus
 * AVAILABLE). Also carries mock-only stock and rich description values. Pure
 * data, framework-free;
 * typed against the domain `EventDetail` port so a shape drift fails tsc.
 */
import type { EventDetail } from "@domain/repositories/event.repository";

const MOCK_EVENT_GALLERY = [
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&q=80",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=80",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80",
] as const;

export const EVENT_FIXTURES: readonly EventDetail[] = [
  {
    id: "evt-1",
    slug: "rusuh-fest-2026",
    name: "Rusuh Fest 2026",
    venue: "Gelora Bung Karno, Jakarta",
    startsAt: "2026-12-01T12:00:00.000Z",
    salesStartsAt: "2026-11-01T00:00:00.000Z",
    salesEndsAt: "2026-11-30T23:59:59.000Z",
    status: "AVAILABLE",
    minPriceMinor: 450000,
    remainingTickets: 120,
    description: {
      longDesc: "Festival musik tahunan terbesar dengan line-up lintas genre.",
      lineup: ["Band A", "Band B", "DJ C"],
      gallery: MOCK_EVENT_GALLERY,
      terms: "Wajib membawa KTP sesuai NIK.",
      bannerImage:
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80&auto=format&fit=crop",
      // FE-NEED (O2): pricing categories + availability, mocked until the BE
      // typed `priceMinor`/`available` contract lands. Read defensively by the
      // detail screen (parseDescription).
      categories: [
        { code: "FEST", name: "Festival", priceMinor: 450000, available: 90 },
        { code: "VIP", name: "VIP", priceMinor: 1200000, available: 20 },
        {
          code: "CAT1",
          name: "Tribun Cat 1",
          priceMinor: 650000,
          available: 10,
        },
      ],
    },
  },
  {
    id: "evt-2",
    slug: "nonton-bareng-finale",
    name: "Nonton Bareng Finale",
    venue: "ICE BSD, Tangerang",
    startsAt: "2026-12-20T18:00:00.000Z",
    salesStartsAt: "2026-11-15T00:00:00.000Z",
    salesEndsAt: "2026-12-19T23:59:59.000Z",
    status: "AVAILABLE",
    minPriceMinor: 300000,
    remainingTickets: 8,
    description: {
      longDesc: "Nobar final dengan layar raksasa dan zona komunitas.",
      lineup: [
        {
          name: "Ahmad Dhani",
          role: "Keyboards",
          avatar:
            "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200&q=80",
        },
        {
          name: "Once Mekel",
          role: "Vocal",
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
        },
        {
          name: "Andra Ramadhan",
          role: "Guitar",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
        },
        {
          name: "Yuke Sampurna",
          role: "Bass",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
        },
      ],
      gallery: MOCK_EVENT_GALLERY,
      terms: "Masuk sesuai sesi pada tiket.",
      bannerImage:
        "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200&q=80&auto=format&fit=crop",
      categories: [
        { code: "REG", name: "Reguler", priceMinor: 300000, available: 8 },
        { code: "VIP", name: "VIP Lounge", priceMinor: 750000, available: 0 },
      ],
    },
  },
  {
    id: "evt-3",
    slug: "indie-night-vol-9",
    name: "Indie Night Vol. 9",
    venue: "Senayan Park, Jakarta",
    startsAt: "2027-01-10T13:00:00.000Z",
    salesStartsAt: "2026-12-20T00:00:00.000Z",
    salesEndsAt: "2027-01-09T23:59:59.000Z",
    status: "NOT_STARTED", // sales window not open yet
    minPriceMinor: 200000,
    remainingTickets: 500,
    description: {
      longDesc: "Malam musik indie dengan 12 penampil.",
      lineup: ["Indie X", "Indie Y"],
      gallery: MOCK_EVENT_GALLERY,
      terms: "Penjualan dibuka 20 Desember.",
      bannerImage:
        "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&q=80&auto=format&fit=crop",
    },
  },
  {
    id: "evt-4",
    slug: "stadium-tour-jkt",
    name: "Stadium Tour Jakarta",
    venue: "Stadion Utama GBK",
    startsAt: "2026-11-28T19:00:00.000Z",
    salesStartsAt: "2026-10-01T00:00:00.000Z",
    salesEndsAt: "2026-11-27T23:59:59.000Z",
    status: "SOLD_OUT", // no tickets left
    minPriceMinor: 750000,
    remainingTickets: 0,
    description: {
      longDesc: "Konser stadion dengan kapasitas penuh.",
      lineup: ["Headliner Z"],
      gallery: MOCK_EVENT_GALLERY,
      terms: "Sold out. Tidak ada penjualan di lokasi.",
      bannerImage:
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80&auto=format&fit=crop",
      categories: [
        { code: "REG", name: "Reguler", priceMinor: 750000, available: 0 },
        { code: "VIP", name: "VIP", priceMinor: 1500000, available: 0 },
      ],
    },
  },
  {
    id: "evt-5",
    slug: "jazz-in-the-park-2025",
    name: "Jazz in the Park 2025",
    venue: "Taman Mini, Jakarta",
    startsAt: "2025-08-15T16:00:00.000Z",
    salesStartsAt: "2025-07-01T00:00:00.000Z",
    salesEndsAt: "2025-08-14T23:59:59.000Z",
    status: "CLOSED", // past event — shows in History
    minPriceMinor: 250000,
    remainingTickets: 0,
    description: {
      longDesc: "Acara jazz tahunan (telah berlalu).",
      lineup: ["Jazz Trio"],
      gallery: MOCK_EVENT_GALLERY,
      terms: "Acara telah selesai.",
      bannerImage:
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80&auto=format&fit=crop",
    },
  },
  {
    id: "evt-6",
    slug: "electronic-waves",
    name: "Electronic Waves",
    venue: "JIExpo Kemayoran",
    startsAt: "2027-02-14T20:00:00.000Z",
    salesStartsAt: "2027-01-01T00:00:00.000Z",
    salesEndsAt: "2027-02-13T23:59:59.000Z",
    status: "AVAILABLE",
    minPriceMinor: 350000,
    remainingTickets: 300,
    description: {
      longDesc: "Pesta musik elektronik dengan panggung 360°.",
      lineup: ["DJ One", "DJ Two", "DJ Three"],
      gallery: MOCK_EVENT_GALLERY,
      terms: "Usia 18+. Wajib NIK.",
      bannerImage:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80&auto=format&fit=crop",
      categories: [
        {
          code: "GA",
          name: "General Admission",
          priceMinor: 350000,
          available: 300,
        },
        {
          code: "FRONT",
          name: "Front of Stage",
          priceMinor: 900000,
          available: 40,
        },
      ],
    },
  },
];
