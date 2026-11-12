import type { ExpiryReason } from "@domain/rules/payment-recovery";

export interface ExpiryCopy {
  readonly title: string;
  readonly body: string;
  readonly infoText: string;
  readonly infoList: readonly string[];
}

export const EXPIRY_COPY: Readonly<Record<ExpiryReason, ExpiryCopy>> = {
  payment: {
    title: "Pembayaran gagal",
    body: "Pembayaranmu tidak berhasil. Kamu bisa coba lagi jika tiket masih tersedia.",
    infoText:
      "Status pembayaran akan mengikuti konfirmasi dari penyedia pembayaran.",
    infoList: [
      "Tidak ada biaya yang dikenakan",
      "Tiket dikembalikan ke inventori",
      "Kuota NIK kamu dipulihkan",
    ],
  },
  hold: {
    title: "Waktu pemesanan habis",
    body: "Waktu untuk menyelesaikan pemesanan sudah habis. Silakan pilih tiket lagi.",
    infoText:
      "Sesi pemesanan dibatasi untuk memastikan akses yang adil bagi semua pengguna.",
    infoList: [
      "Tiket yang dipilih dikembalikan ke inventori",
      "Tidak ada pembayaran yang diproses",
      "Kamu bisa masuk antrean lagi sekarang",
    ],
  },
  queue: {
    title: "Sesi antrean berakhir",
    body: "Sesi antreanmu sudah berakhir. Kamu bisa masuk antrean lagi dari halaman event.",
    infoText: "Jika kamu keluar dari antrean, posisimu tidak bisa dipulihkan.",
    infoList: [
      "Posisi kamu diberikan ke orang berikutnya",
      "Tidak ada tiket yang dipesan",
      "Masuk lagi kapan saja",
    ],
  },
  turn: {
    title: "Giliranmu sudah lewat",
    body: "Maaf, waktunya sudah lewat. Kamu bisa kembali ke antrean dari halaman event.",
    infoText:
      "Saat mendapat giliran, lanjutkan sebelum waktu yang diberikan habis.",
    infoList: [
      "Giliran kamu dilewati",
      "Posisi diberikan ke orang berikutnya dalam antrean",
      "Kamu harus masuk antrean lagi dari belakang",
    ],
  },
};
