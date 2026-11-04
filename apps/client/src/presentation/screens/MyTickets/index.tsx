import { useRouter, type Href } from 'expo-router';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { ticketRef } from '@presentation/components/ETicketCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { eventImage } from '@domain/rules/event-image';
import { formatDateID } from '@domain/services/date-format';
import { minorToIDR } from '@domain/services/money';
import { V2BottomNav, V2Header } from '@presentation/components/v2';
import { LoginModal } from '@presentation/components/auth/LoginModal';
import { ScreenFade } from '@presentation/components/ScreenFade';
import { useEvents } from '@presentation/hooks/useEvents';
import { useETicketShare } from '@presentation/hooks/useETicketShare';
import { useETicketDownload } from '@presentation/hooks/useETicketDownload';
import { useSessionStore } from '@presentation/stores/session-store';
import { useAccountStore } from '@presentation/stores/account-store';
import { useServices } from '@providers/service-context';
import type { MyBookingSummary } from '@domain/repositories/ticket-history.repository';
import { useResponsive } from '@presentation/hooks/useResponsive';
import { v2Colors, v2Borders, interFonts } from '@presentation/theme';

type TicketTab = 'upcoming' | 'past';

interface TicketQrRef {
  toDataURL: (callback: (value: string) => void) => void;
}

