import type { ExpiryReason } from "@domain/rules/payment-recovery";

export interface ExpiryCopy {
  readonly title: string;
  readonly body: string;
  readonly infoText: string;
  readonly infoList: readonly string[];
}

export const EXPIRY_COPY: Readonly<Record<ExpiryReason, ExpiryCopy>> = {
  payment: {
    title: "Pembayaran Timeout",
    body: "Batas waktu pembayaran sudah lewat. Silakan coba lagi.",
    infoText: "Selesaikan pembayaran sebelum batas waktu berakhir.",
    infoList: [
      "Tidak ada biaya yang dikenakan",
      "Tiket dikembalikan ke inventori",
      "Kuota NIK kamu dipulihkan",
    ],
  },
  hold: {
    title: "Pemesanan Kedaluwarsa",
    body: "Batas waktu pemesanan telah berakhir. Tiket sudah dilepas.",
    infoText:
      "Sesi pemesanan dibatasi untuk memastikan akses yang adil bagi semua pengguna.",
    infoList: [
      "Tiket yang dipilih dikembalikan ke inventori",
      "Tidak ada pembayaran yang diproses",
      "Kamu bisa masuk antrean lagi sekarang",
    ],
  },
  queue: {
    title: "Sesi Antrean Berakhir",
    body: "Kamu meninggalkan antrean atau sesi terganggu.",
    infoText: "Meninggalkan halaman antrean akan melepaskan posisi kamu.",
    infoList: [
      "Posisi kamu diberikan ke orang berikutnya",
      "Tidak ada tiket yang dipesan",
      "Masuk lagi kapan saja",
    ],
  },
  turn: {
    title: "Giliran Terlewat",
    body: "Giliran kamu tiba tapi kamu tidak melanjutkan tepat waktu.",
    infoText: "Saat giliran tiba, lanjutkan sebelum kesempatan berakhir.",
    infoList: [
      "Giliran kamu dilewati",
      "Posisi diberikan ke orang berikutnya dalam antrean",
      "Kamu harus masuk antrean lagi dari belakang",
    ],
  },
};
