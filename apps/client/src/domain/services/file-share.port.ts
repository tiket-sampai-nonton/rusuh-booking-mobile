/**
 * FileSharePort — domain PORT (ARCHITECTURE §2.1 ISP, §6.2).
 *
 * Pure TS interface: no React / React Native / Expo / browser / native imports.
 * Native adapter wraps `expo-file-system` + `expo-sharing`; web adapter uses a
 * Blob download / print fallback. Used by the e-ticket QR download/share flow.
 */

/** Minimal shareable-file descriptor placeholder — refined in RBT-06x. */
export interface ShareableFile {
  /** Suggested file name, e.g. `ticket-ORD123.png`. */
  readonly fileName: string;
  /** MIME type, e.g. `image/png` or `application/pdf`. */
  readonly mimeType: string;
  /** File contents as a base64 string (transport-neutral across platforms). */
  readonly base64: string;
}

export interface FileSharePort {
  /** Persist/download the file to the user's device or browser. */
  save(file: ShareableFile): Promise<void>;
  /** Open the OS/browser share sheet for the file. */
  share(file: ShareableFile): Promise<void>;
}
