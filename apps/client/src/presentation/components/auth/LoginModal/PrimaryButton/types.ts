export interface PrimaryButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly disabled?: boolean;
  readonly testID?: string;
  readonly variant?: "default" | "danger";
}
