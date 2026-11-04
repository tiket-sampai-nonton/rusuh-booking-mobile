import Svg, { Circle, Path, Rect } from "react-native-svg";

export function PinIcon({ color = "#000000", size = 16 }: { readonly color?: string; readonly size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><Circle cx={12} cy={10} r={2.5} /></Svg>;
}

export function CalendarIcon({ color = "#000000", size = 16 }: { readonly color?: string; readonly size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Rect x={3} y={5} width={18} height={16} rx={2} /><Path d="M16 3v4M8 3v4M3 10h18" /></Svg>;
}

export function ClockIcon({ color = "#000000", size = 16 }: { readonly color?: string; readonly size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Circle cx={12} cy={12} r={9} /><Path d="M12 7v5l3 2" /></Svg>;
}

export function MailIcon({ color = "#000000", size = 16 }: { readonly color?: string; readonly size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Rect x={3} y={5} width={18} height={14} rx={2} /><Path d="m3 7 9 6 9-6" /></Svg>;
}

export function ExternalLinkIcon({ color = "#000000", size = 16 }: { readonly color?: string; readonly size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="M13 5h6v6M19 5l-9 9" /><Path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></Svg>;
}

export function PlusIcon({ color = "#000000", size = 16 }: { readonly color?: string; readonly size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round"><Path d="M12 5v14M5 12h14" /></Svg>;
}

export function ArrowIcon({ direction = "right", color = "#000000", size = 16 }: { readonly direction?: "left" | "right" | "download"; readonly color?: string; readonly size?: number }) {
  const d = direction === "left"
    ? "M19 12H5m6 6-6-6 6-6"
    : direction === "download"
      ? "M12 3v12m0 0 5-5m-5 5-5-5M5 20h14"
      : "M5 12h14m-6-6 6 6-6 6";
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d={d} /></Svg>;
}

export function CheckIcon({ color = "#000000", size = 16 }: { readonly color?: string; readonly size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><Path d="m5 12 4 4L19 6" /></Svg>;
}

export function WarningIcon({ color = "#000000", size = 18 }: { readonly color?: string; readonly size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="M12 3 2.5 20h19L12 3ZM12 9v5m0 3h.01" /></Svg>;
}

export function CloseIcon({ color = "#000000", size = 18 }: { readonly color?: string; readonly size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="m18 6-12 12M6 6l12 12" /></Svg>;
}
