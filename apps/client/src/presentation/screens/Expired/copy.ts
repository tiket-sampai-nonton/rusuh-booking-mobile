/** Reason → copy mapping for the Expired screen (prototype expired.html). */
import type { ExpiredCopy, ExpiredReason } from "./interface";

export function copyFor(reason: ExpiredReason | undefined): ExpiredCopy {
  switch (reason) {
    case "payment":
      return {
        glyph: "💳",
        title: "Waktu pembayaranmu habis",
        sub: "Batas waktu pembayaran terlampaui, jadi pesanan yang kamu hold otomatis dilepas kembali. Tidak ada biaya yang dikenakan.",
        card: "Kami mengirim notifikasi “pemesanan kedaluwarsa” ke emailmu. Stok sudah dikembalikan ke pool otomatis — kamu bisa mencoba lagi dari antrean selama tiket masih ada.",
        cta: "Masuk Antrean Lagi",
      };
    case "payment-failed":
      return {
        glyph: "↻",
        title: "Pembayaran belum berhasil",
        sub: "SNAP mengembalikan status gagal. Pesananmu belum dibayar dan masih bisa dicoba lagi selama batas waktunya belum habis.",
        card: "Pilih metode pembayaran lain untuk mencoba kembali. Jika batas waktu booking sudah lewat, stok akan dilepas otomatis.",
        cta: "Coba Metode Lain",
      };
    case "session":
    case "booking":
    default:
      return {
        glyph: "⏱️",
        title: "Waktu memilih tiket habis",
        sub: "Sesi pemilihan tiket berakhir sebelum kamu menekan Lanjut Bayar. Slot sementara dilepas agar adil untuk pengantre lain.",
        card: "Stok yang tadi kamu pegang sudah dikembalikan ke pool. Kamu perlu masuk antrean lagi untuk mencoba — selama tiket masih tersedia.",
        cta: "Masuk Antrean Lagi",
      };
  }
}
