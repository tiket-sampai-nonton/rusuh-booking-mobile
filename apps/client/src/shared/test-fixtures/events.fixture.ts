/**
 * Event fixtures — shared contract-shaped seed data (RBT-014).
 *
 * ≥5 events covering every lifecycle status the UI must render, INCLUDING the
 * three special cases the AC calls out: SOLD_OUT, NOT_STARTED, CLOSED (plus
 * AVAILABLE). Also carries the FE-NEED O1 fields (remainingTickets, description
 * JSON) as mock data until the BE delivers them. Pure data, framework-free;
 * typed against the domain `EventDetail` port so a shape drift fails tsc.
 */
import type { EventDetail } from "@domain/repositories/event.repository";

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
    minPriceMinor: 45000000,
    remainingTickets: 120,
    description: {
      longDesc: "Festival musik tahunan terbesar dengan line-up lintas genre.",
      lineup: ["Band A", "Band B", "DJ C"],
      terms: "Tiket tidak dapat dikembalikan. Wajib membawa KTP sesuai NIK.",
      bannerImage: "https://cdn.example/evt-1/banner.jpg",
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
    minPriceMinor: 30000000,
    remainingTickets: 8,
    description: {
      longDesc: "Nobar final dengan layar raksasa dan zona komunitas.",
      lineup: [],
      terms: "Masuk sesuai sesi pada tiket.",
      bannerImage: "https://cdn.example/evt-2/banner.jpg",
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
    minPriceMinor: 20000000,
    remainingTickets: 500,
    description: {
      longDesc: "Malam musik indie dengan 12 penampil.",
      lineup: ["Indie X", "Indie Y"],
      terms: "Penjualan dibuka 20 Desember.",
      bannerImage: "https://cdn.example/evt-3/banner.jpg",
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
    minPriceMinor: 75000000,
    remainingTickets: 0,
    description: {
      longDesc: "Konser stadion dengan kapasitas penuh.",
      lineup: ["Headliner Z"],
      terms: "Sold out. Tidak ada penjualan di lokasi.",
      bannerImage: "https://cdn.example/evt-4/banner.jpg",
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
    minPriceMinor: 25000000,
    remainingTickets: 0,
    description: {
      longDesc: "Acara jazz tahunan (telah berlalu).",
      lineup: ["Jazz Trio"],
      terms: "Acara telah selesai.",
      bannerImage: "https://cdn.example/evt-5/banner.jpg",
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
    minPriceMinor: 35000000,
    remainingTickets: 300,
    description: {
      longDesc: "Pesta musik elektronik dengan panggung 360°.",
      lineup: ["DJ One", "DJ Two", "DJ Three"],
      terms: "Usia 18+. Wajib NIK.",
      bannerImage: "https://cdn.example/evt-6/banner.jpg",
    },
  },
];
