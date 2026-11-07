export const PRIMARY_NAV_LABELS = {
  home: "Beranda",
  browse: "Jelajah",
  tickets: "Ticket",
  profile: "Profil",
} as const;

interface PrimaryNavHandlers {
  readonly onHome: () => void;
  readonly onBrowse: () => void;
  readonly onTickets: () => void;
  readonly onProfile: () => void;
  readonly isLoggedIn: boolean;
}

/** The single source of menu labels and link order for web and native. */
export function createPrimaryNavLinks({
  onHome,
  onBrowse,
  onTickets,
  onProfile,
  isLoggedIn,
}: PrimaryNavHandlers) {
  return [
    {
      label: PRIMARY_NAV_LABELS.home,
      onPress: onHome,
      testID: "nav-home",
    },
    {
      label: PRIMARY_NAV_LABELS.browse,
      onPress: onBrowse,
      testID: "nav-browse",
    },
    ...(isLoggedIn
      ? [
          {
            label: PRIMARY_NAV_LABELS.tickets,
            onPress: onTickets,
            testID: "nav-tickets",
          },
        ]
      : []),
    {
      label: PRIMARY_NAV_LABELS.profile,
      onPress: onProfile,
      testID: "nav-profile",
    },
  ];
}