function TicketCard({
  event,
  bookingId,
  amountMinor,
  ticketCount,
  onOpenQr,
  onDownload,
  onShare,
  past = false,
}: {
  readonly event: { id: string; name: string; venue?: string; startsAt?: string };
  readonly bookingId: string;
  readonly amountMinor: number;
  readonly ticketCount: number;
  readonly onOpenQr: () => void;
  readonly onDownload: () => void;
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
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={past ? 'QR tiket sudah digunakan' : 'Buka QR tiket'}
            accessibilityState={{ disabled: past }}
            disabled={past}
            onPress={onOpenQr}
            style={{ width: '100%', minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: past ? v2Colors.inkMuted : v2Colors.ink }}
            testID={`ticket-qr-${bookingId}`}
          >
            <Text style={{ color: v2Colors.ground, fontFamily: interFonts.bold, fontSize: 12, textTransform: 'uppercase' }}>View QR</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Unduh e-tiket" onPress={onDownload} style={{ flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: v2Colors.ink }} testID={`ticket-download-${bookingId}`}>
            <Text style={{ color: v2Colors.ground, fontFamily: interFonts.bold, fontSize: 12, textTransform: 'uppercase' }}>Download</Text>
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
  const { isWeb, width } = useResponsive();
  const { data } = useEvents();
  const bookingId = useSessionStore((s) => s.bookingId);
  const eventId = useSessionStore((s) => s.eventId);
  const amountMinor = useSessionStore((s) => s.amountMinor) ?? 0;
  const ticketCount = useSessionStore((s) => s.ticketCount) ?? 1;
  const profile = useAccountStore((s) => s.profile);
  const { ticketHistoryRepository } = useServices();
  const activeEvent = useMemo(
    () => (data?.upcoming ?? []).find((event) => event.id === eventId) ?? data?.upcoming[0],
    [data?.upcoming, eventId],
  );
  const { shareTickets } = useETicketShare();
  const { downloadTickets } = useETicketDownload();
  const [tab, setTab] = useState<TicketTab>('upcoming');
  const [qrOpen, setQrOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<MyBookingSummary | null>(null);
  const [downloadError, setDownloadError] = useState('');
  const showTicket = Boolean(bookingId && activeEvent && tab === 'upcoming');
  const { data: history, isLoading: historyLoading, isError: historyError, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['my-bookings', profile?.emailMasked],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => ticketHistoryRepository.listMyBookings(pageParam, 50),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(profile),
  });
  const { data: selectedTickets, isLoading: ticketsLoading, isError: ticketsError } = useQuery({
    queryKey: ['my-booking-tickets', selectedBooking?.bookingId],
    queryFn: () => ticketHistoryRepository.getBookingTickets(selectedBooking!.bookingId),
    enabled: Boolean(selectedBooking),
  });

  const allAccountBookings = profile ? history?.pages.flatMap((page) => page.bookings) ?? [] : [];
  const knownEvents = [...(data?.upcoming ?? []), ...(data?.history ?? [])];
  const isPastBooking = (booking: MyBookingSummary) => {
    const event = knownEvents.find((item) => item.name === booking.eventName);
    const eventHasPassed = event?.startsAt ? new Date(event.startsAt).getTime() < Date.now() : undefined;
    return booking.status === 'EXPIRED' || booking.status === 'CANCELLED' || eventHasPassed === true;
  };
  const accountBookings = allAccountBookings.filter((booking) => (tab === 'past') === isPastBooking(booking));
  const upcomingCount = allAccountBookings.filter((booking) => !isPastBooking(booking)).length + (showTicket && allAccountBookings.length === 0 ? 1 : 0);
  const pastCount = allAccountBookings.filter(isPastBooking).length;
  const qrRefs = useRef<(TicketQrRef | null)[]>([]);

  const handleDownload = async () => {
    if (!bookingId || !activeEvent) return;
    setDownloadError('');
    try {
      const images = await Promise.all(Array.from({ length: ticketCount }, (_, index) => new Promise<string>((resolve, reject) => {
        const qr = qrRefs.current[index];
        if (!qr) return reject(new Error('QR tiket belum siap. Coba lagi.'));
        qr.toDataURL((value) => value ? resolve(value.replace(/^data:image\/png;base64,/, '')) : reject(new Error('QR tiket gagal dibuat.')));
      })));
      await downloadTickets(bookingId, ticketCount, images, activeEvent.name);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'E-tiket gagal disimpan. Coba lagi.');
    }
  };

  const downloadSelectedBooking = async () => {
    if (!selectedBooking || !selectedTickets) return;
    setDownloadError('');
    try {
      const images = await Promise.all(selectedTickets.tickets.map((_, index) => new Promise<string>((resolve, reject) => {
        const qr = qrRefs.current[index];
        if (!qr) return reject(new Error('QR tiket belum siap. Coba lagi.'));
        qr.toDataURL((value) => value ? resolve(value.replace(/^data:image\/png;base64,/, '')) : reject(new Error('QR tiket gagal dibuat.')));
      })));
      await downloadTickets(selectedBooking.bookingId, images.length, images, selectedBooking.eventName, selectedTickets.tickets.map((ticket) => ticket.ticketCode));
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'E-tiket gagal disimpan. Coba lagi.');
    }
  };

  return (
    <ScreenFade>
      <View style={{ flex: 1, backgroundColor: v2Colors.ground }} testID="my-tickets-screen">
        {showTicket && bookingId ? <View style={{ position: 'absolute', left: -10000, top: 0, opacity: 0 }} pointerEvents="none" accessibilityElementsHidden>
          {Array.from({ length: ticketCount }, (_, index) => <QRCode key={index} value={ticketRef(bookingId, index)} size={240} getRef={(ref) => { qrRefs.current[index] = ref; }} />)}
        </View> : null}
        <V2Header
          topInset={insets.top}
          showLinks={isWeb && width > 768}
          isLoggedIn={Boolean(profile)}
          links={[
            { label: 'Beranda', onPress: () => router.push('/' as Href), testID: 'nav-home' },
            { label: 'Browse', onPress: () => router.push('/browse' as Href), testID: 'nav-browse' },
            ...(profile ? [
              { label: 'My Ticket', onPress: () => {}, testID: 'nav-tickets' },
              { label: 'Profile', onPress: () => router.push('/profile' as Href), testID: 'nav-profile' },
            ] : []),
          ]}
          onLogoPress={() => router.push('/' as Href)}
          onCtaPress={() => setLoginOpen(true)}
          actions={[]}
        />
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + 88, paddingHorizontal: 16, paddingBottom: insets.bottom + 88 }}>
          <Text accessibilityRole="header" style={{ color: v2Colors.ink, fontFamily: interFonts.black, fontSize: 32, textTransform: 'uppercase' }}>My Tickets</Text>
          <Text style={{ marginTop: 8, color: v2Colors.inkMuted, fontFamily: interFonts.regular, fontSize: 14 }}>Your upcoming and past event tickets.</Text>

          <View style={{ flexDirection: 'row', marginTop: 24, borderBottomWidth: v2Borders.standard, borderColor: v2Colors.ink }}>
            {(['upcoming', 'past'] as const).map((value) => (
              <Pressable key={value} onPress={() => setTab(value)} style={{ flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: tab === value ? v2Colors.ink : v2Colors.ground }} testID={`tickets-tab-${value}`}>
                <Text style={{ color: tab === value ? v2Colors.ground : v2Colors.ink, fontFamily: interFonts.bold, fontSize: 12, textTransform: 'uppercase' }}>
                  {value === 'upcoming' ? `Upcoming (${upcomingCount})` : `Past (${pastCount})`}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={{ marginTop: 24 }}>
            {historyError ? <Text accessibilityLiveRegion="polite" style={{ color: '#b91c1c', fontFamily: interFonts.medium, fontSize: 13 }}>Could not load your tickets. Please try again.</Text> : null}
            {accountBookings.map((booking) => (
              <View key={booking.bookingId} style={{ marginBottom: 16, padding: 16, borderWidth: v2Borders.standard, borderColor: v2Colors.ink, backgroundColor: v2Colors.ground }} testID={`account-ticket-${booking.bookingId}`}>
                <Text style={{ color: v2Colors.ink, fontFamily: interFonts.black, fontSize: 17, textTransform: 'uppercase' }}>{booking.eventName}</Text>
                <Text style={{ marginTop: 8, color: v2Colors.inkMuted, fontFamily: interFonts.medium, fontSize: 12 }}>{booking.publicRef} · {booking.status.replaceAll('_', ' ')}</Text>
                <Text style={{ marginTop: 8, color: v2Colors.ink, fontFamily: interFonts.bold, fontSize: 14 }}>{minorToIDR(booking.amountMinor)}</Text>
                {booking.status === 'PAID' ? <Pressable accessibilityRole="button" accessibilityLabel={`Lihat QR ${booking.eventName}`} onPress={() => { setSelectedBooking(booking); setQrOpen(true); }} style={{ marginTop: 14, minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: v2Colors.ink }} testID={`account-ticket-qr-${booking.bookingId}`}><Text style={{ color: v2Colors.ground, fontFamily: interFonts.bold, fontSize: 12, textTransform: 'uppercase' }}>View QR</Text></Pressable> : null}
              </View>
            ))}
            {hasNextPage ? <Pressable accessibilityRole="button" onPress={() => void fetchNextPage()} disabled={isFetchingNextPage} style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center', borderWidth: v2Borders.standard, borderColor: v2Colors.ink }}><Text style={{ color: v2Colors.ink, fontFamily: interFonts.bold, fontSize: 12, textTransform: 'uppercase' }}>{isFetchingNextPage ? 'Loading…' : 'Load More Tickets'}</Text></Pressable> : null}
            {showTicket && activeEvent && accountBookings.length === 0 ? (
              <TicketCard
                event={activeEvent}
                bookingId={bookingId ?? 'booking'}
                amountMinor={amountMinor}
                ticketCount={ticketCount}
                onOpenQr={() => setQrOpen(true)}
                onDownload={() => void handleDownload()}
                onShare={() => void shareTickets(bookingId ?? 'booking', ticketCount)}
              />
            ) : !historyLoading && accountBookings.length === 0 && !showTicket ? (
              <View style={{ paddingVertical: 56, paddingHorizontal: 20, alignItems: 'center', borderWidth: v2Borders.standard, borderStyle: 'dashed', borderColor: v2Colors.ink }} testID="my-tickets-empty">
                <Text style={{ color: v2Colors.ink, fontFamily: interFonts.black, fontSize: 20, textTransform: 'uppercase', textAlign: 'center' }}>{tab === 'upcoming' ? 'No Upcoming Tickets' : 'No Past Tickets'}</Text>
                <Text style={{ marginTop: 10, color: v2Colors.inkMuted, fontFamily: interFonts.regular, fontSize: 13, textAlign: 'center' }}>Confirmed tickets will appear here after payment.</Text>
                <Pressable onPress={() => router.push('/browse' as Href)} style={{ marginTop: 20, minHeight: 44, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: v2Colors.ink }}>
                  <Text style={{ color: v2Colors.ground, fontFamily: interFonts.bold, fontSize: 12, textTransform: 'uppercase' }}>Browse Events</Text>
                </Pressable>
              </View>
            ) : historyLoading && !showTicket ? <Text style={{ paddingVertical: 32, textAlign: 'center', color: v2Colors.inkMuted, fontFamily: interFonts.medium }}>Loading tickets…</Text> : null}
            {downloadError ? <Text accessibilityLiveRegion="polite" style={{ marginTop: 12, color: '#b91c1c', fontFamily: interFonts.medium, fontSize: 12 }}>{downloadError}</Text> : null}
          </View>
        </ScrollView>

        <Modal visible={qrOpen} transparent animationType={Platform.OS === 'web' ? 'fade' : 'slide'} onRequestClose={() => { setQrOpen(false); setSelectedBooking(null); }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', alignItems: 'center', justifyContent: Platform.OS === 'web' ? 'center' : 'flex-end', padding: Platform.OS === 'web' ? 24 : 0 }}>
            <View style={{ width: '100%', maxWidth: 360, padding: 24, alignItems: 'center', backgroundColor: v2Colors.ground, borderWidth: v2Borders.standard, borderColor: v2Colors.ink }}>
              <Text style={{ color: v2Colors.ink, fontFamily: interFonts.black, fontSize: 20, textTransform: 'uppercase' }}>{selectedBooking?.eventName ?? 'Your QR Ticket'}</Text>
              {selectedBooking ? ticketsLoading ? <Text style={{ marginTop: 24 }}>Loading QR…</Text> : ticketsError ? <Text style={{ marginTop: 24, color: '#b91c1c' }}>Could not load ticket QR. Please try again.</Text> : selectedTickets?.tickets.map((ticket, index) => <View key={ticket.ticketCode} style={{ marginTop: 20, padding: 16, alignItems: 'center', borderWidth: v2Borders.standard, borderColor: v2Colors.ink }}><QRCode value={ticket.qrPayload} size={190} color={v2Colors.ink} backgroundColor={v2Colors.ground} getRef={(ref) => { qrRefs.current[index] = ref; }} /><Text style={{ marginTop: 8, color: v2Colors.ink, fontFamily: interFonts.bold }}>{ticket.ticketCode}</Text></View>) : <View style={{ marginTop: 24, padding: 16, backgroundColor: v2Colors.ground, borderWidth: v2Borders.standard, borderColor: v2Colors.ink }}><QRCode value={`RBT|${bookingId ?? 'booking'}|1`} size={190} color={v2Colors.ink} backgroundColor={v2Colors.ground} /></View>}
              <Text style={{ marginTop: 16, color: v2Colors.inkMuted, fontFamily: interFonts.regular, fontSize: 12, textAlign: 'center' }}>Show this code at the entrance.</Text>
              {selectedBooking && selectedTickets ? <Pressable onPress={() => void downloadSelectedBooking()} style={{ marginTop: 12, minHeight: 44, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', borderWidth: v2Borders.standard, borderColor: v2Colors.ink }}><Text style={{ color: v2Colors.ink, fontFamily: interFonts.bold, fontSize: 12, textTransform: 'uppercase' }}>Download E-Ticket</Text></Pressable> : null}
              {downloadError ? <Text style={{ marginTop: 8, color: '#b91c1c', fontSize: 12 }}>{downloadError}</Text> : null}
              <Pressable onPress={() => { setQrOpen(false); setSelectedBooking(null); }} style={{ marginTop: 20, minHeight: 44, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: v2Colors.ink }}>
                <Text style={{ color: v2Colors.ground, fontFamily: interFonts.bold, fontSize: 12, textTransform: 'uppercase' }}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        <LoginModal visible={loginOpen} onClose={() => setLoginOpen(false)} />

        <V2BottomNav activeRoute="tickets" isLoggedIn={Boolean(profile)} onNavigate={(route) => {
          if (route === 'home') router.push('/' as Href);
          if (route === 'browse') router.push('/browse' as Href);
          if (route === 'profile') router.push('/profile' as Href);
        }} />
      </View>
    </ScreenFade>
  );
}

