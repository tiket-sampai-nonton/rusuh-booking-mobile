export type HeaderIcon = "login";

export interface HeaderAction {
  readonly icon: HeaderIcon;
  readonly label: string;
  readonly onPress?: () => void;
  readonly testID?: string;
  readonly count?: number;
}
