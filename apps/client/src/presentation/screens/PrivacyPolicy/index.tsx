import { useRouter, type Href } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const sections = [
  {
    title: "Informasi yang diproses",
    body: "Untuk membuat dan mengelola pemesanan, aplikasi memproses nama, email, NIK pembeli dan penonton, pilihan tiket, serta status pemesanan dan pembayaran.",
  },
  {
    title: "Penggunaan informasi",
    body: "Informasi digunakan untuk mengelola antrean dan pemesanan tiket, memeriksa kelayakan penonton, mengirim e-tiket ke email, dan menampilkan status pembayaran. Pembayaran dilakukan melalui halaman Midtrans SNAP.",
  },
  {
    title: "NIK dan keamanan",
    body: "NIK diperlakukan sebagai data sensitif. Aplikasi menampilkan NIK dalam bentuk tersamar dan tidak menyimpan NIK lengkap di penyimpanan lokal perangkat. NIK dikirim untuk validasi pemesanan melalui koneksi HTTPS.",
  },
  {
    title: "Pihak yang membantu layanan",
    body: "Data yang diperlukan untuk menjalankan pemesanan dapat diproses oleh layanan backend Rusuh Booking, penyedia pembayaran Midtrans, dan layanan pengiriman email tiket.",
  },
  {
    title: "Persetujuan",
    body: "Persetujuan pemrosesan data diminta sebelum data pembeli dan NIK dikirim untuk checkout. Jika tidak menyetujui pemrosesan tersebut, checkout tidak dapat dilanjutkan.",
  },
];

export function PrivacyPolicyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center border-b-2 border-ink px-5 py-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          className="mr-4 min-h-11 min-w-11 items-center justify-center border-2 border-ink"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/" as Href)
          }
        >
          <Text className="text-xl font-bold text-foreground">‹</Text>
        </Pressable>
        <Text className="flex-1 text-lg font-bold text-foreground">
          Kebijakan Privasi
        </Text>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 py-6"
      >
        <Text className="text-sm leading-6 text-muted-foreground">
          Ringkasan ini menjelaskan data yang digunakan aplikasi Rusuh Booking
          untuk layanan pemesanan tiket.
        </Text>
        {sections.map((section) => (
          <View key={section.title} className="gap-2 border-2 border-ink p-4">
            <Text className="text-base font-bold text-foreground">
              {section.title}
            </Text>
            <Text className="text-sm leading-6 text-foreground">
              {section.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
