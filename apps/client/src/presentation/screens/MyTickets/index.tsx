import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { eventImage } from '@domain/rules/event-image';
import { formatDateID } from '@domain/services/date-format';
import { minorToIDR } from '@domain/services/money';
import { V2BottomNav, V2Header } from '@presentation/components/v2';
import { ScreenFade } from '@presentation/components/ScreenFade';
import { useEvents } from '@presentation/hooks/useEvents';
import { useETicketShare } from '@presentation/hooks/useETicketShare';
import { useSessionStore } from '@presentation/stores/session-store';
import { v2Colors, v2Borders, interFonts } from '@presentation/theme';

type TicketTab = 'upcoming' | 'past';

function TicketCard({
  event,
  bookingId,
  amountMinor,
  ticketCount,
  onOpenQr,
  onShare,
  past = false,
}: {
  readonly event: { id: string; name: string; venue?: string; startsAt?: string };
  readonly bookingId: string;
  readonly amountMinor: number;
  readonly ticketCount: number;
  readonly onOpenQr: () => void;
  readonly onShare: () => void;
  readonly past?: boolean;
}) {
  return (
    <View
      style={{
        marginBottom: 16,
        borderWidth: v2Borders.standard,
        borderColor: v2Colors.ink,
        backgroundColor: v2Colors.ground,
        opacity: past ? 0.58 : 1,
        shadowColor: v2Colors.ink,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
      }}
      testID={`ticket-card-${bookingId}`}
    >
      <Image source={{ uri: eventImage(event.id) }} resizeMode="cover" style={{ width: '100%', height: 132 }} />
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ flex: 1, color: v2Colors.ink, fontFamily: interFonts.black, fontSize: 18, textTransform: 'uppercase' }}>
            {event.name}
          </Text>
          <Text style={{ color: past ? v2Colors.inkMuted : v2Colors.success, fontFamily: interFonts.bold, fontSize: 11, textTransform: 'uppercase' }}>
            {past ? 'Used' : 'Confirmed'}
          </Text>
        </View>
        <Text style={{ marginTop: 8, color: v2Colors.inkMuted, fontFamily: interFonts.medium, fontSize: 12 }}>
          {formatDateID(event.startsAt)} · {event.venue ?? 'Venue TBA'}
        </Text>
        <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderStyle: 'dashed', borderColor: v2Colors.ink, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: v2Colors.inkMuted, fontFamily: interFonts.regular, fontSize: 11, textTransform: 'uppercase' }}>Ticket</Text>
            <Text style={{ color: v2Colors.ink, fontFamily: interFonts.bold, fontSize: 13 }}>{ticketCount} × General Admission</Text>
          </View>
          <Text style={{ color: v2Colors.ink, fontFamily: interFonts.bold, fontSize: 13 }}>{minorToIDR(amountMinor, { compact: true })}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={past ? 'QR tiket sudah digunakan' : 'Buka QR tiket'}
            accessibilityState={{ disabled: past }}
            disabled={past}
            onPress={onOpenQr}
            style={{ flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: past ? v2Colors.inkMuted : v2Colors.ink }}
            testID={`ticket-qr-${bookingId}`}
          >
            <Text style={{ color: v2Colors.ground, fontFamily: interFonts.bold, fontSize: 12, textTransform: 'uppercase' }}>View QR</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bagikan e-tiket"
            onPress={onShare}
            style={{ minHeight: 44, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderWidth: v2Borders.standard, borderColor: v2Colors.ink }}
            testID={`ticket-share-${bookingId}`}
          >
            <Text style={{ color: v2Colors.ink, fontFamily: interFonts.bold, fontSize: 12, textTransform: 'uppercase' }}>Share</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function MyTicketsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data } = useEvents();
  const bookingId = useSessionStore((s) => s.bookingId);
  const eventId = useSessionStore((s) => s.eventId);
  const amountMinor = useSessionStore((s) => s.amountMinor) ?? 0;
  const ticketCount = useSessionStore((s) => s.ticketCount) ?? 1;
  const { shareTickets } = useETicketShare();
  const [tab, setTab] = useState<TicketTab>('upcoming');
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [qrOpen, setQrOpen] = useState(false);

  const activeEvent = useMemo(
    () => (data?.upcoming ?? []).find((event) => event.id === eventId) ?? data?.upcoming[0],
    [data?.upcoming, eventId],
  );
  const showTicket = Boolean(bookingId && activeEvent && tab === 'upcoming');
  const matchesSearch = !search.trim() || activeEvent?.name.toLowerCase().includes(search.trim().toLowerCase());

  return (
    <ScreenFade>
      <View style={{ flex: 1, backgroundColor: v2Colors.ground }} testID="my-tickets-screen">
        <V2Header
          topInset={insets.top}
          onLogoPress={() => router.push('/' as Href)}
          actions={[{ icon: 'search', label: 'Cari tiket', onPress: () => setSearchOpen((open) => !open), testID: 'my-tickets-search' }]}
        />
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + 88, paddingHorizontal: 16, paddingBottom: insets.bottom + 88 }}>
          <Text accessibilityRole="header" style={{ color: v2Colors.ink, fontFamily: interFonts.black, fontSize: 32, textTransform: 'uppercase' }}>My Tickets</Text>
          <Text style={{ marginTop: 8, color: v2Colors.inkMuted, fontFamily: interFonts.regular, fontSize: 14 }}>Your upcoming and past event tickets.</Text>

          {searchOpen ? (
            <TextInput
              accessibilityLabel="Cari tiket"
              placeholder="Search tickets..."
              placeholderTextColor={v2Colors.inkMuted}
              value={search}
              onChangeText={setSearch}
              style={{ marginTop: 20, minHeight: 48, paddingHorizontal: 14, borderWidth: v2Borders.standard, borderColor: v2Colors.ink, color: v2Colors.ink, fontFamily: interFonts.regular }}
              testID="my-tickets-search-input"
            />
          ) : null}

          <View style={{ flexDirection: 'row', marginTop: 24, borderBottomWidth: v2Borders.standard, borderColor: v2Colors.ink }}>
            {(['upcoming', 'past'] as const).map((value) => (
              <Pressable key={value} onPress={() => setTab(value)} style={{ flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: tab === value ? v2Colors.ink : v2Colors.ground }} testID={`tickets-tab-${value}`}>
                <Text style={{ color: tab === value ? v2Colors.ground : v2Colors.ink, fontFamily: interFonts.bold, fontSize: 12, textTransform: 'uppercase' }}>
                  {value === 'upcoming' ? 'Upcoming (1)' : 'Past (0)'}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={{ marginTop: 24 }}>
            {showTicket && matchesSearch && activeEvent ? (
              <TicketCard
                event={activeEvent}
                bookingId={bookingId ?? 'booking'}
                amountMinor={amountMinor}
                ticketCount={ticketCount}
                onOpenQr={() => setQrOpen(true)}
                onShare={() => void shareTickets(bookingId ?? 'booking', ticketCount)}
              />
            ) : (
              <View style={{ paddingVertical: 56, paddingHorizontal: 20, alignItems: 'center', borderWidth: v2Borders.standard, borderStyle: 'dashed', borderColor: v2Colors.ink }} testID="my-tickets-empty">
                <Text style={{ color: v2Colors.ink, fontFamily: interFonts.black, fontSize: 20, textTransform: 'uppercase', textAlign: 'center' }}>{tab === 'upcoming' ? 'No Upcoming Tickets' : 'No Past Tickets'}</Text>
                <Text style={{ marginTop: 10, color: v2Colors.inkMuted, fontFamily: interFonts.regular, fontSize: 13, textAlign: 'center' }}>Confirmed tickets will appear here after payment.</Text>
                <Pressable onPress={() => router.push('/browse' as Href)} style={{ marginTop: 20, minHeight: 44, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: v2Colors.ink }}>
                  <Text style={{ color: v2Colors.ground, fontFamily: interFonts.bold, fontSize: 12, textTransform: 'uppercase' }}>Browse Events</Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>

        <Modal visible={qrOpen} transparent animationType="fade" onRequestClose={() => setQrOpen(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <View style={{ width: '100%', maxWidth: 360, padding: 24, alignItems: 'center', backgroundColor: v2Colors.ground, borderWidth: v2Borders.standard, borderColor: v2Colors.ink }}>
              <Text style={{ color: v2Colors.ink, fontFamily: interFonts.black, fontSize: 20, textTransform: 'uppercase' }}>Your QR Ticket</Text>
              <View style={{ marginTop: 24, padding: 16, backgroundColor: v2Colors.ground, borderWidth: v2Borders.standard, borderColor: v2Colors.ink }}>
                <QRCode value={`RBT|${bookingId ?? 'booking'}|1`} size={190} color={v2Colors.ink} backgroundColor={v2Colors.ground} />
              </View>
              <Text style={{ marginTop: 16, color: v2Colors.inkMuted, fontFamily: interFonts.regular, fontSize: 12, textAlign: 'center' }}>Show this code at the entrance.</Text>
              <Pressable onPress={() => setQrOpen(false)} style={{ marginTop: 20, minHeight: 44, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: v2Colors.ink }}>
                <Text style={{ color: v2Colors.ground, fontFamily: interFonts.bold, fontSize: 12, textTransform: 'uppercase' }}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <V2BottomNav activeRoute="tickets" onNavigate={(route) => {
          if (route === 'home') router.push('/' as Href);
          if (route === 'browse') router.push('/browse' as Href);
          if (route === 'profile') router.push('/profile' as Href);
        }} />
      </View>
    </ScreenFade>
  );
}

